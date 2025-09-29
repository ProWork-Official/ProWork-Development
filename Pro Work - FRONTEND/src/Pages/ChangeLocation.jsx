import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const loadScript = (src, timeout = 15000) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      if (window.google && window.google.maps) return resolve();
      return resolve();
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.setAttribute("loading", "async");
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
    setTimeout(() => reject(new Error("Timed out loading Google Maps script")), timeout);
  });

export default function ChangeLocation() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [selected, setSelected] = useState(null); // {lat,lng}

  // default center: approximate Prayagraj center
  const defaultCenter = { lat: 25.4358, lng: 81.8463 };

  useEffect(() => {
    if (!showMap) return;

    let map;
    let geocoder;
    let listenerClick;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setStatusMsg("Google Maps API key not set. Please configure VITE_GOOGLE_MAPS_API_KEY.");
      return;
    }

    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;

    setLoadingMap(true);
    loadScript(src)
      .then(() => {
        if (!window.google || !window.google.maps) throw new Error("Google Maps failed to load.");
        geocoder = new window.google.maps.Geocoder();

        // try to center map on user's current position if available
        const initMap = (center) => {
          map = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
          });

          // initial marker
          markerRef.current = new window.google.maps.Marker({
            position: center,
            map,
            draggable: true,
            title: "Drag to set your location",
          });

          setSelected({ lat: center.lat, lng: center.lng });

          // move marker on map click
          listenerClick = map.addListener("click", (e) => {
            const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            markerRef.current.setPosition(e.latLng);
            setSelected(p);
          });

          // update selected when marker dragged
          markerRef.current.addListener("dragend", (ev) => {
            const p = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
            setSelected(p);
          });
        };

        // attempt to get browser location (but don't require permission)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              initMap({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLoadingMap(false);
            },
            () => {
              // user denied or not available — fallback to default center
              initMap(defaultCenter);
              setLoadingMap(false);
            },
            { timeout: 5000 }
          );
        } else {
          initMap(defaultCenter);
          setLoadingMap(false);
        }
      })
      .catch((err) => {
        console.error("Map load error:", err);
        setStatusMsg("Failed to load Google Maps. Check API key / network.");
        setLoadingMap(false);
      });

    // cleanup
    return () => {
      if (listenerClick) window.google.maps.event.removeListener(listenerClick);
    };
  }, [showMap]);

  const confirmLocation = async () => {
    if (!selected) return setStatusMsg("No location selected.");
    setStatusMsg("Checking selected location...");

    try {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      await loadScript(src);

      if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function") {
        throw new Error("Google Maps library not available after loading.");
      }
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: selected }, (results, geocodeStatus) => {
        if (geocodeStatus !== "OK" || !results || results.length === 0) {
          setStatusMsg("Reverse geocoding failed. Try a different point.");
          return;
        }

        // aggregate components
        const comp = {};
        for (const r of results) {
          for (const c of r.address_components || []) {
            for (const t of c.types) if (!comp[t]) comp[t] = c.long_name;
          }
        }

        const norm = (s) => (s || "").toString().toLowerCase().trim();
        const state = norm(comp.administrative_area_level_1);
        const admin2 = norm(comp.administrative_area_level_2);
        const locality = norm(comp.locality);
        const sublocality = norm(comp.sublocality);
        const neighborhood = norm(comp.neighborhood);
        const postalTown = norm(comp.postal_town);
        const formatted = norm(results[0].formatted_address);

        const prayagrajNames = ["prayagraj", "allahabad"];
        const cityCandidates = [locality, admin2, sublocality, neighborhood, postalTown, formatted];

        const inUttarPradesh = state.includes("uttar pradesh") || state === "up";
        const inPrayagraj = cityCandidates.some(
          (n) => n && prayagrajNames.some((name) => n.includes(name))
        );

        // coordinate fallback bounding box (approx)
        const lat = selected.lat;
        const lng = selected.lng;
        const prayagrajBounds = {
          north: 25.6,
          south: 25.2,
          west: 81.6,
          east: 82.0,
        };
        const inBounds =
          lat >= prayagrajBounds.south &&
          lat <= prayagrajBounds.north &&
          lng >= prayagrajBounds.west &&
          lng <= prayagrajBounds.east;

        if ((inUttarPradesh && inPrayagraj) || inBounds) {
          // success — save selected coords and redirect
          localStorage.setItem("selected_coords", `${lat},${lng}`);
          setStatusMsg("Location saved. Redirecting...");
          setTimeout(() => navigate("/"), 400);
        } else {
          setStatusMsg("Selected location is outside Allahabad / Prayagraj. Pick somewhere inside the city.");
        }
      });
    } catch (err) {
      console.error("Confirm location error:", err);
      setStatusMsg("Error checking location. Try again.");
    }
  };

  const clearSelected = () => {
    localStorage.removeItem("selected_coords");
    setStatusMsg("Saved selection cleared.");
    setSelected(null);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 900, textAlign: "center", background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        {!showMap ? (
          <>
            <h1 style={{ marginBottom: 8 }}>Location not supported</h1>
            <p style={{ marginBottom: 20 }}>
              We currently serve only addresses inside Allahabad / Prayagraj, Uttar Pradesh. Please change the address to continue.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate(-1)} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}>
                Go back
              </button>

              {/* Changed Home -> Change location button as you asked */}
              <button onClick={() => setShowMap(true)} style={{ padding: "8px 14px", borderRadius: 6, background: "#2563eb", color: "white", border: "none" }}>
                Change location
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 8 }}>Choose your location (drag marker or click map)</h2>
            <p style={{ marginBottom: 12, color: "#444" }}>{statusMsg || "Drag the marker or click the map to set location. Then Confirm."}</p>

            <div ref={mapRef} style={{ width: "100%", height: 400, borderRadius: 8, marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setShowMap(false); setStatusMsg(""); }} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}>
                Cancel
              </button>

              <button onClick={confirmLocation} style={{ padding: "8px 14px", borderRadius: 6, background: "#10b981", color: "white", border: "none" }}>
                Confirm location
              </button>

              <button onClick={clearSelected} style={{ padding: "8px 14px", borderRadius: 6, background: "#ef4444", color: "white", border: "none" }}>
                Clear saved selection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
