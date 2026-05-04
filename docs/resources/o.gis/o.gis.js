////////////////////////////// GLOBAL VARIABLES

// Get all layers from all group
	var allLayers = map.getAllLayers();
	
// Draw Style Pre and Post
	var drawStylePre = [
		new ol.style.Style({
		  /* fill: new ol.style.Fill({
			color: "rgba(255, 255, 255, 0.2)"
		  }), */
		  stroke: new ol.style.Stroke({
			//color: "rgba(255, 204, 51)", //giallo ocra
			color: "rgba(0, 0, 255)", //blu
			lineDash: [10, 10],
			width: 4
		  }),
		  image: new ol.style.Circle({
		radius: 6,
		stroke: new ol.style.Stroke({
		  color: "rgba(255, 255, 255)", //cerchio esterno bianco
		  width: 1
		}),
			  //fill: new ol.style.Fill({
		//color: "rgba(255, 204, 51, 0.7)", // giallo ocra
		//}),
		  })
		}),
		new ol.style.Style({
		  /* fill: new ol.style.Fill({
			color: "rgba(255, 255, 255, 0.2)"
		  }), */
		  
			stroke: new ol.style.Stroke({
			//color: "rgba(0, 0, 255)", //blu
			color: "rgba(255, 255, 255)", //bianco
			lineDash: [10, 10],
			width: 2
		  }),
		  image: new ol.style.Circle({
		radius: 5,
		stroke: new ol.style.Stroke({
		  color: "rgba(0, 0, 255)", // cerchio interno blu
		  width: 1
		}),
			  fill: new ol.style.Fill({
		  color: "rgba(255, 204, 51, 0.4)", // giallo ocra
		}),
		  })
		})
	];
	
	
	var drawStylePost = [
	  new ol.style.Style({
		  stroke: new ol.style.Stroke({
			color: "rgba(255, 255, 255)", //white
			width: 6
		  }),
		  image: new ol.style.Circle({
			fill: new ol.style.Fill({
			  color: "rgba(0, 0, 255)" // blu
			}),
			 stroke: new ol.style.Stroke({
			  color: "rgba(255, 255, 255)", //white
			  width: 2
			}),
			radius: 5
		  })			
		}),
	  new ol.style.Style({
		  stroke: new ol.style.Stroke({
			color: "rgba(0, 0, 255)", // blu
			width: 3
		  })
		})
	];
		
// Spatial query fixed			
	var spatialQueryLayer = new ol.layer.Vector({
		displayInLayerSwitcher: false,
		source: new ol.source.Vector(),
		style: drawStylePost,
	});
	map.addLayer(spatialQueryLayer);

	var spatialQueriedFeatureStyle = new ol.style.Style({
	  fill: new ol.style.Fill({
		color: "rgba(255, 255, 0, 0.25)", //yellow fill
	  }),
	  stroke: new ol.style.Stroke({
		color: "rgba(255, 255, 0, 0.8)", //yellow stroke,
		width: 3
	  }),
	  image: new ol.style.Circle({
		fill: new ol.style.Fill({
		  color: "rgba(255, 255, 0, 0.25)", //yellow fill
		}),
		stroke: new ol.style.Stroke({
		  color: "rgba(255, 255, 0, 0.8)", //yellow stroke for point
		  width: 3
		}),
		radius: 6
	  })
	});

	var spatialQueriedFeatureLayer = new ol.layer.Vector({
		displayInLayerSwitcher: false,
		source: new ol.source.Vector(),
		style: function (feature, resolution) {
			var originalLayer = feature.get('layerObject');
			if (originalLayer) {
				var baseStyle = spatialQueriedFeatureStyle
				return getAndChangeLayerStyle(originalLayer, feature, resolution, baseStyle)
			} else {
			return spatialQueriedFeatureStyle;
			}
		}
	});
	map.addLayer(spatialQueriedFeatureLayer);
		
// select layer style
		var selectStyle = new ol.style.Style({
		  fill: new ol.style.Fill({
			color: "rgba(255, 255, 255, 0.25)", //white
		  }),
		  stroke: new ol.style.Stroke({
			color: "rgba(0, 255, 255, 0.8)", //ciano
			width: 3
		  }),
		  image: new ol.style.Circle({
			stroke: new ol.style.Stroke({
			  color: "rgba(0, 255, 255, 0.8)", //ciano
			  width: 3
			}),
			radius: 6
		  })
		});

// vector layer for selected feature
	var selectLayer = new ol.layer.Vector({
		displayInLayerSwitcher: false,
		source: new ol.source.Vector(),
		style: function (feature, resolution) {
			var originalLayer = feature.get('layerObject');
			if (originalLayer) {
				var baseStyle = selectStyle
				return getAndChangeLayerStyle(originalLayer, feature, resolution, baseStyle)
			} else {
			return selectStyle;
			}
		}
	});
	map.addLayer(selectLayer);

/*
// Funzione per trovare il layer contenente la feature
	function findFeatureLayer (feature) {
		return allLayers.find(function(layer) {
			if (layer instanceof ol.layer.Vector || layer instanceof ol.layer.AnimatedCluster || layer instanceof ol.layer.VectorImage) {
				if (layer instanceof ol.layer.AnimatedCluster) {
					// trova il layer che contiene la feature nel cluster
					return layer.getSource().getFeatures().some(function(clusterFeature) {
						var clusterFeatures = clusterFeature.get('features');
						return clusterFeatures && clusterFeatures.indexOf(feature) > -1;
					});
				} else {
					// trova il layer che contiene la feature
					return layer.getSource().getFeatures().indexOf(feature) > -1;
				}
			}
			return false;
		});
	}
*/
	
// Funzione per acquisire lo stile dal layer ed applicarlo alla feature di sovrapposizione
	function getAndChangeLayerStyle (originalLayer, feature, resolution, baseStyle) {
		var originalStyleFunction = originalLayer.getStyleFunction();
		var originalStyles = originalStyleFunction(feature, resolution);
		if (Array.isArray(originalStyles)) {
			return originalStyles.map(function (style) {
				var clonedStyle = style.clone();
				var geometryType = feature.getGeometry().getType();
				var image = clonedStyle.getImage();
				// gestisco le icone fontsymbol ol-ext, le icone svg e le geometrie punto
				if (image instanceof ol.style.FontSymbol || image instanceof ol.style.RegularShape) {
					//prendo lo stile originale della feature ma lo cambio impostando
					//il colore e la larghezza prendendoli da baseStyle					
					var imageStroke = image.getStroke();
					if (imageStroke) { // Controlla se lo stroke è definito
						imageStroke.setColor(baseStyle.getStroke().getColor());
						imageStroke.setWidth(baseStyle.getStroke().getWidth());
					} else { // creo uno stroke se non esiste
						var radius = image.getRadius();
						clonedStyle.setImage(
                            new ol.style.Circle({
								radius: radius,
                                stroke: new ol.style.Stroke({
                                    color: baseStyle.getStroke().getColor(),
                                    width: baseStyle.getStroke().getWidth()
                                })
                            })
                        );                        
					}
					if (image instanceof ol.style.RegularShape) {
						image.render();
					}
				}
				var stroke = clonedStyle.getStroke();
				var fill = clonedStyle.getFill();
				// gestisco geometrie linea e poligono
				if (stroke) {
					//prendo lo stile originale della feature ma lo cambio impostando
					//il colore e la larghezza del bordo prendendoli da baseStyle
					//il colore di sfondo prendendolo da baseStyle
					if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
						stroke.setColor(baseStyle.getStroke().getColor());
					} else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
						stroke.setColor(baseStyle.getStroke().getColor());
						stroke.setWidth(baseStyle.getStroke().getWidth());
						fill.setColor(baseStyle.getFill().getColor());
					}
				} else { // creo uno stroke se non esiste
					clonedStyle.setStroke(new ol.style.Stroke({
						color: baseStyle.getStroke().getColor(),
						width: baseStyle.getStroke().getWidth()
					}));					
				}
				return clonedStyle;
			});
		}
	}
	
// highlight layer style
	var highlightFeatureStyle = new ol.style.Style({
	  fill: new ol.style.Fill({
		color: "rgba(255, 255, 255, 0.25)" //white
	  }),
	  stroke: new ol.style.Stroke({
		color: "rgba(255, 0, 255, 0.8)", //magenta 
		width: 3
	  }),
	  image: new ol.style.Circle({
		stroke: new ol.style.Stroke({
		  color: "rgba(255, 0, 255, 0.8)", //magenta
		  width: 3
		}),
		radius: 6
	  })
	});

