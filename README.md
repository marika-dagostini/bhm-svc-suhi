# A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Analysis

This repository contains the code and data used to reproduce the analysis presented in the study 
>  *D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026) A Bayesian Spatially Varying Coefficient Model for Surface Urban Heat Island Analysis*. 

The project develops a Bayesian spatio-temporal framework for analysing surface urban heat island (SUHI) intensity and temporal change using satellite-derived land surface temperature (LST).

The model combines a spatially varying coefficient specification with the SPDE--INLA approach to separate persistent spatial variation in baseline LST from spatial variation in temporal trends. Posterior summaries are used to estimate SUHI intensity, assess its relationship with land cover and land use, and identify regions of statistically supported warming or cooling through posterior excursion sets.

The case study focuses on the municipality of Bologna, Italy, using summer Landsat 8 LST observations from 2013 to 2025, together with land cover, land use, and elevation data. Due to storage constraints, only a subset of the LST data is included, while the scripts provide the full workflow for data preprocessing, model fitting, posterior analysis, sensitivity checks, and visualisation of results.

## Repository Contents

- `code/`: R scripts used for data preprocessing, model fitting, posterior summaries, sensitivity analyses, and visualisation.
- `data/`: Input data and derived data products used in the analysis. Due to storage constraints, only a subset of the full LST dataset is included.
- `docs/`: Configuration files and assets for the interactive data-visualisation web app, available at: https://marika-dagostini.github.io/bhm-svc-suhi/

### Reproducibility and Random Seeds

The models in this repository are implemented using the INLA framework in R.

Unlike MCMC-based methods, `inla()` does not rely on random sampling for inference. As a result, setting an R random seed does not guarantee identical results across runs.

Small numerical differences may still occur due to:

* floating-point arithmetic,
* parallel computation,
* and differences in the order of operations.

These variations are typically negligible and do not affect the substantive results. Therefore, exact numerical reproducibility (bit-for-bit equality) should not be expected. Results should instead be interpreted up to numerical tolerance.
