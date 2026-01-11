import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

/* =========================
   FIX LEAFLET ICON
========================= */
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

/* =========================
   DISTANCE FUNCTION
========================= */
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

/* =========================
   MAP CONTROLLER
========================= */
function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [center, setCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [cityQuery, setCityQuery] = useState("");

  const [mood, setMood] = useState("all");
  const [hoverMood, setHoverMood] = useState(null);

  const [sortNear, setSortNear] = useState(true);
  const [sortPopular, setSortPopular] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [activePlace, setActivePlace] = useState(null);

  const markerRefs = useRef({});

  /* =========================
     GET USER LOCATION
  ========================= */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserLocation(loc);
        setCenter(loc);
      },
      () => {
        console.log("Location denied – manual city enabled");
      }
    );
  }, []);

  /* =========================
     FETCH PLACES (REAL DATA)
  ========================= */
  const fetchPlaces = async (lat, lon) => {
    setLoading(true);

    const query = `
      [out:json];
      (
        node["amenity"="cafe"](around:${SEARCH_RADIUS}, ${lat}, ${lon});
        node["amenity"="fast_food"](around:${SEARCH_RADIUS}, ${lat}, ${lon});
      );
      out;
    `;

    const res = await fetch(
      "https://overpass-api.de/api/interpreter",
      { method: "POST", body: query }
    );

    const data = await res.json();

    setPlaces(
      data.elements.map((el) => ({
        id: el.id,
        name: el.tags?.name || "Unnamed Place",
        type: el.tags?.amenity,
        pos: [el.lat, el.lon],
      }))
    );

    setLoading(false);
  };

  /* =========================
     FETCH WHEN CENTER CHANGES
  ========================= */
  useEffect(() => {
    if (center) {
      fetchPlaces(center[0], center[1]);
    }
  }, [center]);

  /* =========================
     CITY SEARCH (MANUAL)
  ========================= */
  const searchCity = async () => {
    if (!cityQuery) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${cityQuery}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const loc = [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ];
      setCenter(loc);
      setUserLocation(loc);
      setActivePlace(null);
    }
  };

  /* =========================
     FILTER BY MOOD
  ========================= */
  let processed = places.filter((p) => {
    if (mood === "all") return true;
    if (mood === "work" || mood === "date") return p.type === "cafe";
    if (mood === "budget") return p.type === "fast_food";
    return true;
  });

  /* =========================
     ADD DISTANCE
  ========================= */
  processed = processed.map((p) => {
    if (!userLocation) return p;
    return {
      ...p,
      distance: getDistanceKm(
        userLocation[0],
        userLocation[1],
        p.pos[0],
        p.pos[1]
      ),
    };
  });

  /* =========================
     SEARCH TEXT
  ========================= */
  processed = processed.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  /* =========================
     COMBINED SORT
  ========================= */
  processed.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (sortNear) {
      scoreA += a.distance ?? 999;
      scoreB += b.distance ?? 999;
    }

    if (sortPopular) {
      if (a.name !== "Unnamed Place") scoreA -= 5;
      if (b.name !== "Unnamed Place") scoreB -= 5;
      if (a.type === "cafe") scoreA -= 2;
      if (b.type === "cafe") scoreB -= 2;
    }

    return scoreA - scoreB;
  });

  const markersToShow = activePlace ? [activePlace] : processed;

  /* =========================
     MAP SYNC
  ========================= */
  useEffect(() => {
    if (activePlace) {
      setCenter(activePlace.pos);
      markerRefs.current[activePlace.id]?.openPopup();
    }
  }, [activePlace]);

  /* =========================
     BODY BACKGROUND
  ========================= */
  useEffect(() => {
    document.body.className = `mood-${hoverMood || mood}`;
  }, [mood, hoverMood]);

  return (
    <div className="app">
      <header className="header">
        <h1>MOOD MAP</h1>

        <input
          placeholder="Search cafes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="city-search">
          <input
            placeholder="Enter city or state"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
          />
          <button onClick={searchCity}>Search</button>
        </div>
      </header>

      <section className="mood-section">
        <div className="mood-cards">
          {["All","Work","Date","Quick","Budget"].map((v, i) => (
            <MoodCard
              key={v}
              label={v}
              emoji={["✨","💼","❤️","⚡","💰"][i]}
              value={v}
              {...{ mood, setMood, setHoverMood }}
            />
          ))}
        </div>
      </section>

      <main className="content">
        <div className="list">
          <div className="sort-bar">
            <button
              className={sortNear ? "active" : ""}
              onClick={() => setSortNear(!sortNear)}
            >
              📍 Nearest
            </button>
            <button
              className={sortPopular ? "active" : ""}
              onClick={() => setSortPopular(!sortPopular)}
            >
              ⭐ Popular
            </button>
          </div>

          {loading && <p>Loading places…</p>}

          {!loading &&
            processed.map((p) => (
              <div
                key={p.id}
                className={`place-card ${
                  activePlace?.id === p.id ? "active" : ""
                }`}
                onClick={() => setActivePlace(p)}
              >
                <h3>{p.name}</h3>
                {p.distance && (
                  <p className="distance">
                    {p.distance.toFixed(2)} km away
                  </p>
                )}
              </div>
            ))}
        </div>

        {center && (
          <MapContainer center={center} zoom={14} className="map">
            <ChangeMapView center={center} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {markersToShow.map((p) => (
              <Marker
                key={p.id}
                position={p.pos}
                ref={(r) => (markerRefs.current[p.id] = r)}
              >
                <Popup>
                  <strong>{p.name}</strong>
                </Popup>
              </Marker>
            ))}

            {userLocation && (
              <Marker position={userLocation}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </main>
    </div>
  );
}

/* =========================
   MOOD CARD
========================= */
function MoodCard({ label, emoji, value, mood, setMood, setHoverMood }) {
  return (
    <div
      className={`mood-card ${mood === value ? "active" : ""}`}
      onClick={() => setMood(value)}
      onMouseEnter={() => setHoverMood(value)}
      onMouseLeave={() => setHoverMood(null)}
    >
      <div className="icon">{emoji}</div>
      <h4>{label}</h4>
    </div>
  );
}

export default App;