// vector layer for highlight feature
	var highlightLayer = new ol.layer.Vector({
		displayInLayerSwitcher: false,
		source: new ol.source.Vector(),
		style: function (feature, resolution) {
			var originalLayer = feature.get('layerObject');
			if (originalLayer) {
				var baseStyle = highlightFeatureStyle
				return getAndChangeLayerStyle(originalLayer, feature, resolution, baseStyle)
			} else {
			return highlightFeatureStyle;
			}
		}
	});
	map.addLayer(highlightLayer);	
		
// function to re-add vector layers for drawing - anche spatial query after the thematic map change
	function reAddVectorLayersDrawingAndSpatial() {
		map.addLayer(spatialQueryLayer);
		map.addLayer(spatialQueriedFeatureLayer);
		map.addLayer(spatialQueryPreBufferedFeatureLayer);
		map.addLayer(spatialQueryLastBufferedFeatureLayer);
		
		map.addLayer(measureLayer); 
		map.addLayer(editBarLayer);
		map.addLayer(selectLayer);
		map.addLayer(highlightLayer);	
	}

// change logo on smartphone
	if (hasTouchScreen) {
	  $('#form_logo').addClass('touch');
	}		
		
// change cursor
	function styleCursorHelp() {
		map.getViewport().style.cursor = "help";
		map.on('pointerdrag', function(evt) {
			map.getViewport().style.cursor = "grab";
		});
		map.on('pointerup', function(evt) {
			map.getViewport().style.cursor = "help";
		});
	}
	styleCursorHelp();
	
	function styleCursorDefault() {
		map.getViewport().style.cursor = "default";
		map.on('pointerdrag', function(evt) {
		map.getViewport().style.cursor = "grab";
		});
		map.on('pointerup', function(evt) {
		map.getViewport().style.cursor = "default";
		});
	}
	
	function styleCursorPointer() {
		map.getViewport().style.cursor = "pointer";
		map.on('pointerdrag', function(evt) {
		map.getViewport().style.cursor = "grab";
		});
		map.on('pointerup', function(evt) {
		map.getViewport().style.cursor = "pointer";
		});
	}
	
	function styleCursorNone() {
		map.getViewport().style.cursor = "none";
		map.on('pointerdrag', function(evt) {
		map.getViewport().style.cursor = "grab";
		});
		map.on('pointerup', function(evt) {
		map.getViewport().style.cursor = "none";
		});
	}
	
	function styleCursorMove() {
		map.getViewport().style.cursor = "move";
		map.on('pointerdrag', function(evt) {
		map.getViewport().style.cursor = "move";
		});
		map.on('pointerup', function(evt) {
		map.getViewport().style.cursor = "pointer";
		});
	}
		
		
// Funzione per disattivare gli elementi .ol-active, escludendo l'elemento corrente che contiene il pulsante cliccato
	function disableOtherElements(currentButton) {
		//seleziono tutti gli ol-active button tranne quelli interni ad editbar dedicati al disegno
		$('.ol-active button').not('.ol-editbar .ol-active button').each(function() { 
			// Verifica se l'elemento corrente non è il pulsante attualmente cliccato
			if (this !== currentButton[0]) {
				$(this).trigger('click');
			}
		});
	}
		
////////////////////////////// START ELEMENTS AND CONTROLS
		
// sidebar-v2
	var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'left' });
	map.addControl(sidebar); 

	//positioning right for smartphone
	//if hasTouchScreen defined above
	if (hasTouchScreen) {
	  $('#sidebar').removeClass('sidebar-left').addClass('sidebar-right');
	} else {
	  $('#sidebar').removeClass('sidebar-right').addClass('sidebar-left');
	}		

		
// geocoder
	var geocoder = new Geocoder('nominatim', { 
	  //provider: 'bing', //'osm'  'bing' 
	  //key: 'AgsaZIeoGbwnD9FY7lbWR1PrywB-jy3cUFKxuZjG69Ek831ffrBjYkv0vCpVVDhp',
	  provider: 'osm',
	  lang: 'en-US', //'en-US'  'it-IT'
	  placeholder: 'Search Address ...',
	  limit: 5,
	  keepOpen: false,
	  //autoComplete: true,
	  });
	  
	map.addControl(geocoder);
	document.getElementsByClassName('gcd-gl-btn')[0].className += ' fa fa-map-marker';
	
	//Remove previous searches
	geocoder.on('addresschosen', function (evt) {
		var feature = evt.feature,
		  coord = evt.coordinate,
		  address = evt.address;
	  geocoder.getSource().clear();
	  geocoder.getSource().addFeature(feature);
	});

		

// ol-ext geolocate gps
	var geoloc = new ol.control.GeolocationButton({
	  title: 'GPS Locate me',
	  delay: 2000 // 2s
	});
	map.addControl(geoloc);
	
	// Show position
	var here = new ol.Overlay.Popup({ positioning: 'bottom-center' });
	map.addOverlay(here);
	geoloc.on('position', function(e) {
	  if (e.coordinate) here.show(e.coordinate, "You are<br/>here!");
	  else here.hide();
	});	
	
	
	// New element to add
	var geolocelement = document.createElement('DIV')
	// Get control search list element
	var geolocdescription = geoloc.element.querySelector('geolocdescription')
	// Add element before the search list
	geoloc.element.insertBefore(geolocelement, geolocdescription)
	// Set info
	geolocelement.innerHTML = "Activate device GPS"
	geolocelement.classList.add("geolocdescription-visible");

	
	
// Popup WMS-WFS Query
	var querywmswfs = new ol.control.Toggle({
		html: '<i class="fas fa-info"></i>' + ' ' + '<h1>WMS</h1>',
		title: 'Query Layer WMS-WFS',
		className: 'querywmswfs',
		onToggle: function(active) {
		  if (active) {
			  var currentButton = $('.querywmswfs button')
			  disableOtherElements(currentButton)
		  
			  map.removeInteraction(selectInteraction); // remove ol-ext popup select
			  map.removeOverlay(popup); // remove ol-ext popupfeature
			  popup.hide(); //hide ol-ext popupfeature
			  
			  overlayPopup.setPosition(undefined); //hide qgis2web popup
			  featuresPopupActive = false //clear qgis2web popup
			  map.addOverlay(overlayPopup); // add qgis2web popup
			  map.on('singleclick', onSingleClickWMS); //add qgis2web click
			  
			  form_querywmswfs.style.display = '';	
					  
		  } else {

			  map.removeOverlay(overlayPopup); // remove qgis2web popup
			  map.un('singleclick', onSingleClickWMS); //remove qgis2web click
			  
			  map.addInteraction(selectInteraction);  // add ol-ext popup select
			  map.addOverlay(popup); // add ol-ext popupfeature
			  popup.show(); //show ol-ext popupfeature
						  
			  form_querywmswfs.style.display = 'none';						
		  }
		}
	})
	map.addControl(querywmswfs)


	
// ol-ext GeoBookmark
		var bm = new ol.control.GeoBookmark({
			namespace: 'demo',
			title: "Zoom Location",
			editable: false,
		  });		


	
