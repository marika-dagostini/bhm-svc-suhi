ol.proj.proj4.register(proj4);
//ol.proj.get("EPSG:32632").setExtent([665991.400419, 4917132.362926, 708059.315241, 4942941.383839]);
var wms_layers = [];

var lyr_OSMStandard = new ol.layer.Tile({
            'title': 'OSM Standard',
            'baseLayer':'true',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, CC-BY-SA</a>',
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });

var lyr_LandCover = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/LandCover.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969563, 5530466.661843, 1272973.228749, 5552327.064966],
    attributions: '<a class="legend"><b>Land Cover</b><br />\
        <img src="styles/legend/LandCover_0.png" /> Other Unclassified Artificial Surfaces<br />\
        <img src="styles/legend/LandCover_1.png" /> Impermeable Surfaces<br />\
        <img src="styles/legend/LandCover_2.png" /> Permeable Surfaces<br />\
        <img src="styles/legend/LandCover_3.png" /> Consolidated Surfaces<br />\
        <img src="styles/legend/LandCover_4.png" /> Unconsolidated Surfaces<br />\
        <img src="styles/legend/LandCover_5.png" /> Broadleaf Trees<br />\
        <img src="styles/legend/LandCover_6.png" /> Coniferous Trees<br />\
        <img src="styles/legend/LandCover_7.png" /> Shrublands<br />\
        <img src="styles/legend/LandCover_8.png" /> Periodic Herbaceous Vegetation<br />\
        <img src="styles/legend/LandCover_9.png" /> Permanent Herbaceous Vegetation<br />\
        <img src="styles/legend/LandCover_10.png" /> Permanent Water Bodies<br />\
        <img src="styles/legend/LandCover_11.png" /> Permanent Ice and Snow<br />\
        <img src="styles/legend/LandCover_12.png" /> Wetlands<br /></a>'
        }),
    opacity: 1,
    permalink: "LandCover",
    title: '<div id="layertitle">Land Cover<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/LandCover_0.png" /> Other Unclassified Artificial Surfaces<br />\
        <img src="styles/legend/LandCover_1.png" /> Impermeable Surfaces<br />\
        <img src="styles/legend/LandCover_2.png" /> Permeable Surfaces<br />\
        <img src="styles/legend/LandCover_3.png" /> Consolidated Surfaces<br />\
        <img src="styles/legend/LandCover_4.png" /> Unconsolidated Surfaces<br />\
        <img src="styles/legend/LandCover_5.png" /> Broadleaf Trees<br />\
        <img src="styles/legend/LandCover_6.png" /> Coniferous Trees<br />\
        <img src="styles/legend/LandCover_7.png" /> Shrublands<br />\
        <img src="styles/legend/LandCover_8.png" /> Periodic Herbaceous Vegetation<br />\
        <img src="styles/legend/LandCover_9.png" /> Permanent Herbaceous Vegetation<br />\
        <img src="styles/legend/LandCover_10.png" /> Permanent Water Bodies<br />\
        <img src="styles/legend/LandCover_11.png" /> Permanent Ice and Snow<br />\
        <img src="styles/legend/LandCover_12.png" /> Wetlands<br /></a>'
        });

