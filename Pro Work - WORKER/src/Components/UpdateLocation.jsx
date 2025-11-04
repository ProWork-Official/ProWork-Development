import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MyContext } from "../ContextAPI";
import { loadScript } from "./LocationGate";
import { URL } from "../func";
import MapLogo from "../Assets/MapLogo.gif";
import GPS from "../Assets/gps.png";
import NextY from "../Assets/next_Y.png";
import searcH from "../Assets/search.png";
import { useDebounce } from "../Components/Hooks/useDebounce";
import locationIcon from "../Assets/gps.png";
import Plus from "../Assets/plus.png";
import Home from '../Assets/home.png';
import Office from '../Assets/office.png'
import Other from '../Assets/other.png'
import Pin from "../Assets/Pin.png";
import axios from "axios";

function UpdateLocation() {
  const { SessionID, showMap, setShowMap, addss, setAdss, pickerStep, setPickerStep, status, setStatus, statusMsg, setStatusMsg } = useContext(MyContext);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pendingCenterRef = useRef(null); // NEW: keep coords to pan after map init
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingMap, setLoadingMap] = useState(false);
  const [tempAdds, setTempAddss] = useState("");
  const [selected, setSelected] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const autocompleteInputRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Backend addresses
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddress, setSavedAddress] = useState([]);
  const [addressForm, setAddressForm] = useState({ type: "Home", building: "", landmark: "", pinCode: "", completeAddress: "" });

  const defaultCenter = { lat: 25.4358, lng: 81.8463 };

  // Fetch addresses from backend on mount
  useEffect(() => {
    if(! SessionID.SessionID) return;

    async function fetchAddresses() {
      try {
        const res = await axios.get(`${URL}/user/address/all`, { withCredentials: true });
        setSavedAddress(res.data);
      } catch (e) {
        setSavedAddress([]);
      }
    }
    fetchAddresses();
  }, []);

  // Autocomplete predictions
  useEffect(() => {
    const want = showMap && (pickerStep === "search" || (pickerStep === "map" && isAddingNewAddress));
    if (!want) {
      setPredictions([]);
      return;
    }
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;

    loadScript(src)
    .then(() => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setStatusMsg("Google Places library not available.");
        return;
      }

      if (autocompleteInputRef.current) autocompleteInputRef.current.focus();

      if (debouncedSearchQuery) {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          { input: debouncedSearchQuery, componentRestrictions: { country: "in" } },
          (newPredictions, status) => {
            if (status === "OK" && newPredictions) setPredictions(newPredictions);
            else setPredictions([]);
          }
        );
      } else {
        setPredictions([]);
      }
    })
    .catch((err) => {
      setStatusMsg("Failed to load Google Maps Places.");
    });
  }, [showMap, pickerStep, debouncedSearchQuery, isAddingNewAddress]);

  // Map initialization / updates
  useEffect(() => {
    if (!showMap || pickerStep !== "map") return;
    let listenerClick = null;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setStatusMsg("Google Maps API key not set. Please configure VITE_GOOGLE_MAPS_API_KEY.");
      return;
    }
    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    setLoadingMap(true);
    loadScript(src)
      .then(() => {
        setLoadingMap(false);
        if (!mapInstanceRef.current) {
          // center preference:
          const center = selected ? { lat: selected.lat, lng: selected.lng } : (pendingCenterRef.current || defaultCenter);
          // do NOT rely on checkAndSaveCoords to block centering — validate in background
          // validation-only — do not alter global status while centering on a searched location
          checkAndSaveCoords(center, { autoOpenMapIfOutside: false, silent: true }).catch(()=>{});
          const map = new window.google.maps.Map(mapRef.current, { center, zoom: 15 });
          mapInstanceRef.current = map;
          const markerIcon = {
            url: Pin,
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 40),
          };
          const marker = new window.google.maps.Marker({ position: center, map, draggable: true, title: "Drag to set your location", icon: markerIcon });
          markerRef.current = marker;
          // If there is a pending center requested (from search), pan the map to it now
          if (pendingCenterRef.current) {
            try {
              const c = pendingCenterRef.current;
              const pos = new window.google.maps.LatLng(c.lat, c.lng);
              markerRef.current.setPosition(pos);
              map.panTo(pos);
              map.setZoom(15);
            } catch (e) {}
            pendingCenterRef.current = null;
          }
          listenerClick = map.addListener("click", (e) => {
            const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(e.latLng);
            setSelected(p);
            // validation-only — do not alter global status while centering on a searched location
            checkAndSaveCoords(p, { autoOpenMapIfOutside: false, silent: true }).catch(()=>{});
          });
          marker.addListener("dragend", (ev) => {
            const p = ev.latLng ? { lat: ev.latLng.lat(), lng: ev.latLng.lng() } : null;
            if (p) {
              setSelected(p);
              // validation-only — do not alter global status while centering on a searched location
              checkAndSaveCoords(p, { autoOpenMapIfOutside: false, silent: true }).catch(()=>{});

            }
          });
          requestAnimationFrame(() =>
            setTimeout(() => {
              try {
                if (window.google && window.google.maps && map) {
                  window.google.maps.event.trigger(map, "resize");
                  map.setCenter(center);
                }
              } catch (e) {}
            }, 50)
          );
        } else {
          const map = mapInstanceRef.current;
          if (selected && markerRef.current) {
            const pos = new window.google.maps.LatLng(selected.lat, selected.lng);
            try {
              markerRef.current.setPosition(pos);
              map.panTo(pos);
            } catch (e) {}
          } else {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  map.setCenter(p);
                  if (markerRef.current && markerRef.current.setPosition)
                    markerRef.current.setPosition(new window.google.maps.LatLng(p.lat, p.lng));
                },
                () => {
                  map.setCenter(defaultCenter);
                  if (markerRef.current && markerRef.current.setPosition)
                    markerRef.current.setPosition(new window.google.maps.LatLng(defaultCenter.lat, defaultCenter.lng));
                },
                { timeout: 5000 }
              );
            }
          }
        }
      })
      .catch((err) => {
        setStatusMsg("Failed to load Google Maps. Check API key / network.");
        setLoadingMap(false);
      });

    return () => {
      try {
        if (listenerClick && window.google && window.google.maps && window.google.maps.event)
          window.google.maps.event.removeListener(listenerClick);
      } catch (_) {}
      if (mapInstanceRef.current) {
        try {
          const oldDiv = mapInstanceRef.current.getDiv && mapInstanceRef.current.getDiv();
          if (!oldDiv || oldDiv !== mapRef.current) {
            try {
              window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
            } catch (_) {}
            mapInstanceRef.current = null;
            markerRef.current = null;
          }
        } catch (e) {
          mapInstanceRef.current = null;
          markerRef.current = null;
        }
      }
    };
  }, [showMap, pickerStep, selected]);

  // clicking a prediction opens the map centered on that place
  const handlePredictionClick = (prediction) => {
    if (!prediction || !prediction.place_id) return;
    setSearchQuery("");
    setPredictions([]);
    setStatusMsg("Fetching location details...");
    const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
    placesService.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "formatted_address", "name"] },
      (place, status) => {
        if (status === "OK" && place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          const coords = { lat, lng };
          // Set temporary address & selected state
          setSelected(coords);
          setTempAddss(place.formatted_address || place.name);
          setStatusMsg("");

          // Save coords to pendingCenterRef so map init or existing map will pan to it
          pendingCenterRef.current = coords;

          // Validate in background but do not block UI/centering
          // new (silent validation — do not block centering)
          checkAndSaveCoords(coords, { autoOpenMapIfOutside: false, silent: true }).catch(() => {});

          // Open map UI and ensure we pan to coords (map init will also handle pendingCenterRef)
          requestAnimationFrame(() =>
            setTimeout(() => {
              setPickerStep("map");
              setShowMap(true);
              // attempt immediate pan if map already exists
              try {
                if (mapInstanceRef.current) {
                  const pos = new window.google.maps.LatLng(coords.lat, coords.lng);
                  if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(pos);
                  mapInstanceRef.current.panTo(pos);
                  mapInstanceRef.current.setZoom(15);
                  pendingCenterRef.current = null;
                }
              } catch (err) {}
            }, 40)
          );
        } else {
          setStatusMsg("Could not retrieve location details. Please try again.");
        }
      }
    );
  };

