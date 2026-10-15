//Yarmouk_Camp
const map = L.map('map' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.47402738811207, 36.303355743493796], 15); //make map and zoom

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);  //add basemap

var Esri =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map); 
 

var color_Water_pipes = {
  layers: {
    "W-Font-200": { diameter: "200mm", color: "#D95F02", width: 2, type: "line" },
    "W-Font-250": { diameter: "250mm", color: "#7570B3", width: 2.5, type: "line" },
    "W-Font-300": { diameter: "300mm", color: "#1B9E77", width: 3, type: "line" },
    "W-Font-400": { diameter: "400mm", color: "#E7298A", width: 4, type: "line" },
    "W-Font-500": { diameter: "500mm", color: "#66A61E", width: 5, type: "line" },
    "W-Font-600": { diameter: "600mm", color: "#E6AB02", width: 6, type: "line" },
    "SOUTH_EAST_SECTOR": { diameter: "Sector Boundary", color: "#386CB0", width: 1.5, type: "line", dashArray: "5, 5" },
    "concept_design": { diameter: "Proposed/Concept", color: "#A6761D", width: 2, type: "line", dashArray: "2, 2" }
  },
  valves: {
    "Valve200": { color: "#D95F02", radius: 4 },
    "Valve250": { color: "#7570B3", radius: 4 },
    "Valve300": { color: "#1B9E77", radius: 4 },
    "Valve400": { color: "#E7298A", radius: 5 },
    "Valve500": { color: "#66A61E", radius: 5 },
    "Valve600": { color: "#E6AB02", radius: 6 }
  },
  getStyle: function(feature) {
    const layer = feature.properties && feature.properties.Layer ? feature.properties.Layer : "";
    for (const key in this.layers) {
      if (layer.includes(key)) {
        return this.layers[key];
      }
    }
    return { color: "#999999", width: 1, type: "line" };
  }
};