var lyr_LandUse = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/LandUse.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969563, 5530466.661843, 1272973.228749, 5552327.064966],
    attributions: '<a class="legend"><b>Land Use</b><br />\
        <img src="styles/legend/LandUse_0.png" /> Forest Use<br />\
        <img src="styles/legend/LandUse_1.png" /> Quarries and Mines<br />\
        <img src="styles/legend/LandUse_2.png" /> Urban and Related Areas<br />\
        <img src="styles/legend/LandUse_3.png" /> Water Bodies<br />\
        <img src="styles/legend/LandUse_4.png" /> Arable Land (Cropland)<br />\
        <img src="styles/legend/LandUse_5.png" /> Forage Crops<br />\
        <img src="styles/legend/LandUse_6.png" /> Permanent Crops<br />\
        <img src="styles/legend/LandUse_7.png" /> Agroforestry Areas<br />\
        <img src="styles/legend/LandUse_8.png" /> Other Agricultural Uses<br />\
        <img src="styles/legend/LandUse_9.png" /> Wetlands<br />\
        <img src="styles/legend/LandUse_10.png" /> Other Non-economic Uses<br /></a>'
        }),
    opacity: 1,
    permalink: "LandUse",
    title: '<div id="layertitle">Land Use<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/LandUse_0.png" /> Forest Use<br />\
        <img src="styles/legend/LandUse_1.png" /> Quarries and Mines<br />\
        <img src="styles/legend/LandUse_2.png" /> Urban and Related Areas<br />\
        <img src="styles/legend/LandUse_3.png" /> Water Bodies<br />\
        <img src="styles/legend/LandUse_4.png" /> Arable Land (Cropland)<br />\
        <img src="styles/legend/LandUse_5.png" /> Forage Crops<br />\
        <img src="styles/legend/LandUse_6.png" /> Permanent Crops<br />\
        <img src="styles/legend/LandUse_7.png" /> Agroforestry Areas<br />\
        <img src="styles/legend/LandUse_8.png" /> Other Agricultural Uses<br />\
        <img src="styles/legend/LandUse_9.png" /> Wetlands<br />\
        <img src="styles/legend/LandUse_10.png" /> Other Non-economic Uses<br /></a>'
        });
        

var format_MeanLSTChange = new ol.format.GeoJSON();
var features_MeanLSTChange = format_MeanLSTChange.readFeatures(json_MeanLSTChange, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:32632'});
var jsonSource_MeanLSTChange = new ol.source.Vector({
        attributions:
    '<a class="legend"><b>Mean LST Change</b><br />\
        <img src="styles/legend/MeanLSTChange_0.png"/>-4,07 - -4<br />\
        <img src="styles/legend/MeanLSTChange_1.png"/>-4 - -3<br />\
        <img src="styles/legend/MeanLSTChange_2.png"/>-3 - -2<br />\
        <img src="styles/legend/MeanLSTChange_3.png"/>-2 - -1<br />\
        <img src="styles/legend/MeanLSTChange_4.png"/>-1 - 0<br />\
        <img src="styles/legend/MeanLSTChange_5.png"/>0 - 1<br />\
        <img src="styles/legend/MeanLSTChange_6.png"/>1 - 2<br />\
        <img src="styles/legend/MeanLSTChange_7.png"/>2 - 3<br />\
        <img src="styles/legend/MeanLSTChange_8.png"/>3 - 4<br />\
        <img src="styles/legend/MeanLSTChange_9.png"/>4 - 5<br />\
        <img src="styles/legend/MeanLSTChange_10.png"/>5 - 5,2<br /></a>'
        });
var lyr_MeanLSTChange = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_MeanLSTChange, 
    sourceType: 'json',
    permalink: "MeanLSTChange",
    popuplayertitle: 'Mean LST Change',
    creationdate: '2026-07-30 02:08:48',
    interactive: false,
    style: style_MeanLSTChange,
    title: '<div id="layertitle">Mean LST Change<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="-4.07" max-value="-4.0" checked><img src="styles/legend/MeanLSTChange_0.png"/>-4,07 - -4<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="-3.999999" max-value="-3.0" checked><img src="styles/legend/MeanLSTChange_1.png"/>-4 - -3<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="-2.999999" max-value="-2.0" checked><img src="styles/legend/MeanLSTChange_2.png"/>-3 - -2<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="-1.999999" max-value="-1.0" checked><img src="styles/legend/MeanLSTChange_3.png"/>-2 - -1<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="-0.999999" max-value="0.0" checked><img src="styles/legend/MeanLSTChange_4.png"/>-1 - 0<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="1e-06" max-value="1.0" checked><img src="styles/legend/MeanLSTChange_5.png"/>0 - 1<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="1.000001" max-value="2.0" checked><img src="styles/legend/MeanLSTChange_6.png"/>1 - 2<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="2.000001" max-value="3.0" checked><img src="styles/legend/MeanLSTChange_7.png"/>2 - 3<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="3.000001" max-value="4.0" checked><img src="styles/legend/MeanLSTChange_8.png"/>3 - 4<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="4.000001" max-value="5.0" checked><img src="styles/legend/MeanLSTChange_9.png"/>4 - 5<br />\
        <input type="checkbox" class="symbology" symbology-type="graduated" min-value="5.000001" max-value="5.2" checked><img src="styles/legend/MeanLSTChange_10.png"/>5 - 5,2<br /></a>'
        });
