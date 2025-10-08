import React, { useEffect, useRef, useState, useContext } from "react";
import { MyContext } from "../ContextAPI";
import { loadScript } from "./LocationGate";
import MapLogo from "../Assets/MapLogo.gif";
import GPS from "../Assets/gps.png";
import Next from "../Assets/next.png";
import searcH from "../Assets/search.png";
import { useDebounce } from "../Components/Hooks/useDebounce";
import locationIcon from "../Assets/gps.png";
import Plus from "../Assets/plus.png";
import CustomMarkerImg from "../Assets/gps.png"; // marker png image

function UpdateLocation({ setShowLocation }) {
  const { showMap, setShowMap, addss, setAdss, pickerStep, setPickerStep, statusMsg, setStatusMsg } = useContext(MyContext);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [tempAdds, setTempAddss] = useState("");
  const [selected, setSelected] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const autocompleteInputRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // New: add-new-address flow state and saved addresses
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const v = localStorage.getItem("saved_addresses");
      return v ? JSON.parse(v) : [];
    } catch (e) {
      return [];
    }
  });

  const [addressForm, setAddressForm] = useState({
    type: "Home", // Home | Work | Others
    building: "",
    landmark: "",
    pinCode: "",
    completeAddress: "",
  });

  const defaultCenter = { lat: 25.4358, lng: 81.8463 }; // Prayagraj

  // Autocomplete predictions: run when search screen OR when on map while adding a new address
  useEffect(() => {
    const want = showMap && (pickerStep === "search" || (pickerStep === "map" && isAddingNewAddress));
    if (!want) {
      setPredictions([]);
      // keep searchQuery so typed text persists while switching views
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
        console.error("Places load error:", err);
        setStatusMsg("Failed to load Google Maps Places.");
      });
  }, [showMap, pickerStep, debouncedSearchQuery, isAddingNewAddress]);

  // map init/update
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
          const center = selected ? { lat: selected.lat, lng: selected.lng } : defaultCenter;
          // show reverse-geocode preview (non-blocking)
          checkAndSaveCoords(center, { autoOpenMapIfOutside: true }).catch(() => {});

          const map = new window.google.maps.Map(mapRef.current, { center, zoom: 15 });
          mapInstanceRef.current = map;

          const markerIcon = {
            url: CustomMarkerImg,
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 40),
          };

          const marker = new window.google.maps.Marker({ position: center, map, draggable: true, title: "Drag to set your location", icon: markerIcon });
          markerRef.current = marker;

          listenerClick = map.addListener("click", (e) => {
            const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(e.latLng);
            setSelected(p);
            checkAndSaveCoords(p, { autoOpenMapIfOutside: true }).catch(() => {});
          });

          marker.addListener("dragend", (ev) => {
            const p = ev.latLng ? { lat: ev.latLng.lat(), lng: ev.latLng.lng() } : null;
            if (p) {
              setSelected(p);
              checkAndSaveCoords(p, { autoOpenMapIfOutside: true }).catch(() => {});
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
        console.error("Map load error:", err);
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
          setSelected({ lat, lng });
          setTempAddss(place.formatted_address || place.name);
          setStatusMsg("");
          // ensure map view is active so user can fine tune
          requestAnimationFrame(() => setTimeout(() => { setPickerStep("map"); setShowMap(true); }, 40));
        } else setStatusMsg("Could not retrieve location details. Please try again.");
      }
    );
  };

  // quick flow: validate+save current location
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
          const tempAddress = await checkAndSaveCoords(coords, { autoOpenMapIfOutside: true });
          setTimeout(() => {
            setAdss(tempAddress);
            localStorage.setItem("selected_coords", `${coords.lat},${coords.lng}`);
            localStorage.setItem("selected_address", tempAddress);
            setShowMap(false);
            setPickerStep("search");
            setStatusMsg("");
          }, 350);
        } catch (err) {
          setPickerStep("map");
          setShowMap(true);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
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
        checkAndSaveCoords(coords, { autoOpenMapIfOutside: true }).then((addr) => setTempAddss(addr)).catch(() => {});
      },
      (err) => {
        console.warn("Geolocation failed for add-new:", err);
        setStatusMsg("Unable to detect current location; please pick on map.");
        setPickerStep("map");
        setShowMap(true);
      },
      { timeout: 8000 }
    );
  };

  // reverse geocode + validate
  const checkAndSaveCoords = async (coords, opts = { autoOpenMapIfOutside: true }) => {
    setStatusMsg("Checking selected location...");
    try {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      await loadScript(src);
      if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function")
        throw new Error("Google Maps library not available after loading.");
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode({ location: coords }, (results, geocodeStatus) => {
          if (geocodeStatus !== "OK" || !results || results.length === 0) {
            setStatusMsg("Reverse geocoding failed. Try a different point.");
            reject("Reverse geocoding failed.");
            return;
          }
          let bestResult = null;
          for (const result of results) {
            const formattedAddress = result.formatted_address || "";
            if (formattedAddress.match(/^\w{4}\+\w{4}$/)) continue; // skip plus codes
            if (!bestResult || (formattedAddress && formattedAddress.length > (bestResult.formatted_address || "")))
              bestResult = result;
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
          const lat = coords.lat;
          const lng = coords.lng;
          const prayagrajBounds = { north: 25.6, south: 25.2, west: 81.6, east: 82.0 };
          const inBounds = lat >= prayagrajBounds.south && lat <= prayagrajBounds.north && lng >= prayagrajBounds.west && lng <= prayagrajBounds.east;
          const finalAddress = bestResult.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setTempAddss(finalAddress);
          if ((inUttarPradesh && inPrayagraj) || inBounds) {
            resolve(finalAddress);
            setStatusMsg("Location valid.");
          } else {
            setStatusMsg("Selected location is outside Prayagraj. Please adjust on the map.");
            if (opts.autoOpenMapIfOutside) setPickerStep("map");
            reject("Location outside bounds");
          }
        });
      });
    } catch (err) {
      console.error("Confirm location error:", err);
      setStatusMsg("Error checking location. Try again.");
      return Promise.reject(err);
    }
  };

  // confirm button behavior: if we are in Add New Address flow, open address form, else save & close (original quick flow)
  const confirmLocation = async () => {
    if (!selected) return setStatusMsg("No location selected.");
    const savedAddress = tempAdds || `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`;
    const savedCoords = `${selected.lat},${selected.lng}`;

    if (isAddingNewAddress) {
      // open form to capture additional details and keep address info in addressForm.completeAddress
      setAddressForm((prev) => ({ ...prev, completeAddress: savedAddress }));
      setShowAddressForm(true);
      return;
    }

    // Normal confirm flow (not adding new address) - persist selection and close
    try {
      localStorage.setItem("selected_coords", savedCoords);
      localStorage.setItem("selected_address", savedAddress);
    } catch (e) {
      console.warn("Failed to write selected location to localStorage:", e);
    }
    setAdss(savedAddress);
    setTimeout(() => {
      setShowMap(false);
      setPickerStep("search");
      setStatusMsg("");
    }, 350);
  };

  // helper to extract display name
  function extractLocation(addss) {
    const parts = (addss || "").split(",");
    const firstPart = (parts[0] || "").trim();
    const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/i.test(firstPart);
    const isHouseNumber = /[0-9]/.test(firstPart) && /[\/-]/.test(firstPart);
    if ((isPlusCode || isHouseNumber) && parts.length > 1) return parts[1].trim();
    else return firstPart;
  }

  // Save address from the form into savedAddresses (max 3, one per type)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    const { type, building, landmark, pinCode, completeAddress } = addressForm;
    if (!type || !completeAddress) return setStatusMsg("Please provide address and select a type.");
    if (!pinCode || !/^\d{6}$/.test(pinCode)) return setStatusMsg("Enter a valid 6-digit pin code.");

    // limit: one per type
    if (savedAddresses.some((a) => a.type === type)) {
      setStatusMsg(`You already have a saved address for ${type}.`);
      return;
    }

    const newAddr = {
      id: Date.now(),
      type,
      building,
      landmark,
      pinCode,
      completeAddress,
      coords: selected ? { ...selected } : null,
    };

    const updated = [...savedAddresses, newAddr].slice(0, 3); // keep only up to 3
    setSavedAddresses(updated);
    try {
      localStorage.setItem("saved_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to store saved addresses", e);
    }

    // set chosen address as current
    setAdss(completeAddress);
    try {
      localStorage.setItem("selected_address", completeAddress);
      if (selected) localStorage.setItem("selected_coords", `${selected.lat},${selected.lng}`);
    } catch (e) {}

    // close flows
    setShowAddressForm(false);
    setIsAddingNewAddress(false);
    setShowMap(false);
    setPickerStep("search");
    setStatusMsg("");
  };

  // select a saved address from list
  const handleSelectSavedAddress = (addr) => {
    setAdss(addr.completeAddress);
    try {
      localStorage.setItem("selected_address", addr.completeAddress);
      if (addr.coords) localStorage.setItem("selected_coords", `${addr.coords.lat},${addr.coords.lng}`);
    } catch (e) {}
    setShowMap(false);
    setPickerStep("search");
    setStatusMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col bg-white sm:rounded-lg w-full h-full sm:h-[80%] sm:max-w-xl sm:mx-4 md:mx-0 shadow-lg">
        <div className="flex justify-start p-2 py-4 shadow-md">
          <button
            className=" flex items-center text-sm"
            onClick={() => {
              setShowMap(false);
              setPickerStep("search");
              setStatusMsg("");
              setShowLocation(false);
            }}
          >
            <img src={Next} alt="" className="rotate-180 h-[28px] mr-2" />
            Your Location
          </button>
        </div>

        {pickerStep === "search" ? (
          <div className="px-4 mt-4 flex flex-col flex-grow min-h-0">
            <label className="flex w-full items-center text-sm rounded-md border border-[#33806b] p-3 mb-4 focus-within:ring-2 focus-within:ring-[#33806b] bg-gray-100 text-gray-900">
              <img src={searcH} alt="search" className="h-6 mr-3" />
              <input
                ref={autocompleteInputRef}
                placeholder="Search for area, street name..."
                className="w-full bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xl text-gray-500">
                  &times;
                </button>
              )}
            </label>

            {searchQuery.length > 0 ? (
              <div className="flex-grow overflow-y-auto max-h-[60vh]">
                {predictions.map((p) => (
                  <div
                    key={p.place_id}
                    onClick={() => handlePredictionClick(p)}
                    className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  >
                    <img src={locationIcon} alt="location" className="h-6 w-6 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-800">{p.structured_formatting.main_text}</p>
                      <p className="text-sm text-gray-500">{p.structured_formatting.secondary_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col flex-grow relative items-center pt-2 justify-between text-center text-gray-600 overflow-y-auto" id="ColorCustomScroll">
                <button
                  onClick={useMyCurrentLocation}
                  className="flex w-full mb-3 z-10 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center"
                >
                  <img src={GPS} alt="gps" className="h-6 mr-3" /> Use My Current Location
                </button>

                {/* IMPORTANT: call startAddNewAddress (opens map with current position + confirm) */}
                <button
                  onClick={startAddNewAddress}
                  className="flex justify-between z-10 w-full mb-3 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center"
                >
                  <div className="flex items-center">
                    <img src={Plus} alt="gps" className="h-6 mr-3" /> Add New Address
                  </div>
                  <img src={Next} alt="gps" className="h-6 mr-3" />
                </button>

                <div className="text-sm text-gray-600 min-h-[24px] pt-8 text-center z-10 ">{statusMsg}</div>

                <div className="p-2 rounded-md flex items-center absolute top-28 justify-center mb-6">
                  <img src={MapLogo} alt="" className="h-28" />
                </div>

                {/* Saved addresses list */}
                <div className="m-6 py-2 rounded-lg w-full bg-slate-100 flex flex-col items-start z-10">
                  <h2 className="py-2 font-semibold">Saved Addresses</h2>
                  {savedAddresses.length === 0 ? (
                    <p className="text-sm text-gray-500 px-4 py-2">No saved addresses yet. Add one using "Add New Address".</p>
                  ) : (
                    savedAddresses.map((a) => (
                      <div key={a.id} className="w-full p-3 bg-white rounded-md mb-2 border flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="mr-3 text-sm font-semibold">{a.type}</div>
                          <div className="text-sm text-gray-700 text-left">
                            <div className="font-medium">{a.pinCode || a.type}</div>
                            <div className="text-xs text-gray-500">{a.completeAddress}</div>
                          </div>
                        </div>
                        <button onClick={() => handleSelectSavedAddress(a)} className="px-3 py-2 bg-[#42DCB3] text-white rounded-md">
                          Select
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-wrap relative">
            <div ref={mapRef} className="w-full h-full sm:rounded-b-md" />

            {/* When adding new address, show a search input overlay on the map */}
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
                </div>)}

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