// measurement
	var measuring = false;
	var measureControl = (function (Control) {
	  measureControl = function (opt_options) {
		var options = opt_options || {};

		var measurebutton = document.createElement("button");
		measurebutton.className += " fas fa-ruler ";

		var this_ = this;
		var handleMeasure = function (e) {
		  if (!measuring) {
			  
			var currentButton = $('.measure-control button')
			disableOtherElements(currentButton)
		  
			selectInteraction.setActive(false)
			//map.removeInteraction(selectInteraction);
	
			//modify measure:display form
			//typeSelectForm.style.display = "";
			selectLabel.style.display = "";
			this_.getMap().addInteraction(draw);
			createHelpTooltip();
			createMeasureTooltip();
			measuring = true;

			//cursor
			styleCursorNone()
			
		  } else {
			
			selectInteraction.setActive(true)
			//map.addInteraction(selectInteraction);
			
			//modify measure:remove form
			//typeSelectForm.style.display = "none";
			selectLabel.style.display = "none";
			this_.getMap().removeInteraction(draw);
			measuring = false;
			this_.getMap().removeOverlay(helpTooltip);
			this_.getMap().removeOverlay(measureTooltip);

			//modify measure:remove static-tooltip and clear measurelayer
			var staticTooltip = document.getElementsByClassName("tooltip-static");
			while (staticTooltip.length > 0) {
			  staticTooltip[0].parentNode.removeChild(staticTooltip[0]);
			}
			measureLayer.getSource().clear();
			sketch = null;

			//cursor
			styleCursorHelp();
		  }
		};

		measurebutton.addEventListener("click", handleMeasure, false);
		measurebutton.addEventListener("touchstart", handleMeasure, false);

		measurebutton.addEventListener("click", () => {
		  measurebutton.classList.toggle("clicked");
		  measurebutton.parentNode.classList.toggle("ol-active");
		});

		var element = document.createElement("div");
		element.className = "measure-control ol-unselectable ol-control";
		element.appendChild(measurebutton);
		element.title = "Measure";

		ol.control.Control.call(this, {
		  element: element,
		  target: options.target
		});
	  };
	  if (Control) measureControl.__proto__ = Control;
	  measureControl.prototype = Object.create(Control && Control.prototype);
	  measureControl.prototype.constructor = measureControl;
	  return measureControl;
	})(ol.control.Control);
	
	map.addControl(new measureControl());
		
	// Trova il div di misura esistente
	var measureControl = document.querySelector(".measure-control");

	// Creare la select
	var selectLabel = document.createElement("label");
	selectLabel.innerHTML = "&nbsp;Measure:&nbsp;";

	var typeSelect = document.createElement("select");
	typeSelect.id = "type";

	// Aggiungere le opzioni alla select
	var measurementOption = [
	  { value: "LineString", description: "Length" },
	  { value: "Polygon", description: "Area" },
	  { value: "Circle", description: "Radius" }
	];
	// Aggiungere le opzioni alla select
	measurementOption.forEach(function (option) {
	  var optionElement = document.createElement("option");
	  optionElement.value = option.value;
	  optionElement.text = option.description;
	  typeSelect.appendChild(optionElement);
	});

	// Aggiungere la select al div di misurazione
	selectLabel.appendChild(typeSelect);
	measureControl.appendChild(selectLabel);

	// Nascondere la select inizialmente
	selectLabel.style.display = "none";

	map.on('pointermove', function (evt) {
	  if (evt.dragging) {
		return;
	  }
	  if (measuring) {
		/** @type {string} */
		//modify measure:text
		var helpMsg = "Start, active measurement";
		if (sketch) {
		  var geom = sketch.getGeometry();
		  if (geom instanceof ol.geom.Polygon) {
			helpMsg = continuePolygonMsg;
		  } else if (geom instanceof ol.geom.LineString) {
			helpMsg = continueLineMsg;
		  } else if (geom instanceof ol.geom.Circle) {
			helpMsg = continueCircleMsg;
		  }
		}
		helpTooltipElement.innerHTML = helpMsg;
		helpTooltip.setPosition(evt.coordinate);
	  }
	});

	/**
	 * Currently drawn feature.
	 * @type {ol.Feature}
	 */

	/**
	 * The help tooltip element.
	 * @type {Element}
	 */
	var helpTooltipElement;

	/**
	 * Overlay to show the help messages.
	 * @type {ol.Overlay}
	 */
	var helpTooltip;

	/**
	 * The measure tooltip element.
	 * @type {Element}
	 */
	var measureTooltipElement;

	/**
	 * Overlay to show the measurement.
	 * @type {ol.Overlay}
	 */
	var measureTooltip;

	//modify measure:text
	/**
	 * Message to show when the user is drawing a line.
	 * @type {string}
	 */
	var continueLineMsg = "1click continue, 2click close";

	//modify measure:polygon message
	/**
	 * Message to show when the user is drawing a polygon.
	 * @type {string}
	 */
	var continuePolygonMsg = "1click continue, 2click close";

	//modify measure:circle message
	/**
	 * Message to show when the user is drawing a circle.
	 * @type {string}
	 */
	var continueCircleMsg = "1click close";

	//modify measure:type select and form
	//var typeSelect = document.getElementById("type");
	//var typeSelectForm = document.getElementById("form_measure");

	//modify measure:user change the geometry type
	/**
	 * Let user change the geometry type.
	 * @param {Event} e Change event.
	 */
	 
	typeSelect.onchange = function (e) {
		
	  //remove previous measurement in different type (line,polygon,radius)
	  /**
	  map.removeInteraction(draw);
	  var staticTooltip = document.getElementsByClassName("tooltip-static");
	  while (staticTooltip.length > 0) {
		staticTooltip[0].parentNode.removeChild(staticTooltip[0]);
	  }
	  measureLayer.getSource().clear();

	  addInteraction();
	  
	  map.addInteraction(draw);
	  */
	  
	  //keep previous measurement in different type (line,polygon,radius)
	  map.removeInteraction(draw);
	  addInteraction();
	  map.addInteraction(draw);
	  
	  
	};

	//modify measure:style
	
	var measureLineStyle = new ol.style.Style({
	  stroke: new ol.style.Stroke({
		//color: "rgba(255, 204, 51)", //giallo ocra
		color: "rgba(0, 0, 255)", //blu
		lineDash: [10, 10],
		width: 4
	  }),
	  image: new ol.style.Circle({
		radius: 6,
		stroke: new ol.style.Stroke({
		  color: "rgba(255, 255, 255)", //cerchio esterno bianco
		  width: 1
		}),
		// fill: new ol.style.Fill({
		  // color: "rgba(255, 255, 255, 0.2)"
		// })
	  })
	});
	
	var measureLineStyle2 = new ol.style.Style({	  
		stroke: new ol.style.Stroke({
			//color: "rgba(0, 0, 255)", //blu
			color: "rgba(255, 255, 255)", //bianco
			lineDash: [10, 10],
			width: 2
		  }),
	  image: new ol.style.Circle({
		radius: 5,
		stroke: new ol.style.Stroke({
		  color: "rgba(0, 0, 255)", // cerchio interno blu
		  width: 1
		}),
			  fill: new ol.style.Fill({
		  color: "rgba(255, 204, 51, 0.4)", // giallo ocra
		}),
		  })
	});

	var labelStyle = new ol.style.Style({
	  text: new ol.style.Text({
		font: "14px Calibri,sans-serif",
		fill: new ol.style.Fill({
		  color: "rgba(0, 0, 0, 1)"
		}),
		stroke: new ol.style.Stroke({
		  color: "rgba(255, 255, 255, 1)",
		  width: 3
		})
	  })
	});

	var labelStyleCache = [];

	//modify measure:style function
	var styleFunction = function (feature, type) {
	  var styles = [measureLineStyle, measureLineStyle2];
	  var geometry = feature.getGeometry();
	  var type = geometry.getType();
	  var lineString;
	  if (!type || type === type) {
		if (type === "Polygon") {
		  lineString = new ol.geom.LineString(geometry.getCoordinates()[0]);
		} else if (type === "LineString") {
		  lineString = geometry;
		}
	  }
	  if (lineString) {
		var count = 0;
		lineString.forEachSegment(function (a, b) {
		  var segment = new ol.geom.LineString([a, b]);
		  var label = formatLength(segment);
		  if (labelStyleCache.length - 1 < count) {
			labelStyleCache.push(labelStyle.clone());
		  }
		  labelStyleCache[count].setGeometry(segment);
		  labelStyleCache[count].getText().setText(label);
		  styles.push(labelStyleCache[count]);
		  count++;
		});
	  }
	  return styles;
	};

	var source = new ol.source.Vector();

	var measureLayer = new ol.layer.Vector({
	  source: source,
	  displayInLayerSwitcher: false,
	  //modify measure:style
	  style: function (feature) {
		labelStyleCache = [];
		return styleFunction(feature);
	  }
	});

	map.addLayer(measureLayer);

	var draw; // global so we can remove it later
	function addInteraction() {
	  //modify measure:type linestring and area
	  var type = typeSelect.value;
	  draw = new ol.interaction.Draw({
		source: source,
		type: /** @type {ol.geom.GeometryType} */ (type),
		//modify measure:style
		style: function (feature) {
		  return styleFunction(feature, type);
		}
	  });

	  var listener;
	  draw.on(
		"drawstart",
		function (evt) {
		  // set sketch
		  sketch = evt.feature;

		  /** @type {ol.Coordinate|undefined} */
		  var tooltipCoord = evt.coordinate;

		  listener = sketch.getGeometry().on("change", function (evt) {
			var geom = evt.target;
			var output;
			//modify measure:outpur area or lenght
			if (geom instanceof ol.geom.Polygon) {
			  output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
			  tooltipCoord = geom.getInteriorPoint().getCoordinates();
			} else if (geom instanceof ol.geom.LineString) {
			  output = formatLength(/** @type {ol.geom.LineString} */ (geom));
			  tooltipCoord = geom.getLastCoordinate();
			} else if (geom instanceof ol.geom.Circle) {
			  output = formatCircle(/** @type {ol.geom.Circle} */ (geom));
			  tooltipCoord = geom.getLastCoordinate();
			}
			measureTooltipElement.innerHTML = output;
			measureTooltip.setPosition(tooltipCoord);
		  });
		},
		this
	  );

	  draw.on(
		"drawend",
		function (evt) {
		  measureTooltipElement.className = "tooltip tooltip-static";
		  measureTooltip.setOffset([0, -7]);
		  // unset sketch
		  sketch = null;
		  // unset tooltip so that a new one can be created
		  measureTooltipElement = null;
		  createMeasureTooltip();
		  ol.Observable.unByKey(listener);
		},
		this
	  );
	}

	/**
	 * Creates a new help tooltip
	 */
	function createHelpTooltip() {
	  if (helpTooltipElement) {
		helpTooltipElement.parentNode.removeChild(helpTooltipElement);
	  }
	  helpTooltipElement = document.createElement("div");
	  helpTooltipElement.className = "tooltip hidden";
	  helpTooltip = new ol.Overlay({
		element: helpTooltipElement,
		offset: [15, 0],
		positioning: "center-left"
	  });
	  map.addOverlay(helpTooltip);
	}

	/**
	 * Creates a new measure tooltip
	 */
	function createMeasureTooltip() {
	  if (measureTooltipElement) {
		measureTooltipElement.parentNode.removeChild(measureTooltipElement);
	  }
	  measureTooltipElement = document.createElement("div");
	  measureTooltipElement.className = "tooltip tooltip-measure";
	  measureTooltip = new ol.Overlay({
		element: measureTooltipElement,
		offset: [0, -15],
		positioning: "bottom-center"
	  });
	  map.addOverlay(measureTooltip);
	}

	/**
	 * format circle output
	 * @param {ol.geom.Circle} line
	 * @return {string}
	 */
	var formatCircle = function (circle) {
	  var radius;
	  var firstclick = circle.getFirstCoordinate();
	  var secondclick = circle.getLastCoordinate();
	  radius = 0;
	  var sourceProj = map.getView().getProjection();
	  var adjustfirstclick = ol.proj.transform(firstclick, sourceProj, "EPSG:4326");
	  var adjustsecondclick = ol.proj.transform(secondclick, sourceProj, "EPSG:4326");
	  radius += ol.sphere.getDistance(adjustfirstclick, adjustsecondclick);
	  var output;
	  if (radius > 1000) {
		output =
		  "(r)" + " " + Math.round((radius / 1000) * 1000) / 1000 + " " + "km";
	  } else {
		output = "(r)" + " " + Math.round(radius * 100) / 100 + " " + "m";
	  }
	  return output;
	};

	/**
	 * format length output
	 * @param {ol.geom.LineString} line
	 * @return {string}
	 */
	var formatLength = function (line) {
	  var length;
	  var coordinates = line.getCoordinates();
	  length = 0;
	  var sourceProj = map.getView().getProjection();
	  for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
		var c1 = ol.proj.transform(coordinates[i], sourceProj, "EPSG:4326");
		var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, "EPSG:4326");
		length += ol.sphere.getDistance(c1, c2);
	  }
	  var output;
	  if (length > 1000) {
		output = Math.round((length / 1000) * 1000) / 1000 + " " + "km";
	  } else {
		output = Math.round(length * 100) / 100 + " " + "m";
	  }
	  return output;
	};

	//modify measure:format area
	/**
	 * Format area output.
	 * @param {ol.geom.Polygon} polygon The polygon.
	 * @return {string} Formatted area.
	 */
	var formatArea = function (polygon) {
	  var area = polygon.getArea();
	  var output;
	  if (area > 1000000) {
		output =
		  Math.round((area / 1000000) * 1000) / 1000 + " " + "km<sup>2</sup>";
	  } else {
		output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
	  }
	  return output;
	};

	addInteraction(draw);



