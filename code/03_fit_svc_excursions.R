# Spatially Varying Coefficient Model for Land Surface Temperature in Bologna

# Description:
#   This script fits a spatially varying coefficient model to Landsat 8 land
#   surface temperature data for the Municipality of Bologna, Italy. The model
#   is estimated using R-INLA with SPDE Matérn spatial fields. Posterior
#   excursion sets are computed to identify areas with statistically supported
#   warming or cooling trends.


# --------------------------------------------------------------------------- -
# 0. Setup ----
# --------------------------------------------------------------------------- -

# Install missing packages:
# install.packages(c("dplyr", "tidyr", "purrr", "sf", "terra", "ggplot2", 
#                   "readr", "excursions", "here"))
#
# R-INLA is installed from its own repository:
# install.packages("INLA",
#   repos = c(getOption("repos"), INLA = "https://inla.r-inla-download.org/R/stable"),
#   dep = TRUE )

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(purrr)
  library(sf)
  library(terra)
  library(ggplot2)
  library(INLA)
  library(readr)
  library(excursions)
  library(here)
})

set.seed(1234)
options(scipen = 999)
setwd(here())

# coordinate reference system: UTM zone 32N, EPSG:32632
crs_projected = 32632

# output directory
output_dir = getwd()

# --------------------------------------------------------------------------- -
# 1. Import and prepare data ----
# --------------------------------------------------------------------------- -

# input files
lst_data = read_csv("data_LST_Landsat8_ST10_13_25_Bologna.csv")
bologna_boundary = st_read("municipality_bologna.gpkg")

lst_data = lst_data %>%
  mutate(
    date = as.Date(date),
    cell_idx = as.integer(interaction(x, y, drop = TRUE))) # create cell index

# municipality boundary used to mask projected outputs
bologna_boundary = bologna_boundary %>%
  st_transform(crs_projected)

bologna_boundary_vect = terra::vect(bologna_boundary)

# --------------------------------------------------------------------------- -
# 2. Build SPDE mesh ----
# --------------------------------------------------------------------------- -

unique_coordinates = lst_data %>%
  distinct(x, y)

sf_points_utm = st_as_sf(
  unique_coordinates,
  coords = c("x", "y"),
  crs = crs_projected)

coords_utm = st_coordinates(sf_points_utm)

mesh = inla.mesh.2d(
  loc = coords_utm,
  max.edge = c(200, 1200),
  cutoff = 60,
  offset = c(2000, 5000))

# spatial intercept field: u(s)
spde_model_space = inla.spde2.pcmatern(
  mesh = mesh,
  alpha = 2,
  prior.range = c(5000, 0.95),
  prior.sigma = c(5, 0.05))

# spatially varying temporal slope field: v(s)
spde_model_time = inla.spde2.pcmatern(
  mesh = mesh,
  alpha = 2,
  prior.range = c(1000, 0.95),
  prior.sigma = c(1, 0.05))

# --------------------------------------------------------------------------- -
# 3. prepare model matrices and INLA stack ----
# --------------------------------------------------------------------------- -

all_coordinates = lst_data %>%
  select(x, y) %>%
  st_as_sf(coords = c("x", "y"), crs = crs_projected) %>%
  st_coordinates()

# Projection matrix for spatial intercept field
A_space = inla.spde.make.A(
  mesh = mesh,
  loc = all_coordinates)

# center time and express it in years so that the temporal coefficient is
# interpreted as temperature change per year
lst_data = lst_data %>%
  mutate(
    time_days_raw = as.numeric(date - as.Date("2013-06-16")) + 1,
    time_days = time_days_raw - mean(time_days_raw, na.rm = TRUE),
    time_years = time_days / 365.25)

# projection matrix for spatially varying temporal slope, 
# weighted by centered time in years
A_time = inla.spde.make.A(
  mesh = mesh,
  loc = all_coordinates,
  weights = lst_data$time_years)

spatial_index = inla.spde.make.index(
  name = "spatial_field",
  n.spde = spde_model_space$n.spde)

time_index = inla.spde.make.index(
  name = "time_field",
  n.spde = spde_model_time$n.spde)

model_stack = inla.stack(
  data = list(lst = lst_data$lst),
  A = list(1, A_space, A_time),
  effects = list(data.frame(
                    Intercept = 1,
                    time_years = lst_data$time_years),
    list(space = spatial_index$spatial_field),
    list(time = time_index$time_field)),
  tag = "estimation")

gc()

# --------------------------------------------------------------------------- -
# 4. Fit SVC model ----
# --------------------------------------------------------------------------- -

model_spde = inla(
  lst ~ -1 + Intercept + time_years +
                f(space,
                  model = spde_model_space,
                  group = NULL,
                  extraconstr = list(
                    A = matrix(1, 1, spde_model_space$n.spde),
                    e = 0)) +
                f(time,
                  model = spde_model_time,
                  group = NULL,
                  extraconstr = list(
                    A = matrix(1, 1, spde_model_time$n.spde),
                    e = 0)),
  data = inla.stack.data(model_stack),
  family = "gaussian",
  control.predictor = list(A = inla.stack.A(model_stack),
                           compute = TRUE),
  control.compute = list(dic = TRUE,
                         waic = TRUE,
                         cpo = TRUE,
                         config = TRUE),
  control.inla = list(control.vb = list(enable = FALSE),
                      int.strategy = "eb"),
  verbose = TRUE)

