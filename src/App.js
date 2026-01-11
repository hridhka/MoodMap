import { useState } from "react";
import MoodSelector from "./components/MoodSelector";
import MapView from "./components/MapView";
import PlacesList from "./components/PlacesList";

function App() {
  const [mood, setMood] = useState("work");
  const [places, setPlaces] = useState([]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Smart Nearby Places Recommender</h2>
      <MoodSelector setMood={setMood} />
      <MapView mood={mood} setPlaces={setPlaces} />
      <PlacesList places={places} />
    </div>
  );
}

export default App;