var featureCounter_MeanLSTChange = 1;
jsonSource_MeanLSTChange.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_MeanLSTChange++);
    feature.set("layerObject", lyr_MeanLSTChange);
});        
jsonSource_MeanLSTChange.addFeatures(features_MeanLSTChange);


var format_WarmingRegions = new ol.format.GeoJSON();
var features_WarmingRegions = format_WarmingRegions.readFeatures(json_WarmingRegions, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:32632'});
var jsonSource_WarmingRegions = new ol.source.Vector({
        attributions:'<a class="legend"><img src="styles/legend/WarmingRegions.png"/><b>Warming Regions</b>'
        });
var lyr_WarmingRegions = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_WarmingRegions, 
    sourceType: 'json',
    permalink: "WarmingRegions",
    popuplayertitle: 'Warming Regions',
    creationdate: '2026-07-30 02:08:48',
    interactive: false,
    style: style_WarmingRegions,
    title: '<img src="styles/legend/WarmingRegions.png"/>Warming Regions'
    });
var featureCounter_WarmingRegions = 1;
jsonSource_WarmingRegions.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_WarmingRegions++);
    feature.set("layerObject", lyr_WarmingRegions);
});        
jsonSource_WarmingRegions.addFeatures(features_WarmingRegions);


var format_CoolingRegions = new ol.format.GeoJSON();
var features_CoolingRegions = format_CoolingRegions.readFeatures(json_CoolingRegions, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:32632'});
var jsonSource_CoolingRegions = new ol.source.Vector({
        attributions:'<a class="legend"><img src="styles/legend/CoolingRegions.png"/><b>Cooling Regions</b>'
        });
var lyr_CoolingRegions = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_CoolingRegions, 
    sourceType: 'json',
    permalink: "CoolingRegions",
    popuplayertitle: 'Cooling Regions',
    creationdate: '2026-07-30 02:08:48',
    interactive: false,
    style: style_CoolingRegions,
    title: '<img src="styles/legend/CoolingRegions.png"/>Cooling Regions'
    });
var featureCounter_CoolingRegions = 1;
jsonSource_CoolingRegions.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_CoolingRegions++);
    feature.set("layerObject", lyr_CoolingRegions);
});        
jsonSource_CoolingRegions.addFeatures(features_CoolingRegions);


var format_MunicipalityofBologna = new ol.format.GeoJSON();
var features_MunicipalityofBologna = format_MunicipalityofBologna.readFeatures(json_MunicipalityofBologna, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:32632'});
var jsonSource_MunicipalityofBologna = new ol.source.Vector({
        attributions:'<a class="legend"><img src="styles/legend/MunicipalityofBologna.png"/><b>Municipality of Bologna</b>'
        });
var lyr_MunicipalityofBologna = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_MunicipalityofBologna, 
    sourceType: 'json',
    permalink: "MunicipalityofBologna",
    popuplayertitle: 'Municipality of Bologna',
    creationdate: '2026-07-30 02:08:48',
    interactive: false,
    style: style_MunicipalityofBologna,
    title: '<img src="styles/legend/MunicipalityofBologna.png"/>Municipality of Bologna'
    });
var featureCounter_MunicipalityofBologna = 1;
jsonSource_MunicipalityofBologna.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_MunicipalityofBologna++);
    feature.set("layerObject", lyr_MunicipalityofBologna);
});        
jsonSource_MunicipalityofBologna.addFeatures(features_MunicipalityofBologna);