// popup all
	var popupall = new ol.control.Toggle({
		html: '<i class="fas fa-comment-dots"></i>',
		title: 'Unified popup',
		className: 'popupall-feature',
		onToggle: function(active) {  
			if (active) {
				var currentButton = $('.popupall-feature button');
				disableOtherElements(currentButton);

				selectLayer.getSource().clear(); //clear select
				map.removeInteraction(selectInteraction); // remove ol-ext popup select

				// definita in thanks.js, la imposto per non riattivare doHighlight nel mouseover su ol-control
				isPopupAllActive = true 

				if (highlightInteraction) {
					map.removeInteraction(highlightInteraction); // remove new highlight 
				}
				map.removeOverlay(popup); // remove ol-ext popupfeature
				popup.hide(); //hide ol-ext popupfeature

				overlayPopup.setPosition(undefined); //hide qgis2web popup
				map.addOverlay(overlayPopup); // add qgis2web popup
				map.on('singleclick', onSingleClickFeatures); // add qgis2web click

				// add qgis2web pointermove (doHover e doHighlight impostati in thanks.js come 
				// mouseover e mouseout su ol-control)
				map.on('pointermove', onPointerMove); 
				
				form_popupall.style.display = '';

			} else {
				map.removeOverlay(overlayPopup); // remove qgis2web popup
				map.un('singleclick', onSingleClickFeatures); // remove qgis2web click
				map.un('pointermove', onPointerMove); // remove qgis2web pointermove 
				
				map.addInteraction(selectInteraction);  // add ol-ext popup select

				// definita in thanks.js, la imposto per non riattivare doHighlight nel mouseover su ol-control
				isPopupAllActive = false 

				if (highlightInteraction) {
					map.addInteraction(highlightInteraction); // add highlight
				}
				map.addOverlay(popup); // add ol-ext popupfeature
				popup.show(); //show ol-ext popupfeature

				form_popupall.style.display = 'none';

				//cursor
				styleCursorHelp();
			}
		}
	});
	map.addControl(popupall);
				
			
// ol-ext editbar
	// A new control bar
	var bar = new ol.control.Bar({
	  className: 'collapsed',
	})
	map.addControl(bar)

	// Add activate / deactivate button
	var activateBt = new ol.control.Toggle({
	  html: '<i class="fas fa-drafting-compass"></i>',
	  title: 'Draw',
	  className: 'menu',
	  onToggle: function(active) {
		// editBar.getInteraction('Select').setActive(false)
		if (active) {				
			var currentButton = $('.menu button')
			disableOtherElements(currentButton)				
			// remove interaction popup
			selectInteraction.setActive(false);			
			//show bar	
			bar.element.classList.remove('collapsed')				
			//activate default interaction
			editBar.getInteraction('DrawPolygon').setActive(true)		  
			//cursor
			styleCursorDefault()			
		} else {
			// add interaction popup
			selectInteraction.setActive(true);			
			//hide bar	
			bar.element.classList.add('collapsed')			 
			//remove new feature
			editBarLayer.getSource().clear();
			//deactivate usage			
			editBar.deactivateControls();				
			//cursor
			styleCursorHelp();					
		}
	  }
	})
	bar.addControl(activateBt)
	
	
	// Vector layer to draw in
	var editBarLayer = new ol.layer.Vector({ 
	  source: new ol.source.Vector(),
	  displayInLayerSwitcher : false,
	  style: drawStylePost,
	})
	map.addLayer(editBarLayer);
	

	// Add Editbar
	var editBar = new ol.control.EditBar({
	  interactions: { 
					Info: false,
					Select: false,
					DrawHole: false,
					Transform: new ol.interaction.Transform({
					  layers: [editBarLayer]
					}),
					},
	  source: editBarLayer.getSource(),
	});
	bar.addControl(editBar)
	

	
	// Modify Overlay style
	editBar.getInteraction('DrawPoint').getOverlay().setStyle(drawStylePre)
	editBar.getInteraction('DrawLine').getOverlay().setStyle(drawStylePre)
	editBar.getInteraction('DrawPolygon').getOverlay().setStyle(drawStylePre)	
	editBar.getInteraction('DrawRegular').overlayLayer_.setStyle(drawStylePre)		