var waterLayer = L.geoJSON(Water_pipes, {
  style: function(feature) {
    const styleConfig = color_Water_pipes.getStyle(feature);
    return {
      color: styleConfig.color,
      weight: styleConfig.width,
      dashArray: styleConfig.dashArray || null,
      opacity: 0.9
    };
  },
  
 
  pointToLayer: function(feature, latlng) {
    const layerName = feature.properties.Layer;
    const valveConfig = color_Water_pipes.valves[layerName] || { color: "#333", radius: 4 };
    return L.circleMarker(latlng, {
      radius: valveConfig.radius,
      fillColor: valveConfig.color,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  },


  onEachFeature: function(feature, layer) {
    const props = feature.properties || {};
    const layerName = props.Layer || props.layer || "غير محدد";
    
  
    const styleConfig = color_Water_pipes.getStyle(feature);
    const diameter = styleConfig.diameter || props.Diameter || "غير متوفر";

  
    layer.bindPopup(
        '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
        '<b>نوع الطبقة / المكون: </b>' + layerName + '<br>' +
        '<b>القطر / القياس: </b>' + diameter + 
        '</div>'
    );

   
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
        layer.on({
            mouseover: function(e) {
                var l = e.target;
                l.setStyle({
                    color: '#ffc107', 
                    weight: (styleConfig.width || 3) + 3 
                });
                l.bringToFront();
            },
            mouseout: function(e) {
                waterLayer.resetStyle(e.target);
            }
        });
    } else if (feature.geometry.type === 'Point') {
        layer.on({
            mouseover: function(e) {
                e.target.setRadius(7); 
            },
            mouseout: function(e) {
                const lName = feature.properties.Layer;
                const valveConfig = color_Water_pipes.valves[lName] || { radius: 4 };
                e.target.setRadius(valveConfig.radius);
            }
        });
    }
  }
}).addTo(map);

var buildingStyle = {
    color: '#1a252f',       
    weight: 1.2,            
    opacity: 0.85,          
    fillColor: '#3498db',   
    fillOpacity: 0.65      
}; 
var hoverStyle = {
    color: '#2c3e50',      
    weight: 2.5,            
    opacity: 1,
    fillColor: '#f1c40f',   
    fillOpacity: 0.95      
}; 

var buildingsLayer = L.geoJSON(biuldings_2026, {
    style: buildingStyle,
    onEachFeature: function (feature, layer) {
        layer.on({
            mouseover: function (e) {
                var l = e.target;
                l.setStyle(hoverStyle); 
                l.bringToFront();
            }, 
            mouseout: function (e) {
                buildingsLayer.resetStyle(e.target); 
            }
        });
    }
}).addTo(map);

// add layers control
var baseMaps = {
	'osm': osm ,   
	"Esri" : Esri , 
};   
var overlayMap = {
 'أبنية مخيم اليرموك': buildingsLayer,  
 'شبكة مياه الشرب لمنطقة مخيم اليرموك':waterLayer
}; 



L.control.layers(baseMaps ,overlayMap ).addTo(map);   
//legend:
var legend_y  = L.control({ position: 'bottomright' });

legend_y.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح المخطط</b>' +
        
      
        '<div style="margin-bottom: 3px;"><i style="background: #D95F02; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i> مواسير 200 مم</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #1B9E77; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i> مواسير 300 مم</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #E7298A; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i> مواسير 400 مم</div>' +
        
       
        '<div style="margin-bottom: 3px;"><i style="background: #386CB0; width: 16px; height: 2px; border-top: 2px dashed #386CB0; display: inline-block; vertical-align: middle; margin-left: 6px;"></i> حدود القطاع</div>' +
        
        
        '<div style="margin-bottom: 3px;"><span style="background: #3498db; border: 1px solid #1a252f; width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-left: 6px; opacity: 0.85;"></span> أبنية المخيم</div>' +

        '<div><span style="background: #D95F02; border: 1px solid #000; width: 10px; height: 10px; border-radius: 50%; display: inline-block; vertical-align: middle; margin-left: 8px;"></span> محابس شبكة المياه</div>';

    return div;
};

legend_y.addTo(map);

// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map);



//exhibition_map: 
 const map2 = L.map('map2', {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.428209716818145, 36.39273176297629], 7);
var osm2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map2);  //add basemap  


// دالة إرجاع اللون النصي بناءً على الاسم
function getFeatureColor(name) {
    switch (name) {
        case 'مبنى': return '#6c757d';
        case 'حديقة': return '#5cb85c';
        case 'ساحة': return '#f4e8c1';
        case 'موقف سيارات': return '#337ab7';
        case 'بوابة داخلية': return '#f0ad4e';
        case 'بوابة خارجية': return '#d9534f';
        case 'نافورة': return '#3498db';
        default: return '#777777';
    }
}; 

// دالة لتطبيق الأنماط على المعالم وإضافة الـ Labels
var exhibition_layer = L.geoJSON(exhibition, {
    style: function(feature) {
        // استخراج اسم المعلم من خصائص الـ feature وتمريره لدالة الألوان
        var featureName = feature && feature.properties ? feature.properties.NAME : '';
        var fillColorVal = getFeatureColor(featureName);
        
        return {
            fillColor: fillColorVal,
            color: '#ffffff',      // لون حدود المضلع
            weight: 1.5,
            fillOpacity: 0.75
        };
    },
    onEachFeature: function(feature, layer) {
        if (feature.properties) {
            var featureName = feature.properties.NAME || 'عنصر';
            var featureNumber = feature.properties.NUMBER;

            layer.bindPopup(
                "<b>الاسم:</b> " + featureName + "<br>" +
                "<b>الرقم/الرمز:</b> " + (featureNumber || 'لا يوجد')
            );
  
            if (featureNumber) {
                var center = layer.getBounds().getCenter();
                
                var textIcon = L.divIcon({
                    className: 'map-text-label',
                    html: '<div style="background: transparent; padding: 2px 5px; font-size: 11px; font-weight: bold; color: #333; text-align: center; white-space: nowrap;">' + featureNumber + '</div>',
                    iconSize: [40, 20],
                    iconOffset: [-20, -10] 
                });

                L.marker(center, { icon: textIcon }).addTo(map2);
            }
        }
    }
}).addTo(map2);


