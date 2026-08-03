############################################################################## #
# D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026) 
# A Bayesian Spatially Varying Coefficient Model 
# for Surface Urban Heat Island Estimation
############################################################################## #

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

# coordinate reference system: UTM zone 32N, EPSG:32632
crs_projected = 32632

# working directory
setwd("marika-dagostini/bhm-svc-suhi")

# output directory
output_dir = getwd()

# --------------------------------------------------------------------------- -
# 1. Import and prepare data ----
# --------------------------------------------------------------------------- -

# input files
lst_data = read_csv("data/data_LST_Landsat8_ST10_13_16_Bologna.csv")
bologna_boundary = st_read("data/municipality_bologna.gpkg")

lst_data = lst_data %>%
  mutate(
    date = as.Date(date), # change date format
    cell_idx = as.integer(interaction(x, y, drop = TRUE))) # create cell index

# municipality boundary used to mask projected outputs
bologna_boundary = bologna_boundary %>%
  st_transform(crs_projected)

# create a SpatVector object
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
# 3. Prepare model matrices and INLA stack ----
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
                f(space, model = spde_model_space, group = NULL,
                  extraconstr = list(
                    A = matrix(1, 1, spde_model_space$n.spde), e = 0)) +
                f(time, model = spde_model_time, group = NULL,
                  extraconstr = list(
                    A = matrix(1, 1, spde_model_time$n.spde), e = 0)),
  data = inla.stack.data(model_stack),
  family = "gaussian",
  control.predictor = list(A = inla.stack.A(model_stack),
                           compute = TRUE),
  control.compute = list(dic = TRUE, waic = TRUE,
                         cpo = TRUE, config = TRUE),
  control.inla = list(control.vb = list(enable = FALSE),
                      int.strategy = "eb"),
  verbose = TRUE)

summary(model_spde)

# --------------------------------------------------------------------------- -
# 5. Posterior sampling for SUHI estimation ----
# --------------------------------------------------------------------------- -

n_posterior_samples = 1000

posterior_samples_space = inla.posterior.sample(
  n = n_posterior_samples,
  result = model_spde,
  selection = list(space = 0, Intercept = 0))

latent_names = rownames(posterior_samples_space[[1]]$latent)
space_field_idx = grep("^space:", latent_names)
space_intercept_idx = grep("^Intercept:", latent_names)

# posterior samples of alpha
sample_matrix_space_intercept = sapply(
  posterior_samples_space,
  function(sample) sample$latent[space_intercept_idx]) %>% as.matrix()

alpha_mean = rowMeans(sample_matrix_space_intercept, na.rm = TRUE)
alpha_sd   = apply(sample_matrix_space_intercept, 1, sd, na.rm = TRUE)

# posterior samples of u(s)
sample_matrix_space_field = sapply(
  posterior_samples_space,
  function(sample) sample$latent[space_field_idx])

u_field_mean = rowMeans(sample_matrix_space_field, na.rm = TRUE)
u_field_sd   = apply(sample_matrix_space_field, 1, sd, na.rm = TRUE)

# create posterior sample of the total persistent effect alpha+u(s)
sample_matrix_space_effect = sweep(
  sample_matrix_space_field,
  MARGIN = 2,
  STATS = sample_matrix_space_intercept,
  FUN = "+")

space_field_mean = rowMeans(sample_matrix_space_effect, na.rm = TRUE)
space_field_sd   = apply(sample_matrix_space_effect, 1, sd, na.rm = TRUE)

rm(sample_matrix_space_intercept, sample_matrix_space_field)

# 5.1 Import land use data ----

# Download Uso_del_suolo_2023.tif from:
# https://groupware.sinanet.isprambiente.it/uso-copertura-e-consumo-di-suolo/library/copertura-del-suolo/carta-di-copertura-del-suolo/uso-del-suolo-2023

raster_land_use2023 = rast("Uso_del_suolo_2023.tif")
raster_land_use2023 = crop(raster_land_use2023[["Uso_del_suolo_2023"]], 
                           bologna_boundary_vect, mask = TRUE)  

land_use_df = as.data.frame(raster_land_use2023, xy = TRUE) %>%
  rename(LandUse = Uso_del_suolo_2023) %>%
  mutate(LandUse = recode(LandUse,
                          `2`  = "Forestry use",
                          `4`  = "Urban",
                          `5`  = "Water uses",
                          `11` = "Arable crops",
                          `12` = "Forage crops",
                          `13` = "Permanent crops",
                          `16` = "Other agricultural uses",
                          `62` = "Other non-economic uses"))

# create binary variable to identify urban pixels
land_use_df$is_urban = ifelse(land_use_df$LandUse == "Urban", TRUE, FALSE)

# 5.2 Import Elevation data ----

# Download DTM 5x5 RER from
# https://geoportale.regione.emilia-romagna.it/download-data/dati-e-prodotti-cartografici-preconfezionati/altimetria/dtm-5m-x-5m-ultima-edizione
# For Bologna download the North-East (NE) ans South-East (SE) quadrants

dtm_NE = rast("DTM5x5_ed2025_NE_7791.tif")
dtm_SE = rast("DTM5x5_ed2025_SE_7791.tif")

dtm = merge(dtm_NE, dtm_SE)
dtm = crop(dtm, bologna_boundary_vect, mask = TRUE)  
dtm = dtm %>% 
  project(crs_projected, method = "near") %>%
  setNames("dtm5x5m_bologna")

rm(dtm_NE, dtm_SE)

# Resample dtm (5x5m) to match land use raster resolution (10x10m)
r_dtm = raster::resample(dtm, raster_land_use2023, method = "average")
df_dtm = as.data.frame(r_dtm, xy = TRUE) %>%
  rename(Altitude_m = dtm5x5m_bologna)

rm(dtm)

# merge with land use dataframe
land_use_df = merge(land_use_df, df_dtm, by = c("x","y"), all.x = T)


# crate altitude 100m classes: 
# 0-100m = 1; 100-200m = 2; 200-300m = 3; 300-400m = 4
land_use_df$altitude_class = factor(floor(land_use_df$Altitude_m/100)+1)

# 5.3 Create poster sample for SUHI estimation ----

# extract coordinates
coords_lc = land_use_df %>%
  distinct(x, y) %>%
  mutate(
    across(c(x, y), as.numeric))

# transform into utm coordinates
coords_lc_utm = lapply(seq_len(nrow(coords_lc)),
             function(i) st_point(as.numeric(coords_lc[i, c("x","y")]))) %>% 
  st_sfc(crs = crs_projected) %>% 
  st_coordinates() 

# define projection matrix based on the utm coordinates
A_proj = inla.spde.make.A(
  mesh = mesh, 
  loc = coords_lc_utm)

# define empty matrix to store posterior SUHI samples
sample_matrix_suhi = matrix(NA, nrow = nrow(coords_lc_utm), 
                            ncol = n_posterior_samples)

for (i in 1:n_posterior_samples) {
  print(i)
  land_use_df$proj_sample = as.vector(A_proj %*% 
                                        sample_matrix_space_effect[,i])
  
  df_suhi = land_use_df %>%
    group_by(altitude_class) %>%
    mutate(
      # find the minimum proj_sample among NON-URBAN pixels in this altitude class
      min_non_urban = min(proj_sample[!is_urban], na.rm = TRUE),
      
      # if there are no non-urban pixels, min() will return Inf — fix that:
      min_non_urban = ifelse(is.infinite(min_non_urban), NA, min_non_urban),
      
      # compute the SUHI
      suhi = proj_sample - min_non_urban,
      suhi = ifelse(is_urban == FALSE, NA, suhi)
     
    ) %>%
    ungroup()
  
  sample_matrix_suhi[,i] = df_suhi$suhi
}

# save posterior mean and sd of SUHI

land_use_df$suhi_mean = rowMeans(sample_matrix_suhi, na.rm = TRUE)
land_use_df$suhi_sd   = apply(sample_matrix_suhi, 1, sd, na.rm = TRUE)

rm(sample_matrix_suhi, sample_matrix_space_field, posterior_samples_space)

# --------------------------------------------------------------------------- -
# 6. Posterior sampling for temporal spatial field ----
# --------------------------------------------------------------------------- -

n_posterior_samples = 1000

posterior_samples = inla.posterior.sample(
  n = n_posterior_samples,
  result = model_spde,
  selection = list(
    time = 0,
    time_years = 0))

latent_names = rownames(posterior_samples[[1]]$latent)
time_intercept_idx = grep("^time_years:", latent_names)
time_field_idx = grep("^time:", latent_names)


sample_matrix_time_intercept = sapply(
  posterior_samples,
  function(sample) sample$latent[time_intercept_idx]) %>% as.matrix()

beta_mean = rowMeans(sample_matrix_time_intercept, na.rm = TRUE)
beta_sd   = apply(sample_matrix_time_intercept, 1, sd, na.rm = TRUE)

sample_matrix_time_field = sapply(
  posterior_samples,
  function(sample) sample$latent[time_field_idx])