/*		
	// Add a tooltip
	var tooltip = new ol.Overlay.Tooltip();
	map.addOverlay(tooltip);
	
	editBar.getInteraction('DrawPoint').on('change:active', function(e){
	  tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
	});
	
	editBar.getInteraction('DrawLine').on(['change:active','drawend'], function(e){
	  tooltip.setFeature();
	  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
	});
	editBar.getInteraction('DrawLine').on('drawstart', function(e){
	  tooltip.setFeature(e.feature);
	  tooltip.setInfo('Click to continue drawing line...');
	});
	editBar.getInteraction('DrawPolygon').on('drawstart', function(e){
	  tooltip.setFeature(e.feature);
	  tooltip.setInfo('Click to continue drawing shape...');
	});
	editBar.getInteraction('DrawPolygon').on(['change:active','drawend'], function(e){
	  tooltip.setFeature();
	  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
	});
	editBar.getInteraction('DrawRegular').on('drawstart', function(e){
	  tooltip.setFeature(e.feature);
	  tooltip.setInfo('Move and click map to finish drawing...');
	});
	editBar.getInteraction('DrawRegular').on(['change:active','drawend'], function(e){
	  tooltip.setFeature();
	  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
	}); 	
*/


// ol-ext search feature 

	var search = new ol.control.SearchFeature(
	{	
	//indicate source
		//source: jsonSource_ParticelleCensuario,
		maxItems: 1000,
	//indicate search field
		//property: 'Ricerca', 
	//indicate text displayed in the search bar
		//placeholder: 'Cerca Catasto (es: F17 P44) ...', 
	//indicate button title
		label: 'Rapid Search',
		//collapsed: false,
		noCollapse: true,
		sort: function(f1, f2) {
			if (search.getSearchString(f1) < search.getSearchString(f2)) return -1;
			if (search.getSearchString(f1) > search.getSearchString(f2)) return 1;
			return 0;
		  }				
	});
	map.addControl(search);
				
	//variabile globale che si attiva durante la ricerca manuale con search feature
	//e si disattiva durante la ricerca automatizzata proveniente dal permalink query feature
	var isManualSearch = false;

	search.on('select', function(e)
	{						
		//selectInteraction.getFeatures().clear();
		//selectInteraction.getFeatures().push(e.search);
		
		popup.hide();
		
		// Get the geometry of the feature
		  var geometry = e.search.getGeometry();
		  // Get the extent of geometry
		  var featureExtent = geometry.getExtent();
		  // Define padding
		  var padding = [200, 200, 200, 200];
		  
		  if (geometry.getType() === 'Point' || geometry.getType() === 'MultiPoint') {
		  padding[0] = 50; //define padding
		  var paddedExtent = ol.extent.buffer(featureExtent, padding[0]);
			map.getView().fit(paddedExtent);
			popup.show(geometry.getFirstCoordinate(), e.search);
		 } if (geometry.getType() === 'Polygon' || geometry.getType() === 'MultiPolygon') {
			map.getView().fit(featureExtent, { padding: padding });
			popup.show(geometry.getInteriorPoints().getFirstCoordinate(), e.search);
		 } if (geometry.getType() === 'LineString') {
			map.getView().fit(featureExtent, { padding: padding });
			popup.show(geometry.getCoordinateAt(0.5), e.search);
		 }	if (geometry.getType() === 'MultiLineString') {
			map.getView().fit(featureExtent, { padding: padding });
			popup.show(geometry.getLineString(0).getCoordinateAt(0.5), e.search);
		 }		

		//autoclose on smartphone
		//isSmallScreen and hasTouchScreen defined above
		if (isSmallScreen && hasTouchScreen) {
		search.collapse()
		}
	});


// scale line
	var scaleLine = new ol.control.ScaleLine({});
	map.addControl(scaleLine);
	//add ol-control
	var scaleLineControl = document.getElementsByClassName('ol-scale-line')[0];
	if (scaleLineControl) {
		scaleLineControl.className += ' ol-control';
		bottomLeftContainerDiv.appendChild(scaleLineControl);
	}



// ol-ext scale control
	var scaleCtrl = new ol.control.Scale({	});
	map.addControl(scaleCtrl);
	
	function setDiagonal(val) {
	  var res = Math.sqrt(window.screen.width*window.screen.width+window.screen.height*window.screen.height)/val; 
	  res = Math.round(res);
	  $('#ppi').val(res);
	  scaleCtrl.set('ppi', res); 
	  scaleCtrl.setScale()
	}
	
	// New element to add
	var scalaelement = document.createElement('DIV')
	// Get control search list element
	var scaladescription = geoloc.element.querySelector('scaladescription')
	// Add element before the search list
	scaleCtrl.element.insertBefore(scalaelement, scaladescription)
	// Set info
	scalaelement.innerHTML = "Scale"
	scalaelement.classList.add("scaladescription-visible");
			
			
// mouse position coordinates

	var currentProjection = map.getView().getProjection().getCode(); // or your desired projection es: 'EPSG:3857'

	// Add MousePosition control
	var mousePositionDefault = new ol.control.MousePosition({
	  coordinateFormat: function(coord) {
		return '<u>' + currentProjection + '</u>' + ' ' + coord[0].toFixed(5) + ' ' + coord[1].toFixed(5);
	  },
	  projection: currentProjection, 
	  className: 'mousePositionDefault ol-control',
	});
	map.addControl(mousePositionDefault);

	var mousePositionButton = $('.mousePositionDefault');
	mousePositionButton.on('click', function() {
	  var newEpsg = prompt('View the coordinates in the desired SR by entering its EPSG code (e.g. 4326):');
	  if (isValidEpsg(newEpsg)) {
		defaultEpsg = newEpsg;

		// Aggiorna la variabile currentProjection con il nuovo EPSG code
		currentProjection = 'EPSG:' + defaultEpsg;

		// Aggiorna coordinateFormat e projection con il nuovo EPSG code
		mousePositionDefault.setProjection(ol.proj.get(currentProjection));
	  } else {
		alert('Invalid EPSG code. Please enter a valid EPSG code.');
	  }
	});

	// Funzione per verificare se un valore è un EPSG code valido in Proj4.js
	function isValidEpsg(value) {
	  // Verifica se il valore è un numero e se corrisponde a un EPSG code noto in Proj4.js
	  if (/^\d+$/.test(value) || /^EPSG:\d+$/.test(value)) {
		var epsgCode = /^EPSG:(\d+)$/.test(value) ? RegExp.$1 : value;
		return proj4.defs('EPSG:' + epsgCode) != null;
	  }
	  return false;
	}
		

