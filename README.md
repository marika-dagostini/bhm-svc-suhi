# Spatio-Temporal Bayesian Modelling of Land Surface Temperature and SUHI Dynamics

This repository contains the data and scripts used for the spatio-temporal Bayesian hierarchical modelling of land surface temperature (LST) and surface urban heat island (SUHI) dynamics using spatially varying coefficients (SVC) within the SPDE–INLA framework.

## Reproducibility and Random Seeds

The models in this repository are implemented using the INLA framework in R.

Unlike MCMC-based methods, `inla()` does not rely on random sampling for inference. As a result, setting an R random seed does not guarantee identical results across runs.

Small numerical differences may still occur due to:

* floating-point arithmetic,
* parallel computation,
* and differences in the order of operations.

These variations are typically negligible and do not affect the substantive results. Therefore, exact numerical reproducibility (bit-for-bit equality) should not be expected. Results should instead be interpreted up to numerical tolerance.
