############################################################################## #
# D'Agostini M., Ventrucci M., de'Donato F. & Ranzi A. (2026) 
# A Bayesian Spatially Varying Coefficient Model 
# for Surface Urban Heat Island Estimation
############################################################################## #

# Description:
#   This script perform the exploratory analysis of the land surface 
#   temperature (LST) dataset.


# --------------------------------------------------------------------------- -
# 0. Setup ----
# --------------------------------------------------------------------------- -

# Install missing packages:
# install.packages(c("dplyr", "tidyr", "purrr", "sf", "terra", "ggplot2", 
#                   "readr", "here"))

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(purrr)
  library(sf)
  library(terra)
  library(ggplot2)
  library(readr)
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
# 2. Number of pixels for each location ----
# --------------------------------------------------------------------------- -

tab_idx = lst_data %>%
  group_by(cell_idx) %>%
  summarise(n_dates = n_distinct(date),
            mean = mean(lst),
            sd = sd(lst))

df_coords_ixd = unique(lst_data[,c("x","y","cell_idx")])
df_coords_ixd = merge(df_coords_ixd, tab_idx, by = "cell_idx", all.x = T)

p = ggplot() +
  geom_raster(data = df_coords_ixd,
              aes(x = x, y = y, fill = n_dates)) +
  scale_fill_gradientn(
    colours = RColorBrewer::brewer.pal(11, "RdYlGn"),
    name = "", na.value = "white") +
  geom_sf(data = bologna_boundary, inherit.aes = FALSE, 
          fill = NA, color = "grey40", size = 0.4) +
  guides(
    fill = guide_colourbar(
      direction = "horizontal", title.position = "left",
      title.hjust = 0, title.vjust = 0.85,
      barwidth = unit(5, "cm"), barheight = unit(0.5, "cm")
    ))+
  coord_sf() +
  theme_bw() +
  theme(
    axis.title = element_blank(), axis.text = element_blank(),
    axis.ticks = element_blank(), panel.grid = element_blank(),
    panel.background = element_rect(fill = "white", color = NA),
    plot.background = element_rect(fill = "white", color = NA),
    panel.border = element_blank(),
    strip.text = element_text(size = 12, face = "bold", color = "black"),
    strip.background = element_rect(fill = "grey80", color = "black", size = 0.5),
    legend.position = "bottom")

ggsave(filename = paste0(output_dir,"/number_pixels.png"), p,
       width = 2600, height = 2600, units = "px", dpi = 600)

# --------------------------------------------------------------------------- -
# 3. Boxplot - LST by month ----
# --------------------------------------------------------------------------- -

p = ggplot(lst_data, aes(x = Month, y = lst, fill = Month)) +
  geom_boxplot(
    width = 0.65, outlier.alpha = 0.25, outlier.size = 0.9) +
  scale_x_discrete(
    limits = rev,
    labels = c("06" = "June", "07" = "July", "08" = "August")) +
  labs(x = "Month", y = "Land Surface Temperature (°C)") +
  scale_fill_manual(
    values = c("06" = "grey85", "07" = "grey85", "08" = "grey85")) +
  coord_flip() +
  theme_bw(base_size = 18) +
  theme(
    axis.title.x = element_text(margin = margin(t = 12)),
    axis.title.y = element_text(margin = margin(r = 12)),
    axis.text.x = element_text(margin = margin(t = 10), angle = 45, hjust = 1),
    axis.text.y = element_text(margin = margin(r = 10)),
    legend.position = "none",
    panel.grid.minor = element_blank())

ggsave(filename = paste0(output_dir,"/box_plot_month.png"), p,
       width = 5600, height = 3200, units = "px", dpi = 600)

# --------------------------------------------------------------------------- -
# 3. Boxplot - LST by year ----
# --------------------------------------------------------------------------- -

p = ggplot(lst_data, aes(x = as.factor(Year), y = lst, fill = Year)) +
  geom_boxplot(
    width = 0.65, outlier.alpha = 0.25, outlier.size = 0.9, fill = "grey85" ) +
  scale_x_discrete(limits = rev) +
  labs(x = "Year", y = "Land Surface Temperature (°C)")  +
  coord_flip() +
  theme_bw(base_size = 18) +
  theme(
    axis.title.x = element_text(margin = margin(t = 12)),
    axis.title.y = element_text(margin = margin(r = 12)),
    axis.text.x = element_text(margin = margin(t = 10), angle = 45, hjust = 1),
    axis.text.y = element_text(margin = margin(r = 2)),
    legend.position = "none",
    panel.grid.minor = element_blank())

ggsave(filename = paste0(output_dir,"/box_plot_year.png"), p,
       width = 5600, height = 4200, units = "px", dpi = 600)