//  ol-ext popup feature
 
	// rimuovo i controlli e gli eventi predefiniti di qgis2web
	featureOverlay.getSource().clear(); //rimuovo le features evidenziate nel caso di "doHighlight true" perché in pc lenti rimangono appese al caricamento della mappa
	map.un('pointermove', onPointerMove);
	map.un('singleclick', onSingleClickFeatures);
	map.un('singleclick', onSingleClickWMS);
	map.removeOverlay(overlayPopup);
	

	// New highlight Features Iniziale
		// Creo una select pointermove per selezionare le features solo se doHighlight è vero e doHover è falso
		// Perché se doHover è vero prevede già di mostrare popup e selezionare feature quindi non servirebbe il seguente codice
		
		var highlightInteraction; //globale per rimuoverla nel popup all
		if (doHighlight && !doHover) {
				highlightInteraction = new ol.interaction.Select({
					hitTolerance: 5,
					multi: true,
					condition: function (event) {
						if (!doHighlight) {
							return
						} else {
							return ol.events.condition.pointerMove
						}
					},
					layers: function (layer) {
						return layer !== selectLayer && (layer instanceof ol.layer.Vector || layer instanceof ol.layer.VectorImage) && layer.get("interactive");
					},
					style: null,
				});
				map.addInteraction(highlightInteraction);

				// Copia le features di highlightInteraction nel highlightLayer
				highlightInteraction.on('select', function(evt) {
					highlightLayer.getSource().clear();
					const selectedFeatures = highlightInteraction.getFeatures();
					if (selectedFeatures.getLength() > 0) {
						const currentFeature = selectedFeatures.item(0);
						highlightLayer.getSource().addFeature(currentFeature);
					}
				});
		}		
	
	
	// Popup Features Select interaction
	// Seleziono le features ma non applico stile
	var selectInteraction = new ol.interaction.Select({
		hitTolerance: 5,
		multi: true,
		condition: function (event) {
			if (doHover) {
				return ol.events.condition.pointerMove(event);
			} else {
				return ol.events.condition.click(event);
			}
		},
		layers: function (layer) {
			return layer !== selectLayer
			&& (layer instanceof ol.layer.Vector || layer instanceof ol.layer.VectorImage)
			&& layer.get("interactive")
		},
		style: null,
	});
	map.addInteraction(selectInteraction);  
		
	selectInteraction.on('select', function(event) {
		selectInteraction.getFeatures().clear();
		var selectedFeatures = event.selected;
		selectedFeatures.forEach(function(feature) {
			// in caso di cluster
			if (feature.get('features')) {
				var clusterFeatures = feature.get('features');
				clusterFeatures.forEach(function(feature) {
					// Passo la singola feature estratta dall'array alla selezione così il popup la leggerà bene
					selectInteraction.getFeatures().push(feature);
				});
			} else {
				// in caso di singola feature
				selectInteraction.getFeatures().push(feature);
			}
		});
	});


			
	// Create popup overlay
	// Configuro il popup che usa la selectInteraction per acquisire i dati
	var popup = new ol.Overlay.PopupFeature({
		//popupClass: "default anim",
		//anim: true,
		//positioning: 'auto',
		select: selectInteraction,
		closeBox: true,
		canFix: true,
		showImage: true,
		maxChar: 1000,
		template: function (feature) {
		  var layer = feature.get('layerObject');

		  if (layer) {
			var popuplayertitle = layer.get("popuplayertitle");
			var attributes = {};

			var fieldImages = layer.get("fieldImages");
			var fieldLabels = layer.get("fieldLabels");
			var fieldAliases = layer.get("fieldAliases");

			// Iterare attraverso tutte le proprietà della feature
			for (var key in feature.getProperties()) {
				
				// Ottenere il valore dell'attributo corrente
				var value = feature.get(key);

				// Controlla se fieldImages è "hidden" o se fieldLabels è "hidden field" e passa all'elemento successivo
				if ((fieldImages[key] && fieldImages[key].toLowerCase() === 'hidden') ||
					(fieldLabels[key] && fieldLabels[key].toLowerCase() === 'hidden field')) {
					continue
				}

				// Verificare se il valore dell'attributo è null e fieldLabels è 'inline label - visible with data'
				if (value === null && (fieldLabels[key] === 'no label' ||
									   fieldLabels[key] === 'inline label - visible with data' ||
									   fieldLabels[key] === 'header label - visible with data')) {
					continue
				}

				// Verificare se l'attributo corrente non è la geometria
				if (key !== "geometry") {
					// Verificare se fieldLabels[key] è 'no label'
					if (fieldLabels[key] === 'no label') {
						attributes[key] = { title: '<a class="no-label"></a>' };
					} else if (fieldLabels[key] === 'header label - always visible' ||
							   fieldLabels[key] === 'header label - visible with data'){
						if (fieldAliases[key]) {
						  // Se esiste, assegnare il titolo usando l'alias
						  attributes[key] = { title: '<a class="header-label">' + fieldAliases[key] + '</a>' };
						} else {
						  // Altrimenti, utilizzare il nome dell'attributo come titolo
						  var title = key;
						  // Assegnare il titolo all'attributo nell'oggetto "attributes"
						  attributes[key] = { title: '<a class="header-label">' + title + '</a>' };
						}
					} else {
						// Verificare se esiste un alias per l'attributo corrente in "fieldAliases"
						if (fieldAliases[key]) {
						  // Se esiste, assegnare il titolo usando l'alias
						  attributes[key] = { title: fieldAliases[key] };
						} else {
						  // Altrimenti, utilizzare il nome dell'attributo come titolo
						  var title = key;
						  // Assegnare il titolo all'attributo nell'oggetto "attributes"
						  attributes[key] = { title: title };
						}
					}

					if (value === null) {
						// Se è null, assegnare una funzione vuota al formato per eliminarlo
						attributes[key].format = function (val, feature) {
							return '';
						};
					} else if (typeof value === "string") {
						// Verifica se la stringa è un URL
						function isURL(str) { 
							return isValidURL = str.startsWith("http://") || str.startsWith("https://") || str.startsWith("www");;
						}

						// Se la stringa è un URL, assegnare una funzione di formato per generare un link
						if (isURL(value)) {
							attributes[key].format = function(val, feature) {
								// Se l'URL non inizia con "http://" o "https://", aggiungi "http://"
								if (!val.startsWith("http://") && !val.startsWith("https://")) {
									val = "http://" + val;
								}
								return '<a href="' + val + '" target="_blank">' + val + '</a>';
							};
						} else if (fieldImages[key] && fieldImages[key].toLowerCase() === 'externalresource') {
							// Se è un'immagine esterna, assegnare una funzione di formato per generare un tag img o video controls
							attributes[key].format = function (val, feature) {
								if (/\.(gif|jpg|jpeg|tif|tiff|png|avif|webp|svg)$/i.test(val)) {
									// Se il valore è un'immagine, visualizzalo come immagine
									return '<img src="' + val + '"></img>';
								} else if (/\.(mp4|webm|ogg|avi|mov|flv)$/i.test(val)) {
									// Se il valore è un video, visualizzalo come video
									return '<video controls src="' + val + '"></video>';
								}
							};
						} else {
							// Se non soddisfa le condizioni precedenti, assegnare il valore all'attributo
							attributes[key].value = value;
						}
						
					}	
				}
			}

			return {
			  title: function () {
				return popuplayertitle;
			  },
			  attributes: attributes // title and value
			};
		  }
		}  
	});

	// Add popup overlay to map
	map.addOverlay(popup);

	
	/* //positioning center for smartphone
	//isSmallScreen and hasTouchScreen defined above
	if (isSmallScreen && hasTouchScreen) {
		  popup.setPositioning('bottom-center')
		} */
	
	// Seleziono le features portandole dalla selectInteraction al selectLayer
	popup.on('select', function(feature, layer) {
	  selectLayer.getSource().clear();
	  const selectedFeatures = selectInteraction.getFeatures();
	  if (selectedFeatures.getLength() > 0) {
		const currentFeature = selectedFeatures.item(0);
		selectLayer.getSource().addFeature(currentFeature);
	  }		  
	});
	
	// Listener for closing the popup with closebox
	$(".closeBox").on("click", function() {
		selectInteraction.getFeatures().clear();
		selectLayer.getSource().clear();
	});
	
	// Listener for closing the popup with click out
	selectInteraction.getFeatures().on(['remove'], function(e) {
		selectInteraction.getFeatures().clear();
		selectLayer.getSource().clear();
	})
	
	/* 
	popup.on('hide', () => {
		selectInteraction.getFeatures().clear();
		selectLayer.getSource().clear();	
	});
   */
					
	popup.on('show', () => {
		// sposta l'elemento count dopo h1 così da poterlo selezionare con css
		var count = popup.element.querySelector('.ol-count');
		if (count) {
			popup.element.querySelector('h1').prepend(count);
		}
		
		// Elimina larghezza massima popup in caso di foto
		  var tdParentOfImg = document.querySelectorAll('.ol-popup .ol-popupfeature table td img');

		  tdParentOfImg.forEach(function(img) {
			var tdParent = img.parentNode; // Ottieni l'elemento td padre dell'img
			tdParent.style.maxWidth = 'unset';
		  });
		  
		// Elimina larghezza massima popup in caso di video
		  var tdParentOfVideo = document.querySelectorAll('.ol-popup .ol-popupfeature table td video');

		  tdParentOfVideo.forEach(function(video) {
			var tdParent = video.parentNode; // Ottieni l'elemento td padre del video
			tdParent.style.maxWidth = 'unset';
		  });
		  
		// Trova tutti gli elementi "a" con classe "no-label" all'interno di .ol-popupfeature table tr td
		$(".ol-popupfeature table tr td a.no-label").each(function() {
			// Applica display: none al td genitore di "a" con classe "no-label"
			$(this).parent("td").css('display', 'none');
		});

		// Trova tutti gli elementi "a" con classe "header-label" all'interno di .ol-popupfeature table tr td
		$(".ol-popupfeature table tr td a.header-label").each(function() {
			// Applica display: block a tutti i td nel tr genitore di "a" con classe "header-label"
			$(this).closest("tr").find("td").css('display', 'block');
		}); 	
	})


			
//  extend popup characters
	var autolinker = new Autolinker({truncate: {length: 40, location: 'smart'}});			


