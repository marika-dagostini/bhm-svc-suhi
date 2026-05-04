# Prior Sensitivity Analysis for SPDE Range Hyperparameters

# Description:
#   This script performs a prior sensitivity analysis for a spatially varying
#   coefficient model fitted with R-INLA. It varies the PC prior on the SPDE
#   range hyperparameter for two latent fields:
#
#     u(s): spatial intercept field
#     v(s): spatially varying temporal slope field
#
#   The prior on sigma is kept fixed based on prior knowledge. For each prior
#   specification, the model is re-fitted and posterior summaries, fixed effects,
#   and predictive criteria are exported for comparison.


# --------------------------------------------------------------------------- -
# 0. Setup ----
# --------------------------------------------------------------------------- -

# Install missing packages:
# install.packages(c("dplyr", "purrr", "sf", "terra", "readr", "ggplot2", "here"))
#
# R-INLA is installed from its own repository:
# install.packages(
#   "INLA",
#   repos = c(getOption("repos"), INLA = "https://inla.r-inla-download.org/R/stable"),
#   dep = TRUE
# )

suppressPackageStartupMessages({
  library(dplyr)
  library(purrr)
  library(sf)
  library(terra)
  library(readr)
  library(ggplot2)
  library(INLA)
  library(here)
})

set.seed(1234)
options(scipen = 999)

crs_projected = 32632

output_dir = here()

# --------------------------------------------------------------------------- -
# 1. Import data ----
# --------------------------------------------------------------------------- -

# input files
lst_data = read_csv("data_LST_Landsat8_ST10_13_16_Bologna.csv")
bologna_boundary = st_read("municipality_bologna.gpkg")

lst_data = lst_data %>%
  mutate(
    date = as.Date(date),
    cell_idx = as.integer(interaction(x, y, drop = TRUE)),
    time_days_raw = as.numeric(date - as.Date("2013-06-16")) + 1,
    time_days = time_days_raw - mean(time_days_raw, na.rm = TRUE),
    time_years = time_days / 365.25
  )

# --------------------------------------------------------------------------- -
# 2. Define prior grid ----
# --------------------------------------------------------------------------- -

# PC prior parameterization used by inla.spde2.pcmatern:
#   prior.range = c(r0, p0) gives P(range < r0) = p0
#   prior.sigma = c(s0, q0) gives P(sigma > s0) = q0
#
# In this analysis, range priors are varied and sigma priors are held fixed

fixed_prior_sigma_u = c(5, 0.05)
fixed_prior_sigma_v = c(1, 0.05)

prior_grid = list(
  list(name = "M1", prior.range.u = c(10000, 0.95), prior.range.v = c(5000, 0.95)),
  list(name = "M2", prior.range.u = c(10000, 0.95), prior.range.v = c(500, 0.95)),
  list(name = "M3", prior.range.u = c(10000, 0.95), prior.range.v = c(1000, 0.95)),
  list(name = "M4", prior.range.u = c(5000, 0.95), prior.range.v = c(5000, 0.95)),
  list(name = "M5", prior.range.u = c(5000, 0.95), prior.range.v = c(1000, 0.95)),
  list(name = "M6", prior.range.u = c(5000, 0.95), prior.range.v = c(500, 0.95)),
  list(name = "M7", prior.range.u = c(1000, 0.95), prior.range.v = c(1000, 0.95)),
  list(name = "M8", prior.range.u = c(1000, 0.95), prior.range.v = c(500, 0.95)),
  list(name = "M9", prior.range.u = c(1000, 0.95), prior.range.v = c(5000, 0.95))
) %>%
  map(function(prior_spec) {
    prior_spec$prior.sigma.u = fixed_prior_sigma_u
    prior_spec$prior.sigma.v = fixed_prior_sigma_v
    prior_spec
  })

prior_grid_table = map_dfr(prior_grid, function(pr) {
  tibble(
    model_name = pr$name,
    range_u_r0 = pr$prior.range.u[1],
    range_u_p0 = pr$prior.range.u[2],
    sigma_u_s0 = pr$prior.sigma.u[1],
    sigma_u_q0 = pr$prior.sigma.u[2],
    range_v_r0 = pr$prior.range.v[1],
    range_v_p0 = pr$prior.range.v[2],
    sigma_v_s0 = pr$prior.sigma.v[1],
    sigma_v_q0 = pr$prior.sigma.v[2]
  )
})

