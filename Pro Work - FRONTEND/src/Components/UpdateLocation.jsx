import React, { useEffect, useRef, useState, useContext } from "react";
import { MyContext } from "../ContextAPI";
import { loadScript } from "./LocationGate";
import MapLogo from "../Assets/MapLogo.gif"
import GPS from "../Assets/gps.png"
import Next from "../Assets/next.png"
import searcH from "../Assets/search.png"


function UpdateLocation() {
    const { showMap, setShowMap, addss, setAdss, pickerStep, setPickerStep, statusMsg, setStatusMsg } = useContext(MyContext);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [loadingMap, setLoadingMap] = useState(false);
    const [tempAdds, setTempAddss] = useState('');
    const [selected, setSelected] = useState(null); // {lat,lng}
    
    const autocompleteInputRef = useRef(null);
    const acRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const defaultCenter = { lat: 25.4358, lng: 81.8463 }; // Prayagraj

    // handles the initialization, updates, and cleanup of a Google Maps instance.
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

            // create map only once
            if (!mapInstanceRef.current) {
                const center = selected ? { lat: selected.lat, lng: selected.lng } : defaultCenter;
                checkAndSaveCoords(center, { autoOpenMapIfOutside: true });
                console.log("Initializing map at", center);
                const map = new window.google.maps.Map(mapRef.current, { center, zoom: 13 });
                mapInstanceRef.current = map;

                const marker = new window.google.maps.Marker({ position: center, map, draggable: true, title: "Drag to set your location"});
                markerRef.current = marker;

                // map click -> move marker
                listenerClick = map.addListener("click", (e) => {
                    const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(e.latLng);
                    setSelected(p); 
                });
                
                marker.addListener("dragend", (ev) => {
                    const p = ev.latLng ? { lat: ev.latLng.lat(), lng: ev.latLng.lng() } : null;
                    if (p) { 
                        setSelected(p);
                        checkAndSaveCoords(p, { autoOpenMapIfOutside: true });
                    }

                    
                });

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        try {
                            if (window.google && window.google.maps && map) {
                                window.google.maps.event.trigger(map, "resize");
                                map.setCenter(center);
                            }
                        } catch (e) { /* ignore */ }
                    }, 50);
                });
            } else {
                const map = mapInstanceRef.current;
                if (selected && markerRef.current) {
                    const pos = new window.google.maps.LatLng(selected.lat, selected.lng);
                    try {
                        markerRef.current.setPosition(pos);
                        map.panTo(pos);
                    } catch (e) { /* ignore */ }
                } else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition( (pos) => {
                            const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            map.setCenter(p);
                            if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(new window.google.maps.LatLng(p.lat, p.lng));
                        },
                        () => {
                            map.setCenter(defaultCenter);
                            if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(new window.google.maps.LatLng(defaultCenter.lat, defaultCenter.lng));
                        },
                        { 
                            timeout: 5000 
                        });
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
                if (listenerClick && window.google && window.google.maps && window.google.maps.event) {
                    window.google.maps.event.removeListener(listenerClick);
                }
            } catch (_) {}

            if (mapInstanceRef.current) {
                try {
                    const oldDiv = mapInstanceRef.current.getDiv && mapInstanceRef.current.getDiv();
                    if (!oldDiv || oldDiv !== mapRef.current) {
                        try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(mapInstanceRef.current); } catch (_) {}
                        mapInstanceRef.current = null;
                        markerRef.current = null;
                    }
                } catch (e) {
                    mapInstanceRef.current = null;
                    markerRef.current = null;
                }
            } 
        } 
    }, [showMap, pickerStep]); 

    // responsible for updating the position of the marker on the map whenever the selected state changes.
    useEffect(() => {
        if (!selected) return;
        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        if (!map || !marker) return;

        try {
            const mapDiv = map.getDiv && map.getDiv();
            if (!mapDiv || mapDiv !== mapRef.current) {
            try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(map); } catch (_) {}
            mapInstanceRef.current = null;
            return;
        }
        } catch (e) {
            mapInstanceRef.current = null;
            return;
        }

        const pos = new window.google.maps.LatLng(selected.lat, selected.lng);
        try { 
            if (marker.setPosition) marker.setPosition(pos);
            map.panTo(pos);
        } catch (e) {
            console.warn("Failed to update marker position:", e);
        }
    }, [selected]);

    // The purpose of this effect is to ensure that when the map is closed and then reopened, it starts with a fresh, clean state.
    useEffect(() => {
        if (!showMap) {    
            try {
                if (markerRef.current) {
                    try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(markerRef.current); } catch (_) {}
                    markerRef.current = null;
                }
                if (mapInstanceRef.current) {
                    try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(mapInstanceRef.current); } catch (_) {}
                    mapInstanceRef.current = null;
                }
            } catch (e) { /* ignore */}
        }
    }, [showMap]);

    // This effect is responsible for loading the Google Maps Places library and setting up the autocomplete functionality on an input field.
    useEffect(() => {
        if (!showMap || pickerStep !== "search") return;
    
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
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const inputEl = autocompleteInputRef.current;
                    if (!inputEl) return;
                    inputEl.style.background = "#f3f4f6";
                    // inputEl.style.color = "#111827";
                    inputEl.style.border = "0px solid transparent";
                    inputEl.style.outline = "none";
 

                    try { inputEl.focus(); } catch(e) { /* ignore */ }
                    
                    try {
                        if (acRef.current) {
                            if (acRef.current.unbindAll) acRef.current.unbindAll();
                            acRef.current = null;
                        }
                    } catch (e) { /* ignore */ }
    
                    if (window.google && window.google.maps && window.google.maps.places) {
                        const ac = new window.google.maps.places.Autocomplete(inputEl, {
                            fields: ["geometry", "formatted_address", "address_component", "name"],
                        });

                        acRef.current = ac;
    
                        const listener = ac.addListener("place_changed", () => {
                            const place = ac.getPlace();
                            if (place && place.geometry && place.geometry.location) {
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                setSelected({ lat, lng });
                                setTempAddss(place.formatted_address || place.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                                setPickerStep("map");

                                const savedCoords = `${lat},${lng}`;
                                const savedAddress = place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                console.log(savedAddress)

                                setTempAddss(savedAddress);

                                // localStorage.setItem("selected_coords", savedCoords);
                                // localStorage.setItem("selected_address", savedAddress);
                            } else {
                                setStatusMsg("Please select a suggestion from the dropdown.");
                            }
                        });
    
                        acRef.current._listener = listener;
                    } else {
                        setStatusMsg("Places library not available.");
                    }
                }, 60); 
            });
        })
        .catch((err) => {
          console.error("Places load error:", err);
          setStatusMsg("Failed to load Places. Check API key / network.");
          setLoadingMap(false);
        });
    return () => {
        try {
            if (acRef.current) {
                if (acRef.current._listener && window.google && window.google.maps && window.google.maps.event) {
                    window.google.maps.event.removeListener(acRef.current._listener);
                }
                acRef.current = null;
            }
        } catch (e) { /* ignore */ }
    }}, [showMap, pickerStep]);

    // This function attempts to get the user's current geographic location using the browser's Geolocation API.
    const useMyCurrentLocation = async () => {
        setStatusMsg("Detecting your current location...");
        if (!navigator.geolocation) {
            setStatusMsg("Geolocation not available in this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition( async (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // setSelected(coords);
            // attempt to auto-validate and close; if outside, open map
            const tempAddress = await checkAndSaveCoords(coords, { autoOpenMapIfOutside: true });
            setTimeout(() => {
                
                setAdss(tempAddress)

                localStorage.setItem("selected_coords", coords);
                localStorage.setItem("selected_address", tempAddress);
                
                setShowMap(false);
                setPickerStep("search");
                setStatusMsg("");
            }, 350);
        },
        (err) => {
            console.warn("Geolocation error:", err);
            setStatusMsg("Unable to detect your location. You can pick manually.");
            setPickerStep("map");
        },
        { 
            timeout: 8000 
        });
    };

    // This function performs reverse geocoding to convert geographic coordinates (latitude and longitude) into a human-readable address.
    const checkAndSaveCoords = async (coords, opts = { autoOpenMapIfOutside: true }) => {
    setStatusMsg("Checking selected location...");
    try {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places}`;
        await loadScript(src);

        if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function") {
            throw new Error("Google Maps library not available after loading.");
        }

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

                    if (formattedAddress.match(/^\w{4}\+\w{4}$/)) {
                        continue;  // Skip Plus Code results
                    }

                    if (!bestResult || (formattedAddress && formattedAddress.length > (bestResult.formatted_address || "").length)) {
                        bestResult = result;
                    }
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

                setTempAddss(bestResult.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

                if ((inUttarPradesh && inPrayagraj) || inBounds) {
                    const savedCoords = `${lat},${lng}`;
                    const savedAddress = bestResult.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                    console.log("Location validated:", savedAddress);

                    setTempAddss(savedAddress);
                    resolve(savedAddress);  // Resolve the promise with the address
                    setStatusMsg("Location saved.");
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
        return Promise.reject(err); // Reject the promise if there's an error
    }
};

    
    // This function is called when the user confirms their selected location.
    const confirmLocation = async () => {
        if (!selected) return setStatusMsg("No location selected.");

        setAdss(tempAdds)
        setTimeout(() => {
            setShowMap(false);
            setPickerStep("search");
            setStatusMsg("");
        }, 350);
    };

    // This function extracts a simplified location name from a full address string.
    function extractLocation(addss) {
        const parts = addss.split(',');
        const firstPart = parts[0].trim();

        // Match plus codes like "9RQC+MR7"
        const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/i.test(firstPart);

        // Match house numbers like "122H/2J", "B-23", etc.
        // Must contain at least one digit AND either "/" or "-"
        const isHouseNumber = /[0-9]/.test(firstPart) && /[\/-]/.test(firstPart);

        if ((isPlusCode || isHouseNumber) && parts.length > 1) {
            return parts[1].trim(); // Return second part
        } else {
            return firstPart; // Return first part
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white sm:rounded-lg w-full h-full sm:h-[80%] sm:max-w-xl sm:mx-4 md:mx-0 shadow-lg">
                <div className="flex justify-start p-2 py-4 shadow-md">
                    <button className=" flex items-center text-sm" onClick={() => { setShowMap(false); setPickerStep("search"); setStatusMsg(""); }}>
                        <img src={Next} alt="" className="rotate-180 h-[28px] mr-2" />
                        Your Location
                    </button>
                </div>

                {pickerStep === 'search' ? 
                    <div className="px-4 mt-4">
                        {/* <h3 className="text-lg font-semibold mb-3">Your Location</h3> */}
                        <label className="flex w-full text-sm rounded-md border border-[#33806b] p-3 mb-4 focus:outline-none bg-gray-100 text-gray-900">
                            <img src={searcH} alt="" className="h-6 mr-2" />
                            <input ref={autocompleteInputRef} placeholder="Search a new address"  />
                        </label>

                        <button onClick={useMyCurrentLocation} className="flex w-full mb-3 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3" >
                            
                            <img src={GPS} alt="" className="h-6 mr-2" />
                            Use My Current Location
                        </button>

                        <div className="text-sm text-gray-600 min-h-[24px]">{statusMsg}</div>

                        <div className="mt-6 flex justify-center">
                            <img src={MapLogo} alt="illustration" className="w-64 sm:w-48 opacity-90" />
                        </div>
                    </div>
                : 
                    <div className="w-full h-full flex flex-wrap">
                       <div ref={mapRef} className="w-full h-full sm:rounded-b-md " />

                        <div className="flex justify-center w-full fixed sm:relative bottom-0 sm:bottom-[35%] left-0 right-0">
                            <div className="flex flex-col justify-center p-4 bg-white w-[85%] h-[90%] rounded-lg mb-2 shadow-shadow5px shadow-[#33806b] md:rounded-b-md">
                                <span className="text-base mb-2 font-serif font-semibold">{extractLocation(tempAdds)}</span>
                                <span className="text-sm mb-2 text-gray-600 font-sans font-semibold">{tempAdds}</span>
                            
                                <button className="px-4 py-2 rounded-md w-[98%] bg-emerald-600 text-white" onClick={confirmLocation}>
                                     Confirm & Continue
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default UpdateLocation