function getRoadStyle(feature) {
    var directionVal = feature && feature.properties ? String(feature.properties.الاتجاه) : '';
    
    switch (directionVal) {
        case '3': 
            return { color: '#00050a', weight: 4, dashArray: '5, 5', opacity: 0.9 }; 
        case '1': 
            return { color: '#000000', weight: 2.5, opacity: 0.8 }; 
        case '2': 
            return { color: '#847968', weight: 5, opacity: 0.85 }; 
        default: 
            return { color: '#95a5a6', weight: 2, opacity: 0.5 };
    }
}

var rode_exhibition = L.geoJSON(rode_exhibition, {
    style: getRoadStyle,
    onEachFeature: function(feature, layer) {
        if (feature.properties) {
            var dirText = '';
            var val = String(feature.properties.الاتجاه);
            if (val === '3') dirText = 'سور مدينة المعارض';
            else if (val === '1') dirText = 'طريق باتجاه واحد';
            else if (val === '2') dirText = 'طريق باتجاهين';

            layer.bindPopup(
                "<b>التصنيف:</b> " + dirText + "<br>" 
            );
        }
    }
}).addTo(map2);

map2.fitBounds(rode_exhibition.getBounds());   



var Esri2 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map2);   


var baseMaps2 = {   
    "osm" :osm2, 
    "Esri" : Esri2 ,  
};   
var overlayMap2= {
'أبنية مدينة المعارض': exhibition_layer,  
'طريق': rode_exhibition ,  
}; 

L.control.layers(baseMaps2,overlayMap2 ).addTo(map2);  

// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map2); 

var legend_map2  = L.control({ position: 'bottomright' });

legend_map2.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '50px 25px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح المخطط</b>' +
        
      
        '<div style="margin-bottom: 3px;"><i style="background: #6c757d; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مبنى</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #5cb85c; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>حديقة</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #f4e8c1; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>ساحة</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #337ab7; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>موقف سيارات</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #f0ad4e; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>بوابة داخلية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #d9534f; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>بوابة خارجية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #3498db; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i> نافورة</div>' +       
        '<div style="margin-bottom: 3px;"><i style="background: #000000; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>طريق باتجاه واحد</div>'+
        '<div style="margin-bottom: 5px;"><i style="background: #847968; width: 18px; height: 7px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>طريق باتجاهين</div>'+ 
        '<div style="margin-bottom: 3px;"><i style="background: transparent; width: 16px; height: 0; border-top: 2px dashed #000000; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>سور مدينة المعارض</div>'; 


       

    return div;
};

legend_map2.addTo(map2);

//old_dama: 
const map3 = L.map('map3', {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.5103496028372, 36.30976087121949], 10);

var osm3 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map3);  //add basemap   


var Esri3 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map3);   


var color_rode = {
  routes: {
    "مسار شامل": { color: "#e41a1c", width: 3, opacity: 0.9 },
    "مسار قصير": { color: "#377eb8", width: 3, opacity: 0.9 },
    "مسار الحرف التقليدية": { color: "#4daf4a", width: 3.5, opacity: 0.9 },
    "مسار الأسواق التقليدية": { color: "#984ea3", width: 3.5, opacity: 0.9 },
    "سور دمشق القديمة": { color: "#000000", width: 4, dashArray: "6, 4", opacity: 0.9 } 
  },
  

  getStyle: function(feature) {
    const props = feature.properties || {};
    const routeName = props.name || "";
    
    if (this.routes[routeName]) {
      return this.routes[routeName];
    }
    return { color: "#999999", width: 2, opacity: 0.7 };
  }
};





