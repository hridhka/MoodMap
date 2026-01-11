// src/services/placesService.js

const API_KEY = 'fsq3C4bJnLuIW2M/p2X962HN4yWHiBn1yh4LHV/I1fYyBo8='; 

export const fetchPlaces = async (lat, lng, query) => {
  try {
    // Foursquare API endpoint
    const response = await fetch(
      `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&query=${query}&limit=10`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: API_KEY,
        },
      }
    );

    const data = await response.json();
    return data.results; // This returns an array of places
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};