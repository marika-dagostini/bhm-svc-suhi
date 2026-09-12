# A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Estimation

<br>

This repository contains the code and data used to reproduce the analysis presented in the study 
>  *D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026+) A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Estimation*. 

The project develops a Bayesian spatio-temporal framework for analysing surface urban heat island (SUHI) intensity and temporal change using satellite-derived land surface temperature (LST).

The model combines a spatially varying coefficient specification with the SPDE-INLA approach to separate persistent spatial variation in baseline LST from spatial variation in temporal trends. Posterior summaries are used to estimate SUHI intensity, assess its relationship with land cover and land use, and identify regions of statistically supported warming or cooling through posterior excursion sets.

The case study focuses on the municipality of Bologna, Italy.

> #### 🗺️ Explore the project results ➡️ [**Interactive Web Map**](https://marika-dagostini.github.io/bhm-svc-suhi/)

<br>

## Repository Contents

- `code/`: R scripts used for data preprocessing, model fitting, sensitivity analyses, and visualisation
- `data/`: Example input data and derived data products 
- `docs/`: Configuration files and assets for the interactive data-visualisation web app

<br>

>[!NOTE]
> All datasets used in this study are publicly available from the original providers. To avoid duplicating large remote-sensing datasets, the repository does not include the full Landsat LST archive. Instead, it provides a subset of the processed LST data that allows users to test the workflow and reproduce the main computational steps.
