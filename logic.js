let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let baseMaps = {
    Street: street,
    Topography: topo
};

// Modify the map so that it has the streetmap, states, and cities layers
let myMap = L.map("map", {
    center: newYorkCoords,
    zoom: mapZoomLevel,
    layers: [street]
});
  
// Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
L.control.layers(baseMaps).addTo(myMap);