# Code

This folder contains the scripts used to preprocess the data, fit the Bayesian spatially varying coefficient model, compute posterior summaries, perform sensitivity analyses, and generate outputs for the surface urban heat island analysis.

## Scripts

### `01_GEE_lst_landsat8.js`

Google Earth Engine script used to retrieve and preprocess Landsat 8 Collection 2 Level 2 land surface temperature data. The script clips the images to the study area, applies quality masking, converts the thermal product to degrees Celsius, and exports the processed LST rasters.

### `02_GEE_rasters_to_csv.R`

R script used to convert the exported raster files into tabular format for statistical modelling. The output includes the spatial coordinates, acquisition date or time index, and LST values used as input for the Bayesian model.

### `03_exploratoy_analysis.R`

R script used to perform an exploratory analysis of the land surface temperature (LST) data. The outputs include an assessment of the number of observations available for each pixel within the study area and an analysis of LST distributions by year and month.

### `04_fit_svc_excursions.R`

R script used to fit the Bayesian spatially varying coefficient model with the SPDE-INLA framework. The script estimates the baseline spatial field, the spatially varying temporal trend, posterior summaries, SUHI intensity, and posterior excursion sets for warming and cooling regions.

### `05_sensitivity_analysis.R`

R script used to assess the sensitivity of the model to alternative Penalised Complexity prior specifications for the spatial range parameters. The script compares posterior summaries and model selection criteria across prior configurations.

## Running the workflow

The scripts should be run in numerical order:

```text
01_GEE_lst_landsat8.js
02_GEE_rasters_to_csv.R
03_fit_svc_excursions.R
04_sensitivity_analysis.R