// Aggiorna il buffer dei layer sulla base dello zoom
	// Funzione per ottenere un buffer dinamico basato sul livello di zoom
	function getDynamicBuffer(extent, zoom) {
		var factor = Math.pow(2, (10 - zoom)); // Fattore di scala basato sul livello di zoom
		var buffer = factor * 10000; // Buffer esponenziale basato sul livello di zoom
		var bufferedExtent = ol.extent.buffer(extent, buffer); // Aggiungi il buffer calcolato
		return bufferedExtent;
	}

	// Aggiorna l'estensione del layer basato sul livello di zoom corrente
	function updateLayerExtent(layer) {
		var zoom = map.getView().getZoom(); // Ottieni il livello di zoom corrente
		var source = layer.getSource(); // Ottieni la sorgente del layer
		if (source) {
			var extent = source.getExtent(); // Ottieni l'estensione corrente della sorgente
			if (extent && !ol.extent.isEmpty(extent)) {
				var bufferedExtent = getDynamicBuffer(extent, zoom);
				layer.set('extent', bufferedExtent); // Applica l'estensione bufferizzata al layer
			}
		}
	}

	// Imposta l'extent nei layers
	function setLayersExtent() {
		// Filtra solo i layer di tipo ol.layer.Vector
		var vectorLayersForExtent = allLayers.filter(function(layer) {
			return layer instanceof ol.layer.Vector || layer instanceof ol.layer.VectorImage || layer instanceof ol.layer.AnimatedCluster;
		});

		// Esegui l'aggiornamento iniziale per tutti i layer
		vectorLayersForExtent.forEach(function(layer) {
			updateLayerExtent(layer);
		});
	}

	// Aggiungi un listener per l'evento `moveend` sulla vista della mappa
	map.on('moveend', function() {
		// Processa tutti i layer quando lo zoom si ferma
		setLayersExtent();
	});


		
// ol-ext print dialog control
	// Add a title control
	map.addControl(new ol.control.CanvasTitle({ 
	  title: 'Titolo', 
	  visible: false,
	  style: new ol.style.Style({ text: new ol.style.Text({ font: '20px "Lucida Grande",Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif'}) })
	}));
	
	// Add a ScaleLine control 
	var scalebar = new ol.control.ScaleLine({
		bar: true, 
		})
		map.addControl(scalebar);

	// Print control
	var printControl = new ol.control.PrintDialog();
	printControl.setSize('A4');
	printControl.setOrientation('landscape');
	
	// change sheet dimensions to avoid having to change print margins in the browser window (subtract 25 from each value)
	ol.control.PrintDialog.prototype.paperSize = {
	  '': null,
	  'A0': [816,1164],
	  'A1': [569,816],
	  'A2': [395,569],
	  'A3': [272,395],
	  'A4': [185,272],
	  'US Letter': [190.9,254.4],
	  'A5': [123,185],
	  'B4': [232,339],
	  'B5': [157,232]
	};
	map.addControl(printControl); 
	
	// Select button
	var printbuttontitle = $('div.ol-print button');
	// Set button title
	printbuttontitle.attr('title', 'Print');
		
				
// Permalink Control
	var permalink = new ol.control.Permalink({
	title: 'Permalink',				
	urlReplace: true,
	onclick: function(url) {
		
		// take link from permalink
		var takelink = permalink.getLink();
		// show dialogmap onclik whit content
		dialogMap.show({ 
		content: takelink
		});

	} 
	});
	map.addControl(permalink);
	
	// Select button
	var permalinkbuttontitle = $('div.ol-permalink button');
	// Set button title
	permalinkbuttontitle.attr('title', 'Permalink');
	
				
	// A dialog inside a map
	var dialogMap = new ol.control.Dialog({ 
			hideOnClick: false,
			className: 'center',
		});
	map.addControl(dialogMap);				
	
	/* 
	function setPermalink(l) {
		l.set('permalink', l.get('style'))
		if (l.getLayers) l.getLayers().forEach(setPermalink);
	}
	setPermalink(map.getLayerGroup())
	*/
	
	// Permalink Query Feature
	function loadPermalink() {
		if (permalink.hasUrlParam('find')) {
			// Extract the value of the 'find' parameter
			var urlFindParam = permalink.getUrlParam('find');
			// Break down the string 'find' by commas
			var findParams = urlFindParam.split(',');
			// The first element is always the layer (based on "popuplayertitle")
			var layerTitle = findParams[0].trim(); 
			// The following elements represent the fields for searching for the feature
			var searchCriteria = {};
			findParams.slice(1).forEach(function(param) {
				var keyValue = param.split(':');
				if (keyValue.length === 2) {
					searchCriteria[keyValue[0].trim()] = keyValue[1].trim();
				}
			});
			// Find the layer corresponding to the 'popuplayertitle' property
			var selectedLayer;
			allLayers.forEach(function(layer) {
				if (layer.get('popuplayertitle') === layerTitle) { 
					selectedLayer = layer;
				}
			});
			if (selectedLayer) {
				
				// Funzione per ottenere la chiave in base al valore (invertire gli alias)
				function getKeyByValue(object, value) {
					return Object.keys(object).find(key => object[key] === value);
				}

				selectedLayer.setVisible(true);
				// Get alias mapping from layer
				var fieldAliases = selectedLayer.get('fieldAliases') || {};
				// Convert defined search fields based on aliases
				var convertedSearchCriteria = {};
				for (var alias in searchCriteria) {
					var valueCriteria = searchCriteria[alias];
					// If the alias is present in the aliases, find the corresponding effective field
					var actualField = getKeyByValue(fieldAliases, alias) || alias;
					convertedSearchCriteria[actualField] = valueCriteria;
				}	
				// Find the matching feature using the converted search criteria
				var features = selectedLayer.getSource().getFeatures();
				var featureFound = features.find(function(f) {				
					var match = true;
					for (var field in convertedSearchCriteria) {
						var valueCriteria = convertedSearchCriteria[field];
						var valueFeature = f.get(field);
						// If the feature value is a number, compare as a number
						if (!isNaN(valueFeature)) {
							// Remove any units of measurement from the search criterion (e.g. '125.32m' -> '125.32')
							valueCriteria = parseFloat(valueCriteria.replace(/[^0-9.-]/g, ''));
							// Compare numerically
							if (parseFloat(valueFeature) !== valueCriteria) {
								match = false;
								break;
							}
						} else {
							// Compare as string
							if (valueFeature !== valueCriteria) {
								match = false;
								break;
							}
						}
					}

					/* if (match) {
						console.log('Find feature:', f);
					} else {
						console.log('No match fot this feature.');
					} */

					return match;
				});

				if (featureFound) {	
					//global variable for manual search feature search and automatic search permalink query feature
					isManualSearch = false;
					// Simulate selection to activate SearchFeature's 'select' function
					// The selection is configured in the base code with search.on...
					search.dispatchEvent({
						type: 'select',
						search: featureFound
					});
				}/* else {
					console.log('No feature found with this criteria:', searchCriteria);
				}*/
			}/* else {
				console.log('Layer not found with popuplayertitle:', layerTitle);
			}*/
			// Remove the "find" parameter from the URL using setUrlParam without specifying the value
			permalink.setUrlParam('find');
		}

		//Permalink query bookmark
		if (permalink.hasUrlParam('book')) {				
			var urlBookParam = permalink.getUrlParam('book');					
			var bookmarkElement = $(".ol-bookmark ul li[data-name='" + urlBookParam + "']");
			bookmarkElement.trigger('click');
			// Remove "book" parameter from URL using setUrlParam without specifying value
			permalink.setUrlParam('book');	
		}
		
		// ottengo il nome progetto per salvare nella cache i dati dei layer univocamente
		var getPermalinkProjectName = permalink.getLink()			
		const parsedUrl = new URL(getPermalinkProjectName);
		const pathSegments = parsedUrl.pathname.split('/');
		const enteIndex = pathSegments.indexOf('ente'); // trovo ente se esiste
		const prototipoIndex = pathSegments.indexOf('prototipo'); // trovo prototipo se esiste
		window.projectName = null;
		if (enteIndex !== -1 && enteIndex < pathSegments.length - 1) {
			projectName = pathSegments[enteIndex + 1]; // Prendi il valore dopo "ente"
		} else if (prototipoIndex !== -1 && prototipoIndex < pathSegments.length - 1) {
			projectName = pathSegments[prototipoIndex + 1]; // Prendi il valore dopo "prototipo"
		}
	}
	document.addEventListener('DOMContentLoaded', () => {
		if (window.layersLoadedFlag) {
			loadPermalink();
		} else {
			document.addEventListener('layersLoaded', loadPermalink);
		}
	});

