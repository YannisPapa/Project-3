let newYorkCoords = [40.73260746020104, -73.87199799779387];
let mapZoomLevel = 11;
import { restaurant_data } from './restaurant_data.js';

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
    
};

// Modify the map so that it has the streetmap, states, and cities layers
let myMap = L.map("map", {
    center: newYorkCoords,
    zoom: mapZoomLevel,
    layers: [street,restaurantsLayerGroup]
});
  
// Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
L.control.layers(baseMaps,overlayMaps,{collapsed: false}).addTo(myMap);

function getSelectedValues(id_name) {
    let select = document.getElementById(id_name);
    let selectedValues = [];
    for (let option of select.options) {
        if (option.selected) {
            selectedValues.push(option.value);
        }
    }
    return selectedValues;
}

function check(selected, toCheck){
    return toCheck.includes(String(selected));
}

// Function to update markers
function updateMarkersNew() {
    // make sure we update points based on choices
    let selected_category = getSelectedValues('category');
    let selected_rating = getSelectedValues('rating');
    let selected_price = getSelectedValues('price');
    let selected_type = getSelectedValues('type');
    console.log(selected_category,selected_rating,selected_price,selected_type);

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

        let current_category = restaurantLayers[i]._layers[(i*2)+1].feature.properties.categories;
        let current_rating = restaurantLayers[i]._layers[(i*2)+1].feature.properties.rating;
        let current_price = restaurantLayers[i]._layers[(i*2)+1].feature.properties.price;
        let current_type = restaurantLayers[i]._layers[(i*2)+1].feature.properties.transactions;

        // If drop downs are set to any then they match everything
        if (String(selected_category[0]) == 'any' || selected_category[0] == null || selected_category[0] == '???') {
            match_cat = true;
        } else {
            match_cat = selected_category.some(selected => check(selected, current_category));
        }
        if (String(selected_rating[0]) == 'any' || selected_rating[0] == null || selected_rating[0] == '???') {
            match_rating = true;
        } else {
            if (current_rating != "N/A" && current_rating >= selected_rating && current_rating < selected_rating+1){
                match_rating = true;
            }
        }
        if (String(selected_price[0]) == 'any' || selected_price[0] == null || selected_price[0] == '???') {
            match_price = true;
        } else {
            match_price = selected_price.some(selected => check(selected, current_price));
        }
        if (String(selected_type[0]) == 'any' || selected_type[0] == null || selected_type[0] == '???') {
            match_type = true;
        } else {
            match_type = selected_type.some(selected => check(selected, current_type));
        }

        // If all condions are met add it to the list of markers
        if (match_cat && match_rating && match_price && match_type){
            currentMarkers.push(restaurantLayers[i]);
            res_found++;
        }
        if (res_found == 100 || i == restaurantLayers.length-1){
            last_end_point.push(i+1);
            break;
        }
    }
    restaurantsLayerGroup = L.layerGroup(currentMarkers);
    restaurantsLayerGroup.addTo(myMap);
}

// Using select2's select event
['category', 'rating', 'price', 'type'].forEach(id => {
    $('#' + id).on('select2:select', function(e) {
        let selectedOption = e.params.data;
        
        // Logic to deselect "Any" if another option is selected
        let selectedValues = $(this).val();
        if (String(selectedOption.id) == 'any') {
            // Deselect all other options if "Any" is selected
            $(this).val(['any']).trigger('change');
        } else {
            // Remove "Any" if another option is selected
            let index = selectedValues.indexOf('any');
            if (index !== -1) {
                selectedValues.splice(index, 1);
                $(this).val(selectedValues).trigger('change');
            }
        }

        last_end_point = [0];
        updateMarkersNew();
    });
});

// Event listeners for the next batch navigation buttons
document.getElementById('nextBatch').addEventListener('click', function() {
    if (last_end_point[last_end_point.length-1] < restaurantLayers.length){
        updateMarkersNew();
    }
});
// Event listeners for the previous batch navigation buttons
document.getElementById('prevBatch').addEventListener('click', function() {
    if (last_end_point.length > 2){
        last_end_point.pop();
        last_end_point.pop();
        updateMarkersNew();
    }
});

// Initially load the first batch of markers
updateMarkersNew();