const useMyCurrentLocation = async () => {
  setStatusMsg("Detecting your current location...");
  if (!navigator.geolocation) {
    setStatusMsg("Geolocation not available in this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
        // result is now an object: { allowed, finalAddress }
        const result = await checkAndSaveCoords(coords, { autoOpenMapIfOutside: true });

        // NEW: persist coords so they survive refresh
        if (result && result.allowed) {
          try {
            localStorage.setItem("selected_coords", `${coords.lat},${coords.lng}`);
          } catch (e) { /* ignore storage errors */ }
        }

        // NEW: If allowed -> save the address string and close the map
        if (result.allowed) {
          setTimeout(() => {
            setAdss(result.finalAddress); // use geocoded address string
            setShowMap(false);
            setPickerStep("search");
            setStatusMsg("");
            navigate("/");
          }, 350);
        } else {
          // If not allowed, set the address text but KEEP the map open
          setSelected(coords);
          setTempAddss(result.finalAddress);
          setPickerStep("map");
          setShowMap(true);
          navigate("/change-location");
        }
      } catch (err) {
        // geocoder or other error -> show map and let user pick
        setPickerStep("map");
        setShowMap(true);
        setStatusMsg("Could not validate location, please adjust on map.");
      }
    },
    (err) => {
      setStatusMsg("Unable to detect your location. You can pick manually.");
      setPickerStep("map");
    },
    { timeout: 8000 }
  );
};


  // NEW: start Add New Address flow => center map on current location and keep isAddingNewAddress
  const startAddNewAddress = () => {
    setIsAddingNewAddress(true);
    setShowAddressForm(false);
    setStatusMsg("Fetching your current location...");
    if (!navigator.geolocation) {
      setStatusMsg("Geolocation not available in this browser.");
      setPickerStep("map");
      setShowMap(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSelected(coords);
        setPickerStep("map");
        setShowMap(true);
        // This is the fixed part
       // new — validation-only so map can still center on the searched coordinates
       checkAndSaveCoords(coords, { autoOpenMapIfOutside: true })
       .then((result) => setTempAddss(result.finalAddress))
       .catch(() => {});


      },
      (err) => {
        setStatusMsg("Unable to detect current location; please pick on map.");
        setPickerStep("map");
        setShowMap(true);
      },
      { timeout: 8000 }
    );
  };

