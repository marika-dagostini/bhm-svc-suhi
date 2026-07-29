############################################################################## #
# D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026) 
# A Bayesian Spatially Varying Coefficient Model 
# for Surface Urban Heat Island Estimation
############################################################################## #

# Convert Google Earth Engine Landsat LST Raster Exports to CSV

# Description:
#   This script imports Landsat land surface temperature raster images exported
#   from Google Earth Engine (GEE), clips them to the Municipality of Bologna,
#   extracts pixel-level values, assigns acquisition dates from filenames, and
#   exports a long-format CSV suitable for downstream spatial-temporal modelling.
#
# Reproducibility notes:
#   - Place GEE raster exports in data/LST_QA_Bologna/

# --------------------------------------------------------------------------- -
# 0. Setup ----
# --------------------------------------------------------------------------- -

# Install missing packages:
# install.packages(c("dplyr", "purrr", "sf", "terra", "readr", "here"))

suppressPackageStartupMessages({
  library(dplyr)
  library(purrr)
  library(sf)
  library(terra)
  library(readr)
  library(here)
})

setwd(here())

# input files
raster_root_dir = file.path("./data/LST_QA_Bologna/")
bologna_boundary = st_read("municipality_bologna.gpkg")

# output directory and file
output_csv = file.path(getwd(), "data_LST_Landsat8_ST10_13_25_Bologna.csv")

# --------------------------------------------------------------------------- -
# 1. Locate GEE raster files ----
# --------------------------------------------------------------------------- -

# Raster files are expected to be stored inside one or more subfolders.
# The recursive search allows a flexible folder structure.
raster_files = list.files(
  path = raster_root_dir,
  pattern = "\\.tif$",
  full.names = TRUE,
  recursive = TRUE,
  ignore.case = TRUE
)

message("Number of raster files found: ", length(raster_files))

# --------------------------------------------------------------------------- -
# 2. Import Bologna boundary ----
# --------------------------------------------------------------------------- -

bologna_boundary = st_read(bologna_boundary_file, quiet = TRUE)

# match boundary CRS to first raster CRS
first_raster = rast(raster_files[[1]])
raster_crs = terra::crs(first_raster)

bologna_boundary = st_transform(bologna_boundary, crs = raster_crs)
bologna_boundary_vect = terra::vect(bologna_boundary)

# --------------------------------------------------------------------------- -
# 3. Helper functions ----
# --------------------------------------------------------------------------- -

extract_date_from_filename = function(file_path) {
  # extract the first 8-digit sequence (date) beginning with 20xx
  file_name = basename(file_path)
  date_string = regmatches(file_name, regexpr("(20)[0-9]{6}", file_name))
  
  as.Date(date_string, format = "%Y%m%d")
}

read_lst_raster_as_dataframe = function(file_path, boundary_vect) {
  message("Processing: ", file_path)
  
  raster_stack = rast(file_path)
  
  if (!("LST" %in% names(raster_stack))) {
    stop("The raster does not contain a band named 'LST': ", file_path)
  }
  
  acquisition_date = extract_date_from_filename(file_path)
  
  lst_raster = raster_stack[["LST"]] %>%
    crop(boundary_vect, mask = TRUE)
  
  lst_df = as.data.frame(lst_raster, xy = TRUE, na.rm = TRUE)
  names(lst_df)[3] = "lst"
  
  lst_df %>%
    mutate(
      date = acquisition_date,
      Month = factor(format(date, "%m")),
      Year = format(date, "%Y"),
      source_file = basename(file_path)
    ) %>%
    select(x, y, lst, date, Month, Year, source_file)
}
}

# --------------------------------------------------------------------------- -
# 4. Convert rasters to long-format data frame ----
# --------------------------------------------------------------------------- -

lst_long = map_dfr(
  raster_files,
  read_lst_raster_as_dataframe,
  boundary_vect = bologna_boundary_vect
)

message("Rows in final long-format data set: ", nrow(lst_long))
message("Date range: ", min(lst_long$date), " to ", max(lst_long$date))

# --------------------------------------------------------------------------- -
# 5. Export CSV ----
# --------------------------------------------------------------------------- -

write_csv(lst_long, output_csv)