v_field_mean = rowMeans(sample_matrix_time_field, na.rm = TRUE)
v_field_sd   = apply(sample_matrix_time_field, 1, sd, na.rm = TRUE)

# total temporal effect: beta + v(s)
sample_matrix_total_time_effect = sweep(
  sample_matrix_time_field,
  MARGIN = 2,
  STATS = sample_matrix_time_intercept,
  FUN = "+")

time_field_mean = rowMeans(sample_matrix_total_time_effect, na.rm = TRUE)
time_field_sd   = apply(sample_matrix_total_time_effect, 1, sd, na.rm = TRUE)

gc()

# --------------------------------------------------------------------------- -
# 7. Excursion analysis
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
  samples = sample_matrix_time_field,
  u = 0,
  type = ">",
  alpha = alpha_level,
  verbose = TRUE)

# --------------------------------------------------------------------------- -
# 8. Contour export ----
# --------------------------------------------------------------------------- -

# project excursion functions to a regular grid for raster/vector output
projector_grid = inla.mesh.projector(
  mesh,
  xlim = range(coords_utm[, 1]),
  ylim = range(coords_utm[, 2]),
  dims = c(500, 500))

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

# export excursion contour boundaries as shapefiles
export_excursion_contour(
  excursion_object = excursion_svc_warming,
  projector_grid = projector_grid,
  output_file = file.path(output_dir, "excursion_contour_boundary_time_hot.shp"),
  crs_epsg = crs_projected)

export_excursion_contour(
  excursion_object = excursion_total_cooling,
  projector_grid = projector_grid,
  output_file = file.path(output_dir, "excursion_contour_boundary_time_cold.shp"),
  crs_epsg = crs_projected)

# --------------------------------------------------------------------------- -
# 9. Plots ----
# --------------------------------------------------------------------------- -

common_settings = list(geom_sf(data = bologna_boundary, inherit.aes = FALSE, 
                          fill = NA, color = "grey40", size = 0.4),
  coord_sf(),
  guides(
    fill = guide_colourbar(direction = "horizontal", title.position = "left",
      title.hjust = 0, title.vjust = 0.85, barwidth = unit(5, "cm"),
      barheight = unit(0.5, "cm"))),
  theme_bw(),
  theme(axis.title = element_blank(), axis.text = element_blank(),
    axis.ticks = element_blank(), panel.grid = element_blank(),
    panel.background = element_rect(fill = "white", color = NA),
    panel.border = element_blank(),
    plot.background = element_rect(fill = "white", color = NA),
    strip.text       = element_text(size = 12, face = "bold", color = "black"),
    strip.background = element_rect(fill = "grey80", color = "black", size = 0.5),
    legend.position = "bottom", legend.key.width = unit(0.5, "cm"),
    plot.title = element_text(size = 10)))

# 9.1 Posterior mean and SD of u(s) ----

# project summaries on land use (10m resolution) grid
land_use_df$u_mean = as.vector(A_proj %*% u_field_mean)
land_use_df$u_sd = as.vector(A_proj %*% u_field_sd)

p = ggplot() +
  geom_raster(data = land_use_df, aes(x = x, y = y, fill = u_mean)) +
  scale_fill_gradientn(
    colours = rev(RColorBrewer::brewer.pal(11, "RdBu")),
    values = scales::rescale(c(min(land_use_df$u_mean, na.rm = TRUE), 0,
                               max(land_use_df$u_mean, na.rm = TRUE))),
    name = "°C", na.value = "white") + common_settings
  

ggsave(filename = paste0(output_dir,"/us_posterior_mean.png"), p,
    width = 2600, height = 2600, units = "px", dpi = 600)

p = ggplot() +
  geom_raster(data = land_use_df, aes(x = x, y = y, fill = u_sd)) +
  scale_fill_gradient(low = "#f7f4f3", high = "#c94940",
    na.value = "white", name = "°C") + common_settings

