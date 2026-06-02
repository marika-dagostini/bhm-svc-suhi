# Data

This folder contains the input and example data used to run the analysis workflow.

## Files

### `data_LST_Landsat8_ST10_13_16_Bologna.zip`

Subset of the processed Landsat 8 Collection 2 Level 2 land surface temperature data for the municipality of Bologna.

The full Landsat LST dataset used in the study covers summer observations from 2013 to 2025. Because of storage constraints, only a subset of the processed LST data is included in this repository. The subset allows users to test the workflow and reproduce the main computational steps.
The original Landsat 8 data are publicly available from the U.S. Geological Survey and can be accessed through [Google Earth Engine](https://earthengine.google.com/).

### `municipality_bologna.gpkg`

Geospatial file containing the administrative boundary of the municipality of Bologna used to clip the remote-sensing data and define the study area.

## External Data Sources

All external datasets used in the study are publicly available from the original providers. The full raw datasets are not duplicated in this repository.

### Landsat 8 Land Surface Temperature

Landsat 8 Collection 2 Level 2 surface temperature data were accessed through Google Earth Engine.

- Dataset: `LANDSAT/LC08/C02/T1_L2`
- Provider: U.S. Geological Survey
- Google Earth Engine Data Catalog: https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2

### Land Cover and Land Use

Land cover and land use data were obtained from the Italian Institute for Environmental Protection and Research (ISPRA).

- ISPRA land cover and land use data:  
  https://groupware.sinanet.isprambiente.it/uso-copertura-e-consumo-di-suolo/library/

### Elevation Data

Elevation data were obtained from the Digital Terrain Model distributed by the Geoportal of the Emilia-Romagna Region.

- Emilia-Romagna Geoportal — Digital Terrain Model:  
  https://geoportale.regione.emilia-romagna.it/catalogo/dati-cartografici/altimetria/layer-2

### Administrative Boundaries

Administrative boundaries were obtained from the Italian National Institute of Statistics (ISTAT).

- ISTAT administrative boundaries:  
  https://www.istat.it/notizia/confini-delle-unita-amministrative-a-fini-statistici-al-1-gennaio-2018/

## Notes

The data included in this folder are intended to support reproducibility of the computational workflow. Users who want to reproduce the full analysis should download the complete public datasets from the sources listed above and run the preprocessing scripts provided in the `code/` folder.
