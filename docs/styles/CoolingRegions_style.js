var clusterSize = 0;

var style_CoolingRegions = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    var labelText = "";
    var labelFont = "10px, sans-serif";
    var labelFill = "#000000";
    var bufferColor = "";
    var bufferWidth = 0;
    var textAlign = "left";
    var textPlacement = 'line';
    var offsetX = 8;
    var offsetY = 3; 
        var value = feature.get("") || "";
        if ("" !== null) {
            labelText = String("");
        }
        var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(48,48,126,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 4.028}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, textPlacement, bufferColor,
                              bufferWidth)
    })];

		var interval = 250;
		var geometry = feature.getGeometry();
		if (geometry.getType() === 'MultiLineString' || geometry.getType() === 'LineString') {
			var lines = geometry.getType() === 'MultiLineString' 
						? geometry.getLineStrings() 
						: [geometry];
			lines.forEach(function(line) {
				var length = line.getLength();
				var intervals = Math.ceil(length / (interval * resolution));
				for (let i = 1; i < intervals; ++i) { // will not place labels at the start and end of the line
					var point = line.getCoordinateAt(i / intervals);
					style.push(new ol.style.Style({
						text: createTextStyle(feature, resolution, labelText, labelFont, labelFill, 'line', bufferColor, bufferWidth),
						geometry: new ol.geom.Point(point)
					}));
				}
			});
		}

    return style;
};
