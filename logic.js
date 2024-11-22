let newYorkCoords = [40.73260746020104, -73.87199799779387];
let mapZoomLevel = 11;
import { restaurant_data } from '../data/restaurant_data.js';

function createGeoJSONFromRestaurant(restaurant) {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [restaurant.Longitude, restaurant.Latitude] // GeoJSON uses [longitude, latitude]
        },
        properties: {
            name: restaurant.Name,
            rating: restaurant.Rating,
            restaurant_id: restaurant.Restaurant_id,
            review_count: restaurant.Review_Count,
            price: restaurant.Price,
            phone_pumber: restaurant.Phone_Number,
            latitude: restaurant.Latitude,
            longitude: restaurant.Longitude,
            categories: restaurant.Categories,
            transactions: restaurant.Transactions
        }
    };
}

function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.name}</h3><hr>
                    <p><b>Phone Number:</b> ${feature.properties.phone_pumber}</p>
                    <p><b>Rating:</b> ${feature.properties.rating} (${feature.properties.review_count} reviews)</p>
                    <p><b>Price Point:</b> ${feature.properties.price}</p>
                    <p><b>Categories:</b> ${feature.properties.categories}</p>
                    <p><b>Transaction Types:</b> ${feature.properties.transactions}</p>`);
}
let resMarkers = []
// Loop through restaurant data and create markers
// change 10 later
for (let i = 0; i < 100; i++) {
    // Convert each restaurant into GeoJSON format
    var restaurantGeoJSON = createGeoJSONFromRestaurant(restaurant_data[i]);

    resMarkers.push(
        L.geoJSON(restaurantGeoJSON, {
            onEachFeature: onEachFeature
        })
    );
}

let restaurantsLayerGroup = L.layerGroup(resMarkers);

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

var overlayMaps = {
    restaurants: restaurantsLayerGroup
};

// Modify the map so that it has the streetmap, states, and cities layers
let myMap = L.map("map", {
    center: newYorkCoords,
    zoom: mapZoomLevel,
    layers: [street]
});
  
// Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
L.control.layers(baseMaps,overlayMaps,{collapsed: false}).addTo(myMap);