var markersCluster = L.markerClusterGroup({
   
    maxClusterRadius: 50, 
    spiderfyOnMaxZoom: true, 
    showCoverageOnHover: false 
}); 


var my_icon = L.icon({
	iconUrl: './image/building-columns-solid-full.svg', 
	iconSize:[50 , 50] , 
    popupAnchor: [0, -40] , 
    className: 'my-custom-marker',     
}) ; 


var old_dama = L.geoJSON(old_dama , {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: my_icon });
    },

    onEachFeature: function(feature , layer){
        if (feature.properties && feature.properties.name){
            layer.bindPopup(
                '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
                '<b>اسم المعلم الأثري: </b>' + feature.properties.name + 
                '</div>'
            ); 
        }
    }

}); 


markersCluster.addLayer(old_dama);

map3.addLayer(markersCluster);  

map3.fitBounds(old_dama.getBounds()); 


var rode = L.geoJSON(rode, {
  style: function(feature) {
    return color_rode.getStyle(feature);
  },
  
  onEachFeature: function(feature, layer) {
    const props = feature.properties || {};
    const routeName = props.name || "مسار غير محدد";
    const shapeLength = props.Shape_Length ? (props.Shape_Length / 1000).toFixed(2) + " كم" : "غير متوفر";


    layer.bindPopup(
        '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
        '<b>اسم المسار: </b>' + routeName + '<br>' +
        '<b>الطول الإجمالي: </b>' + shapeLength + 
        '</div>'
    );


    layer.on({
        mouseover: function(e) {
            var l = e.target;
            l.setStyle({
                color: '#ffff33',
                weight: 6 
            });
            l.bringToFront();
        },
        mouseout: function(e) {
            rode.resetStyle(e.target);
        }
    });
  }
}).addTo(map3); 



