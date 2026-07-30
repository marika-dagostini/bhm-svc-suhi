// ====================
//  FUNZIONI DI SUPPORTO PER LO STYLE
// ====================

    // Funzione per non disegnare le features con simbologia spenta
    function checkSymbologyRules(value, activeSymbology, allSymbology, feature, rulesList) {
        if (!activeSymbology || !activeSymbology.values) return true;

        if (activeSymbology.type === "categorized") {
            const valueStr = value != null ? String(value) : "default";

            if (activeSymbology.values.includes("ogis-other")) {
            if (allSymbology?.values) {
                const diff = allSymbology.values.filter(v => !activeSymbology.values.includes(v));
                return !diff.includes(valueStr);
            }
            }
            return activeSymbology.values.includes(valueStr);
        }

        if (activeSymbology.type === "graduated") {
            const valNum = Number(value);
            return activeSymbology.values.some(r => valNum >= r.min && valNum <= r.max);
        }

        if (activeSymbology.type === "rule-based") {
            const context = { feature, variables: {} };
            return rulesList.some(fn => {
            const key = fn && fn.ruleKey;
            if (key && !activeSymbology.values.includes(key)) return false;
            return !!fn(context);
            });
        }

        return true;
    }
    function symbologySwitcher(layer, value, feature, rulesList) {
        if (!layer) return true;
        const allSetLyr = layer.get("allSymbology");
        const actSetLyr = layer.get("activeSymbology");
        return checkSymbologyRules(value, actSetLyr, allSetLyr, feature, rulesList);
    }

    // Function to create text style for labels
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

    // Funzione per creare un pattern a strisce
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

    // Function to style clustered features
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

    // Funzione per applicare lo stile in caso di Complex Style quindi esportazione di
    // file di stile in formato SLD
    function applySLDstyle(layer, sldContent, layerName) {       
        const sldObject = SLDReader.Reader(sldContent, { compatibilityMode: 'QGIS' });
        const sldLayer = SLDReader.getLayer(sldObject);
        const style = SLDReader.getStyle(sldLayer, layerName);
        const featureTypeStyle = style.featuretypestyles[0];
        
        document.addEventListener('DOMContentLoaded', function() {

            const viewProjection = map.getView().getProjection();

            // Funzione stile base (senza filtri custom)
            const baseStyleFunction = SLDReader.createOlStyleFunction(featureTypeStyle, {
                convertResolution: viewResolution => {
                    const viewCenter = map.getView().getCenter();
                    return ol.proj.getPointResolution(viewProjection, viewResolution, viewCenter);
                },
                imageLoadedCallback: () => {
                    layer.changed();
                },
            });
                    
            // Funzione ricorsiva per estrarre il propertyName dallo stile SLD
            function extractPropertyNameFromFilter(filter) {
                if (!filter) return null;

                // Caso semplice: confronto diretto con expression1
                if (filter.expression1 && filter.expression1.type === "propertyname") {
                    return filter.expression1.value;
                }

                // Alcuni filtri potrebbero avere direttamente propertyname
                if (filter.propertyname) {
                    return filter.propertyname;
                }

                // Caso composito: filtro con più predicati
                if (filter.predicates && Array.isArray(filter.predicates)) {
                    for (const pred of filter.predicates) {
                        const found = extractPropertyNameFromFilter(pred);
                        if (found) return found;
                    }
                }

                return null;
            }
            function getPropertyNameFromFeatureTypeStyle(featureTypeStyle) {
                if (!featureTypeStyle || !featureTypeStyle.rules) return null;

                for (const rule of featureTypeStyle.rules) {
                    const found = extractPropertyNameFromFilter(rule.filter);
                    if (found) return found;
                }
                return null;
            }

            let propertyName = getPropertyNameFromFeatureTypeStyle(featureTypeStyle);
            if (!propertyName) {
                console.warn("No PropertyName in SLD, using '' as default");
                propertyName = "";
            }

            // Controllo quali features non disegnare con simbologia spenta
            layer.setStyle(function(feature, resolution) {	
                const value = feature.get(propertyName);
                
                // escludi feature con simbologia spenta (passo exp_rules_List se definita)
                if (typeof symbologySwitcher === "function") {
                    if (!symbologySwitcher(layer, value, feature, typeof exp_rules_List !== "undefined" ? exp_rules_List : undefined)) {
                        return null;
                    }
                }

                // Se passa i controlli → applico lo stile SLD originale
                return baseStyleFunction(feature, resolution);
            });
        });
    }