// reverse geocode + validate
const checkAndSaveCoords = async (coords, opts = { autoOpenMapIfOutside: true, silent: false }) => {
  // opts:
  //  - autoOpenMapIfOutside: whether callers want the function to trigger the "outside" UI/flow
  //  - silent: if true, DON'T set global status/statusMsg/pickerStep etc.
  if (!coords) return { allowed: false, finalAddress: '' };
  if (!opts || typeof opts !== 'object') opts = { autoOpenMapIfOutside: true, silent: false };

  if (!opts.silent) setStatusMsg("Checking selected location...");
  try {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    await loadScript(src);

    if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function") {
      if (!opts.silent) {
        setStatus("error");
        setStatusMsg("Google Maps library not available after loading.");
      }
      return { allowed: false, finalAddress: `${coords.lat?.toFixed?.(4) || ""}, ${coords.lng?.toFixed?.(4) || ""}` };
    }

    const geocoder = new window.google.maps.Geocoder();

    return await new Promise((resolve) => {
      geocoder.geocode({ location: coords }, (results, geocodeStatus) => {
        if (geocodeStatus !== "OK" || !results || results.length === 0) {
          if (!opts.silent) {
            setStatus("error");
            setStatusMsg("Reverse geocoding failed. Try a different point.");
          }
          resolve({ allowed: false, finalAddress: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` });
          return;
        }

        // pick best human-readable result
        let bestResult = null;
        for (const result of results) {
          const formattedAddress = result.formatted_address || "";
          if (formattedAddress.match(/^\w{4}\+\w{4}$/)) continue; // skip pure plus-code results
          if (!bestResult || (formattedAddress && formattedAddress.length > (bestResult.formatted_address || "")))
            bestResult = result;
        }

        if (!bestResult) {
          if (!opts.silent) {
            setStatus("error");
            setStatusMsg("No human-readable address found. Please try again.");
          }
          resolve({ allowed: false, finalAddress: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` });
          return;
        }

        // extract components
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

        const lat = coords.lat;
        const lng = coords.lng;
        const prayagrajBounds = { north: 25.6, south: 25.2, west: 81.6, east: 82.0 };
        const inBounds = lat >= prayagrajBounds.south && lat <= prayagrajBounds.north && lng >= prayagrajBounds.west && lng <= prayagrajBounds.east;
        const finalAddress = bestResult.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Always update the temporary address text so UI shows formatted address for searches
        try { setTempAddss(finalAddress); } catch (e) { /* ignore if unavailable */ }

        const allowed = ((inUttarPradesh && inPrayagraj) || inBounds);

        // IMPORTANT: only update global status/messages when NOT silent.
        if (!opts.silent) {
          if (allowed) {
            setStatus("allowed");
            setStatusMsg("Location valid.");
          } else {
            setStatus("outside");
            setStatusMsg("Selected location is outside Prayagraj. Please adjust on the map.");
            // caller may choose to open map or redirect when outside (autoOpenMapIfOutside)
          }
        } else {
          // silent mode: do NOT touch global status/statusMsg or trigger navigation
          // keep function purely as validator
        }

        resolve({ allowed, finalAddress });
      });
    });
  } catch (err) {
    console.error("Error in checkAndSaveCoords:", err);
    if (!opts.silent) {
      setStatus("error");
      setStatusMsg("Error checking location. Try again.");
    }
    return { allowed: false, finalAddress: `${coords.lat?.toFixed?.(4) || ""}, ${coords.lng?.toFixed?.(4) || ""}` };
  }
};


  // Confirm button behavior: for add-new flow open the address details form, otherwise quick-save & close