var old_dama_color = { 
    "مأذنة الشحم": { color: "#e41a1c", fillColor: "#fb9a99", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "شاغور جواني": { color: "#377eb8", fillColor: "#a6cee3", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "الأمين": { color: "#4daf4a", fillColor: "#b2df8a", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "الحريقة": { color: "#984ea3", fillColor: "#cab2d6", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "القيمرية": { color: "#ff7f00", fillColor: "#fdbf6f", fillOpacity: 0.5, width: 2, opacity: 0.9 }, 
    "باب توma": { color: "#e7298a", fillColor: "#f768a1", fillOpacity: 0.5, width: 2, opacity: 0.9 }, 
    "الجورة": { color: "#a65628", fillColor: "#ffff99", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "العمارة الجوانية": { color: "#f781bf", fillColor: "#b3cde3", fillOpacity: 0.5, width: 2, opacity: 0.9 },
    "العمارة البرانية": { color: "#999999", fillColor: "#cccccc", fillOpacity: 0.5, width: 2, opacity: 0.9 }, 
    "الحميدية": { color: "#1b9e77", fillColor: "#66c2a5", fillOpacity: 0.5, width: 2, opacity: 0.9 },

    getStyle: function(feature) {
        const props = feature.properties || {};
        const old_dama_name = props.NAME_AR || "";
        
        if (this[old_dama_name]) {
            return this[old_dama_name];
        }
        return { color: "#2b8cbe", fillColor: "#6baed6", fillOpacity: 0.4, width: 2, opacity: 0.7 };
    }
}; 

var old_dama_a = L.geoJSON(old_dama_a, {
    style: function(feature) {
        return old_dama_color.getStyle(feature);
    },
    
    onEachFeature: function(feature, layer) {
        const props = feature.properties || {};
        const areaName = props.NAME_AR || "منطقة غير محددة";

        layer.bindPopup(
            '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
            '<b>اسم المنطقة: </b>' + areaName + 
            '</div>'
        );


        layer.on({
            mouseover: function(e) {
                var l = e.target;
                l.setStyle({
                    color: '#ffff33', 
                    weight: 4,
                    fillOpacity: 0.8 
                });
                l.bringToFront();
            },
            mouseout: function(e) {
                old_dama_a.resetStyle(e.target);
            }
        });
    }    
}).addTo(map3);

var legend_old_dama = L.control({ position: 'bottomright' });

legend_old_dama.onAdd = function (map3) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح الخريطة</b>' +
        
      

        '<div style="margin-bottom: 3px;"><i styl width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مسارات سياحية</div>'+
        '<div style="margin-bottom: 3px;"><i style="background: #e41a1c; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مسار شامل</div>'+
        '<div style="margin-bottom: 3px;"><i style="background: #377eb8; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مسار قصير</div>'+
        '<div style="margin-bottom: 3px;"><i style="background: #4daf4a; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مسار الحرف التقليدية</div>'+
        '<div style="margin-bottom: 3px;"><i style="background: #984ea3; width: 16px; height: 4px; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>مسار الأسواق التقليدية</div>'+ 
        '<div style="margin-bottom: 3px;"><i style="background: transparent; width: 16px; height: 0; border-top: 2px dashed #000000; display: inline-block; vertical-align: middle; margin-left: 6px;"></i>سور دمشق القديمة</div>'; 
    return div;
};

legend_old_dama.addTo(map3);




var baseMaps3 = {
	'osm': osm3 ,   
	"Esri" : Esri3 , 
};   
var overlayMap3= {
'المعالم الأثرية لدمشق القديمة':markersCluster , 
'المسارات السياحية في دمشق القديمة': rode,  
'أحياء دمشق القديمة ': old_dama_a 
}; 


L.control.layers(baseMaps3,overlayMap3 ).addTo(map3) 

// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map3);

//school_dama:
var markersCluster_shcool = L.markerClusterGroup({
   
    maxClusterRadius: 50, 
    spiderfyOnMaxZoom: true, 
    showCoverageOnHover: false 
}); 


var icon_shcool = L.icon({
	iconUrl: 'image/PngItem_4026288.png', 
	iconSize:[50 , 50] , 
    popupAnchor: [0, -40] , 
    className: 'icon_school',     
}) ; 


const map4 = L.map('map4' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.5140327178866, 36.27199135272795], 12); //make map and zoom 

var osm4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map4);  //add basemap   

var Esri4 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map4);


var shcool_dama_data  = L.geoJSON(shcool_dama , {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: icon_shcool });
    },

    onEachFeature: function(feature , layer){
        if (feature.properties && feature.properties.name){
            layer.bindPopup(
                '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
                '<b>اسم المدرسة: </b>' + feature.properties.name + 
                '</div>'
            ); 
        }
    }

}); 


markersCluster_shcool.addLayer(shcool_dama_data );

map4.addLayer(markersCluster_shcool);  

map4.fitBounds(markersCluster_shcool.getBounds());  


var baseMaps4 = {   
	"osm" : osm4 , 
    "Esri":Esri4 , 
};   
var overlayMap4= {
'المدارس':markersCluster_shcool,    
};  
var legend_school = L.control({ position: 'bottomright' });

legend_school.onAdd = function (map4) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح الخريطة</b>' +
        
      
        '<div style="margin-bottom: 2px;"><img src="image/PngItem_4026288.png" width="30" height="30" style="vertical-align: middle; margin-left: 6px;"> مدرسة</div>'; 

    return div;
};

legend_school.addTo(map4);


L.control.layers(baseMaps4 , overlayMap4).addTo(map4); 
// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map4);


//land_cover : 
const map5 = L.map('map5' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.5140327178866, 36.27199135272795], 12); //make map and zoom 

var osm5 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map5);  //add basemap   


var Esri5 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map5);  

var damastyle = {
    color: '#1a252f',       
    weight: 2,            
    opacity: 1,          
    fillColor: '#3498db',   
    fillOpacity: 0 , 
        
}; 
var hoverstyle_dama = {
    color: '#fcfcfc00',      
    weight: 2.5,            
    opacity: 1,
    fillColor: '#f1c40f',   
    fillOpacity: 0.95      
}; 


var neighborhoods_of_damascus_layer = L.geoJSON(neighborhoods_of_damascus, {
    style: damastyle,
    onEachFeature: function (feature, layer) {
        const props = feature.properties || {};
        const areaName = props.NAME_AR || "منطقة غير محددة";
        layer.bindPopup(
            '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
            '<b>اسم الحي: </b>' + areaName + 
            '</div>'
        );
        layer.on({
            mouseover: function (e) {
                var k = e.target;
                k.setStyle(hoverstyle_dama); 
                k.bringToFront();
            }, 
            mouseout: function (e) {
                neighborhoods_of_damascus_layer.resetStyle(e.target); 
            }
        });
    }
}).addTo(map5);

const lulc = L.esri.imageMapLayer({
    url: 'https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer',
    opacity: 0.7,
    attribution: 'Esri, Impact Observatory, Microsoft'
}).addTo(map5);

lulc.setMosaicRule({
    method: 'esriMosaicAttribute',
    where: 'Year = 2024'   // check the service for the exact field name/years
});

var baseMaps5 = {   
	"osm" : osm5 , 
    "Esri":Esri5 ,   
};    

var overlayMap5= {
    'الغطاء الأرضي': lulc,    
    'أحياء دمشق' : neighborhoods_of_damascus_layer ,
};  

L.control.layers(baseMaps5,overlayMap5).addTo(map5); 

//legend:

var legend_map5 = L.control({ position: 'bottomright' });

legend_map5.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح الخريطة</b>' +
        
      
        '<div style="margin-bottom: 3px;"><i style="background: #419BDF; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i> مسطحات مائية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #397d49; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>غطاء نباتي</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #e49635; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>محاصيل زراعية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #c4281b; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>المباني الحضرية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #a59b8f; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>أراضي جرداء</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #e3e2c3; width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>مراعي</div>' ; 
        

    return div;
};

legend_map5.addTo(map5);



// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map5);

//garden_map: 
const map6 = L.map('map6' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.5140327178866, 36.27199135272795], 12); //make map and zoom  

var osm6 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map6);  //add basemap   


var Esri6 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map6);


var markersCluster_grden = L.markerClusterGroup({
   
    maxClusterRadius: 50, 
    spiderfyOnMaxZoom: true, 
    showCoverageOnHover: false 
}); 




var icon_grden = L.icon({
	iconUrl: 'image/PngItem_3255789.png', 
	iconSize:[50 , 50] , 
    popupAnchor: [0, -40] , 
    className: 'garden_icon',     
}) ; 



var grden_dama = L.geoJSON(grden_dama , {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: icon_grden });
    },

    onEachFeature: function(feature , layer){
        if (feature.properties && feature.properties.name){
            layer.bindPopup(
                '<div style="text-align: right; font-family: sans-serif; direction: rtl;">' +
                '<b>اسم الحديقة: </b>' + feature.properties.name + 
                '</div>'
            ); 
        }
    }

});  

markersCluster_grden.addLayer(grden_dama);
map6.addLayer(markersCluster_grden);  
map6.fitBounds(markersCluster_grden.getBounds());  

var baseMaps6 = {   
	"osm" : osm6 , 
    "Esri":Esri6, 
};   
var overlayMap6= {
'الحدائق':markersCluster_grden,    
};   


var legend_garden = L.control({ position: 'bottomright' });

