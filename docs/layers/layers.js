var wms_layers = [];

var lyr_OSMStandard = new ol.layer.Tile({
  title: 'Basemap',
  source: new ol.source.XYZ({
    url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png',
    attributions: [
      '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    ]
  })
});

var lyr_Voyager = new ol.layer.Tile({
            'title': 'Labels',
            'opacity': 1.000000,
            source: new ol.source.XYZ({
                url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png'
            })
        });
        
var lyr_June2013 = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/June2013.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249629.274315, 5530474.360217, 1272977.082897, 5552320.386213],
    attributions: '<a class="legend"><b>June 2013</b><br /></a>'
        }),
    opacity: 1,
    permalink: "June2013",
    
     
    title: '<div id="layertitle">June 2013<br />\
        </i></div><a class="layerlegend"></a>'
        });
    
var lyr_June2025 = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/June2025.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249629.274315, 5530474.360217, 1272977.082897, 5552320.386213],
    attributions: '<a class="legend"><b>June 2025</b><br /></a>'
        }),
    opacity: 1,
    permalink: "June2025",
    
     
    title: '<div id="layertitle">June 2025<br />\
        </div><a class="layerlegend"></a>'
        });
    
var lyr_PosteriorSD = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/PosteriorSD.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969618, 5530466.251247, 1272987.037882, 5552327.065035],
    attributions: '<a class="legend"><b>Posterior SD</b><br />\
        <img src="styles/legend/PosteriorSD_0.png" /> 0,04<br />\
        <img src="styles/legend/PosteriorSD_1.png" /> 0,05<br />\
        <img src="styles/legend/PosteriorSD_2.png" /> 0,06<br />\
        <img src="styles/legend/PosteriorSD_3.png" /> 0,07<br />\
        <img src="styles/legend/PosteriorSD_4.png" /> 0,08<br />\
        <img src="styles/legend/PosteriorSD_5.png" /> 0,09<br /></a>'
        }),
    opacity: 1,
    permalink: "PosteriorSD",
    
     
    title: '<div id="layertitle">Posterior SD<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/PosteriorSD_0.png" /> 0,04<br />\
        <img src="styles/legend/PosteriorSD_1.png" /> 0,05<br />\
        <img src="styles/legend/PosteriorSD_2.png" /> 0,06<br />\
        <img src="styles/legend/PosteriorSD_3.png" /> 0,07<br />\
        <img src="styles/legend/PosteriorSD_4.png" /> 0,08<br />\
        <img src="styles/legend/PosteriorSD_5.png" /> 0,09<br /></a>'
        });
    
var lyr_PosteriorMean = new ol.layer.Image({
    source: new ol.source.ImageStatic({
        url: "./layers/PosteriorMean.png",
        projection: 'EPSG:3857',
        alwaysInRange: true,
        imageExtent: [1249622.969618, 5530466.251247, 1272987.037882, 5552327.065035],
    attributions: '<a class="legend"><b>β+v(s) - Temporal Trend</b><br />\
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
    permalink: "PosteriorMean",
    
     
    title: '<div id="layertitle">β+v(s) - Temporal Trend<br />\
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
    
var format_MeanLSTChange = new ol.format.GeoJSON();
var features_MeanLSTChange = format_MeanLSTChange.readFeatures(json_MeanLSTChange, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_MeanLSTChange = new ol.source.Vector({
    attributions: '<a class="legend"><b>Mean LST Change</b><br />\
        <img src="styles/legend/MeanLSTChange_0.png" /> -4,07 - -4<br />\
        <img src="styles/legend/MeanLSTChange_1.png" /> -4 - -3<br />\
        <img src="styles/legend/MeanLSTChange_2.png" /> -3 - -2<br />\
        <img src="styles/legend/MeanLSTChange_3.png" /> -2 - -1<br />\
        <img src="styles/legend/MeanLSTChange_4.png" /> -1 - 0<br />\
        <img src="styles/legend/MeanLSTChange_5.png" /> 0 - 1<br />\
        <img src="styles/legend/MeanLSTChange_6.png" /> 1 - 2<br />\
        <img src="styles/legend/MeanLSTChange_7.png" /> 2 - 3<br />\
        <img src="styles/legend/MeanLSTChange_8.png" /> 3 - 4<br />\
        <img src="styles/legend/MeanLSTChange_9.png" /> 4 - 5<br />\
        <img src="styles/legend/MeanLSTChange_10.png" /> 5 - 5,2<br /></a>'
        });
var lyr_MeanLSTChange = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_MeanLSTChange, 
    style: style_MeanLSTChange,
    permalink: "MeanLSTChange",
    popuplayertitle: 'Mean LST Change',
    creationdate: '2026-03-21 19:16:51',
    interactive: false,
    title: '<div id="layertitle">Mean LST Change<br />\
        <i class="fas fa-angle-up" id="secondImage"></i><i class="fas fa-angle-down" id="firstImage"></i></div><a class="layerlegend">\
        <img src="styles/legend/MeanLSTChange_10.png" /> 5 - 5,2<br />\
        <img src="styles/legend/MeanLSTChange_9.png" /> 4 - 5<br />\
        <img src="styles/legend/MeanLSTChange_8.png" /> 3 - 4<br />\
        <img src="styles/legend/MeanLSTChange_7.png" /> 2 - 3<br />\
        <img src="styles/legend/MeanLSTChange_6.png" /> 1 - 2<br />\
        <img src="styles/legend/MeanLSTChange_5.png" /> 0 - 1<br />\
        <img src="styles/legend/MeanLSTChange_4.png" /> -1 - 0<br />\
        <img src="styles/legend/MeanLSTChange_3.png" /> -2 - -1<br />\
        <img src="styles/legend/MeanLSTChange_2.png" /> -3 - -2<br />\
        <img src="styles/legend/MeanLSTChange_1.png" /> -4 - -3<br />\
        <img src="styles/legend/MeanLSTChange_0.png" /> -4,07 - -4<br /></a>'
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
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_WarmingRegions = new ol.source.Vector({
    attributions: '<a class="legend"><img src="styles/legend/WarmingRegions.png" /> <b>Warming Regions</b>'
    });
var lyr_WarmingRegions = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_WarmingRegions, 
    style: style_WarmingRegions,
    permalink: "WarmingRegions",
    popuplayertitle: 'Warming Regions',
    creationdate: '2026-03-21 19:16:51',
    interactive: false,
    title: '<img src="styles/legend/WarmingRegions.png" /> Warming Regions'
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
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_CoolingRegions = new ol.source.Vector({
    attributions: '<a class="legend"><img src="styles/legend/CoolingRegions.png" /> <b>Cooling Regions</b>'
    });
var lyr_CoolingRegions = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_CoolingRegions, 
    style: style_CoolingRegions,
    permalink: "CoolingRegions",
    popuplayertitle: 'Cooling Regions',
    creationdate: '2026-03-21 19:16:51',
    interactive: false,
    title: '<img src="styles/legend/CoolingRegions.png" /> Cooling Regions'
    });
var featureCounter_CoolingRegions = 1;
jsonSource_CoolingRegions.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_CoolingRegions++);
    feature.set("layerObject", lyr_CoolingRegions);
});        
jsonSource_CoolingRegions.addFeatures(features_CoolingRegions);

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
    attributions: '<a class="legend"><b>v(s)</b><br />\
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
    
     
    title: '<div id="layertitle">v(s)<br />\
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
    attributions: '<a class="legend"><b>α + u(s) - Persistent Spatial Pattern</b><br />\
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
    permalink: "PosteriorMean",
    
     
    title: '<div id="layertitle">α + u(s) - Persistent Spatial Pattern<br />\
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
    attributions: '<a class="legend"><b>SUHI - Posterior SD</b><br />\
        <img src="styles/legend/SUHIPosteriorSD_0.png" /> 1,10<br />\
        <img src="styles/legend/SUHIPosteriorSD_1.png" /> 1,20<br />\
        <img src="styles/legend/SUHIPosteriorSD_2.png" /> 1,29<br />\
        <img src="styles/legend/SUHIPosteriorSD_3.png" /> 1,39<br />\
        <img src="styles/legend/SUHIPosteriorSD_4.png" /> 1,48<br /></a>'
        }),
    opacity: 1,
    permalink: "SUHIPosteriorSD",
    
     
    title: '<div id="layertitle">SUHI - Posterior SD<br />\
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
    attributions: '<a class="legend"><b>SUHI - Posterior Mean</b><br />\
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
    
     
    title: '<div id="layertitle">SUHI - Posterior Mean<br />\
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
    
     
    title: '<div id="layertitle">u(s)<br />\
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
    
