const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.use(cors());
app.use(express.json());

// Function to reverse geocode latitude and longitude
async function getAddressFromCoords(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      const formattedAddress = results[0].formatted_address;

      const street = addressComponents.find((c) => c.types.includes('route'))?.long_name;
      const city = addressComponents.find((c) => c.types.includes('locality'))?.long_name;
      const state = addressComponents.find((c) => c.types.includes('administrative_area_level_1'))?.long_name;
      const zipCode = addressComponents.find((c) => c.types.includes('postal_code'))?.long_name;

      return { formattedAddress, street, city, state, zipCode };
    } else {
      throw new Error('No results found.');
    }
  } catch (error) {
    console.error('Error in Reverse Geocoding:', error.message);
    return null;
  }
}

// Endpoint to receive and log location updates
app.post('/update-location', async (req, res) => {
  const { driverName, driverNumber, loadNumber, location } = req.body;

  if (!driverName || !driverNumber || !loadNumber || !location) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  console.log('--- New Location Update ---');
  console.log(`Driver Name: ${driverName}`);
  console.log(`Driver Number: ${driverNumber}`);
  console.log(`Load Number: ${loadNumber}`);
  console.log(`Latitude: ${location.lat}`);
  console.log(`Longitude: ${location.lng}`);

  const addressDetails = await getAddressFromCoords(location.lat, location.lng);
  if (addressDetails) {
    console.log(`Street: ${addressDetails.street || 'N/A'}`);
    console.log(`City: ${addressDetails.city || 'N/A'}`);
    console.log(`State: ${addressDetails.state || 'N/A'}`);
    console.log(`Zip Code: ${addressDetails.zipCode || 'N/A'}`);
    console.log(`Full Address: ${addressDetails.formattedAddress}`);
  } else {
    console.log('Could not retrieve detailed location information.');
  }

  res.json({ message: 'Location received and logged.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