ggsave(filename = paste0(output_dir,"/us_posterior_sd.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)


# 9.2 Posterior mean and SD of persistent spatial effect alpha+u(s) ----

land_use_df$space_mean = as.vector(A_proj %*% space_field_mean)
land_use_df$space_sd = as.vector(A_proj %*% space_field_sd)

p = ggplot(land_use_df, aes(x = x, y = y, fill = space_mean)) +
  geom_raster() +
  scale_fill_gradientn(
    colours = c("white", RColorBrewer::brewer.pal(9, "YlOrRd"), "brown4"),
    name = "°C", na.value = "white") + common_settings

ggsave(filename = paste0(output_dir,"/alpha_us_posterior_mean.png"), p,
    width = 2600, height = 2600, units = "px", dpi = 600)

p = ggplot(land_use_df, aes(x = x, y = y, fill = space_sd)) +
  geom_raster() +
  scale_fill_gradient(low = "#f7f4f3", high = "#c94940",
    na.value = "white", name = "°C",
    labels = scales::label_number(accuracy = 0.01)) + common_settings

ggsave(filename = paste0(output_dir,"/alpha_us_posterior_sd.png"), p,
    width = 2600, height = 2600, units = "px", dpi = 600)


# 9.3 SUHI ----

p = ggplot(land_use_df, aes(x = x, y = y, fill = suhi_mean)) +
  geom_raster() +
  scale_fill_gradientn(
    colours = c("grey99",(RColorBrewer::brewer.pal(9, "YlOrRd"))),
    na.value = "white", name = "°C") + common_settings

ggsave(filename = paste0(output_dir,"/suhi_mean.png"), p,
    width = 2600, height = 2600, units = "px", dpi = 600)


p = ggplot(land_use_df, aes(x = x, y = y, fill = suhi_sd)) +
  geom_raster() +
  scale_fill_gradient(low = "#f7f4f3", high = "#c94940",
    na.value = "white", name = "°C") + common_settings

ggsave(filename = paste0(output_dir,"/suhi_sd.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

# 9.4 Posterior mean and SD of v(s) ----

land_use_df$v_mean = as.vector(A_proj %*% v_field_mean)
land_use_df$v_sd = as.vector(A_proj %*% v_field_sd)

p = ggplot() +
  geom_raster(data = land_use_df, aes(x = x, y = y, fill = v_mean)) +
  scale_fill_gradientn(
    colours = rev(RColorBrewer::brewer.pal(11, "RdBu")),
    values = scales::rescale(c(min(land_use_df$v_mean, na.rm = TRUE), 0,
                               max(land_use_df$v_mean, na.rm = TRUE))),
    name = "°C", na.value = "white") + common_settings


ggsave(filename = paste0(output_dir,"/vs_posterior_mean.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

p = ggplot() +
  geom_raster(data = land_use_df, aes(x = x, y = y, fill = v_sd)) +
  scale_fill_gradient(low = "#f7f4f3", high = "#c94940",
                      na.value = "white", name = "°C") + common_settings

ggsave(filename = paste0(output_dir,"/vs_posterior_sd.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

# 9.5 Posterior mean and SD of temporal trend beta+v(s) ----

land_use_df$time_mean = as.vector(A_proj %*% time_field_mean)
land_use_df$time_sd = as.vector(A_proj %*% time_field_sd)

p = ggplot(land_use_df, aes(x = x, y = y, fill = time_mean)) +
  geom_raster() +
  scale_fill_gradientn(
    colours = rev(RColorBrewer::brewer.pal(11, "RdBu")),
    values = scales::rescale(c(min(land_use_df$time_mean, na.rm = TRUE), 0,
                               max(land_use_df$time_mean, na.rm = TRUE))),
    name = "°C", na.value = "white") + common_settings

ggsave(filename = paste0(output_dir,"/beta_vs_posterior_mean.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

p = ggplot(land_use_df, aes(x = x, y = y, fill = time_sd)) +
  geom_raster() +
  scale_fill_gradient(low = "#f7f4f3", high = "#c94940", name = "°C", 
    labels = scales::label_number(accuracy = 0.01)) + common_settings
 
ggsave(filename = paste0(output_dir,"/beta_vs_posterior_sd.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)


# 9.6 Excursion sets ----

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


# 9.6.1 Excursion sets, cooling areas ----

df_excursion_total_cooling = project_excursion_function(
  excursion_object = excursion_total_cooling,
  projector_grid = projector_grid,
  boundary_vect = bologna_boundary_vect)

p = ggplot(df_excursion_total_cooling, aes(x = x, y = y, fill = E)) +
  geom_raster() +
  scale_fill_manual( values = c("#01296f", "white"),
                     na.value = "white",
                     name = expression(E^"-"*(s))) + common_settings

ggsave(filename = paste0(output_dir,"/excursions_cold.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

# 9.6.2 Excursion sets, warming areas ----

df_excursion_svc_warming = project_excursion_function(
  excursion_object = excursion_svc_warming,
  projector_grid = projector_grid,
  boundary_vect = bologna_boundary_vect)

p = ggplot(df_excursion_svc_warming, aes(x = x, y = y, fill = E)) +
  geom_raster() +
  scale_fill_manual( values = c("#781806", "white"),
                     na.value = "white",
                     name =  expression(E^"+"*(s))) + common_settings

ggsave(filename = paste0(output_dir,"/excursions_hot.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