var lyr_PosteriorMean_beta_vs = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/PosteriorMean.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969618, 5530466.251247, 1272987.037882, 5552327.065035],
    attributions: '<a class="legend"><b>β+v(s) - Posterior Mean</b><br />\
        <img src="styles/legend/PosteriorMean_8.png" /> 0,72<br />\
        <img src="styles/legend/PosteriorMean_7.png" /> 0,57<br />\
        <img src="styles/legend/PosteriorMean_6.png" /> 0,39<br />\
        <img src="styles/legend/PosteriorMean_5.png" /> 0,20<br />\
        <img src="styles/legend/PosteriorMean_4.png" /> 0,01<br />\
        <img src="styles/legend/PosteriorMean_3.png" /> -0,18<br />\
        <img src="styles/legend/PosteriorMean_2.png" /> -0,38<br />\
        <img src="styles/legend/PosteriorMean_1.png" /> -0,57<br />\
        <img src="styles/legend/PosteriorMean_0.png" /> -0,76<br /></a>'
        }),
    opacity: 1,
    permalink: "PosteriorMeanBetaVs",
    title: '<div id="layertitle">β+v(s) - Posterior Mean<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/PosteriorMean_8.png" /> 0,72<br />\
        <img src="styles/legend/PosteriorMean_7.png" /> 0,57<br />\
        <img src="styles/legend/PosteriorMean_6.png" /> 0,39<br />\
        <img src="styles/legend/PosteriorMean_5.png" /> 0,20<br />\
        <img src="styles/legend/PosteriorMean_4.png" /> 0,01<br />\
        <img src="styles/legend/PosteriorMean_3.png" /> -0,18<br />\
        <img src="styles/legend/PosteriorMean_2.png" /> -0,38<br />\
        <img src="styles/legend/PosteriorMean_1.png" /> -0,57<br />\
        <img src="styles/legend/PosteriorMean_0.png" /> -0,76<br /></a>'
        });

var lyr_vsPosteriorSD = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/vsPosteriorSD.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.477437, 5530481.577854, 1272969.872405, 5552313.551122],
    attributions: '<a class="legend"><b>v(s) - Posterior SD</b><br />\
        <img src="styles/legend/vsPosteriorSD_0.png" /> 0,03<br />\
        <img src="styles/legend/vsPosteriorSD_1.png" /> 0,04<br />\
        <img src="styles/legend/vsPosteriorSD_2.png" /> 0,05<br />\
        <img src="styles/legend/vsPosteriorSD_3.png" /> 0,06<br />\
        <img src="styles/legend/vsPosteriorSD_4.png" /> 0,07<br /></a>'
        }),
    opacity: 1,
    permalink: "vsPosteriorSD",
    title: '<div id="layertitle">v(s) - Posterior SD<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/vsPosteriorSD_0.png" /> 0,03<br />\
        <img src="styles/legend/vsPosteriorSD_1.png" /> 0,04<br />\
        <img src="styles/legend/vsPosteriorSD_2.png" /> 0,05<br />\
        <img src="styles/legend/vsPosteriorSD_3.png" /> 0,06<br />\
        <img src="styles/legend/vsPosteriorSD_4.png" /> 0,07<br /></a>'
        });
    
