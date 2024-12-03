const form = document.getElementById('locationForm');
const mapDiv = document.getElementById('map');

let map, marker, driverName, driverNumber, loadNumber;

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(mapDiv, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  driverName = document.getElementById('driverName').value;
  driverNumber = document.getElementById('driverNumber').value;
  loadNumber = document.getElementById('loadNumber').value;

  if (!driverName || !driverNumber || !loadNumber) {
    alert('Please fill out all fields.');
    return;
  }

  alert(`Tracking started for ${driverName} (Load: ${loadNumber})`);
  startTracking();
});

function startTracking() {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Update the map and add marker
        updateMap(location);
        sendLocationToBackend(location);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

function sendLocationToBackend(location) {
  fetch('https://project-godi01-1.onrender.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverName, driverNumber, loadNumber, location }),
  })
    .then((response) => response.json())
    .then((data) => console.log('Server response:', data))
    .catch((error) => console.error('Error sending data to server:', error));
}

function updateMap(location) {
  map.setCenter(location);
  map.setZoom(14);

  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({
    position: location,
    map: map,
    title: `${driverName} (Load: ${loadNumber})`,
  });
}

// Initialize map on page load
window.onload = initMap;