var format_MunicipalityofBologna = new ol.format.GeoJSON();
var features_MunicipalityofBologna = format_MunicipalityofBologna.readFeatures(json_MunicipalityofBologna, 
    {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_MunicipalityofBologna = new ol.source.Vector({
    attributions: '<a class="legend"><img src="styles/legend/MunicipalityofBologna.png" /> <b>Municipality of Bologna</b>'
    });
var lyr_MunicipalityofBologna = new ol.layer.Vector({
    declutter: false,
    source: jsonSource_MunicipalityofBologna, 
    style: style_MunicipalityofBologna,
    permalink: "MunicipalityofBologna",
    popuplayertitle: 'Municipality of Bologna',
    creationdate: '2026-03-21 19:16:51',
    interactive: false,
    title: '<img src="styles/legend/MunicipalityofBologna.png" /> Municipality of Bologna'
    });
var featureCounter_MunicipalityofBologna = 1;
jsonSource_MunicipalityofBologna.on('addfeature', function (event) {
    var feature = event.feature;
    feature.set("idO", featureCounter_MunicipalityofBologna++);
    feature.set("layerObject", lyr_MunicipalityofBologna);
});        
jsonSource_MunicipalityofBologna.addFeatures(features_MunicipalityofBologna);

var group_Boundaries = new ol.layer.Group({
                            layers: [lyr_Voyager,lyr_MunicipalityofBologna,],
                            openInLayerSwitcher: true,
                            title: 'Boundaries and Labels',
                            noOpacity: true});
var group_Land = new ol.layer.Group({
                        layers: [lyr_LandUse,lyr_LandCover,],
                        openInLayerSwitcher: true,
                        title: 'Land Classification',
                        noOpacity: true});
var group_SpatialResults = new ol.layer.Group({
                                layers: [lyr_PosteriorMean,lyr_PosteriorMean_alpha_us,lyr_vsPosteriorMean,lyr_usPosteriorMean,],
                                openInLayerSwitcher: true,
                                title: 'Random Fields - Posterior Means',
                                noOpacity: true});
var group_PersistentSpatialPattern = new ol.layer.Group({
                                layers: [lyr_SUHIPosteriorSD,lyr_SUHIPosteriorMean,],
                                openInLayerSwitcher: true,
                                title: 'Surface Urban Heat Island',
                                noOpacity: true});
var group_TemporalResults = new ol.layer.Group({
                                layers: [lyr_MeanLSTChange,lyr_WarmingRegions,lyr_CoolingRegions,],
                                openInLayerSwitcher: true,
                                title: 'Excursion Sets',
                                noOpacity: true});
var group_SurfaceReflectance = new ol.layer.Group({
                                layers: [lyr_June2013,lyr_June2025,],
                                openInLayerSwitcher: true,
                                title: 'Surface Reflectance',
                                noOpacity: true});

lyr_Voyager.setVisible(false);lyr_OSMStandard.setVisible(true);lyr_June2013.setVisible(false);lyr_June2025.setVisible(false);
lyr_PosteriorSD.setVisible(false);lyr_PosteriorMean.setVisible(false);lyr_MeanLSTChange.setVisible(false);
lyr_WarmingRegions.setVisible(false);lyr_CoolingRegions.setVisible(false);lyr_PosteriorMean_alpha_us.setVisible(false);
lyr_vsPosteriorSD.setVisible(false);lyr_vsPosteriorMean.setVisible(false);lyr_SUHIPosteriorSD.setVisible(false);lyr_SUHIPosteriorMean.setVisible(false);lyr_usPosteriorSD.setVisible(false);lyr_usPosteriorMean.setVisible(false);lyr_LandCover.setVisible(false);lyr_LandUse.setVisible(false);lyr_MunicipalityofBologna.setVisible(true);
var layersList = [lyr_OSMStandard,group_SurfaceReflectance,group_TemporalResults,group_SpatialResults,group_Land,group_Boundaries];
lyr_MeanLSTChange.set('fieldAliases', {'fid': 'fid', '_count': '_count', '_sum': '_sum', '_mean': '_mean', 'total_effect_14-25': 'total_effect_14-25', '_stdev': '_stdev', 'mean_12y': 'mean_12y', 'fid_2': 'fid_2', '_count_2': '_count_2', '_sum_2': '_sum_2', '_mean_2': '_mean_2', '_stdev_2': '_stdev_2', 'mean_tot_14_25': 'mean_tot_14_25', 'mean_12y_2': 'mean_12y_2', 'mean_12y_merged': 'mean_12y_merged', });
lyr_WarmingRegions.set('fieldAliases', {'FID': 'FID', });
lyr_CoolingRegions.set('fieldAliases', {'FID': 'FID', });
lyr_MunicipalityofBologna.set('fieldAliases', {'OBJECTID_1': 'OBJECTID_1', 'OBJECTID': 'OBJECTID', 'ISTAT': 'ISTAT', 'NOME_C': 'NOME_C', 'CD_BLF': 'CD_BLF', 'PRV_ID_E': 'PRV_ID_E', 'TY_E': 'TY_E', 'ID_E': 'ID_E', 'DT_INI_VAL': 'DT_INI_VAL', 'DATA_AGG': 'DATA_AGG', 'D_TIPO_AGG': 'D_TIPO_AGG', 'DT_PRES': 'DT_PRES', 'ST_VALID': 'ST_VALID', 'ST_CERTIF': 'ST_CERTIF', 'QUALITA': 'QUALITA', 'METODO': 'METODO', 'D_METODO': 'D_METODO', 'COMP_FONTI': 'COMP_FONTI', 'SEZ_ID_E': 'SEZ_ID_E', 'INT_FONTI': 'INT_FONTI', 'VISIBILITA': 'VISIBILITA', 'TIPO_FONTE': 'TIPO_FONTE', 'DATA_DA': 'DATA_DA', 'DATA_A': 'DATA_A', 'SHAPE_Leng': 'SHAPE_Leng', 'DT_FIN_VAL': 'DT_FIN_VAL', 'Shape_Le_1': 'Shape_Le_1', 'Shape_Le_2': 'Shape_Le_2', 'Shape_Area': 'Shape_Area', });
lyr_MeanLSTChange.set('fieldImages', {'fid': 'TextEdit', '_count': 'TextEdit', '_sum': 'TextEdit', '_mean': 'TextEdit', 'total_effect_14-25': 'TextEdit', '_stdev': 'TextEdit', 'mean_12y': 'TextEdit', 'fid_2': 'TextEdit', '_count_2': 'TextEdit', '_sum_2': 'TextEdit', '_mean_2': 'TextEdit', '_stdev_2': 'TextEdit', 'mean_tot_14_25': 'TextEdit', 'mean_12y_2': 'TextEdit', 'mean_12y_merged': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_WarmingRegions.set('fieldImages', {'FID': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_CoolingRegions.set('fieldImages', {'FID': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_MunicipalityofBologna.set('fieldImages', {'OBJECTID_1': 'TextEdit', 'OBJECTID': 'TextEdit', 'ISTAT': 'TextEdit', 'NOME_C': 'TextEdit', 'CD_BLF': 'TextEdit', 'PRV_ID_E': 'TextEdit', 'TY_E': 'TextEdit', 'ID_E': 'TextEdit', 'DT_INI_VAL': 'DateTime', 'DATA_AGG': 'DateTime', 'D_TIPO_AGG': 'TextEdit', 'DT_PRES': 'DateTime', 'ST_VALID': 'TextEdit', 'ST_CERTIF': 'TextEdit', 'QUALITA': 'TextEdit', 'METODO': 'TextEdit', 'D_METODO': 'TextEdit', 'COMP_FONTI': 'TextEdit', 'SEZ_ID_E': 'TextEdit', 'INT_FONTI': 'TextEdit', 'VISIBILITA': 'TextEdit', 'TIPO_FONTE': 'TextEdit', 'DATA_DA': 'DateTime', 'DATA_A': 'DateTime', 'SHAPE_Leng': 'TextEdit', 'DT_FIN_VAL': 'DateTime', 'Shape_Le_1': 'TextEdit', 'Shape_Le_2': 'TextEdit', 'Shape_Area': 'TextEdit', 'layerObject': 'Hidden', 'idO': 'Hidden'});
lyr_MeanLSTChange.set('fieldLabels', {'fid': 'no label', '_count': 'no label', '_sum': 'no label', '_mean': 'no label', 'total_effect_14-25': 'no label', '_stdev': 'no label', 'mean_12y': 'no label', 'fid_2': 'no label', '_count_2': 'no label', '_sum_2': 'no label', '_mean_2': 'no label', '_stdev_2': 'no label', 'mean_tot_14_25': 'no label', 'mean_12y_2': 'no label', 'mean_12y_merged': 'no label', });
lyr_WarmingRegions.set('fieldLabels', {'FID': 'no label', });
lyr_CoolingRegions.set('fieldLabels', {'FID': 'header label - visible with data', });
lyr_MunicipalityofBologna.set('fieldLabels', {'OBJECTID_1': 'no label', 'OBJECTID': 'no label', 'ISTAT': 'no label', 'NOME_C': 'no label', 'CD_BLF': 'no label', 'PRV_ID_E': 'no label', 'TY_E': 'no label', 'ID_E': 'no label', 'DT_INI_VAL': 'no label', 'DATA_AGG': 'no label', 'D_TIPO_AGG': 'no label', 'DT_PRES': 'no label', 'ST_VALID': 'no label', 'ST_CERTIF': 'no label', 'QUALITA': 'no label', 'METODO': 'no label', 'D_METODO': 'no label', 'COMP_FONTI': 'no label', 'SEZ_ID_E': 'no label', 'INT_FONTI': 'no label', 'VISIBILITA': 'no label', 'TIPO_FONTE': 'no label', 'DATA_DA': 'no label', 'DATA_A': 'no label', 'SHAPE_Leng': 'no label', 'DT_FIN_VAL': 'no label', 'Shape_Le_1': 'no label', 'Shape_Le_2': 'no label', 'Shape_Area': 'no label', });
lyr_MunicipalityofBologna.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});

window.layersLoadedFlag = true;
const layersLoaded = new Event('layersLoaded');
document.dispatchEvent(layersLoaded);
