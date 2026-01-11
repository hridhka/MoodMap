// src/components/PlacesList.jsx
import React from 'react';

const PlacesList = ({ places }) => {
  if (!places || places.length === 0) {
    return <p>No places found for this mood.</p>;
  }

  return (
    <div className="places-list">
      {places.map((place) => {
        // Accessing data from Foursquare API response structure
        const distanceKm = (place.distance / 1000).toFixed(1); // Convert meters to km
        const category = place.categories[0]?.name || 'Place';

        return (
          <div 
            key={place.fsq_id} 
            className="place-card" 
            style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}
          >
            <h3>{place.name}</h3>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Distance:</strong> {distanceKm} km</p>
            <p><strong>Status:</strong> {place.closed ? 'Closed' : 'Open Now'}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PlacesList;