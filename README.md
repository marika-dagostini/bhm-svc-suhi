# A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Estimation

This repository contains the code and data used to reproduce the analysis presented in the study 
>  *D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026) A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Estimation*. 

The project develops a Bayesian spatio-temporal framework for analysing surface urban heat island (SUHI) intensity and temporal change using satellite-derived land surface temperature (LST).

The model combines a spatially varying coefficient specification with the SPDE-INLA approach to separate persistent spatial variation in baseline LST from spatial variation in temporal trends. Posterior summaries are used to estimate SUHI intensity, assess its relationship with land cover and land use, and identify regions of statistically supported warming or cooling through posterior excursion sets.

The case study focuses on the municipality of Bologna, Italy, using summer Landsat 8 LST observations from 2013 to 2025, together with land cover, land use, and elevation data. Due to storage constraints, only a subset of the LST data is included, while the scripts provide the full workflow for data preprocessing, model fitting, posterior analysis, sensitivity checks, and visualisation of results.

## Repository Contents

- `code/`: R scripts used for data preprocessing, model fitting, posterior summaries, sensitivity analyses, and visualisation.
- `data/`: Example input data and derived data products used to test the workflow. 
- `docs/`: Configuration files and assets for the interactive data-visualisation web app, available at: https://marika-dagostini.github.io/bhm-svc-suhi/

## Data Availability

All external datasets used in this study are publicly available from the original providers. To avoid duplicating large remote-sensing datasets, the repository does not include the full Landsat LST archive. Instead, it provides a subset of the processed LST data that allows users to test the workflow and reproduce the main computational steps.

The full analysis can be reproduced by downloading the original datasets from their public sources and running the preprocessing scripts provided in the `code/` folder. Land cover, land use, elevation, and administrative boundary data are publicly available from the sources cited in the manuscript.