legend_garden.onAdd = function (map3) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح الخريطة</b>' +
        
      
        '<div style="margin-bottom: 2px;"><img src="./image/PngItem_3255789.png" class= "garden_icon"  width="30" height="30" style="vertical-align: middle; margin-left: 6px;"> حديقة</div>'; 

    return div;
};

legend_garden.addTo(map6);


L.control.layers(baseMaps6 , overlayMap6).addTo(map6); 
// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map6); 

map6.fitBounds(grden_dama.getBounds()); 


//Electrical_cables
const map7 = L.map('map7' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.42620076133476, 36.32168760658307], 15); //make map and zoom  

var osm7 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map7);  //add basemap   

var Esri7 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map7); 

// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map7); 


// map7.fitBounds(.getBounds()); 

//Douma: 
const map8 = L.map('map8' , {
    fullscreenControl: true, 
    fullscreenControlOptions: {
        position: 'topleft', 
        title: 'عرض ملء الشاشة',
        titleCancel: 'خروج من ملء الشاشة'
    }
}).setView([33.56853011336747, 36.407395598866295], 15); //make map and zoom  

var osm8 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map8);  //add basemap   


var Esri8 =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map8); 

// location button
L.control.locate({
    position: 'topleft', 
    strings: {
        title: "عرض موقعي الحالي"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map8);


var icon_steetlamp = L.icon({
    iconUrl: './image/lamppost.png', 
    iconSize: [35, 35],              
    popupAnchor: [0, -20],           
    // className: 'custom-point-icon'    
}); 



var streetlamp_layer =L.geoJSON(streetlamp ,{ 
  pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: icon_steetlamp });
    
}}).addTo(map8);  




var building_color = {
    color: '#a3967d',       
    weight: 1.2,            
    opacity: 0.85,          
    fillColor: '#d4c5a9',   
    fillOpacity: 1      
};  



var street1_color = {
    color: '#95a5a6',       
    weight: 1.2,            
    opacity: 0.85,          
    fillColor: '#808080',   
    fillOpacity: 0.65 
}; 

var building_layer = L.geoJSON(pologon, {
    style: building_color,
    onEachFeature: function (feature, layer) {
        layer.on({
            mouseover: function (e) {
                var l = e.target;
                l.setStyle(hoverStyle); 
                l.bringToFront();
            }, 
            mouseout: function (e) {
                building_layer.resetStyle(e.target); 
            }
        });
    }
}).addTo(map8); 

var street1_layer =L.geoJSON(street1, {
    style: street1_color,
}).addTo(map8); 
 
var baseMaps8 = {   
	"osm" : osm8 , 
    "Esri":Esri8, 
};   
var overlayMap8= {
'طريق':street1_layer, 
'أبنية':building_layer, 
'أعمدة إنارة':streetlamp_layer,     
};   

L.control.layers(baseMaps8 , overlayMap8).addTo(map8); 

var legend_Douma = L.control({ position: 'bottomright' });

legend_Douma.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    

    div.style.backgroundColor = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.direction = 'rtl';
    div.style.textAlign = 'right';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '13px';
    div.style.lineHeight = '24px';
    div.style.color = '#333';

    div.innerHTML = '<b style="font-size: 14px; border-bottom: 2px solid #ddd; display: block; margin-bottom: 5px; padding-bottom: 3px;">مفتاح الخريطة</b>' +

        '<div style="margin-bottoms : 2px;"><img src="./image/lamppost.png " class= "garden_icon"  width="30" height="30" style="vertical-align: middle; margin-left: 12px;"> أعمدة إنارة</div>'+ 
                '<div style="margin-bottom: 3px;"><i style="background: #d4c5a9; width: 30px; height: 30px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>أبنية</div>' +
        '<div style="margin-bottom: 3px;"><i style="background: #808080; width: 30px; height: 30px; display: inline-block; vertical-align: middle; margin-left: 12px;"></i>طرق</div>' ; 

    return div;
};

legend_Douma.addTo(map8);
map8.fitBounds(street1_layer.getBounds());      