var bologna_municipality = ee.FeatureCollection(
  "projects/hi-marikadagostini/assets/municipality_bologna");

var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");

// Cloud and shadow mask
function maskL8sr(image) {
  var qa = image.select('QA_PIXEL');

  var dilatedCloudBitMask = 1 << 1;
  var cirrusBitMask       = 1 << 2;
  var cloudBitMask        = 1 << 3;
  var cloudShadowBitMask  = 1 << 4;

  var mask = qa.bitwiseAnd(dilatedCloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0))
    .and(qa.bitwiseAnd(cloudBitMask).eq(0))
    .and(qa.bitwiseAnd(cloudShadowBitMask).eq(0));

  return image.updateMask(mask);
}

// Calculate LST in Celsius from ST_B10
function calcLST(image) {
  
  // get additive and multiplicative rescaling factors from metadata
  var ML = 0.00341802;
  var AL = 149.0;

  var lst = image.select('ST_B10')
    .multiply(ML)
    .add(AL)
    .subtract(273.15) // from Kelvin to Celsius
    .rename('LST')
    .toFloat();

  var qa = image.select('QA_PIXEL')
    .rename('QA')
    .toFloat();

  return lst.addBands(qa)
    .copyProperties(image, image.propertyNames());
}

// Filter images
var filteredCollection = L8
  .filterDate('2013-06-01', '2025-09-01')
  .filter(ee.Filter.calendarRange(6, 8, 'month')) // June, July, August
  .filterBounds(bologna_municipality)
  .map(maskL8sr)
  .map(calcLST);


// Export each image
var imageList = filteredCollection.toList(filteredCollection.size());

imageList.size().evaluate(function(count) {
  for (var i = 0; i < count; i++) {
    var img = ee.Image(imageList.get(i));
    var id = img.get('system:index').getInfo();

    Export.image.toDrive({
      image: img,
      description: 'Bologna_LST_QA_' + id,
      region: bologna_municipality.geometry(),
      scale: 30,
      folder: 'LST_QA_Bologna',
      fileFormat: 'GeoTIFF',
      maxPixels: 1e13
    });
  }
});
