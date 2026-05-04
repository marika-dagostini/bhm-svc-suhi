var createTextStyle = function(feature, resolution, labelText, labelFont,
                               labelFill, placement, bufferColor,
                               bufferWidth) {

    if (feature.hide || !labelText) {
        return; 
    } 

    if (bufferWidth == 0) {
        var bufferStyle = null;
    } else {
        var bufferStyle = new ol.style.Stroke({
            color: bufferColor,
            width: bufferWidth
        })
    }
    
    var textStyle = new ol.style.Text({
        font: labelFont,
        text: labelText,
        textBaseline: "middle",
        textAlign: "left",
        offsetX: 8,
        offsetY: 3,
        placement: placement,
        maxAngle: 0,
        fill: new ol.style.Fill({
          color: labelFill
        }),
        stroke: bufferStyle
    });

    return textStyle;
};

function stripe(stripeWidth, gapWidth, angle, color) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = screen.width;
    canvas.height = stripeWidth + gapWidth;
    context.fillStyle = color;
    context.lineWidth = stripeWidth;
    context.fillRect(0, 0, canvas.width, stripeWidth);
    innerPattern = context.createPattern(canvas, 'repeat');

    var outerCanvas = document.createElement('canvas');
    var outerContext = outerCanvas.getContext('2d');
    outerCanvas.width = screen.width;
    outerCanvas.height = screen.height;
    outerContext.rotate((Math.PI / 180) * angle);
    outerContext.translate(-(screen.width/2), -(screen.height/2));
    outerContext.fillStyle = innerPattern;
    outerContext.fillRect(0,0,screen.width,screen.height);

    return outerContext.createPattern(outerCanvas, 'no-repeat');
};



function clusterStyle(feature, resolution, singleFeatureStyle) {
    // Verifica se 'features' è definito e se è un array
    var features = feature.get('features');
    var size = Array.isArray(features) ? features.length : 0;
    var style;
  
    if (size === 1) {
      // Usa lo stile singolo per la feature
      style = singleFeatureStyle(feature, resolution);
    } else if (size > 1) {
      // Stile per cluster di feature
      var color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
      var radius = Math.max(8, Math.min(size * 0.75, 20));
      var dash = 2 * Math.PI * radius / 6;
      var dashArray = [0, dash, dash, dash, dash, dash, dash];
  
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          stroke: new ol.style.Stroke({
            color: "rgba(" + color + ",0.5)",
            width: 7,
          }),
          fill: new ol.style.Fill({
            color: "rgba(" + color + ",1)"
          })
        }),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: '#fff'
          })
        })
      });
    } else {
      // Gestire il caso in cui non ci siano feature (se necessario)
      style = singleFeatureStyle(feature, resolution);
    }
  
    return style;
  }
