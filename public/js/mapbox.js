/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);


mapboxgl.accessToken = 'pk.eyJ1IjoibWFuemV6aG91IiwiYSI6ImNsam5sMTg4bjFhYm0zZHFuZW5tZnF6emYifQ.nCItHTy7qMQr2hfkp6NyZw';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/manzezhou/cljnldjqa00ng01pg8zo5g73c', // style URL
    scrollZoom: false,
    // center: [-74.5, 40], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();


locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div')
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map);

    // Add popup
    new mapboxgl
        .Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
        .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds,{
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
});