write_csv(prior_grid_table, file.path(output_dir, "prior_grid.csv"))

# --------------------------------------------------------------------------- -
# 3. Build mesh and projection matrices ----
# --------------------------------------------------------------------------- -

unique_coordinates = lst_data %>%
  distinct(x, y)

sf_points_utm = st_as_sf(
  unique_coordinates,
  coords = c("x", "y"),
  crs = crs_projected
)

coords_utm = st_coordinates(sf_points_utm)

mesh = inla.mesh.2d(
  loc = coords_utm,
  max.edge = c(200, 1200),
  cutoff = 60,
  offset = c(2000, 5000)
)

all_coordinates = lst_data %>%
  select(x, y) %>%
  st_as_sf(coords = c("x", "y"), crs = crs_projected) %>%
  st_coordinates()

A_space = inla.spde.make.A(
  mesh = mesh,
  loc = all_coordinates
)

A_time = inla.spde.make.A(
  mesh = mesh,
  loc = all_coordinates,
  weights = lst_data$time_years
)

# --------------------------------------------------------------------------- -
# 4. Model-fitting function ----
# --------------------------------------------------------------------------- -

fit_prior_model = function(prior_spec, data, mesh, A_space, A_time) {
  message(
    "Fitting ", prior_spec$name,
    " | range u: ", paste(prior_spec$prior.range.u, collapse = ", "),
    " | range v: ", paste(prior_spec$prior.range.v, collapse = ", "))
  
  spde_model_space = inla.spde2.pcmatern(
    mesh = mesh,
    alpha = 2,
    prior.range = prior_spec$prior.range.u,
    prior.sigma = prior_spec$prior.sigma.u)
  
  spde_model_time = inla.spde2.pcmatern(
    mesh = mesh,
    alpha = 2,
    prior.range = prior_spec$prior.range.v,
    prior.sigma = prior_spec$prior.sigma.v)
  
  spatial_index = inla.spde.make.index(
    name = "spatial_field",
    n.spde = spde_model_space$n.spde)
  
  time_index = inla.spde.make.index(
    name = "time_field",
    n.spde = spde_model_time$n.spde)
  
  model_stack = inla.stack(
    data = list(lst = data$lst),
    A = list(1, A_space, A_time),
    effects = list(
      data.frame(
        Intercept = 1,
        time_years = data$time_years),
      list(space = spatial_index$spatial_field),
      list(time = time_index$time_field)),
    tag = "estimation")
  
  fit = inla(lst ~ -1 + Intercept + time_years +
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
    control.predictor = list(
      A = inla.stack.A(model_stack),
      compute = TRUE),
    control.compute = list(dic = TRUE, waic = TRUE, 
                           cpo = TRUE, config = TRUE),
    control.inla = list(control.vb = list(enable = FALSE),
      int.strategy = "eb"),
    verbose = TRUE)
  
  list(prior = prior_spec,
       spde_u = spde_model_space,
       spde_v = spde_model_time,
       fit = fit)
}

# --------------------------------------------------------------------------- -
# 5. Fit all prior specifications ----
# --------------------------------------------------------------------------- -

fit_list = map(
  prior_grid,
  fit_prior_model,
  data = lst_data,
  mesh = mesh,
  A_space = A_space,
  A_time = A_time
)

names(fit_list) = map_chr(prior_grid, "name")

if (save_model_objects) {
  walk(names(fit_list), function(model_name) {
    saveRDS(
      fit_list[[model_name]],
      file = file.path(output_dir, paste0("fit_", model_name, ".rds"))
    )
  })
}

gc()

# --------------------------------------------------------------------------- -
# 6. Extract posterior and predictive summaries ----
# --------------------------------------------------------------------------- -

safe_extract = function(x, row_name, column_name) {
  if (is.null(x) || !(row_name %in% rownames(x)) || !(column_name %in% colnames(x))) {
    return(NA_real_)
  }
  
  x[row_name, column_name]
}

