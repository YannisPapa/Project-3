let newYorkCoords = [40.73260746020104, -73.87199799779387];
let mapZoomLevel = 11;
import { restaurant_data } from '../data/restaurant_data.js';

let last_end_point = [0];

function createGeoJSONFromRestaurant(restaurant) {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [restaurant.Longitude, restaurant.Latitude]
        },
        properties: {
            name: restaurant.Name || "N/A",
            rating: restaurant.Rating || "N/A",
            restaurant_id: restaurant.Restaurant_id || "N/A",
            review_count: restaurant.Review_Count || "N/A",
            price: restaurant.Price || "N/A",
            phone_number: restaurant.Phone_Number || "N/A",
            latitude: restaurant.Latitude || "N/A",
            longitude: restaurant.Longitude || "N/A",
            categories: restaurant.Categories || "N/A",
            transactions: restaurant.Transactions || "N/A"
        }
    };
}

function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.name}</h3><hr>
                    <p><b>Phone Number:</b> ${feature.properties.phone_number}</p>
                    <p><b>Rating:</b> ${feature.properties.rating} (${feature.properties.review_count} reviews)</p>
                    <p><b>Price Point:</b> ${feature.properties.price}</p>
                    <p><b>Categories:</b> ${feature.properties.categories}</p>
                    <p><b>Transaction Types:</b> ${feature.properties.transactions}</p>`);
}

let restaurantLayers = [];
// Loop through restaurant data and create markers
for (let i = 0; i < restaurant_data.length; i++) {
    // Convert each restaurant into GeoJSON format
    var restaurantGeoJSON = createGeoJSONFromRestaurant(restaurant_data[i]);
    let restaurantMarker = L.geoJSON(restaurantGeoJSON, {
        onEachFeature: onEachFeature
    });
    restaurantLayers.push(restaurantMarker);
}

console.log(`Total restaurants processed: ${restaurantLayers.length}`);

let currentMarkers = [];
let restaurantsLayerGroup = L.layerGroup(currentMarkers);

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
    layers: [street,restaurantsLayerGroup]
});
  
// Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
L.control.layers(baseMaps,overlayMaps,{collapsed: false}).addTo(myMap);

// Function to update markers
function updateMarkers() {
    // make sure we update points based on choices
    let u_category = document.getElementById('category').value;
    let u_rating = document.getElementById('rating').value;
    let u_price = document.getElementById('price').value;
    let u_type = document.getElementById('type').value;

    // Clear the current markers
    restaurantsLayerGroup.clearLayers();
    currentMarkers = [];

    let res_found = 0; // keep track of number of restaurants found

    // Add the markers for the current batch
    for (let i = last_end_point[last_end_point.length-1]; i < restaurantLayers.length; i++) {
        let match_cat = false;
        let match_rating = false;
        let match_price = false;
        let match_type = false;

        let cur_cat = restaurantLayers[i]._layers[(i*2)+1].feature.properties.categories;
        let cur_rating = restaurantLayers[i]._layers[(i*2)+1].feature.properties.rating;
        let cur_price = restaurantLayers[i]._layers[(i*2)+1].feature.properties.price;
        let cur_type = restaurantLayers[i]._layers[(i*2)+1].feature.properties.transactions;

        // If drop downs are set to any then they match everything
        if (u_category == 'any-cat') {
            match_cat = true;
        }
        if (u_rating == 'any-star') {
            match_rating = true;
        }
        if (u_price == 'any-price') {
            match_price = true;
        }
        if (u_type == 'any-type') {
            match_type = true;
        }

        // Check if current point being looked at matches search conditions
        if (cur_cat.includes(u_category)){
            match_cat = true;
        }
        if (cur_rating >= u_rating){
            match_rating = true;
        }
        if (cur_price == u_price){
            match_price = true;
        }
        if (cur_type.includes(u_type)){
            match_type = true;
        }

        // If all condions are met add it to the list of markers
        if (match_cat && match_rating && match_price && match_type){
            currentMarkers.push(restaurantLayers[i]);
            res_found++;
        }
        if (res_found == 100 || i == restaurantLayers.length-1){
            last_end_point.push(i+1);
            console.log(`Restaurants Found: ${res_found}`, last_end_point)
            break;
        }
    }
    restaurantsLayerGroup = L.layerGroup(currentMarkers);
    restaurantsLayerGroup.addTo(myMap);
}

// Add an event listener to the category dropdown menu to detect changes
document.getElementById('category').addEventListener('change', function() {
    last_end_point = [0];
    updateMarkers();
});
// Add an event listener to the rating dropdown menu to detect changes
document.getElementById('rating').addEventListener('change', function() {
    last_end_point = [0];
    updateMarkers();
});
// Add an event listener to the price dropdown menu to detect changes
document.getElementById('price').addEventListener('change', function() {
    last_end_point = [0];
    updateMarkers();
});
// Add an event listener to the type dropdown menu to detect changes
document.getElementById('type').addEventListener('change', function() {
    last_end_point = [0];
    updateMarkers();
});

// Event listeners for the next batch navigation buttons
document.getElementById('nextBatch').addEventListener('click', function() {
    if (last_end_point[last_end_point.length-1] < restaurantLayers.length){
        console.log('100 more',last_end_point)
        updateMarkers();
    }
});
// Event listeners for the previous batch navigation buttons
document.getElementById('prevBatch').addEventListener('click', function() {
    if (last_end_point.length > 2){
        last_end_point.pop();
        last_end_point.pop();
        console.log(`100 less`,last_end_point)
        updateMarkers();
    }
});

// Initially load the first batch of markers
updateMarkers();