var lyr_vsPosteriorMean = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/vsPosteriorMean.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.477437, 5530481.577854, 1272969.872405, 5552313.551122],
    attributions: '<a class="legend"><b>v(s) - Posterior Mean</b><br />\
        <img src="styles/legend/vsPosteriorMean_0.png" /> -0,88<br />\
        <img src="styles/legend/vsPosteriorMean_1.png" /> -0,70<br />\
        <img src="styles/legend/vsPosteriorMean_2.png" /> -0,52<br />\
        <img src="styles/legend/vsPosteriorMean_3.png" /> -0,33<br />\
        <img src="styles/legend/vsPosteriorMean_4.png" /> -0,15<br />\
        <img src="styles/legend/vsPosteriorMean_5.png" /> 0,03<br />\
        <img src="styles/legend/vsPosteriorMean_6.png" /> 0,21<br />\
        <img src="styles/legend/vsPosteriorMean_7.png" /> 0,40<br />\
        <img src="styles/legend/vsPosteriorMean_8.png" /> 0,58<br /></a>'
        }),
    opacity: 1,
    permalink: "vsPosteriorMean",
    title: '<div id="layertitle">v(s) - Posterior Mean<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/vsPosteriorMean_8.png" /> 0,58<br />\
        <img src="styles/legend/vsPosteriorMean_7.png" /> 0,40<br />\
        <img src="styles/legend/vsPosteriorMean_6.png" /> 0,21<br />\
        <img src="styles/legend/vsPosteriorMean_5.png" /> 0,03<br />\
        <img src="styles/legend/vsPosteriorMean_4.png" /> -0,15<br />\
        <img src="styles/legend/vsPosteriorMean_3.png" /> -0,33<br />\
        <img src="styles/legend/vsPosteriorMean_2.png" /> -0,52<br />\
        <img src="styles/legend/vsPosteriorMean_1.png" /> -0,70<br />\
        <img src="styles/legend/vsPosteriorMean_0.png" /> -0,88<br /></a>'
        });

var lyr_PosteriorMean_alpha_us = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/PosteriorMean_alpha_us.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969618, 5530466.251247, 1272987.037882, 5552327.065035],
    attributions: '<a class="legend"><b>α + u(s) - Posterior Mean</b><br />\
        <img src="styles/legend/PosteriorMean_alpha_us_0.png" /> 29,89<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_1.png" /> 32,09<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_2.png" /> 34,29<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_3.png" /> 36,50<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_4.png" /> 38,70<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_5.png" /> 40,90<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_6.png" /> 43,10<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_7.png" /> 45,30<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_8.png" /> 47,51<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_9.png" /> 49,71<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_10.png" /> 51,91<br /></a>'
        }),
    opacity: 1,
    permalink: "PosteriorMeanAlphaUs",
    title: '<div id="layertitle">α + u(s) - Posterior Mean<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/PosteriorMean_alpha_us_0.png" /> 29,89<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_1.png" /> 32,09<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_2.png" /> 34,29<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_3.png" /> 36,50<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_4.png" /> 38,70<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_5.png" /> 40,90<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_6.png" /> 43,10<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_7.png" /> 45,30<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_8.png" /> 47,51<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_9.png" /> 49,71<br />\
        <img src="styles/legend/PosteriorMean_alpha_us_10.png" /> 51,91<br /></a>'
        });
    
var lyr_SUHIPosteriorSD = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/SUHIPosteriorSD.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969618, 5530466.251247, 1272987.037882, 5552327.065035],
    attributions: '<a class="legend"><b>Posterior SD</b><br />\
        <img src="styles/legend/SUHIPosteriorSD_0.png" /> 1,10<br />\
        <img src="styles/legend/SUHIPosteriorSD_1.png" /> 1,20<br />\
        <img src="styles/legend/SUHIPosteriorSD_2.png" /> 1,29<br />\
        <img src="styles/legend/SUHIPosteriorSD_3.png" /> 1,39<br />\
        <img src="styles/legend/SUHIPosteriorSD_4.png" /> 1,48<br /></a>'
        }),
    opacity: 1,
    permalink: "SUHIPosteriorSD",
    title: '<div id="layertitle">Posterior SD<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/SUHIPosteriorSD_0.png" /> 1,10<br />\
        <img src="styles/legend/SUHIPosteriorSD_1.png" /> 1,20<br />\
        <img src="styles/legend/SUHIPosteriorSD_2.png" /> 1,29<br />\
        <img src="styles/legend/SUHIPosteriorSD_3.png" /> 1,39<br />\
        <img src="styles/legend/SUHIPosteriorSD_4.png" /> 1,48<br /></a>'
        });
    
