import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

/* FIX LEAFLET ICON */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SEARCH_RADIUS = 5000;

/* DISTANCE */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* MAP CONTROLLER */
function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export default function App() {
  const [places, setPlaces] = useState([]);
  const [center, setCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userCity, setUserCity] = useState("Detecting location...");
  const [mood, setMood] = useState("Work Mode");
  const [sortNear, setSortNear] = useState(true);
  const [sortPopular, setSortPopular] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activePlace, setActivePlace] = useState(null);
  const [loading, setLoading] = useState(false);

  /* GET USER LOCATION + CITY */
  const getUserLocation = () => {
    setUserCity("Detecting location...");

    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setCenter(loc);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc[0]}&lon=${loc[1]}&accept-language=en`
        );
        const data = await res.json();

        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.state ||
          "Your location";

        setUserCity(city);
      },
      () => setUserCity("Location access denied")
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  /* FETCH PLACES */
  const fetchPlaces = async (lat, lon) => {
    setLoading(true);

    const query = `
      [out:json];
      (
        node["amenity"="cafe"](around:${SEARCH_RADIUS},${lat},${lon});
        node["amenity"="fast_food"](around:${SEARCH_RADIUS},${lat},${lon});
      );
      out;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await res.json();

    setPlaces(
      data.elements
        .filter((el) => el.tags?.name)
        .map((el) => ({
          id: el.id,
          name: el.tags.name,
          type: el.tags.amenity,
          pos: [el.lat, el.lon],
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1),
          reviews: Math.floor(Math.random() * 300) + 50,
          price: el.tags.amenity === "fast_food" ? "$$" : "$$$$",
          tags:
            el.tags.amenity === "fast_food"
              ? ["Fast", "Takeout"]
              : ["Coffee", "Fresh"],
        }))
    );

    setLoading(false);
  };

  useEffect(() => {
    if (center) fetchPlaces(center[0], center[1]);
  }, [center]);

  /* FILTER */
  let filtered = places
    .filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((p) => {
      if (mood === "Work Mode" || mood === "Date Night") return p.type === "cafe";
      if (mood === "Quick Bite" || mood === "Budget")
        return p.type === "fast_food";
      return true;
    })
    .map((p) => ({
      ...p,
      distance: userLocation
        ? getDistanceKm(
            userLocation[0],
            userLocation[1],
            p.pos[0],
            p.pos[1]
          )
        : null,
    }))
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (sortNear) {
        scoreA += a.distance ?? 999;
        scoreB += b.distance ?? 999;
      }

      if (sortPopular) {
        scoreA -= a.reviews;
        scoreB -= b.reviews;
      }

      return scoreA - scoreB;
    });

  const markers = activePlace ? [activePlace] : filtered;

  return (
    <div className="app">
      {/* HEADER */}
<header className="header">
  <div className="brand">
    <img src="/logo.png" alt="Mood Map Logo" className="logo" />
    <h1>MOOD MAP</h1>
  </div>

  <input
    placeholder="Search places, cuisines, vibes..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />

  <button className="location-btn" onClick={getUserLocation}>
    ➤ {userCity}
  </button>
</header>


      {/* MOOD INTRO */}
      <div className="mood-intro">
        <h2>What's your mood?</h2>
        <p>Choose how you're feeling and we'll find the perfect spot</p>
      </div>

      {/* MOODS */}
      <div className="mood-cards">
        {["Work Mode", "Date Night", "Quick Bite", "Budget"].map(
          (m, i) => (
            <div
              key={m}
              className={`mood-card ${mood === m ? "active" : ""}`}
              onClick={() => setMood(m)}
            >
              <div className="icon">{["⌘", "♥", "✦", "₹"][i]}</div>
              <h4>{m}</h4>
            </div>
          )
        )}
      </div>

      <main className="content">
        <div className="list">
          <div className="results-header">
            <div className="results-left">
              <span>{filtered.length} spots found</span>
              <button className="open-now">
                <span className="dot" /> Open Now
              </button>
            </div>

            <div className="results-right">
              <button
                className={`pill ${sortNear ? "active" : ""}`}
                onClick={() => setSortNear(!sortNear)}
              >
                Nearest
              </button>
              <button
                className={`pill ${sortPopular ? "active" : ""}`}
                onClick={() => setSortPopular(!sortPopular)}
              >
                Popular
              </button>
            </div>
          </div>

          {loading && <p>Loading places…</p>}

          {!loading &&
            filtered.map((p) => (
              <div
                key={p.id}
                className="place-card"
                onClick={() => {
                  setActivePlace(p);
                  setCenter(p.pos); // 🔥 THIS IS THE FIX
                }}
              >
                <div className="place-info">
                  <div className="place-head">
                    <h3>{p.name}</h3>
                    <span className="rating">
                      ★ {p.rating} ({p.reviews})
                    </span>
                  </div>
                  <p className="meta">
                    {p.distance?.toFixed(2)} km · Open · {p.price}
                  </p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="footer">Directions →</div>
                </div>
              </div>
            ))}
        </div>

        {center && (
          <MapContainer center={center} zoom={14} className="map">
            <ChangeMapView center={center} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markers.map((p) => (
              <Marker key={p.id} position={p.pos}>
                <Popup>{p.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </main>
    </div>
  );
}