print(summary(model_spde))

# --------------------------------------------------------------------------- -
# 5. Posterior sampling for temporal spatial field ----
# --------------------------------------------------------------------------- -

n_posterior_samples = 1000

posterior_samples = inla.posterior.sample(
  n = n_posterior_samples,
  result = model_spde,
  selection = list(
    time = 0,
    time_years = 0))

latent_names = rownames(posterior_samples[[1]]$latent)
time_field_idx = grep("^time:", latent_names)
time_intercept_idx = grep("^time_years:", latent_names)

sample_matrix_time_field = sapply(
  posterior_samples,
  function(sample) sample$latent[time_field_idx])

sample_matrix_time_intercept = sapply(
  posterior_samples,
  function(sample) sample$latent[time_intercept_idx])

# total temporal effect: 
# fixed temporal coefficient plus spatially varying field
sample_matrix_total_time_effect = sweep(
  sample_matrix_time_field,
  MARGIN = 2,
  STATS = sample_matrix_time_intercept,
  FUN = "+")

# spatially varying component only: v(s)
sample_matrix_svc_only = sample_matrix_time_field

rm(posterior_samples)
gc()

# --------------------------------------------------------------------------- -
# 6. Excursion analysis
# --------------------------------------------------------------------------- -

alpha_level = 0.05

# areas with statistically supported cooling: 
# \beta + v(s) < 0
excursion_total_cooling = excursions.mc(
  samples = sample_matrix_total_time_effect,
  u = 0,
  type = "<",
  alpha = alpha_level,
  verbose = TRUE)

# areas with statistically supported warming:
# v(s) > 0
excursion_svc_warming = excursions.mc(
  samples = sample_matrix_svc_only,
  u = 0,
  type = ">",
  alpha = alpha_level,
  verbose = TRUE)

# --------------------------------------------------------------------------- -
# 7. Helper functions for projection and contour export ----
# --------------------------------------------------------------------------- -

# project excursion functions to a regular grid for raster/vector output
projector_grid = inla.mesh.projector(
  mesh,
  xlim = range(coords_utm[, 1]),
  ylim = range(coords_utm[, 2]),
  dims = c(500, 500))

project_excursion_function = function(excursion_object, 
                                      projector_grid, 
                                      boundary_vect) {
  excursion_function_grid = inla.mesh.project(
    projector_grid,
    excursion_object$F)
  
  excursion_raster = terra::rast(
    t(excursion_function_grid),
    extent = terra::ext(
      min(projector_grid$x),
      max(projector_grid$x),
      min(projector_grid$y),
      max(projector_grid$y)),
    crs = paste0("EPSG:", crs_projected)  )
  
  excursion_raster = terra::flip(excursion_raster, direction = "vertical")
  excursion_raster = terra::mask(excursion_raster, boundary_vect)
  
  excursion_df = as.data.frame(excursion_raster, xy = TRUE, na.rm = FALSE)
  names(excursion_df)[3] = "F"
  
  excursion_df %>%
    mutate(
      E = if_else(F > 1 - alpha_level, "inside", "outside"),
      E = factor(E, levels = c("inside", "outside")))
}

export_excursion_contour = function(excursion_object, 
                                    projector_grid, 
                                    output_file, 
                                    crs_epsg = 32632) {
  excursion_grid = inla.mesh.project(
    projector_grid,
    field = as.numeric(excursion_object$E))
  
  contour_lines = contourLines(
    x = projector_grid$x,
    y = projector_grid$y,
    z = excursion_grid,
    levels = 0.5)
  
  line_geometries = lapply(contour_lines, function(line) {
    sf::st_linestring(cbind(line$x, line$y))
  })
  
  contour_sf = st_sf(geometry = st_sfc(line_geometries, crs = crs_epsg))
  
  st_write(contour_sf, output_file, append = FALSE, quiet = TRUE)
  invisible(contour_sf)
}

# data frames for plotting excursion functions
df_excursion_total_cooling = project_excursion_function(
  excursion_object = excursion_total_cooling,
  projector_grid = projector_grid,
  boundary_vect = bologna_boundary_vect)

df_excursion_svc_warming = project_excursion_function(
  excursion_object = excursion_svc_warming,
  projector_grid = projector_grid,
  boundary_vect = bologna_boundary_vect)

# export excursion contour boundaries as shapefiles
export_excursion_contour(
  excursion_object = excursion_svc_warming,
  projector_grid = projector_grid,
  output_file = file.path(output_dir, 
                          "excursion_contour_boundary_time_hot.shp"),
  crs_epsg = crs_projected)

export_excursion_contour(
  excursion_object = excursion_total_cooling,
  projector_grid = projector_grid,
  output_file = file.path(output_dir, 
                          "excursion_contour_boundary_time_cold.shp"),
  crs_epsg = crs_projected)