// Confirm button behavior: for add-new flow open the address details form, otherwise quick-save & close
const confirmLocation = async () => {
  if (!selected) return setStatusMsg("No location selected.");
  const savedAddress = tempAdds || `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`;

  // Re-validate at confirmation time to be sure (checkAndSaveCoords no longer rejects)
  try {
    const result = await checkAndSaveCoords({ lat: selected.lat, lng: selected.lng }, { autoOpenMapIfOutside: false });
    // result = { allowed: boolean, finalAddress: string }
    if (!result || result.allowed === false) {
      // redirect to change-location flow
      try { localStorage.setItem("pending_redirect_after_change", "1"); } catch (e) {}
      setShowMap(false);
      setPickerStep("search");
      setStatusMsg("Selected location is outside service area. Redirecting to change location...");
      try { localStorage.setItem("selected_coords", `${selected.lat},${selected.lng}`); } catch (e) {}
      navigate("/change-location");
      return;
    }

    // allowed -> persist coords
    try { localStorage.setItem("selected_coords", `${selected.lat},${selected.lng}`); } catch (e) {}

  } catch (err) {
    // on geocoder/other error, fallback to showing map so user can pick again
    setPickerStep("map");
    setShowMap(true);
    setStatusMsg("Could not validate location, please adjust on map.");
    return;
  }

  // Now handle add-new-address vs normal confirm
  if (isAddingNewAddress) {
    setAddressForm((prev) => ({ ...prev, completeAddress: savedAddress }));
    setShowAddressForm(true);
    return;
  }

  // Normal save: update visible address and close the map
  setAdss(savedAddress);

  setTimeout(() => {
    setShowMap(false);
    setPickerStep("search");
    setStatusMsg("");
    // IF the user is currently on the change-location page, redirect home
    try {
      // use the react-router location object to check current path
      if (location && location.pathname && location.pathname.startsWith("/change-location")) {
        navigate("/");
      }
    } catch (e) {
      // ignore navigation errors
    }
  }, 350);
};


  function extractLocation(addss) {
    const parts = (addss || "").split(",");
    const firstPart = (parts[0] || "").trim();
    const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/i.test(firstPart);
    const isHouseNumber = /[0-9]/.test(firstPart) && /[\/-]/.test(firstPart);
    if ((isPlusCode || isHouseNumber) && parts.length > 1) return parts[1].trim();
    else return firstPart;
  }

  // Save address to backend (max 3, one per type)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const { type, building, landmark, pinCode, completeAddress } = addressForm;
    if (!type || !completeAddress) return setStatusMsg("Please provide address and select a type.");
    if (!pinCode || !/^\d{6}$/.test(pinCode)) return setStatusMsg("Enter a valid 6-digit pin code.");

    if (savedAddress.some((a) => a.type === type)) {
      setStatusMsg(`You already have a saved address for ${type}.`);
      return;
    }
    if (savedAddress.length >= 3) {
      setStatusMsg("Maximum 3 addresses allowed. Delete one to add another.");
      return;
    }

    try {
      // POST /user/address/:addressId (addressId = "new" for new address)
      const res = await axios.post(`${URL}/user/address/new`, {
        type,
        building,
        landmark,
        pinCode,
        completeAddress,
        coords: selected ? { ...selected } : null,
      }, { withCredentials: true });
      console.log(res);
      setSavedAddress([...savedAddress, res.data]);
      setAdss(completeAddress);
      setShowAddressForm(false)
      setIsAddingNewAddress(false);
      setShowMap(false);
      setPickerStep("search");
      setStatusMsg("");
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "Failed to save address");
    }
  };

  // Delete address from backend
  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`${URL}/user/address/${id}`, { withCredentials: true });
      setSavedAddress(savedAddress.filter((a) => a._id !== id));
    } catch (err) {
      setStatusMsg("Failed to delete address");
    }
  };

  // select a saved address from list
  const handleSelectSavedAddress = async (addr) => {
  // If backend saved address includes coords, use them to persist and validate.
  // Otherwise fall back to the address string (no coords -> cannot persist exact location).
  if (!addr) return;

  // If coords are present, validate them first (this will set status appropriately).
  if (addr.coords && (addr.coords.lat || addr.coords.lng)) {
    const coords = { lat: Number(addr.coords.lat), lng: Number(addr.coords.lng) };
    try {
      const result = await checkAndSaveCoords(coords, { autoOpenMapIfOutside: false });
      // If allowed, persist and close map
      if (result && result.allowed) {
        try { localStorage.setItem("selected_coords", `${coords.lat},${coords.lng}`); } catch (e) {}
        setAdss(result.finalAddress || addr.completeAddress);
        setShowMap(false);
        setPickerStep("search");
        setStatusMsg("");
        return;
      } else {
        // Not allowed -> open map so user can pick valid location or confirm
        setSelected(coords);
        setTempAddss(result.finalAddress || addr.completeAddress);
        setPickerStep("map");
        setShowMap(true);
        return;
      }
    } catch (err) {
      // fallback: show map and let user choose
      setStatusMsg("Could not validate saved address location. Please pick or confirm on map.");
      setSelected({ lat: addr.coords.lat, lng: addr.coords.lng });
      setTempAddss(addr.completeAddress);
      setPickerStep("map");
      setShowMap(true);
      return;
    }
  }

  // If no coords, just set the address text (user can confirm on map or choose)
  setAdss(addr.completeAddress);
  setShowMap(false);
  setPickerStep("search");
  setStatusMsg("");
};


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="flex flex-col bg-white sm:rounded-lg w-full h-full sm:h-[80%] sm:max-w-xl sm:mx-4 md:mx-0 shadow-lg">

        <div className="flex justify-start p-2 py-4 shadow-md">
          <button className=" flex items-center text-sm text-[#33806b]" onClick={() => { setShowMap(false); setPickerStep("search"); setStatusMsg("") }} >
            <img src={NextY} alt="" className="rotate-180 h-[28px] mr-2" />
            Your Location
          </button>
        </div>

        {pickerStep === "search" ? 
          <div className="px-4 mt-4 flex flex-col flex-grow min-h-0">

            <label className="flex w-full items-center text-sm rounded-md border border-[#33806b] p-3 mb-4 focus-within:ring-2 focus-within:ring-[#33806b] bg-gray-100 text-gray-900">
              <img src={searcH} alt="search" className="h-6 mr-3" />
              <input ref={autocompleteInputRef} placeholder="Search for area, street name..." className="w-full bg-transparent outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              {searchQuery && 
                <button onClick={() => setSearchQuery("")} className="text-xl text-gray-500">
                  &times;
                </button>
              }
            </label>

            {searchQuery.length > 0 ? 
              <div className="flex-grow overflow-y-auto max-h-[60vh]">
                {predictions.map((p) => 
                  <div key={p.place_id} onClick={() => handlePredictionClick(p)} className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                    <img src={locationIcon} alt="location" className="h-6 w-6 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-800">{p.structured_formatting.main_text}</p>
                      <p className="text-sm text-gray-500">{p.structured_formatting.secondary_text}</p>
                    </div>
                  </div>
                )}
              </div>
             : 
              <div className="flex flex-col overflow-x-hidden flex-grow relative items-center pt-2 justify-between text-center text-gray-600 overflow-y-auto" id="ColorCustomScroll">
                <div className="w-full">
                  <button onClick={useMyCurrentLocation} className="flex w-full mb-3 z-10 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center">
                    <img src={GPS} alt="gps" className="h-6 mr-3" /> 
                    Use My Current Location
                  </button>
                  <button onClick={startAddNewAddress} className="flex justify-between z-10 w-full mb-3 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center">
                    <div className="flex items-center">
                      <img src={Plus} alt="gps" className="h-6 mr-3" /> 
                      Add New Address
                    </div>
                    <img src={NextY} alt="gps" className="h-6 mr-3" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 min-h-[24px] pt-24 text-center z-10 ">{statusMsg}</div>
                <div className="p-2 rounded-md flex items-center absolute top-28 justify-center mb-6">
                  <img src={MapLogo} alt="" className="h-28" />
                </div>
                {/* Saved addresses list */}
                <div className="m-6 py-2 mt-8 rounded-lg w-full bg-slate-100 flex flex-col items-start z-10">
                  <h2 className="w-full py-2 font-semibold px-4 text-start">Saved Addresses</h2>
                  {savedAddress.length === 0 ? 
                    <p className="text-sm text-gray-500 px-4 py-2">No address saved yet.</p>
                   : 
                    savedAddress.map((a) => 
                      <div className="w-full px-4" key={a._id}>
                        <button onClick={() => handleSelectSavedAddress(a)} className="w-full p-3 bg-white rounded-md mb-2 border flex items-center justify-between">
                          <div className="flex items-center">
                            {a.type === 'Home' && <img src={Home} alt="" className="h-8 " />}
                            {a.type === 'Work' && <img src={Office} alt="" className="h-8" />}
                            {a.type === 'Others' &&  <img src={Other} alt="" className="h-8" />}
                            <div className="flex flex-wrap pl-2">
                              <div className="text-xs font-semibold"><span className="text-[#33806b]">{a.type}</span> - {a.pinCode || a.type}</div>
                              <div className="text-sm text-gray-700 text-left">
                                <div className="font-medium"></div>
                                <div className="text-xs text-gray-500">{a.completeAddress}</div>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteAddress(a._id)} className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-xs">Delete</button>
                        </button>
                      </div>
                    )
                  }
                </div>
              </div>
            }
          </div>
         : 
          <div className="w-full h-full flex flex-wrap relative">
            <div ref={mapRef} className="w-full h-full sm:rounded-b-md" />
            {isAddingNewAddress && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-xl z-40">
                <label className="flex items-center text-sm rounded-md bg-white border p-2 shadow">
                  <img src={searcH} alt="search" className="h-5 mr-2" />
                  <input
                    ref={autocompleteInputRef}
                    placeholder="Search on map (area, street name...)"
                    className="w-full bg-transparent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="text-xl text-gray-500">&times;</button>}
                </label>
                {predictions.length > 0 && (
                  <div className="mt-1 max-h-60 overflow-y-auto bg-white rounded shadow border">
                    {predictions.map((p) => (
                      <div
                        key={p.place_id}
                        onClick={() => handlePredictionClick(p)}
                        className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                      >
                        <div className="font-medium text-sm">{p.structured_formatting.main_text}</div>
                        <div className="text-xs text-gray-500">{p.structured_formatting.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Confirm panel fixed at bottom */}
            <div className="flex justify-center w-full fixed sm:relative bottom-0 sm:bottom-[35%] left-0 right-0">
               <div className="flex flex-col justify-center p-4 bg-white w-[85%] h-[90%] rounded-lg mb-2 shadow-shadow5px shadow-[#33806b] md:rounded-b-md">
                 <span className="text-base mb-2 font-serif font-semibold">{extractLocation(tempAdds)}</span>
                  <span className="text-sm mb-2 text-gray-600 font-sans font-semibold">{tempAdds}</span>
                   <button className="px-4 py-2 rounded-md w-[98%] bg-emerald-600 text-white" onClick={confirmLocation}> Confirm & Continue
                    </button>
                    </div>
                  </div> 
                </div>}
        {/* Address details form (shown after Confirm & Continue in Add New Address flow) */}
        {showAddressForm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
            <form onSubmit={handleSaveAddress} className="bg-white w-[95%] sm:w-[90%] max-w-lg rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Add Address Details</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Save Address as</label>
                <div className="flex gap-3">
                  {["Home", "Work", "Others"].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setAddressForm((p) => ({ ...p, type: t }))}
                      className={`px-3 py-2 rounded-md border ${addressForm.type === t ? "bg-[#42DCB3] text-white border-transparent" : "bg-white text-gray-700 border-gray-200"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Complete address</label>
                <textarea
                  value={addressForm.completeAddress}
                  onChange={(e) => setAddressForm((p) => ({ ...p, completeAddress: e.target.value }))}
                  className="w-full border rounded-md p-2 text-sm"
                  rows={2}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Building name / Floor</label>
                <input value={addressForm.building} onChange={(e) => setAddressForm((p) => ({ ...p, building: e.target.value }))} className="w-full border rounded-md p-2 text-sm" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Landmark (optional)</label>
                <input value={addressForm.landmark} onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))} className="w-full border rounded-md p-2 text-sm" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Pin code</label>
                <input
                  value={addressForm.pinCode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, pinCode: e.target.value }))}
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="6-digit pin code"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setIsAddingNewAddress(false);
                  }}
                  className="px-4 py-2 rounded-md border"
                >
                  Edit
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-[#42DCB3] text-white">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateLocation;