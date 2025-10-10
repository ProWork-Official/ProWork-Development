// Package
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Assets
import ProworkLogo from '../Assets/ProworkLogo.png';

// Function
import { MyContext } from "../ContextAPI";

let googleMapsPromise = null;

export const loadScript = (src) => {
  // 1. Check if the promise already exists.
  if (googleMapsPromise) return googleMapsPromise;
  
  // 2. Also check if the API is already loaded on the window object.
  if (window.google && window.google.maps) return Promise.resolve();
  

  // 3. If this is the first time, create the promise and the script tag.
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      console.log("Google Maps script loaded successfully.");
      resolve();
    };
    
    script.onerror = (error) => {
      console.error("Google Maps script failed to load.", error);
      googleMapsPromise = null; // Reset on error so we can try again later.
      reject(error);
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export default function LocationGate({ children }) {

  const { setAdss, setStatusMsg } = useContext(MyContext);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("checking"); // checking | allowed | denied | outside | error

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setStatus("error");
      setMessage("Google Maps API key not set (VITE_GOOGLE_MAPS_API_KEY).");
      return;
    }

    if (!("geolocation" in navigator)) {
      setStatus("error");
      setMessage("Geolocation is not available in this browser.");
      return;
    }

    // shared logic to take coords and reverse-geocode & validate
    const processCoords = async (lat, lng) => {
      try {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        await loadScript(src);

        if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function") {
          throw new Error("Google Maps library not available after loading.");
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, geocodeStatus) => {
          try {
            if (geocodeStatus !== "OK" || !results || results.length === 0) {
              setStatus("error");
              setMessage("Reverse geocoding failed. Try again.");
              return;
            }

            let bestResult = null;
            for (const result of results) {
              const formattedAddress = result.formatted_address || "";
              if (formattedAddress.match(/^\w{4}\+\w{4}$/)) continue; 
              if (!bestResult || (formattedAddress && formattedAddress.length > (bestResult.formatted_address || ""))) bestResult = result;
            }
            if (!bestResult) {
              setStatusMsg("No human-readable address found. Please try again.");
              reject("No human-readable address found.");
              return;
            }
            const comp = {};
            for (const r of bestResult.address_components || []) {
              for (const c of r.types) if (!comp[c]) comp[c] = r.long_name;
            }
            const norm = (s) => (s || "").toString().toLowerCase().trim();
            const state = norm(comp.administrative_area_level_1);
            const admin2 = norm(comp.administrative_area_level_2);
            const locality = norm(comp.locality);
            const sublocality = norm(comp.sublocality);
            const neighborhood = norm(comp.neighborhood);
            const postalTown = norm(comp.postal_town);
            const formatted = norm(bestResult.formatted_address);
            const prayagrajNames = ["prayagraj", "allahabad"];
            const cityCandidates = [locality, admin2, sublocality, neighborhood, postalTown, formatted];
            const inUttarPradesh = state.includes("uttar pradesh") || state === "up";
            const inPrayagraj = cityCandidates.some((n) => n && prayagrajNames.some((name) => n.includes(name)));    
            const prayagrajBounds = { north: 25.6, south: 25.2, west: 81.6, east: 82.0 };
            const inBounds = lat >= prayagrajBounds.south && lat <= prayagrajBounds.north && lng >= prayagrajBounds.west && lng <= prayagrajBounds.east;
            const finalAddress = bestResult.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            localStorage.setItem("selected_address", finalAddress);
            localStorage.setItem("selected_coords", `${lat},${lng}`);

            setAdss(finalAddress);
            setMessage(finalAddress);

            if ((inUttarPradesh && inPrayagraj) || inBounds) {
              setStatus("allowed");
            } else {
              setStatus("outside");
              navigate("/change-location");
            }
          } catch (cbErr) {
            console.error("Geocode callback error:", cbErr);
            setStatus("error");
            setMessage("Error while processing geocode results.");
          }
        });
      } catch (err) {
        console.error("Maps script or geocode error:", err);
        setStatus("error");
        setMessage("Failed to load Google Maps or geocode. Check the API key, network, or Google Cloud Console settings.");
      }
    };


    // If a manually-selected location exists in localStorage, use it
    const selected = localStorage.getItem("selected_coords");
    const selectedAddress = localStorage.getItem("selected_address");
    if (selected && selectedAddress) {
      setAdss(selectedAddress);
      setStatus("allowed");
      return;
    } else if (selected) {
      // fallback: reverse-geocode if address missing
      const [latStr, lngStr] = selected.split(",").map((s) => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        processCoords(lat, lng);
        return;
      } else {
        localStorage.removeItem("selected_coords");
      }
    }

    // otherwise use browser geolocation (will prompt user)
    const onPosition = (pos) => { processCoords(pos.coords.latitude, pos.coords.longitude) };

    const onError = (err) => {
      console.warn("Geolocation error:", err);
      if (err && err.code === 1) {
        setStatus("denied");
        setMessage("Location permission denied. Allow location or change location manually.");
        navigate("/location-permission-denied");
      } else {
        setStatus("error");
        setMessage("Unable to get your location. Try again.");
      }
    };


    navigator.geolocation.getCurrentPosition(onPosition, onError, { timeout: 10000 });
  }, [navigate]);


  // if already allowed or user is on /change-location, let children show
  if (status === "allowed" || location.pathname === "/change-location") {
    return <>{children}</>;
  }

  

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>Detecting your location…</div>
          <div style={{ fontSize: 12, color: "#666" }}>Please allow location access if prompted.</div>
        </div>
      </div>
    );
  }

  if (status === "allowed") return <>{children}</>;

  // fallback for denied/outside/error
  return (
    <div className="min-h-screen bg-gray-50 flex flex-wrap items-center justify-center pt-2">
      <img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' />
      <div className="w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 mt-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-semibold text-[gray-800] mb-4">
            Location Access Denied
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            In order to provide personalized content, we need your location. Please follow the steps below to enable location access.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-6">

          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-[#33806b] text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg mb-2 md:mb-0 font-semibold text-gray-800">
                Open Your Browser Settings
              </h3>
              <p className="text-xs md:text-base text-gray-600">
                Click on the padlock icon in the address bar (next to the URL) to access site settings.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-[#33806b] text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg mb-2 md:mb-0 font-semibold text-gray-800">
                Locate the Location Permission
              </h3>
              <p className="text-xs md:text-base text-gray-600">
                In the settings menu, find the location permission setting and set it to "Allow".
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-[#33806b] text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg mb-2 md:mb-0 font-semibold text-gray-800">
                Reload the Page
              </h3>
              <p className="text-xs md:text-base text-gray-600">
                After enabling location, refresh the page to proceed.
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center mt-10">
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#33806b] w-full sm:w-auto text-[#f2da1d] font-semibold rounded-lg shadow-md hover:bg-[#296354] transition duration-300">
            Reload Page
          </button>      
        </div>
      </div>
    </div>
  );
}