var lyr_SUHIPosteriorMean = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/SUHIPosteriorMean.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249664.310193, 5530466.251247, 1272986.614698, 5552311.695170],
    attributions: '<a class="legend"><b>Posterior Mean</b><br />\
        <img src="styles/legend/SUHIPosteriorMean_0.png" /> 0,10<br />\
        <img src="styles/legend/SUHIPosteriorMean_1.png" /> 1,90<br />\
        <img src="styles/legend/SUHIPosteriorMean_2.png" /> 3,71<br />\
        <img src="styles/legend/SUHIPosteriorMean_3.png" /> 5,51<br />\
        <img src="styles/legend/SUHIPosteriorMean_4.png" /> 7,31<br />\
        <img src="styles/legend/SUHIPosteriorMean_5.png" /> 9,12<br />\
        <img src="styles/legend/SUHIPosteriorMean_6.png" /> 10,92<br />\
        <img src="styles/legend/SUHIPosteriorMean_7.png" /> 12,72<br />\
        <img src="styles/legend/SUHIPosteriorMean_8.png" /> 14,53<br />\
        <img src="styles/legend/SUHIPosteriorMean_9.png" /> 16,33<br />\
        <img src="styles/legend/SUHIPosteriorMean_10.png" /> 18,13<br />\
        <img src="styles/legend/SUHIPosteriorMean_11.png" /> 19,94<br />\
        <img src="styles/legend/SUHIPosteriorMean_12.png" /> 21,74<br /></a>'
        }),
    opacity: 1,
    permalink: "SUHIPosteriorMean",
    title: '<div id="layertitle">Posterior Mean<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/SUHIPosteriorMean_0.png" /> 0,10<br />\
        <img src="styles/legend/SUHIPosteriorMean_1.png" /> 1,90<br />\
        <img src="styles/legend/SUHIPosteriorMean_2.png" /> 3,71<br />\
        <img src="styles/legend/SUHIPosteriorMean_3.png" /> 5,51<br />\
        <img src="styles/legend/SUHIPosteriorMean_4.png" /> 7,31<br />\
        <img src="styles/legend/SUHIPosteriorMean_5.png" /> 9,12<br />\
        <img src="styles/legend/SUHIPosteriorMean_6.png" /> 10,92<br />\
        <img src="styles/legend/SUHIPosteriorMean_7.png" /> 12,72<br />\
        <img src="styles/legend/SUHIPosteriorMean_8.png" /> 14,53<br />\
        <img src="styles/legend/SUHIPosteriorMean_9.png" /> 16,33<br />\
        <img src="styles/legend/SUHIPosteriorMean_10.png" /> 18,13<br />\
        <img src="styles/legend/SUHIPosteriorMean_11.png" /> 19,94<br />\
        <img src="styles/legend/SUHIPosteriorMean_12.png" /> 21,74<br /></a>'
        });
    
var lyr_usPosteriorSD = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/usPosteriorSD.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.477437, 5530481.577854, 1272969.872405, 5552313.551122],
    attributions: '<a class="legend"><b>u(s) - Posterior SD</b><br />\
        <img src="styles/legend/usPosteriorSD_0.png" /> 0,32<br />\
        <img src="styles/legend/usPosteriorSD_1.png" /> 0,36<br />\
        <img src="styles/legend/usPosteriorSD_2.png" /> 0,40<br />\
        <img src="styles/legend/usPosteriorSD_3.png" /> 0,43<br />\
        <img src="styles/legend/usPosteriorSD_4.png" /> 0,47<br />\
        <img src="styles/legend/usPosteriorSD_5.png" /> 0,51<br />\
        <img src="styles/legend/usPosteriorSD_6.png" /> 0,55<br />\
        <img src="styles/legend/usPosteriorSD_7.png" /> 0,58<br />\
        <img src="styles/legend/usPosteriorSD_8.png" /> 0,61<br /></a>'
        }),
    opacity: 1,
    permalink: "usPosteriorSD",
    title: '<div id="layertitle">u(s) - Posterior SD<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/usPosteriorSD_0.png" /> 0,32<br />\
        <img src="styles/legend/usPosteriorSD_1.png" /> 0,36<br />\
        <img src="styles/legend/usPosteriorSD_2.png" /> 0,40<br />\
        <img src="styles/legend/usPosteriorSD_3.png" /> 0,43<br />\
        <img src="styles/legend/usPosteriorSD_4.png" /> 0,47<br />\
        <img src="styles/legend/usPosteriorSD_5.png" /> 0,51<br />\
        <img src="styles/legend/usPosteriorSD_6.png" /> 0,55<br />\
        <img src="styles/legend/usPosteriorSD_7.png" /> 0,58<br />\
        <img src="styles/legend/usPosteriorSD_8.png" /> 0,61<br /></a>'
        });
    
var lyr_usPosteriorMean = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/usPosteriorMean.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.477437, 5530481.577854, 1272969.872405, 5552313.551122],
    attributions: '<a class="legend"><b>u(s)</b><br />\
        <img src="styles/legend/usPosteriorMean_0.png" /> -9,73<br />\
        <img src="styles/legend/usPosteriorMean_1.png" /> -6,60<br />\
        <img src="styles/legend/usPosteriorMean_2.png" /> -3,46<br />\
        <img src="styles/legend/usPosteriorMean_3.png" /> -0,33<br />\
        <img src="styles/legend/usPosteriorMean_4.png" /> 2,81<br />\
        <img src="styles/legend/usPosteriorMean_5.png" /> 5,94<br />\
        <img src="styles/legend/usPosteriorMean_6.png" /> 9,08<br />\
        <img src="styles/legend/usPosteriorMean_7.png" /> 12,21<br /></a>'
        }),
    opacity: 1,
    permalink: "usPosteriorMean",
    title: '<div id="layertitle">u(s) - Posterior Mean<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/usPosteriorMean_7.png" /> 12,21<br />\
        <img src="styles/legend/usPosteriorMean_6.png" /> 9,08<br />\
        <img src="styles/legend/usPosteriorMean_5.png" /> 5,94<br />\
        <img src="styles/legend/usPosteriorMean_4.png" /> 2,81<br />\
        <img src="styles/legend/usPosteriorMean_3.png" /> -0,33<br />\
        <img src="styles/legend/usPosteriorMean_2.png" /> -3,46<br />\
        <img src="styles/legend/usPosteriorMean_1.png" /> -6,60<br />\
        <img src="styles/legend/usPosteriorMean_0.png" /> -9,73<br /></a>'
        });



window.layersLoadedFlag = true;
const layersLoaded = new Event('layersLoaded');
document.dispatchEvent(layersLoaded);
var group_StudyArea = new ol.layer.Group({
                                layers: [lyr_MunicipalityofBologna,],
                                openInLayerSwitcher: true,
                                title: 'Study Area'});
var group_LandClassification = new ol.layer.Group({
                                layers: [lyr_LandUse, lyr_LandCover,],
                                openInLayerSwitcher: true,
                                title: 'Land Classification'});
var group_SpatialRandomFields = new ol.layer.Group({
                                layers: [lyr_vsPosteriorSD, lyr_vsPosteriorMean, lyr_usPosteriorSD,lyr_usPosteriorMean,],
                                openInLayerSwitcher: true,
                                title: 'Spatial Random Fields'});
var group_PersistentSpatialPatternalphaus = new ol.layer.Group({
                                layers: [lyr_PosteriorMean_alpha_us,],
                                openInLayerSwitcher: true,
                                title: 'Persistent Spatial Pattern in LST'});
var group_SurfaceUrbanHeatIsland = new ol.layer.Group({
                                layers: [lyr_SUHIPosteriorSD, lyr_SUHIPosteriorMean,],
                                openInLayerSwitcher: true,
                                title: 'Surface Urban Heat Island'});
var group_TemporalTrendbetavs = new ol.layer.Group({
                                layers: [lyr_PosteriorMean_beta_vs,],
                                openInLayerSwitcher: true,
                                title: 'Temporal Trend in LST'});
var group_ExcursionSets = new ol.layer.Group({
                                layers: [lyr_MeanLSTChange,lyr_WarmingRegions,lyr_CoolingRegions,],
                                openInLayerSwitcher: true,
                                title: 'Excursion Sets'});

lyr_OSMStandard.setVisible(true);lyr_MeanLSTChange.setVisible(false);lyr_WarmingRegions.setVisible(false);lyr_CoolingRegions.setVisible(false);lyr_MunicipalityofBologna.setVisible(false);
;lyr_LandCover.setVisible(false);lyr_LandUse.setVisible(false);lyr_PosteriorMean_alpha_us.setVisible(false);lyr_PosteriorMean_beta_vs.setVisible(false);
lyr_SUHIPosteriorMean.setVisible(false);lyr_SUHIPosteriorSD.setVisible(false);lyr_vsPosteriorMean.setVisible(false);
lyr_vsPosteriorSD.setVisible(false);lyr_usPosteriorMean.setVisible(false);lyr_usPosteriorSD.setVisible(false);
var layersList = [lyr_OSMStandard,group_ExcursionSets,group_TemporalTrendbetavs,group_SurfaceUrbanHeatIsland,group_PersistentSpatialPatternalphaus,group_SpatialRandomFields,group_LandClassification,group_StudyArea];
lyr_MeanLSTChange.set('fieldAliases', {'fid': 'fid', '_count': '_count', '_sum': '_sum', '_mean': '_mean', 'total_effect_14-25': 'total_effect_14-25', '_stdev': '_stdev', 'mean_12y': 'mean_12y', 'fid_2': 'fid_2', '_count_2': '_count_2', '_sum_2': '_sum_2', '_mean_2': '_mean_2', '_stdev_2': '_stdev_2', 'mean_tot_14_25': 'mean_tot_14_25', 'mean_12y_2': 'mean_12y_2', 'mean_12y_merged': 'mean_12y_merged', });
lyr_WarmingRegions.set('fieldAliases', {'FID': 'FID', });
lyr_CoolingRegions.set('fieldAliases', {'FID': 'FID', });
lyr_MunicipalityofBologna.set('fieldAliases', {'OBJECTID': 'OBJECTID', 'ISTAT': 'ISTAT', 'NOME_C': 'NOME_C', });
lyr_MeanLSTChange.set('fieldImages', {'fid': 'TextEdit', '_count': 'TextEdit', '_sum': 'TextEdit', '_mean': 'TextEdit', 'total_effect_14-25': 'TextEdit', '_stdev': 'TextEdit', 'mean_12y': 'TextEdit', 'fid_2': 'TextEdit', '_count_2': 'TextEdit', '_sum_2': 'TextEdit', '_mean_2': 'TextEdit', '_stdev_2': 'TextEdit', 'mean_tot_14_25': 'TextEdit', 'mean_12y_2': 'TextEdit', 'mean_12y_merged': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_WarmingRegions.set('fieldImages', {'FID': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_CoolingRegions.set('fieldImages', {'FID': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_MunicipalityofBologna.set('fieldImages', {'OBJECTID': 'TextEdit', 'ISTAT': 'TextEdit', 'NOME_C': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_MeanLSTChange.set('fieldLabels', {'fid': 'no label', '_count': 'no label', '_sum': 'no label', '_mean': 'no label', 'total_effect_14-25': 'no label', '_stdev': 'no label', 'mean_12y': 'no label', 'fid_2': 'no label', '_count_2': 'no label', '_sum_2': 'no label', '_mean_2': 'no label', '_stdev_2': 'no label', 'mean_tot_14_25': 'no label', 'mean_12y_2': 'no label', 'mean_12y_merged': 'no label', });
lyr_WarmingRegions.set('fieldLabels', {'FID': 'header label - visible with data', });
lyr_CoolingRegions.set('fieldLabels', {'FID': 'header label - visible with data', });
lyr_MunicipalityofBologna.set('fieldLabels', {'OBJECTID': 'no label', 'ISTAT': 'no label', 'NOME_C': 'no label', });