// fullscreen expand control

	document.getElementById("toggle-fs").addEventListener("click", function() {
	  toggleFS()
	});
	document.getElementById("toggle-fs").setAttribute('title','Full Screen');

	function isFullScreen() {
	  return (document.fullScreenElement && document.fullScreenElement !== null) ||
		(document.msFullscreenElement && document.msFullscreenElement !== null) ||
		(document.mozFullScreen || document.webkitIsFullScreen);
	}

	function enterFS() {
	  var page = document.documentElement
	  if (page.requestFullscreen) page.requestFullscreen();
	  else if (page.mozRequestFullScreen) page.mozRequestFullScreen();
	  else if (page.msRequestFullscreen) page.msRequestFullscreen();
	  else if (page.webkitRequestFullScreen) page.webkitRequestFullScreen();
	}

	function exitFS() {
	  if (document.exitFullScreen) return document.exitFullScreen();
	  else if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
	  else if (document.msExitFullscreen) return document.msExitFullscreen();
	  else if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
	}

	function toggleFS() {
	  if (!isFullScreen()) {
		enterFS();
		document.getElementsByClassName('fa fa-expand')[0].className = ' fa fa-compress';
	  } else {
		exitFS();
		document.getElementsByClassName('fa fa-compress')[0].className = ' fa fa-expand';
	  }
	}
	
	//change expand in smartphone
	if (hasTouchScreen) {
	  $('.expand').addClass('touch');
	}


// ol-ext layerswitcher

	var layerSwitcher = new ol.control.LayerSwitcher({
		noScroll : true, 
		reordering: true,
		//collapsed: false,
		extent: true, //funziona solo definendo extent nei layer
		//trash: true
		//oninfo: function (l) { alert(l.get("title")); }
		//mouseover: false,
		//target: $(".layerSwitcher").get(0)
		});		
	map.addControl(layerSwitcher);	

	// Select button
	var layerswitcherbuttontitle = $('div.ol-layerswitcher button');
	// Set button title
	layerswitcherbuttontitle.attr('title', 'Layers');


	//	/* Hide opacity bar for noOpacity class list element */	
	//		layerSwitcher.on('drawlist', function (e) {
	//		  // Current layer
	//		  var layer =  e.layer;
	//		  // Current line
	//		  var li = e.li;
	// 		  // Change className base on a layer property
	//		  if (layer.get('noOpacity')) li.classList.add('noOpacity');
	//		});
	
	
	// Hide layer for hideLayer class list element
	// Used to make openstreetmap layers disappear when using streetview
	layerSwitcher.on('drawlist', function (e) {
	  var layer =  e.layer;
	  var li = e.li;
	  // Add class based on a layer property
	  if (layer.get('hideLayer')) li.classList.add('hideLayer');
	});

	// Spegni i gruppi layer che all'interno hanno tutto spento
	layerSwitcher.on("drawlist", function (e) {
	  if (e.layer instanceof ol.layer.Group) {
		// Aggiungi una classe per identificare i gruppi   
		e.li.className = "ol-layer-group"; 
		
		// Funzione ricorsiva per verificare se un layer o un gruppo è visibile
		function isAnythingVisible(group) {
		  return group.getLayers().getArray().some(function (layer) {
			if (layer instanceof ol.layer.Group) {
			  // Se il layer è un gruppo, richiamo ricorsivamente la funzione
			  return isAnythingVisible(layer);
			} else {
			  // Se è un layer semplice, controllo la visibilità
			  return layer.getVisible();
			}
		  });
		}
		// Controllo se tutto all'interno del gruppo è invisibile
		var allInvisible = !isAnythingVisible(e.layer);
		// Se tutto è invisibile, nascondo il gruppo
		if (allInvisible) {
		  e.layer.setVisible(false); // Imposto il gruppo come invisibile
		}
	  }
	});
	
	// LayerSwitcher Father/Children group relation
	var goUp = false;	
	function listenVisible(layers, parent) {
	  layers.forEach(function (layer) {
		if (layer.getLayers) {
		  listenVisible(layer.getLayers(), layer);
		}
		layer.on("change:visible", function () {
		  // Show/hide sublayer
		  if (!goUp && layer.getLayers) {
			layer.getLayers().forEach(function (l) {
			  l.setVisible(layer.getVisible());
			});
		  }
		  // Show uplayer
		  goUp = true;
		  if (parent && layer.getVisible()) {
			parent.setVisible(true);
		  }
		  if (parent && !layer.getVisible()) {
			var allInvisible = parent.getLayers().getArray().every(function (l) {
			  return !l.getVisible();
			});
			if (allInvisible) {
			  parent.setVisible(false);
			}
		  }
		  goUp = false;
		});
	  });
	}
	listenVisible(map.getLayers());

	// LayerSwitcher open/collapsed desktop/smartphone
	// Show layer switcher if not too small and non touch device...
	// isSmallScreen and hasTouchScreen defined above
	if (!isSmallScreen && !hasTouchScreen) {
	  layerSwitcher.toggle()
	}
		
	// Remove title when mouse stops over label
	layerSwitcher.on('drawlist', function(e) {
	  // remove list label element title
	  e.li.querySelector('label').title = '';
	})
			
	// Remove click on the label to turn on/off layer
	layerSwitcher.on('drawlist', function(e) {
		e.li.querySelector('span').addEventListener('click', function(e) {
			e.stopPropagation()
		})
	})
	
	// Expand collapse layerlegend 
	layerSwitcher.on('drawlist', function (e) {
	   // Show if active
		var active = e.layer.get('legendActive')
		if (active) $(".li-content #layertitle", e.li).addClass('active');
	   var layer = e.layer;
	   // Toggle on click
	   $(".li-content #layertitle", e.li).click(function() {
		   layer.set('legendActive', !layer.get('legendActive'))
		   $(this).toggleClass("active"); 
			preventDefault()				   
		});
	});
	
	// Legend Layer Attribution
	// Creo la legenda sovrapposta al layerswitcher
	var legendAttribution = new ol.control.Attribution({
		className: 'legend-attribution',
		collapsible: true,
		collapsed: true,
		label: 'Legend',
		tipLabel: 'Legend',
		collapseLabel: 'Close Legend',
	});
	map.addControl(legendAttribution);
			
	$(document).ready(function() {
		// Funzione per controllare e mostrare/nascondere il legend-attribution
		function toggleLegendAttribution() {
			if ($('.ol-layerswitcher').hasClass('ol-forceopen')) {
				$('.legend-attribution').css('display', 'block');
			} else {
				$('.legend-attribution').css('display', 'none');
			}
			
			if (hasTouchScreen || isSmallScreen) {
				$('.legend-attribution').css('display', 'none');
			}
		}
	
		// Controllo iniziale quando la pagina è caricata
		toggleLegendAttribution();
	
		// Aggiungi un event listener per il click su ol-layerswitcher
		$('.ol-layerswitcher > button').on('click', function() {
			toggleLegendAttribution();
		});
	});


	
// StreetView
	var coordsIcon = [-6451474.93, -4153206.94];
	var coordsView = [-6451484.76, -4153214.08];
	
	/* OLD STREETVIEW CONFIGURATION
	var streetView = new StreetView(
		{
			apiKey: '',
			language: 'en',
			size: 'md',
			resizable: true,
			sizeToggler: true,
			defaultMapSize: 'expanded',
			i18n: {
				dragToInit: 'Drag and drop me'
			}
		}
	);

	map.addControl(streetView);
	 */
	
	// Default options
	var opt_options = {
	//apiKey: '', // Must be provided to remove "For development purposes only" message
	language: 'it',
	size: 'md',
	resizable: true,
	sizeToggler: true,
	defaultMapSize: 'expanded',
	target: 'map', // Important for OL 5
	// Custom translations. Default is according to selected language
	i18n: {
				dragToInit: 'StreetView - Drag and drop me' 
			}
	}

	var iconUrl = 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FF0000';

	// Add icon to OpenLayers map
	map.addLayer(
		new ol.layer.Vector({
			displayInLayerSwitcher : false,
			zIndex: 15,
			style: new ol.style.Style({
				image: new ol.style.Icon({
					anchor: [0.5, 1],
					anchorXUnits: 'fraction',
					anchorYUnits: 'fraction',
					src: iconUrl
				})
			}),
			source: new ol.source.Vector({
				features: [
					new ol.Feature({
						name: 'Star',
						geometry: new ol.geom.Point(coordsIcon),
						style: new ol.style.Style({
							image: new ol.style.Icon({
								anchor: [0.5, 46],
								anchorXUnits: 'fraction',
								anchorYUnits: 'pixels',
								src: iconUrl,
								crossOrigin: 'anonymous'
							})
						})
					})
				]
			})
		})
	);

	// Init panorama programatically after the lib is loaded
	//streetView.once('loadLib', function () {
	//    var pano = streetView.showStreetView(coordsView);
	//    pano.setPov({
	//        heading: 52,
	//        pitch: -12,
	//        zoom: 1
	//    });
	//})



// attribution

	// Azzero attributionList e la definisco nuova nell'index.html
	attributionList.innerHTML = '';