summarise_prior_fit = function(model_name, fit_object) {
  prior_spec = fit_object$prior
  fit = fit_object$fit
  hyperpar = fit$summary.hyperpar
  fixed = fit$summary.fixed
  
  tibble(
    model_name = model_name,
    
    # priors for u(s), the spatial intercept field
    range_u_r0 = prior_spec$prior.range.u[1],
    range_u_p0 = prior_spec$prior.range.u[2],
    sigma_u_s0 = prior_spec$prior.sigma.u[1],
    sigma_u_q0 = prior_spec$prior.sigma.u[2],
    
    # priors for v(s), the spatially varying temporal slope field
    range_v_r0 = prior_spec$prior.range.v[1],
    range_v_p0 = prior_spec$prior.range.v[2],
    sigma_v_s0 = prior_spec$prior.sigma.v[1],
    sigma_v_q0 = prior_spec$prior.sigma.v[2],
    
    # model fit criteria
    dic = fit$dic$dic,
    waic = fit$waic$waic,
    mean_cpo = ifelse(is.null(fit$cpo$cpo), NA_real_, 
                      mean(fit$cpo$cpo, na.rm = TRUE)),
    mean_log_cpo = ifelse(is.null(fit$cpo$cpo), NA_real_, 
                          mean(log(fit$cpo$cpo), na.rm = TRUE)),
    
    # posterior hyperparameters
    precision_gaussian_obs_mean = safe_extract(
      hyperpar,
      "Precision for the Gaussian observations",
      "mean"
    ),
    range_space_mean = safe_extract(hyperpar, "Range for space", "mean"),
    range_space_sd = safe_extract(hyperpar, "Range for space", "sd"),
    sd_space_mean = safe_extract(hyperpar, "Stdev for space", "mean"),
    sd_space_sd = safe_extract(hyperpar, "Stdev for space", "sd"),
    range_time_mean = safe_extract(hyperpar, "Range for time", "mean"),
    range_time_sd = safe_extract(hyperpar, "Range for time", "sd"),
    sd_time_mean = safe_extract(hyperpar, "Stdev for time", "mean"),
    sd_time_sd = safe_extract(hyperpar, "Stdev for time", "sd"),
    
    # fixed effects
    intercept_mean = safe_extract(fixed, "Intercept", "mean"),
    intercept_sd = safe_extract(fixed, "Intercept", "sd"),
    time_years_mean = safe_extract(fixed, "time_years", "mean"),
    time_years_sd = safe_extract(fixed, "time_years", "sd"))
}

model_summary = imap_dfr(fit_list, summarise_prior_fit)

# add delta metrics relative to the best WAIC model
best_waic = min(model_summary$waic, na.rm = TRUE)
best_dic = min(model_summary$dic, na.rm = TRUE)

model_summary = model_summary %>%
  mutate(
    delta_waic = waic - best_waic,
    delta_dic = dic - best_dic
  ) %>%
  arrange(waic)

write_csv(model_summary, file.path(output_dir, "prior_sensitivity_model_summary.csv"))

print(model_summary)

# --------------------------------------------------------------------------- -
# 7. Quantitative sensitivity metrics ----
# --------------------------------------------------------------------------- -

# compare fitted values against a reference model
# by default, the reference is the best-WAIC model
reference_model_name = model_summary$model_name[1]
reference_fitted_mean = fit_list[[reference_model_name]]$fit$summary.fitted.values$mean

fitted_value_sensitivity = imap_dfr(fit_list, function(fit_object, model_name) {
  fitted_mean = fit_object$fit$summary.fitted.values$mean
  difference = fitted_mean - reference_fitted_mean
  
  tibble(
    model_name = model_name,
    reference_model = reference_model_name,
    fitted_mean_abs_difference = mean(abs(difference), na.rm = TRUE),
    fitted_root_mean_squared_difference = sqrt(mean(difference^2, na.rm = TRUE)),
    fitted_correlation_with_reference = cor(fitted_mean, reference_fitted_mean, use = "complete.obs")
  )
})

write_csv(
  fitted_value_sensitivity,
  file.path(output_dir, "prior_sensitivity_fitted_value_distances.csv"))

# join model criteria and fitted-value distances
sensitivity_report = model_summary %>%
  left_join(fitted_value_sensitivity, by = "model_name")
write_csv(
  sensitivity_report,
  file.path(output_dir, "prior_sensitivity_report.csv"))
