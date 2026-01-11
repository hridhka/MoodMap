import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapView({ data, center, selectedPlace }) {
  return (
    <MapContainer
      center={
        selectedPlace
          ? [selectedPlace.lat, selectedPlace.lng]
          : center
      }
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((place, index) => (
        <Marker key={index} position={[place.lat, place.lng]}>
          <Popup>
            <strong>{place.name}</strong>
            <br />
            Rating: {place.rating}
            <br />
            Status: {place.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
