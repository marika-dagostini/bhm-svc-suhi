////////////////////////////// GLOBAL VARIABLES

// Get all layers from all group at this moment
	var allLayers = map.getAllLayers();

// Get initial zoom level
	var initialMapZoom = map.getView().getZoom();
	//console.log("Initial Map Zoom Level: ", initialMapZoom);

// Get current projection and extent
	var currentProjection = map.getView().getProjection().getCode();
	var viewExtent = map.getView().getProperties().extent;

// full zooms if Vector tiles, deactivate in globo 3d
	var zoomIfVectorTile = (function() {
		var isActive = false;
		function snapZoom() {
			if (!isActive) return;
			const view = map.getView();
			const z = view.getZoom();
			// const rounded = Math.round(z);
			// if (Math.abs(z - rounded) < 0.20) return; //se zoom vicino a intero salta
			const maxRounded = Math.ceil(z); // arrotonda sempre per eccesso
            if (z !== maxRounded) {
                view.animate({
                    zoom: maxRounded,
                    duration: 200, // Animazione breve per nascondere lo scatto
                    easing: ol.easing.easeOut
                });
            }
		}
		function activate() {
			if (isActive) return;
			if (!map.getAllLayers().some(l => l instanceof ol.layer.VectorTile)) return;
			isActive = true;
			snapZoom(); // snap on load
			// piccolo delay dopo il move end prima di chiamare snapZoom
			map.on('moveend', snapZoom);
		}
		function deactivate() {
			if (!isActive) return;
			isActive = false;
			map.un('moveend', snapZoom);
		}
		return {
			activate: activate,
			deactivate: deactivate,
			isActive: function() { return isActive; }
		};
	})();
    /*document.addEventListener('DOMContentLoaded', () => {
		if (window.layersLoadedFlag) {
			zoomIfVectorTile.activate();
		} else {
			document.addEventListener('layersLoaded', () => {
				zoomIfVectorTile.activate();
			});
		}
	}); */
	zoomIfVectorTile.activate();

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
		color: "rgba(255, 255, 0, 0)", //yellow fill
	  }),
	  stroke: new ol.style.Stroke({
		color: "rgba(255, 255, 0, 0.8)", //yellow stroke,
		width: 3
	  }),
	  image: new ol.style.Circle({
		fill: new ol.style.Fill({
		  color: "rgba(255, 255, 0, 0)", //yellow fill
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
						if (fill) {
							fill.setColor(baseStyle.getFill().getColor());
						} else {
							clonedStyle.setFill(new ol.style.Fill({
								color: baseStyle.getFill().getColor()
							}));
						}
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
		color: "rgba(153, 0, 255, 0.8)", //magenta 
		width: 3
	  }),
	  image: new ol.style.Circle({
		stroke: new ol.style.Stroke({
		  color: "rgba(155, 0, 255, 0.8)", //magenta
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
		map.addLayer(spatialQueryPreBufferedLayer);
		map.addLayer(spatialQueryLastBufferedLayer);
		
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
	function styleCursorDefault() {
		map.getViewport().style.cursor = "default";
		map.on('pointerup', function(evt) {
			map.getViewport().style.cursor = "default";
		});
	}
	
	function styleCursorPointer() {
		map.getViewport().style.cursor = "pointer";
		map.on('pointerup', function(evt) {
			map.getViewport().style.cursor = "pointer";
		});
	}
	
	function styleCursorNone() {
		map.getViewport().style.cursor = "none";
		map.on('pointerup', function(evt) {
			map.getViewport().style.cursor = "none";
		});
	}
		
		
// Funzione per disattivare gli elementi .ol-active, escludendo l'elemento corrente che contiene il pulsante cliccato
	function disableOtherElements(currentButton) {
		//seleziono tutti gli ol-active button tranne quelli interni ad editbar dedicati al disegno
		$('.ol-active button').not('.ol-editbar .ol-active button').not('.globo button').each(function() {
			// Verifica se l'elemento corrente non è il pulsante attualmente cliccato
			if (this !== currentButton[0]) {
				$(this).trigger('click');
			}
		});
	}
		
////////////////////////////// START ELEMENTS AND CONTROLS
		
// sidebar-v2
	var sidebar = new Sidebar({
		element: 'sidebar',
		position: 'left'
	});
	//positioning right for smartphone
	//if hasTouchScreen defined above
	if (hasTouchScreen) {
	  $('#sidebar').removeClass('sidebar-left').addClass('sidebar-right');
	} else {
	  $('#sidebar').removeClass('sidebar-right').addClass('sidebar-left');
	}	
	
	
// Sposta in mappa Logo and title (sotto al popup)
	const formLogo = document.getElementById('form_logo');
	if (formLogo && map && map.getOverlayContainerStopEvent) {
		map.getOverlayContainerStopEvent().appendChild(formLogo);
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
	
	//Remove previous searches
	geocoder.on('addresschosen', function (evt) {
		var feature = evt.feature,
		  coord = evt.coordinate,
		  address = evt.address;
	  geocoder.getSource().clear();
	  geocoder.getSource().addFeature(feature);
	});

	// limito la ricerca all'extent iniziale della mappa solo se "restrict to extent"
	// per farlo funzionare ho inserito "bounded: 1" nei params in ol-geocoder.js
	map.once('postrender', function() {
	  // prendo extent dalla View
	  var viewExtent = map.getView().getProperties().extent;
	  if (viewExtent) {
		  // trasformo l’estensione in EPSG:4326
		  var viewboxCoords = ol.proj.transformExtent(viewExtent, map.getView().getProjection(), 'EPSG:4326');
		  // aggiungo opzione convertendo in stringa
		  geocoder.options.viewbox = viewboxCoords.join(','); 
	  }
	});

		

// ol-ext geolocate gps
	var geoloc = new ol.control.GeolocationButton({
	  title: 'GPS Locate me',
	  delay: 2000 // 2s
	});
	
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
	var querywms = new ol.control.Toggle({
		html: '<i class="fas fa-info"></i>' + ' ' + '<h1>WMS</h1>',
		title: 'Query Layer WMS-WFS',
		className: 'querywms',
		onToggle: function(active) {
		  	if (active) {
				if (!Array.isArray(wms_layers) || wms_layers.length === 0) {
					alert("No queryable WMS layers are present.");
					querywms.setActive(false);
					return;
				}
				var visibleWmsLayers = wms_layers.filter(function(item) {
					return item[0].getVisible && item[0].getVisible();
				});
				if (visibleWmsLayers.length === 0) {
					alert("Queryable WMS layers detected, but none are currently visible.");
					querywms.setActive(false);
					return;
				}

				var currentButton = $('.querywms button')
				disableOtherElements(currentButton)

				map.removeInteraction(selectInteraction); // remove ol-ext popup select
				map.removeOverlay(popup); // remove ol-ext popupfeature
				popup.hide(); //hide ol-ext popupfeature

				overlayPopup.setPosition(undefined); //hide qgis2web popup
				featuresPopupActive = false //clear qgis2web popup
				map.addOverlay(overlayPopup); // add qgis2web popup
				map.on('singleclick', onSingleClickWMS); //add qgis2web click

				form_querywms.style.display = '';	

				map.un('pointermove', pointerOnFeature);
					  
		  	} else {
				map.removeOverlay(overlayPopup); // remove qgis2web popup
				map.un('singleclick', onSingleClickWMS); //remove qgis2web click

				map.addInteraction(selectInteraction);  // add ol-ext popup select
				map.addOverlay(popup); // add ol-ext popupfeature
				popup.show(); //show ol-ext popupfeature
							
				form_querywms.style.display = 'none';	
				
				map.on('pointermove', pointerOnFeature);
		  }
		}
	})

	var form_querywms = document.createElement('form');
	form_querywms.className = 'form_querywms ol-control';
	form_querywms.style.display = 'none';
	form_querywms.style.height = '74px';
	form_querywms.innerHTML = `
		<label><b>Query WMS layers only</b><br />
		<a>Turn on the WMS layers, click on the map and wait for the result. The response varies based on the speed of the remote server.</a></label>
	`;
	querywms.element.appendChild(form_querywms);
	


	
// ol-ext GeoBookmark
		var bm = new ol.control.GeoBookmark({
			namespace: 'demo',
			title: "Zoom Location",
			editable: false,
		  });
		  


	
// measurement

	let measuring = false;
	var measureToggle = new ol.control.Toggle({
		html: '<i class="fas fa-ruler"></i>',
		title: 'Measure',
		className: 'measure-toggle',
		onToggle: function(active) {
			if (active) {
				var currentButton = $('.measure-toggle button')
				disableOtherElements(currentButton)
				
				selectInteraction.setActive(false)
				//map.removeInteraction(selectInteraction);

				//measureSelectForm.style.display = "";
				measureLabel.style.display = "";
				map.addInteraction(draw);
				createMeasureHelpTooltip();
				createMeasureTooltip();
				measuring = true;

				//cursor
				styleCursorNone()
				map.un('pointermove', pointerOnFeature);
			} else {
				selectInteraction.setActive(true)
				//map.addInteraction(selectInteraction);
				
				//measureSelectForm.style.display = "none";
				measureLabel.style.display = "none";
				map.removeInteraction(draw);
				measuring = false;
				map.removeOverlay(measureHelpTooltip);
				map.removeOverlay(measureTooltip);

				//remove static-tooltip and clear measurelayer
				var staticTooltip = document.getElementsByClassName("tooltip-static");
				while (staticTooltip.length > 0) {
					staticTooltip[0].parentNode.remove();
				}
				measureLayer.getSource().clear();
				sketch = null;

				//cursor
				styleCursorMove();
				map.on('pointermove', pointerOnFeature);
			}
		}
	});
	
	map.on('pointermove', function (evt) {
	  if (evt.dragging) {
		return;
	  }
	  if (measuring) {
		/** @type {string} */
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
		measureHelpTooltipElement.innerHTML = helpMsg;
		measureHelpTooltip.setPosition(evt.coordinate);
	  }
	});

	// Creazione della select e del label
	var measureLabel = document.createElement("label");
	measureLabel.innerHTML = "&nbsp;Measure:&nbsp;";
	var measureSelect = document.createElement("select");
	measureSelect.id = "type";
	var measurementOption = [
	{ value: "LineString", description: "Length" },
	{ value: "Polygon", description: "Area" },
	{ value: "Circle", description: "Radius" }
	];
	measurementOption.forEach(function (option) {
	var optionElement = document.createElement("option");
	optionElement.value = option.value;
	optionElement.text = option.description;
	measureSelect.appendChild(optionElement);
	});
	measureLabel.appendChild(measureSelect);

	// Div di controllo misura
	var measureControl = document.createElement('div');
	measureControl.className = 'measure-control ol-unselectable ol-control';
	measureControl.appendChild(measureLabel);
	measureToggle.element.appendChild(measureControl);
	//map.getTargetElement().querySelector('.ol-overlaycontainer-stopevent').appendChild(measureControl);

	// Nascondi la select inizialmente
	measureLabel.style.display = "none";

	/**
	 * Currently drawn feature.
	 * @type {ol.Feature}
	 */

	/**
	 * The help tooltip element.
	 * @type {Element}
	 */
	var measureHelpTooltipElement;

	/**
	 * Overlay to show the help messages.
	 * @type {ol.Overlay}
	 */
	var measureHelpTooltip;

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

	/**
	 * Message to show when the user is drawing a line.
	 * @type {string}
	 */
	var continueLineMsg = "1click continue, 2click close";

	/**
	 * Message to show when the user is drawing a polygon.
	 * @type {string}
	 */
	var continuePolygonMsg = "1click continue, 2click close";

	/**
	 * Message to show when the user is drawing a circle.
	 * @type {string}
	 */
	var continueCircleMsg = "1click close";

	/**
	 * Let user change the geometry type.
	 * @param {Event} e Change event.
	 */
	 
	measureSelect.onchange = function (e) {
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
	  addMeasureInteraction()
	  map.addInteraction(draw);
	};
	
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

	var measureLabelStyle = new ol.style.Style({
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

	var measureLabelStyleCache = [];

	var measureStyleFunction = function (feature, type) {
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
		  if (measureLabelStyleCache.length - 1 < count) {
			measureLabelStyleCache.push(measureLabelStyle.clone());
		  }
		  measureLabelStyleCache[count].setGeometry(segment);
		  measureLabelStyleCache[count].getText().setText(label);
		  styles.push(measureLabelStyleCache[count]);
		  count++;
		});
	  }
	  return styles;
	};

	var measureLayer = new ol.layer.Vector({
	  source: new ol.source.Vector(),
	  displayInLayerSwitcher: false,
	  style: function (feature) {
		measureLabelStyleCache = [];
		return measureStyleFunction(feature);
	  },
	  isMeasureLayer: true
	});
	map.addLayer(measureLayer);

	var draw; // global so we can remove it later
	function addMeasureInteraction() {
	  var type = measureSelect.value;
	  draw = new ol.interaction.Draw({
		source: measureLayer.getSource(),
		type: /** @type {ol.geom.GeometryType} */ (type),
		style: function (feature) {
		  return measureStyleFunction(feature, type);
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
	function createMeasureHelpTooltip() {
	  if (measureHelpTooltipElement) {
		measureHelpTooltipElement.parentNode.removeChild(measureHelpTooltipElement);
	  }
	  measureHelpTooltipElement = document.createElement("div");
	  measureHelpTooltipElement.className = "tooltip hidden";
	  measureHelpTooltip = new ol.Overlay({
		element: measureHelpTooltipElement,
		offset: [15, 0],
		positioning: "center-left"
	  });
	  map.addOverlay(measureHelpTooltip);
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

	// isImperialUnits e isNauticalUnits definiti in thanks.js

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
		if (isNauticalUnits) {
			// Sistema nautico: metri → miglia nautiche
			if (radius > 1852) { // 1 miglio nautico = 1852 metri
			  output = "(r) " + (radius / 1852).toFixed(3).replace('.', ',') + " nm";
			} else {
			  output = "(r) " + radius.toFixed(2).replace('.', ',') + " m";
			}
		} else if (isImperialUnits) {
			// Sistema imperiale: metri → piedi → miglia
			var feet = radius * 3.28084;
			if (feet > 5280) { // 1 miglio = 5280 piedi
			  output = "(r) " + (feet / 5280).toFixed(3).replace('.', ',') + " mi";
			} else {
			  output = "(r) " + feet.toFixed(2).replace('.', ',') + " ft";
			}
		} else {
			// Sistema metrico (default)
			if (radius > 1000) {
			  output = "(r) " + (radius / 1000).toFixed(3).replace('.', ',') + " km";
			} else {
			  output = "(r) " + radius.toFixed(2).replace('.', ',') + " m";
			}
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

		if (isNauticalUnits) {
			// Sistema nautico: metri → miglia nautiche
			if (length > 1852) { // 1 miglio nautico = 1852 metri
			  output = (length / 1852).toFixed(3).replace('.', ',') + " nm";
			} else {
			  output = length.toFixed(2).replace('.', ',') + " m";
			}
		} else if (isImperialUnits) {
			// Sistema imperiale: metri → piedi → miglia
			var feet = length * 3.28084;
			if (feet > 5280) { // 1 miglio = 5280 piedi
			  output = (feet / 5280).toFixed(3).replace('.', ',') + " mi";
			} else {
			  output = feet.toFixed(2).replace('.', ',') + " ft";
			}
		} else {
			// Sistema metrico (default)
			if (length > 1000) {
			  output = (length / 1000).toFixed(3).replace('.', ',') + " km";
			} else {
			  output = length.toFixed(2).replace('.', ',') + " m";
			}
		}
		return output;
	};

	/**
	 * Format area output.
	 * @param {ol.geom.Polygon} polygon The polygon.
	 * @return {string} Formatted area.
	 */
	var formatArea = function (polygon) {
		var sourceProj = map.getView().getProjection();
		var geom = polygon.clone().transform(sourceProj, 'EPSG:3857');
		var area = Math.abs(ol.sphere.getArea(geom, { projection: 'EPSG:3857' }));
		var output;
		if (isNauticalUnits) {
			// Sistema nautico: m² → miglia nautiche quadrate
			var sqNauticalMiles = area / 3429904; // 1 nm² = 3.429.904 m²
			if (sqNauticalMiles > 1) {
			  output = sqNauticalMiles.toFixed(3).replace('.', ',') + ' nm<sup>2</sup>';
			} else {
			  output = area.toFixed(2).replace('.', ',') + ' m<sup>2</sup>';
			}
		} else if (isImperialUnits) {
			// Sistema imperiale: m² → ft² → acri → mi²
			var sqFeet = area * 10.7639;
			if (sqFeet > 27878400) { // 1 mi² = 27.878.400 ft²
			  output = (sqFeet / 27878400).toFixed(3).replace('.', ',') + ' mi<sup>2</sup>';
			} else if (sqFeet > 43560) { // 1 acro = 43.560 ft²
			  output = (sqFeet / 43560).toFixed(2).replace('.', ',') + ' ac';
			} else {
			  output = sqFeet.toFixed(2).replace('.', ',') + ' ft<sup>2</sup>';
			}
		} else {
			// Sistema metrico (default)
			if (area > 1000000) {
			  output = (area / 1000000).toFixed(3).replace('.', ',') + ' km<sup>2</sup>';
			} else {
			  output = area.toFixed(2).replace('.', ',') + ' m<sup>2</sup>';
			}
		}
		return output;
	};
	addMeasureInteraction();



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
				isPopupAllActive = false;

				map.addOverlay(popup); // add ol-ext popupfeature
				popup.show(); //show ol-ext popupfeature

				form_popupall.style.display = 'none';

				//cursor
				styleCursorMove();
			}
		}
	});

	// inserisci una form con id form_popupall con scritto "Query with the unified popup" con display none
	var form_popupall = document.createElement('form');
	form_popupall.className = 'form_popupall ol-control';
	form_popupall.innerHTML = 'Query with the unified popup';
	form_popupall.style.display = 'none';
	popupall.element.appendChild(form_popupall);
				
			
// ol-ext editbar
	// A new control bar
	var bar = new ol.control.Bar({
	  className: 'collapsed',
	})

	// Add activate / deactivate button
	var activateBt = new ol.control.Toggle({
	  html: '<i class="fas fa-drafting-compass"></i>',
	  title: 'Draw',
	  className: 'menu',
	  onToggle: function(active) {
		// editBar.getInteraction('Select').setActive(false)
		if (active) {				
			var currentButton = $('.menu > button').first();
			disableOtherElements(currentButton)				
			// remove interaction popup
			selectInteraction.setActive(false);			
			//show bar	
			bar.element.classList.remove('collapsed')				
			//activate default interaction
			editBar.getInteraction('DrawPolygon').setActive(true)		  
			//cursor
			styleCursorDefault()
			map.un('pointermove', pointerOnFeature);			
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
			styleCursorMove();
			map.on('pointermove', pointerOnFeature);
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

	var search = new ol.control.SearchFeature({	
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

	document.addEventListener('DOMContentLoaded', () => {
		// Toggle su .ol-search
		$('.ol-search button').off('click');
		$('.ol-search button').on('click', function (evt) {
			// fai toggle della classe ol-active sul genitore
			$(this).parent().toggleClass('ol-active');
			
			// se ha la classe ol-active disattiva gli altri bottoni
			if ($(this).parent().hasClass('ol-active')) {
				var currentButton = $(this);
				disableOtherElements(currentButton);
			}
		});
	});

	//variabile globale che si attiva durante la ricerca manuale con search feature
	//e si disattiva durante la ricerca automatizzata proveniente dal permalink query feature
	var isManualSearch = false;

// padding for search
	var paddingValueForSearch;
	function getPaddingForSearch() {
		var minZoom = 1;
		var maxZoom = 24;
		var paddingAtMinZoom = 300;
		var paddingAtMaxZoom = 1;
		paddingValueForSearch = Math.round(
			paddingAtMinZoom - ((initialMapZoom - minZoom) / (maxZoom - minZoom)) * (paddingAtMinZoom - paddingAtMaxZoom)
		);
	}
	getPaddingForSearch();

	search.on('select', function(e) {
		//selectInteraction.getFeatures().clear();
		//selectInteraction.getFeatures().push(e.search);
		
		popup.hide();

		var geometry, feature

		var layer = e.search.get('layerObject');
		var isVectorTile = layer instanceof ol.layer.VectorTile;

		if (!isVectorTile) {
			feature = e.search;
			geometry = e.search.getGeometry();
		} else { // in caso di VectorTile	
			var idO = e.search.get('idO');
			// calcola il nome del set e trova la feature
			var jsonName = 'json_' + layer.get('permalink');
			var originalFeatureData = window[jsonName].features[idO];
			var format = new ol.format.GeoJSON();
			var originalFeature = format.readFeature(originalFeatureData, {
				dataProjection: 'EPSG:4326',
				featureProjection: map.getView().getProjection()
			});
			// imposto layerObject perché la feature nel set non ce l'ha
			originalFeature.set('layerObject', layer);
			feature = originalFeature;
			geometry = originalFeature.getGeometry();
		}

		// Get the extent of geometry
		var featureExtent = geometry.getExtent();		  

		// Per smartphone: Calcola il punto di zoom
		function getOffsetCenter(center, offsetY) {
			return [center[0], center[1] + offsetY];
		}

		// Per smartphone: Calcola 1/4 del monitor
		function getMapOffsetY() {
			const view = map.getView();
			const resolution = view.getResolution();
			const size = map.getSize();
			return (size[1] / 4) * resolution;
		}

		// Funzione per adattare la vista e mostrare il popup
		function fitAndShowPopup(geometry, featureExtent, popupCoord) {
			var padding;
			if (isSmallScreen || hasTouchScreen) {
				padding = Array(4).fill(paddingValueForSearch / 2);
			} else {
				padding = Array(4).fill(paddingValueForSearch);
			}
			//console.log('Padding for search:', padding);
			// zoom classico
			map.getView().fit(featureExtent, { padding: padding });
			// zoom per smartphone
			if (isSmallScreen || hasTouchScreen) {
				const center = popupCoord;
				const offsetY = getMapOffsetY();
				map.getView().setCenter(getOffsetCenter(center, offsetY));
			}
			setTimeout(() => {
				//mostro popup
				popup.show(popupCoord, feature);
			}, 200);
		}

		if (geometry.getType() === 'Point' || geometry.getType() === 'MultiPoint') {
			const paddedExtent = ol.extent.buffer(featureExtent, paddingValueForSearch);
			fitAndShowPopup(geometry, paddedExtent, geometry.getFirstCoordinate());
        } else if (geometry.getType() === 'Polygon') {
			fitAndShowPopup(geometry, featureExtent, geometry.getInteriorPoint().getCoordinates());
		} else if (geometry.getType() === 'MultiPolygon') {
			fitAndShowPopup(geometry, featureExtent, geometry.getInteriorPoints().getFirstCoordinate());
		} else if (geometry.getType() === 'LineString') {
			fitAndShowPopup(geometry, featureExtent, geometry.getCoordinateAt(0.5));
		} else if (geometry.getType() === 'MultiLineString') {
			fitAndShowPopup(geometry, featureExtent, geometry.getLineString(0).getCoordinateAt(0.5));
		}

		//autoclose on smartphone
		//isSmallScreen and hasTouchScreen defined above
		if (isSmallScreen || hasTouchScreen) {
		search.collapse()
		}
	});



// minimap
	var miniMap = new ol.control.Overview({
		layers: [ 
			new ol.layer.Tile({
				source: new ol.source.XYZ({
					url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
				})
			}),
		],
		projection: currentProjection,
		rotation: true,
		align: 'bottom-left', 
	});



// scale line
	// isImperialUnits e isNauticalUnits definiti in thanks.js
	var scaleUnits = isNauticalUnits ? 'nautical' : (isImperialUnits ? 'imperial' : 'metric');
	var scaleLine = new ol.control.ScaleLine({
 		units: scaleUnits
	});



// ol-ext scale control
	var scaleCtrl = new ol.control.Scale({});



// popup Coordinates position control
	function onSingleClickCoordinates(evt) {
		var viewProj = map.getView().getProjection();
		var targetProj = ol.proj.get(currentProjection) || viewProj;
		var coord = ol.proj.transform(evt.coordinate, viewProj, targetProj);
		// Stampa le coordinate nel popup
		content.innerHTML = '<p><u>' + currentProjection + '</u></p>';
		// Aggiungi long e lat con massimo 6 decimali
		if (currentProjection === 'EPSG:4326') {
			content.innerHTML += 'Lat(y): ' + coord[1].toFixed(5) + '</br>';
			content.innerHTML += 'Long(x): ' + coord[0].toFixed(5) + '</br>';
		} else {
			content.innerHTML += 'Long(x): ' + coord[0].toFixed(5) + '</br>';
			content.innerHTML += 'Lat(y): ' + coord[1].toFixed(5) + '</br>';
		}
		container.style.display = 'block';
		overlayPopup.setPosition(evt.coordinate);

		closer.onclick = function() {
			container.style.display = 'none';
			closer.blur();
			//disattiva il pulsante popupCoordinates ed esegui else
			$('.popup-coordinates button').trigger('click');
		};
	}
	// Add a button to activate/deactivate the control
	// and disable other ol-control when active
	var popupCoordinates = new ol.control.Toggle({
		html: '<i class="fas fa-map-pin"></i>',
		title: 'Popupcoordinates',
		className: 'popup-coordinates',
		onToggle: function(active) {
		  if (active) {
			  var currentButton = $('.popup-coordinates button')
			  disableOtherElements(currentButton)
		  
			  map.removeInteraction(selectInteraction); // remove ol-ext popup select
			  map.removeOverlay(popup); // remove ol-ext popupfeature
			  popup.hide(); //hide ol-ext popupfeature
			  
			  overlayPopup.setPosition(undefined); //hide qgis2web popup
			  featuresPopupActive = false //clear qgis2web popup
			  map.addOverlay(overlayPopup); // add qgis2web popup
			  map.on('singleclick', onSingleClickCoordinates); //add qgis2web click
			  map.un('pointermove', pointerOnFeature);
					  
		  } else {

			  map.removeOverlay(overlayPopup); // remove qgis2web popup
			  map.un('singleclick', onSingleClickCoordinates); //remove qgis2web click
			  
			  map.addInteraction(selectInteraction);  // add ol-ext popup select
			  map.addOverlay(popup); // add ol-ext popupfeature
			  popup.show(); //show ol-ext popupfeature
			  map.on('pointermove', pointerOnFeature);
		  }
		}
	})

			

// mouse position coordinates
	ol.proj.proj4.register(proj4); //registro le proiezioni di Proj4js in OpenLayers

	// Add MousePosition control
	var mousePositionDefault = new ol.control.MousePosition({
	  coordinateFormat: function(coord) {
		return '<u>' + currentProjection + '</u>' + ' ' + coord[0].toFixed(5) + ' ' + coord[1].toFixed(5);
	  },
	  projection: currentProjection, 
	  className: 'mousePositionDefault ol-control',
	});

	document.addEventListener('DOMContentLoaded', function() {
		var mousePositionButton = $('.mousePositionDefault');
		mousePositionButton.on('click', function() {
		var newEpsg = prompt('View the coordinates in the desired SR by entering its EPSG code (e.g. 4326):');
		if (isValidEpsg(newEpsg)) {
			// Aggiorna la variabile currentProjection con il nuovo EPSG code
			currentProjection = 'EPSG:' + newEpsg;
			// Aggiorna coordinateFormat con il nuovo EPSG code
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
	});



		

//  ol-ext popup feature
 
	// rimuovo i controlli e gli eventi predefiniti di qgis2web
	featureOverlay.getSource().clear(); //rimuovo le features evidenziate nel caso di "doHighlight true" perché in pc lenti rimangono appese al caricamento della mappa
	map.un('pointermove', onPointerMove);
	map.un('singleclick', onSingleClickFeatures);
	map.un('singleclick', onSingleClickWMS);
	map.removeOverlay(overlayPopup);

	// New highlight Features
	// La rimuove nel popup all
	function highlightFeatures(evt) {
		if (evt.dragging) return;
		highlightLayer.getSource().clear();

		map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
			if (
				layer !== selectLayer &&
				(layer instanceof ol.layer.Vector ||
				 layer instanceof ol.layer.VectorImage ||
				 layer instanceof ol.layer.AnimatedCluster ||
				 layer instanceof ol.layer.VectorTile) &&
				layer.get("interactive")
			) {
				var layer = feature.get('layerObject');
				var isVectorTile = layer instanceof ol.layer.VectorTile;
				var collectedIdO = [];

				if (!isVectorTile) {
					// Gestione cluster
					if (feature.get('features')) {
						var clusterFeatures = feature.get('features');
						clusterFeatures.forEach(function(f) {
							highlightLayer.getSource().addFeature(f);
						});
					} else {
						highlightLayer.getSource().addFeature(feature);
					}
				} else {
					var idO = feature.get('idO');
					var permalink = layer.get('permalink');
					var uniqueId = permalink + '_' + idO;
					if (collectedIdO.includes(uniqueId)) {
						return; // salta i duplicati
					}
					collectedIdO.push(uniqueId);
					// calcola il nome del set e trova la feature
					var jsonName = 'json_' + permalink;
					var originalFeatureData = window[jsonName].features[idO];
					var format = new ol.format.GeoJSON();
					var originalFeature = format.readFeature(originalFeatureData, {
						dataProjection: 'EPSG:4326',
						featureProjection: map.getView().getProjection()
					});
					// imposto layerObject perché la feature nel set non ce l'ha
					originalFeature.set('layerObject', layer);
					highlightLayer.getSource().addFeature(originalFeature);
				}

				return true;
			}
		}, { hitTolerance: 5 });
	}

	if (doHighlight && !doHover) {
		map.on('pointermove', highlightFeatures);
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
				if (ol.events.condition.click(event)) {
					// Clear delle features esistenti prima del nuovo click
					selectInteraction.getFeatures().clear();

					// Nascondi il popup se nel click non ci sono features
					var pixel = event.pixel;
					var exists = map.hasFeatureAtPixel(pixel, {
						layerFilter: function(layer) {
							return layer !== selectLayer &&
								(layer instanceof ol.layer.Vector ||
								 layer instanceof ol.layer.VectorImage ||
								 layer instanceof ol.layer.VectorTile) &&
								layer.get("interactive");
						}
					});

					if (!exists) {
						popup.hide(); // Nascondi il popup se non c'è selezione
						selectLayer.getSource().clear();
					}

					return true;
				}
				return false;
			}
		},
		layers: function (layer) {
			return layer !== selectLayer
			&& (layer instanceof ol.layer.Vector || 
				layer instanceof ol.layer.VectorImage ||
				layer instanceof ol.layer.VectorTile)
			&& layer.get("interactive")
		},
		style: null,
	});
	map.addInteraction(selectInteraction);  
		
	selectInteraction.on('select', function(event) {
		selectInteraction.getFeatures().clear();
		var selectedFeatures = event.selected;
		// colleziono idO per non selezionare doppioni
		var collectedIdO = [];
		selectedFeatures.forEach(function(feature) {
			var layer = feature.get('layerObject');
			var isVectorTile = layer instanceof ol.layer.VectorTile;

			if (!isVectorTile) {
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
			// in caso di VectorTile
			} else {		
				var idO = feature.get('idO');
				var permalink = layer.get('permalink');
				var uniqueId = permalink + '_' + idO;
				if (collectedIdO.includes(uniqueId)) {
					return; // salta i duplicati
				}
				collectedIdO.push(uniqueId);
				// calcola il nome del set e trova la feature
				var jsonName = 'json_' + permalink;
				var originalFeatureData = window[jsonName].features[idO];
				var format = new ol.format.GeoJSON();
				var originalFeature = format.readFeature(originalFeatureData, {
					dataProjection: 'EPSG:4326',
					featureProjection: map.getView().getProjection()
				});
				// imposto layerObject perché la feature nel set non ce l'ha
				originalFeature.set('layerObject', layer);
				selectInteraction.getFeatures().push(originalFeature);
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
		autoPan: true, // attiva il pan automatico
		template: function (feature) {
		  // Ottengo il layer della feature solo se sto interrogando una feature
		  var layer = feature.get && feature.get('layerObject');

		  if (layer) {
			var popuplayertitle = layer.get("popuplayertitle");
			var attributes = {};

			var fieldImages = layer.get("fieldImages");
			var fieldLabels = layer.get("fieldLabels");
			var fieldAliases = layer.get("fieldAliases");

			var imgCount = 0; // Contatore per le immagini

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
				if (key !== feature.getGeometryName()) {
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
							  const filename = val.replace(/[\\\/:]/g, '_').trim();
							  if (/\.(gif|jpg|jpeg|tif|tiff|png|avif|webp|svg)$/i.test(val)) {
								const imgId = 'img-' + imgCount++; // Incrementa il contatore per creare un ID unico
																							 
								// HTML con immagine e bottone
								const html = `
								<div id="imgContainer-${imgId}" class='popupimage' style="position: relative">
									<img id="${imgId}" src="images/${filename}">
									<div style="position: absolute; top: 3px; right: 3px; display: flex; gap:4px; z-index:999;">
										<button class="fa fa-expand expand-btn" onclick="document.getElementById('imgContainer-${imgId}').requestFullscreen().catch(function(err){console.error('requestFullscreen failed:', err);})"></button>
										<button class="fa fa-xmark compress-btn" onclick="if (document.fullscreenElement) { document.exitFullscreen().catch(function(err){console.error('exitFullscreen failed:', err);}); }"></button>
									</div>
								</div>
								`;
								return html;
							  } else if (/\.(mp4|webm|ogg|avi|mov|flv)$/i.test(val)) {
								return `<video controls src="images/${filename}" style="max-width:100%; max-height:300px;"></video>`;
							  } else if (/\.(mp3|wav|ogg|aac|flac)$/i.test(val)) {
								return `<audio controls src="images/${filename}" style="max-width:100%;"></audio>`;
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

	
	//positioning center for smartphone
	//isSmallScreen or hasTouchScreen defined above
	if (isSmallScreen || hasTouchScreen) {
		  popup.setPositioning('bottom-center')
		}
	
	// Listener for closing the popup with closebox
	$(".closeBox").on("click", function() {
		selectInteraction.getFeatures().clear();
		selectLayer.getSource().clear();
	});
					
	popup.on('show', () => {
		// Seleziono le features portandole dalla selectInteraction al selectLayer
		selectLayer.getSource().clear();
		const selectedFeatures = selectInteraction.getFeatures();
		if (selectedFeatures.getLength() > 0) {
			const currentFeature = selectedFeatures.item(0);
			selectLayer.getSource().addFeature(currentFeature);
		}

		// sposta l'elemento count dopo h1 così da poterlo selezionare con css
		var count = popup.element.querySelector('.ol-count');
		if (count) {
			popup.element.querySelector('h1').prepend(count);
		}
		
		// Elimina larghezza massima popup in caso di foto e rimuovi l'expand button se img piccola
		  var tdImg = document.querySelectorAll('.ol-popup .ol-popupfeature table td img');

		  tdImg.forEach(function(img) {
			// elimina larghezza massima
			var tdParent = img.parentNode.parentNode;
			tdParent.style.maxWidth = 'unset';
			// elimina expand button se img piccola
			img.onload = function() {
				if (this.naturalWidth < 150 && this.naturalHeight < 150) {
					const expandBtn = tdParent.querySelector('.expand-btn');
					if (expandBtn) {
						expandBtn.style.display = 'none';
					}
				}
			};
		  });
		  
		// Elimina larghezza massima popup in caso di video
		  var tdVideo = document.querySelectorAll('.ol-popup .ol-popupfeature table td video');

		  tdVideo.forEach(function(video) {
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

		// Se il popup ha classe ol-fixed elimina tutte le classi che iniziano per "ol-popup-"
		// e aggiungi ol-popup-top, ol-popup-left
		if (popup.element.classList.contains('ol-fixed')) {
			popup.element.className = popup.element.className
			.split(' ')
			.filter(c => !c.startsWith('ol-popup-'))
			.join(' ');
			popup.element.classList.add('ol-popup-top', 'ol-popup-left');
		}
	})

	popup.on('hide', () => {
		// Stop any playing audio or video in the popup
		const mediaElements = popup.element.querySelectorAll('audio, video');
		mediaElements.forEach(media => {
			media.pause();
			media.currentTime = 0;
		});
		selectLayer.getSource().clear();
	});

			
//  extend popup characters
	var autolinker = new Autolinker({truncate: {length: 40, location: 'smart'}});			


// Applica l'extent ai layer sulla base dello zoom
	// Cache per memorizzare all'avvio gli extent dei source dei layer
	var layerExtentsCache = new Map();
	
	// Funzione per ottenere un buffer dinamico basato sul livello di zoom
	function getDynamicBuffer(extent, zoom) {
		var factor = Math.pow(2, (10 - zoom)); // Fattore di scala basato sul livello di zoom
		var buffer = factor * 10000; // Buffer esponenziale basato sul livello di zoom
		var bufferedExtent = ol.extent.buffer(extent, buffer); // Aggiungi il buffer calcolato
		return bufferedExtent;
	}

	/* // Funzione per calcolare l'extent di un GeoJSON in caso di VectorTile
	function getGeoJSONExtent(geojson) {
		var extent = [Infinity, Infinity, -Infinity, -Infinity];
		geojson.features.forEach(function(feature) {
			var coords = [];
			// Estrai tutte le coordinate della geometria
			if (feature.geometry.type === 'Point') {
				coords = [feature.geometry.coordinates];
			} else if (feature.geometry.type === 'MultiPoint' ||
					feature.geometry.type === 'LineString') {
				coords = feature.geometry.coordinates;
			} else if (feature.geometry.type === 'MultiLineString' ||
					feature.geometry.type === 'Polygon') {
				coords = [].concat.apply([], feature.geometry.coordinates);
			} else if (feature.geometry.type === 'MultiPolygon') {
				coords = [].concat.apply([], [].concat.apply([], feature.geometry.coordinates));
			}
			coords.forEach(function(coord) {
				if (coord.length >= 2) {
					extent[0] = Math.min(extent[0], coord[0]);
					extent[1] = Math.min(extent[1], coord[1]);
					extent[2] = Math.max(extent[2], coord[0]);
					extent[3] = Math.max(extent[3], coord[1]);
				}
			});
		});
		var mapProj = map.getView().getProjection();
		var projectedExtent = ol.proj.transformExtent(extent, 'EPSG:4326', mapProj);
		return projectedExtent;
	} */
	
	// Inizializzo la cache degli extent all'avvio
	function initializeLayersExtentsCache() {
		var vectorLayersForExtent = allLayers.filter(function(layer) {
			return layer instanceof ol.layer.Vector ||
			     layer instanceof ol.layer.VectorImage ||
				 layer instanceof ol.layer.AnimatedCluster ||
				 layer instanceof ol.layer.VectorTile;
		});
		vectorLayersForExtent.forEach(function(layer) {
			var layerId = layer.get('permalink') || layer.ol_uid || Math.random().toString(36);
			var extent;
			if (layer instanceof ol.layer.VectorTile) {
				extent = layer.get('extent');
																							 
			} else {
				var src = layer.getSource();
				var source = src instanceof ol.source.Cluster ? src.getSource() : src;
				extent = source.getExtent();
			}	
			if (extent && !ol.extent.isEmpty(extent)) {
				// Memorizzo l'extent originale nella cache
				layerExtentsCache.set(layerId, {
					layer: layer,
					originalExtent: extent 
				});
			}
		});
	}
	
	// Applica l'extent con buffer ai layer
	function setBufferedLayersExtent() {
		var zoom = map.getView().getZoom();
		// Itera sulla cache invece di ricalcolare gli extent
		layerExtentsCache.forEach(function(cacheData, layerId) {
			var layer = cacheData.layer;
			var originalExtent = cacheData.originalExtent;
			// Applica il buffer dinamico all'extent originale memorizzato
			var bufferedExtent = getDynamicBuffer(originalExtent, zoom);
			layer.set('extent', bufferedExtent); // Applica l'estensione bufferizzata al layer
		});
	}
	
	// Imposta l'extent nei layers
	function setLayersExtent() {
		// Memorizzo gli extent dei source nella map cache
		if (layerExtentsCache.size === 0) {
			initializeLayersExtentsCache();
		}
		// Applica il buffer agli extent usando la cache
		setBufferedLayersExtent();
	}
	
	// Quando ho finito di caricare i layers lancio l'inizializzazione della cache
	document.addEventListener('DOMContentLoaded', () => {
		if (window.layersLoadedFlag) {
			initializeLayersExtentsCache();
			setLayersExtent();
			map.on('moveend', function() {
				setLayersExtent();
			});
		} else {
			document.addEventListener('layersLoaded', function() {
				initializeLayersExtentsCache();
				setLayersExtent();
				map.on('moveend', function() {
					setLayersExtent();
				});
			});
		}
													  
								
					 
	 
	});


		
// ol-ext print dialog control

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

	// Modifica le labels del PrintDialog prima di creare l'istanza
	ol.control.PrintDialog.prototype._labels.en.mapTitle = 'Description';

	// Print control
	var printControl = new ol.control.PrintDialog({
		lang: 'en',
		//copy: true,
		//save: true,
		//pdf: true,
	});
	printControl.setSize('A4');
	printControl.setOrientation('landscape');

	document.addEventListener('DOMContentLoaded', function() {
		var printButton = $('.ol-print-param > .ol-ext-buttons')[0];
		
		// Pulsante per scaricare l'immagine
		var btDownload = document.createElement('BUTTON');
		btDownload.classList.add('print-download-button');
		btDownload.innerHTML = '<i class="fa-solid fa-download"></i>';
		printButton.insertBefore(btDownload, printButton.firstChild);
		// Quando clicco download scarico l'immagine
		btDownload.addEventListener('click', function() {
			var container = document.querySelector('.ol-print-map > .ol-page');
			if (!container) {
				alert('Print preview not available. Please open the print dialog first.');
				return;
			}
			var containerWidth = container.clientWidth;
			console.log('Container width:', containerWidth);
			var minWidth = 1920;
			var baseScale = 2;
			var dynamicScale = baseScale;
			
			if (containerWidth < minWidth) {
				var ratio = minWidth / containerWidth;
				var extraScale = ratio - 1;
				dynamicScale = baseScale + extraScale;
			}
			console.log('Dynamic scale for screenshot:', dynamicScale);

			html2canvas(container, {
				useCORS: true,
				allowTaint: false,
				backgroundColor: '#ffffff',
				scale: dynamicScale
			}).then(function(canvas) {
				canvas.toBlob(function(blob) {
					if (!blob) {
						alert('There are active realtime WMS/XYZ layers. Cannot download image. Please use PDF print instead.');
						return;
					}
					var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
					var filename = 'map-' + timestamp + '.png';
					saveAs(blob, filename);
					alert('Image downloaded!\n\nIf the background is white, remove remote WMS/XYZ layers.');
				}, 'image/png');
			}).catch(function(err) {
				console.error('Error capturing screenshot:', err);
				alert('Error capturing screenshot.\n\nIf the project is local, load it in a web server.');
			});	
		});

		// Pulsante per copiare negli appunti
		var btCopy = document.createElement('BUTTON');
		btCopy.classList.add('print-copy-button');
		btCopy.innerHTML = '<i class="fa-solid fa-copy"></i>';
		printButton.insertBefore(btCopy, printButton.firstChild);
		// Quando clicco share copio l'immagine negli appunti
		btCopy.addEventListener('click', function() {
			var container = document.querySelector('.ol-print-map > .ol-page');
			if (!container) {
				alert('Print preview not available. Please open the print dialog first.');
				return;
			}
			var containerWidth = container.clientWidth;
			console.log('Container width:', containerWidth);
			var minWidth = 1920;
			var baseScale = 2;
			var dynamicScale = baseScale;
			
			if (containerWidth < minWidth) {
				var ratio = minWidth / containerWidth;
				var extraScale = ratio - 1;
				dynamicScale = baseScale + extraScale;
			}
			console.log('Dynamic scale for screenshot:', dynamicScale);

			html2canvas(container, {
				useCORS: true,
				allowTaint: false,
				backgroundColor: '#ffffff',
				scale: dynamicScale
			}).then(function(canvas) {
				canvas.toBlob(function(blob) {
					navigator.clipboard.write([
						new ClipboardItem({ 'image/png': blob })
					]).then(function() {
						alert('Image copied to clipboard!\n\nIf the background is white, remove remote WMS/XYZ layers.');
					}).catch(function(err) {
						console.error('Error copying to clipboard:', err);
						alert('Error copying to clipboard.\n\nIf the project is local, load it in a web server.');
					});
				}, 'image/png');
			}).catch(function(err) {
				console.error('Error capturing screenshot:', err);
				alert('Error capturing screenshot.\n\nIf the project is local, load it in a web server.');
			});	
		});

		// Modifico aspetto pulsante print
		var printButton = document.querySelector('.ol-ext-print-dialog .ol-print-param button[type="submit"]');
		if (printButton) {
			printButton.innerHTML = '<i class="fa-solid fa-print"></i>';
			printButton.classList.add('print-submit-button');
		}

	});

	// /* On print > save image file */
	// printControl.on(['print', 'error'], function(e) {
	// // Print success
	// if (e.image) {
	// 	if (e.pdf) {
	// 	// Export pdf using the print info
	// 	var pdf = new jsPDF({
	// 		orientation: e.print.orientation,
	// 		unit: e.print.unit,
	// 		format: e.print.size
	// 	});
	// 	pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[0], e.print.imageWidth, e.print.imageHeight);
	// 	pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
	// 	} else  {
	// 	// Save image as file
	// 	e.canvas.toBlob(function(blob) {
	// 		var name = (e.print.legend ? 'legend.' : 'map.')+e.imageType.replace('image/','');
	// 		saveAs(blob, name);
	// 	}, e.imageType, e.quality);
	// 	}
	// } else {
	// 	console.warn('No canvas to export');
	// }
	// });
	
	// Add a title control
	var canvasTitle = new ol.control.CanvasTitle({ 
		title: 'Description', 
		visible: false,
		style: new ol.style.Style({ text: new ol.style.Text({ font: '20px "Lucida Grande",Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif'}) })
		});
	map.addControl(canvasTitle);
	// Sovrascrivo il metodo setVisible per aggiungere/rimuovere la classe 'visible'
	var originalSetVisible = canvasTitle.setVisible.bind(canvasTitle);
	canvasTitle.setVisible = function(visible) {
		originalSetVisible(visible);
		if (visible) {
			this.element.classList.add('visible');
		} else {
			this.element.classList.remove('visible');
		}
	};
	map.getOverlayContainerStopEvent().prepend(canvasTitle.element);

	// add switch for logo and title
	document.addEventListener('DOMContentLoaded', function() {
		if (typeof logoForm !== 'undefined') { // se var logoForm è definito nell'index.html
			var printSwitchLogoTitle = ol.ext.element.createSwitch({
				html: 'Logo & Title',
				className: 'switch-logo-title',
				checked: false,
				on: {
					change: function (e) {
						// aggiungi classe print a logoForm se non c'è altrimenti la toglie
						if (e.target.checked) {
							logoForm.classList.add('print');
						} else {
							logoForm.classList.remove('print');
						}
					}
				},
				parent: printControl.getUserElement()
			})
		}
	});

	// add switch for legend
	var printSwitchLegend = ol.ext.element.createSwitch({
		html: 'Legend',
		className: 'switch-legend',
		checked: false,
		on: {
			change: function (e) {
				var legendAttribution = document.getElementsByClassName('legend-attribution')[0];
				if (e.target.checked) {
					legendAttribution.classList.add('print');
				} else {
					legendAttribution.classList.remove('print');
				}
			}
		},
		parent: printControl.getUserElement()
	})

    // Add a ScaleLine control 
	var scalebar = new ol.control.ScaleLine({
		bar: true,
		units: scaleUnits
	})
	map.addControl(scalebar);


	
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
					// Simulate SearchFeature's 'select' function
					search.select(featureFound);
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
		var permalinkbuttontitle = $('div.ol-permalink button');
		permalinkbuttontitle.attr('title', 'Permalink');

		if (window.layersLoadedFlag) {
			setTimeout(loadPermalink, 500); // Ritardo di 500ms
		} else {
			document.addEventListener('layersLoaded', () => {
				setTimeout(loadPermalink, 500); // Ritardo di 500ms
			});
		}
	});


// fullscreen expand control

	var fullScreenControl = new ol.control.FullScreen({
		tipLabel: 'Full Screen'
	});
	//change position in smartphone
	if (hasTouchScreen) {
		$('.ol-full-screen').addClass('touch');
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
	// Lancia all'avvio
	listenVisible(map.getLayers());


	// LayerSwitcher open/collapsed desktop/smartphone
	// Show layer switcher if not too small and non touch device...
	// isSmallScreen and hasTouchScreen defined above
	if (!isSmallScreen && !hasTouchScreen) {
	  layerSwitcher.toggle()
	}
	
	// drawlist event per personalizzare ogni riga del layer switcher
	// e per gestire il cambio di simbologia	
	layerSwitcher.on('drawlist', function (e) {
		var layer =  e.layer;
		var li = e.li;

		// Hide layer for hideLayer class list element
		// Used to make openstreetmap layers disappear when using streetview
		// Add class based on a layer property
		if (layer.get('hideLayer')) li.classList.add('hideLayer');

		// Spegni i gruppi layer che all'interno hanno tutto spento
		if (layer instanceof ol.layer.Group) {
			// Aggiungi una classe per identificare i gruppi   
			li.className = "ol-layer-group"; 

			// Funzione ricorsiva per verificare se un layer o un gruppo è visibile
			function isAnythingVisible(group) {
			  return group.getLayers().getArray().some(function (lyr) {
				if (lyr instanceof ol.layer.Group) {
				  // Se il layer è un gruppo, richiamo ricorsivamente la funzione
				  return isAnythingVisible(lyr);
				} else {
				  // Se è un layer semplice, controllo la visibilità
				  return lyr.getVisible();
				}
			  });
			}
			// Controllo se tutto all'interno del gruppo è invisibile
			var allInvisible = !isAnythingVisible(layer);
			// Se tutto è invisibile, nascondo il gruppo
			if (allInvisible) {
			  layer.setVisible(false); // Imposto il gruppo come invisibile
			}
		}

		
		// Remove title when mouse stops over label
		// remove list label element title
		const labelEl = li.querySelector('label');
		if (labelEl) labelEl.title = '';
		
		// Remove click on the label to turn on/off layer
		const spanEl = li.querySelector('span');
		if (spanEl) spanEl.addEventListener('click', e => e.stopPropagation());

		// Expand/collapse layer legend
		if (!(layer instanceof ol.layer.Group)) {
			var active = layer.get('legendActive');
			if (active) $(".li-content #layertitle", li).addClass('active');
			var layerTitle = $(".li-content #layertitle", li)[0];
			$(layerTitle).off('click');
			$(layerTitle).click(function(event) {
			  event.stopPropagation(); // Prevent interference with the layer switcher
			  event.preventDefault(); // No first input toggle
			  layer.set('legendActive', !layer.get('legendActive')); // Toggle legend active state
			  $(this).toggleClass('active'); // Toggle active class
			});
		}
		// if target is not an input, we stop the label's behavior
		$(".layerlegend", li).on("click", function(ev) {
			if (ev.target.tagName.toLowerCase() !== "input") {
				ev.preventDefault();
				ev.stopPropagation();
			}
		});

		// Applica alle checkbox lo stato salvato in activeSymbology
		const activeSymbology = layer.get('activeSymbology');
		if (activeSymbology) {
			const checks = li.querySelectorAll('.symbology');
			activeSymbology.checksStatus.forEach((status, index) => {
				if (checks[index]) {
					checks[index].checked = status;
				}
			});
		}
			
		// symbology switcher	
		if (layer instanceof ol.layer.Vector ||
			layer instanceof ol.layer.VectorImage ||
			layer instanceof ol.layer.VectorTile) {
			var checks = li.querySelectorAll('.symbology');
			if (checks.length <= 1) return;
		
			// Funzione per ottenere i valori dalle input, gestendo le diverse tipologie
			function getValues(cb) {
				const t = cb.getAttribute('symbology-type'); 
				if (t === "merged-categorized") {
					return cb.value.split(',').map(v => v.trim());
				} else if (t === "graduated") {
					return [{
						min: parseFloat(cb.getAttribute("min-value")),
						max: parseFloat(cb.getAttribute("max-value"))
					}];
				} else if (t === "rule-based") {
					return [cb.getAttribute("rule")];
				} else { // categorized semplice
					return [cb.value];
				}
			}
		
			// Init una sola volta per allSymbology
			if (!layer.get('allSymbology')) {
				const categorized = [];
				const graduated = [];
				const rules = [];
		
				checks.forEach(cb => {
					const type = cb.getAttribute('symbology-type');
					const vals = getValues(cb);
		
					if (type === "graduated") {
						graduated.push(...vals);
					} else if (type === "rule-based") {
						rules.push(...vals);
					} else {
						vals.forEach(v => {
							if (v !== 'ogis-other') categorized.push(v);
						});
					}
				});
		
				let type = "categorized";
				let values = categorized;
				if (graduated.length) { type = "graduated"; values = graduated; }
				else if (rules.length) { type = "rule-based"; values = rules; }
		
				layer.set('allSymbology', { type, values });
			}
		
			// Init la prima volta per activeSymbology
			if (!layer.get('activeSymbology')) {
				const categorized = [];
				const graduated = [];
				const rules = [];
				const checksStatus = Array.from(checks).map(cb => cb.checked); // Stato iniziale delle checkbox
		
				checks.forEach(cb => {
					const type = cb.getAttribute('symbology-type');
					const vals = getValues(cb);
		
					if (type === "graduated") graduated.push(...vals);
					else if (type === "rule-based") rules.push(...vals);
					else categorized.push(...vals);
				});
		
				let type = "categorized";
				let values = categorized;
				if (graduated.length) { type = "graduated"; values = graduated; }
				else if (rules.length) { type = "rule-based"; values = rules; }
		
				layer.set('activeSymbology', { type, values, checksStatus });

				if (layer instanceof ol.layer.VectorTile) {
                    const worker = layer.get('worker');
					if (worker) {
						worker.postMessage({
							type: 'updateFilter',
							activeSymbology: layer.get('activeSymbology'),
							allSymbology: layer.get('allSymbology')
						}); 
					}
                }
			}
		
			const actSetLyr = layer.get('activeSymbology');
		
			// Cambio simbologia → aggiornamento set e visibilità layer
			checks.forEach((cb, index) => {
				cb.addEventListener('change', function() {
					if (!actSetLyr) return;
					const type = cb.getAttribute('symbology-type');
					const vals = getValues(cb);

					actSetLyr.checksStatus[index] = this.checked;
		
					if (this.checked) {
						if (type === "graduated") {
							vals.forEach(v => {
								if (!actSetLyr.values.some(r => r.min === v.min && r.max === v.max)) {
									actSetLyr.values.push(v);
								}
							});
						} else {
							vals.forEach(v => {
								if (!actSetLyr.values.includes(v)) actSetLyr.values.push(v);
							});
						}
					} else {
						if (type === "graduated") {
							vals.forEach(v => {
								actSetLyr.values = actSetLyr.values.filter(r => !(r.min === v.min && r.max === v.max));
							});
						} else {
							vals.forEach(v => {
								actSetLyr.values = actSetLyr.values.filter(r => r !== v);
							});
						}
					}
		
					layer.setVisible(actSetLyr.values.length > 0);

                    // UPDATE VISIBILITA'
					// VectorTile con worker
                    if (layer instanceof ol.layer.VectorTile) {
                        const source = layer.getSource();
                        const worker = layer.get('worker');
						if (worker) {
							worker.postMessage({
								type: 'updateFilter',
								activeSymbology: actSetLyr,
								allSymbology: layer.get('allSymbology')
							});
						}
						// ricarico tile chiamando tileLoadFunction
						source.refresh(); 
                    } else {
					// Altre tipologie di layer
                        layer.changed();
                    }
                    //console.log("activeSymbology change:", actSetLyr);
				});
			});
		
			// Visibilità layer → aggiorna check e set
			layer.on("change:visible", function () {
				if (!actSetLyr) return;
		
				if (layer.getVisible()) {
					if (actSetLyr.values.length === 0) {
						// Layer acceso ma nessuna simbologia attiva → attivo tutte
						checks.forEach((cb, index) => {
							const type = cb.getAttribute('symbology-type');
							const vals = getValues(cb);
							if (type === "graduated") {
								vals.forEach(v => {
									if (!actSetLyr.values.some(r => r.min === v.min && r.max === v.max)) {
										actSetLyr.values.push(v);
									}
								});
							} else {
								vals.forEach(v => {
									if (!actSetLyr.values.includes(v)) actSetLyr.values.push(v);
								});
							}
							cb.checked = true;
							actSetLyr.checksStatus[index] = true;
						});
					} else {
						// Ripristino solo le simbologie attive
						checks.forEach((cb, index) => {
							const type = cb.getAttribute('symbology-type');
							const vals = getValues(cb);
							let activeVals = false;
							if (type === "graduated") {
								activeVals = vals.some(v => actSetLyr.values.some(r => r.min === v.min && r.max === v.max));
							} else {
								activeVals = vals.some(v => actSetLyr.values.includes(v));
							}
							cb.checked = activeVals;
							actSetLyr.checksStatus[index] = activeVals;
						});
					}
				} else {
					checks.forEach((cb, index) => {
						cb.checked = false;
						actSetLyr.checksStatus[index] = false; // Aggiorna checksStatus
					});
					actSetLyr.values = [];
				}

				// UPDATE VISIBILITA'
				// VectorTile con worker
				if (layer instanceof ol.layer.VectorTile) {
					const source = layer.getSource();
					const worker = layer.get('worker'); 
					if (worker) {
						worker.postMessage({
							type: 'updateFilter',
							activeSymbology: actSetLyr,
							allSymbology: layer.get('allSymbology')
						});
					}
					// ricarico tile chiamando tileLoadFunction
					source.refresh(); 
				} else {
				// Altre tipologie di layer
					layer.changed();
				}
			});
		}
	});

	

// Legend Layer Attribution
	// Creo la legenda sovrapposta al layerswitcher
	var legendAttribution = new ol.control.Attribution({
		className: 'legend-attribution',
		collapsible: true,
		collapsed: true,
		label: 'Legend',
		tipLabel: 'Key',
		collapseLabel: 'Close Legend',
	});
	

/* 	// Registro l'evento toggle per il LayerSwitcher
	layerSwitcher.on('toggle', function(e) {
	    if (($('.ol-layerswitcher').hasClass('ol-forceopen')) && !(hasTouchScreen || isSmallScreen)) {
			$('.legend-attribution').attr('style', 'display: block');
			$('.legend-attribution button').attr('style', 'display: block');
		} else {
			$('.legend-attribution').attr('style', 'display: none');
			$('.legend-attribution button').attr('style', 'display: none');
		}
	})
	// Mostro la legenda se non è un dispositivo touch e non è uno smartphone
	if (!hasTouchScreen && !isSmallScreen) {
		$('.legend-attribution button').attr('style', 'display: block');
	} else {
		$('.legend-attribution button').attr('style', 'display: none');
	} */	



// StreetView
	var streetViewOptions = {
		//apiKey: '', // Must be provided to remove "For development purposes only" message
		language: 'en',
		size: 'md',
		resizable: true,
		sizeToggler: true,
		defaultMapSize: 'expanded',
		target: 'map', // Important for OL 5
		// Custom translations. Default is according to selected language
		i18n: {dragToInit: 'StreetView - Drag and drop me'}
	}
	// Sposta in mappa icona streetview (sotto al popup)
	document.addEventListener('DOMContentLoaded', function () {
		streetView.once('loadLib', function () {
			var streetviewButton = document.getElementById('ol-street-view--pegman-button-div');
			if (streetviewButton && map && map.getOverlayContainerStopEvent) {
				map.getOverlayContainerStopEvent().appendChild(streetviewButton);
			}
		});
	});


// Sposta in mappa icona O.GIS (sotto al popup)
	const formOGIS = document.getElementById('form_opengis');
	if (formOGIS && map && map.getOverlayContainerStopEvent) {
		map.getOverlayContainerStopEvent().appendChild(formOGIS);
	}


// attribution

	// Azzero attributionList e la definisco nuova nell'index.html
	attributionList.innerHTML = '';
