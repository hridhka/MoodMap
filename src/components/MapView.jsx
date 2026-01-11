import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { fetchPlaces } from "../services/placesService";
import L from "leaflet";

const center = [12.9716, 77.5946]; // Bangalore

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapView({ mood, setPlaces }) {
  const [localPlaces, setLocalPlaces] = useState([]);

  useEffect(() => {
    fetchPlaces(mood).then((data) => {
      setPlaces(data);
      setLocalPlaces(data);
    });
  }, [mood, setPlaces]);

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {localPlaces.map((place, index) => (
        <Marker
          key={index}
          position={[
            place.geocodes?.main?.latitude || center[0],
            place.geocodes?.main?.longitude || center[1],
          ]}
        >
          <Popup>
            <strong>{place.name}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