// ====================
//  VECTOR TILE WORKER + SOURCE + BBOX
// ====================

    const VT_WORKER_CODE = `
    importScripts('https://www.opengis.it/a_o.gis/master/geojson-vt-master/geojson-vt.js');

    let tileIndex = null;
    let activeSymbology = null;
    let allSymbology = null;
    let filterKey = ""; 
    let checkSymbologyRules = null;

    const GRID_SIZE = 32;

    self.onmessage = function(e) {
        const msg = e.data;
        if (msg.type === 'init') {
            tileIndex = geojsonvt(msg.geojson, {
                extent: 4096,
                tolerance: msg.tolerance || 3,
                maxZoom: 24,
                indexMaxPoints: msg.indexMaxPoints || 8000,
                indexMaxZoom: 24,
                debug: 0
            });
            checkSymbologyRules = new Function('return ' + msg.checkSymbologyRulesStr)();
            filterKey = msg.filterKey || "";
            self.postMessage({ type: 'ready' });
            return;
        }

        if (msg.type === 'updateFilter') {
            activeSymbology = msg.activeSymbology;
            allSymbology = msg.allSymbology;
            return;
        }

        if (msg.type !== 'loadTile') return;

        const { z, x, y, tileCoordStr } = msg;
        const tile = tileIndex.getTile(z, x, y);

        if (!tile) {
            self.postMessage({ type: 'tileLoaded', tileCoordStr, features: [] });
            return;
        }

        const occupied = new Set();
        const out = [];

        for (const f of tile.features) {
            // === FILTRO SIMBOLOGIA (Applicato a tutti i tipi) ===
            if (filterKey && activeSymbology) {
                const val = f.tags[filterKey];
                if (!checkSymbologyRules(val, activeSymbology, allSymbology)) continue;
            }

            let type, coords;

            if (f.type === 1) { // PUNTI
                coords = f.geometry[0];
                const gx = Math.floor(coords[0] / GRID_SIZE);
                const gy = Math.floor(coords[1] / GRID_SIZE);
                const k = gx + ':' + gy;
                if (occupied.has(k)) continue;
                occupied.add(k);
                
                type = 'Point';
            } else if (f.type === 2) { // LINEE
                type = f.geometry.length === 1 ? 'LineString' : 'MultiLineString';
                coords = f.geometry.length === 1 ? f.geometry[0] : f.geometry;
            } else if (f.type === 3) { // POLIGONI
                type = f.geometry.length === 1 ? 'Polygon' : 'MultiPolygon';
                coords = f.geometry.length === 1 ? f.geometry : [f.geometry];
            }

            out.push({
                type: 'Feature',
                geometry: { type: type, coordinates: coords },
                properties: f.tags
            });
        }

        self.postMessage({ type: 'tileLoaded', tileCoordStr, features: out });
    };
    `;

    // Funzione Helper per creare il formato Tile
    function createTileFormat(extent, epsg) {
        return new ol.format.GeoJSON({
            dataProjection: new ol.proj.Projection({
                code: 'TILE_PIXELS',
                units: 'tile-pixels',
                extent: [0, 0, extent || 4096, extent || 4096],
            }),
            featureProjection: epsg
        });
    }

    function createVectorTileSourceWithWorker(layer, geojson, filterKey, epsg) {
        // A. Calcolo Tolerance e indexMaxPoints Dinamica
        let tolerance = 3;
        let jsonLength = 0;
        if (geojson && geojson.features) {
            jsonLength = geojson.features.length;
            if (jsonLength >= 50000) {
                tolerance = 3 + ((jsonLength - 50000) / 950000) * (20 - 3);
                tolerance = Math.min(20, Math.round(tolerance * 10) / 10);
            }
        }
        const indexMaxPoints = Math.min(
            8000,
            Math.max(2000, jsonLength / 10) 
        );

        console.log(`${layer.get('permalink')}: Features n°${jsonLength}, Semplification ${tolerance}, maxVertexPerTile ${indexMaxPoints}`);       

        // B. Inizializzazione Worker (Sempre)
        const blob = new Blob([VT_WORKER_CODE], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        const tileCallbacks = new Map();

        layer.set('worker', worker);

        worker.postMessage({ 
            type: 'init', 
            geojson: geojson, 
            tolerance: tolerance,
            indexMaxPoints: indexMaxPoints,
            checkSymbologyRulesStr: checkSymbologyRules.toString(), 
            filterKey: filterKey 
        });

        worker.onmessage = function(e) {
            const msg = e.data;
            if (msg.type === 'tileLoaded') {
                const callback = tileCallbacks.get(msg.tileCoordStr);
                if (callback) {
                    callback(msg.features);
                    tileCallbacks.delete(msg.tileCoordStr);
                }
            }
        };

        // C. Creazione Source
        const format = createTileFormat(4096, epsg);
        const source = new ol.source.VectorTile({
            attributions: layer.get('attributions') || '',
            tileUrlFunction: (tileCoord) => tileCoord.join('/'),
            tileLoadFunction: function(tile, url) {
                const parts = url.split('/');
                const z = +parts[0], x = +parts[1], y = +parts[2];
                const tileExtent = source.getTileGrid().getTileCoordExtent([z, x, y]);

                // Callback chiamata quando il worker ha finito
                tileCallbacks.set(url, function(rawFeatures) {
                    const features = format.readFeatures(
                        { type: 'FeatureCollection', features: rawFeatures },
                        { 
                            extent: tileExtent, 
                            featureProjection: map.getView().getProjection() 
                        }
                    );
                    features.forEach(f => f.set('layerObject', layer));
                    tile.setFeatures(features);
                });

                worker.postMessage({ type: 'loadTile', z, x, y, tileCoordStr: url });
            }
        });

        return source;
    }

    // Calcolo bbox da geometria
    function calculateBBox(geometry) {
    var coords = [];
    function collectCoords(obj) {
        if (Array.isArray(obj)) {
        if (typeof obj[0] === 'number' && obj.length >= 2) {
            coords.push(obj);
        } else {
            obj.forEach(collectCoords);
        }
        } else if (obj && typeof obj === 'object' && obj.coordinates) {
        collectCoords(obj.coordinates);
        }
    }
    collectCoords(geometry);
    if (coords.length === 0) return [Infinity, Infinity, -Infinity, -Infinity];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    coords.forEach(function(coord) {
        var x = coord[0], y = coord[1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });
    return [minX, minY, maxX, maxY];
    }