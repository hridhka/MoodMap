import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { fetchPlaces } from "../services/placesService";
import { useEffect } from "react";

const center = { lat: 12.9716, lng: 77.5946 };

function MapView({ mood, setPlaces }) {
  useEffect(() => {
    fetchPlaces(mood).then(setPlaces);
  }, [mood, setPlaces]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: "400px", width: "100%" }}
        center={center}
        zoom={14}
      />
    </LoadScript>
  );
}

export default MapView;
