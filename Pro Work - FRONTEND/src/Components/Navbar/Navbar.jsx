// Packages
import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
// Styles
import './Navbar.css'

// Components
import AlgoSearch from '../AlgoSearch/AlgoSearch'

// Functions
import { showSignUpForm } from '../SignUpForm/signUp'
import { MyContext } from '../../ContextAPI'

// Assets
import Menu_Y from '../../Assets/equal_Y.png'
import Menu_G from '../../Assets/equal_G.png'

import Close_Y from '../../Assets/close_Y.png';
import Close_G from '../../Assets/close_G.png';
import User from '../../Assets/nav_user.png'
import User_Y from '../../Assets/user_Y.png'
import User_G from '../../Assets/user_G.png'
import SearchIcon_Y from "../../Assets/nav_search_Y.png";
import SearchIcon_G from "../../Assets/nav_search_G.png";
import ProworkLogo from '../../Assets/ProworkLogo.png';
import DownArrow from '../../Assets/down-arrow.png';    

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


function Navbar() {
    const { UserData, SessionID } = useContext(MyContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHamOpen, setIsHamOpen] = useState(false); 
    const phoneListRef = useRef(null);

    const [placeholder, setPlaceholder] = useState("Search");

    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [isHamHovered, setIsHamHovered] = useState(false);

    const handleEnterUser = () => setIsUserHovered(true);
    const handleLeaveUser = () => setIsUserHovered(false);

    const handleEnterSearch = () => setIsSearchHovered(true);
    const handleLeaveSearch = () => setIsSearchHovered(false);

    const handleEnterHam = () => setIsHamHovered(true);
    const handleLeaveHam = () => setIsHamHovered(false);

     const navigate = useNavigate();
     const [pickerStep, setPickerStep] = useState("search");
      const mapRef = useRef(null);
      const markerRef = useRef(null);
      const [showMap, setShowMap] = useState(false);
      const [loadingMap, setLoadingMap] = useState(false);
      const [statusMsg, setStatusMsg] = useState("");
      const [selected, setSelected] = useState(null); // {lat,lng}

      const autocompleteInputRef = useRef(null);
      const acRef = useRef(null);
      const mapInstanceRef = useRef(null);

      const [addss, setAdss] = useState("");
    
      // default center: approximate Prayagraj center
      const defaultCenter = { lat: 25.4358, lng: 81.8463 };
    

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
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
        });
        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: "Drag to set your location",
        });
        markerRef.current = marker;

        // map click -> move marker
        listenerClick = map.addListener("click", (e) => {
          const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(e.latLng);
          setSelected(p); // this won't recreate the map because map init is guarded above
        });

        marker.addListener("dragend", (ev) => {
          const p = ev.latLng ? { lat: ev.latLng.lat(), lng: ev.latLng.lng() } : null;
          if (p) setSelected(p);
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
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                map.setCenter(p);
                if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(new window.google.maps.LatLng(p.lat, p.lng));
              },
              () => {
                map.setCenter(defaultCenter);
                if (markerRef.current && markerRef.current.setPosition) markerRef.current.setPosition(new window.google.maps.LatLng(defaultCenter.lat, defaultCenter.lng));
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
  } } }, [showMap, pickerStep]); 

useEffect(() => {
  if (!showMap) {
    // modal closed: clear stored map & marker so next open is clean
    try {
      if (markerRef.current) {
        try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(markerRef.current); } catch (_) {}
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try { window.google && window.google.maps && window.google.maps.event.clearInstanceListeners(mapInstanceRef.current); } catch (_) {}
        mapInstanceRef.current = null;
      }
    } catch (e) {
    }
  }
}, [showMap]);


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



useEffect(() => {
  try {
    const coords = localStorage.getItem("selected_coords");
    const addr = localStorage.getItem("selected_address");

    if (addr) {
      setAdss(addr);
    }

    if (coords) {
      const parts = coords.split(",").map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        setSelected({ lat: parts[0], lng: parts[1] });
      }
    }
  } catch (e) {
    console.warn("Failed to read saved location:", e);
  }
}, []);



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
          inputEl.style.background = "#ffffff";
          inputEl.style.color = "#111827";

          try { inputEl.focus(); } catch(e) {}

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
                setAdss(place.formatted_address || place.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                setPickerStep("map");
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
} }, [showMap, pickerStep]);



    const checkAndSaveCoords = async (coords, opts = { autoOpenMapIfOutside: true }) => {
      setStatusMsg("Checking selected location...");
      try {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        await loadScript(src);

        if (!window.google || !window.google.maps || typeof window.google.maps.Geocoder !== "function") {
          throw new Error("Google Maps library not available after loading.");
        }
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ location: coords }, (results, geocodeStatus) => {
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
          const inPrayagraj = cityCandidates.some((n) => n && prayagrajNames.some((name) => n.includes(name)));

          // coordinate fallback bounding box (approx)
          const lat = coords.lat;
          const lng = coords.lng;
          const prayagrajBounds = { north: 25.6, south: 25.2, west: 81.6, east: 82.0 };
          const inBounds = lat >= prayagrajBounds.south && lat <= prayagrajBounds.north && lng >= prayagrajBounds.west && lng <= prayagrajBounds.east;

          // set short preview from the formatted address when available
          setAdss(results[0].formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

          if ((inUttarPradesh && inPrayagraj) || inBounds) {
            // success — save selected coords and the formatted address, then close modal
            const savedCoords = `${lat},${lng}`;
            const savedAddress = results[0].formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

           localStorage.setItem("selected_coords", savedCoords);
           localStorage.setItem("selected_address", savedAddress);

           // update local state (so navbar updates immediately)
           setAdss(savedAddress);

           setStatusMsg("Location saved. Closing...");
           setTimeout(() => {
            setShowMap(false);
            setPickerStep("search");
            setStatusMsg("");
           }, 350);
          }
          else {
            setStatusMsg("Selected location is outside Allahabad / Prayagraj. Please adjust on the map.");
            if (opts.autoOpenMapIfOutside) setPickerStep("map");
          }
        });
      } catch (err) {
        console.error("Confirm location error:", err);
        setStatusMsg("Error checking location. Try again.");
      }
    };

    const confirmLocation = async () => {
      if (!selected) return setStatusMsg("No location selected.");
      await checkAndSaveCoords(selected, { autoOpenMapIfOutside: true });
    };

    // "Use my current location" handler used in search modal
    const useMyCurrentLocation = () => {
      setStatusMsg("Detecting your current location...");
      if (!navigator.geolocation) {
        setStatusMsg("Geolocation not available in this browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setSelected(coords);
          // attempt to auto-validate and close; if outside, open map
          checkAndSaveCoords(coords, { autoOpenMapIfOutside: true });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setStatusMsg("Unable to detect your location. You can pick manually.");
          setPickerStep("map");
        },
        { timeout: 8000 }
      );
    };


    const truncateAddress = (addr, words = 2) => {
      if (!addr) return "";
      const parts = addr.trim().split(/\s+/);
      if (parts.length <= words) return addr;
      return parts.slice(0, words).join(" ") + "...";
    };


    const clearSelected = () => {
      localStorage.removeItem("selected_coords");
      localStorage.removeItem("selected_address");
      setStatusMsg("Saved selection cleared.");
      setSelected(null);
      setAdss("");
    };


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) { setIsScrolled(true) }
            else { setIsScrolled(false) }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
    const placeholders = [ "Search electricians", "Search plumbers", "What service are you looking for?", "What is your location?", "Try Searching area..." ];
    let index = 0;
    const interval = setInterval(() => {
      setPlaceholder(placeholders[index]);
      index = (index + 1) % placeholders.length;
    }, 3000);
    return () => clearInterval(interval);
    }, []);

    const scrollTop0 = () => window.scrollTo({ top: 0, behavior: "smooth" });

    function toggleNavbarMenu() {
        if (phoneListRef.current) {
            phoneListRef.current.classList.toggle('nav-phone-list-moveDown', !isHamOpen);
            phoneListRef.current.classList.toggle('nav-phone-list-moveUp', isHamOpen);
            setIsHamOpen(prevState => !prevState);
        }
    }

    function ShowSmallSearch(){
        const SmallSearch = document.getElementById('SmallSearch')
        SmallSearch.classList.add('displayFlex')
        SmallSearch.classList.remove('displayNone')
    }


    return (
        <>
        <div className={`fixed top-0 left-0 right-0 flex flex-wrap justify-center h-[120px] w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} ${isHamOpen ? 'bg-white shadow-md' : 'bg-transparent'}`} id='Navbar'>
            <div className="flex justify-between items-center h-2/3 w-full max-w-[1250px] mx-auto px-4 xl:px-0">

                {/* Brand Logo */}
                <Link to='/' ><img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' /></Link>

                {/* My Location Component */}
                <div onClick={() => { setShowMap(true); setPickerStep("search"); setStatusMsg(""); }} className='flex flex-wrap w-[40%] xxxs:w-[50%] xxs:w-[55%] ssm:w-[27%] h-[60%] md:h-[70%] md:ml-4 ml-1 pt-3 xxxs:pt-2 px-2 mt-1 cursor-pointer'>
                    <div className=' w-full text-[12px] xxxs:text-[14px] md:text-sm text-[#f2da1d] leading-loose'>Your Location</div>
                    <div className='text-[10px] xxxs:text-[12px] font-bold md:text-sm font-sans text-[#33806b] flex justify-between items-center'>
                        <span title={addss || ""}>
                        {addss ? truncateAddress(addss, 4) : "Select your location"}
                        </span>
                        <img src={DownArrow} alt="" className='h-5' />
                    </div>
                </div>

                {/* Search Component */}
                <AlgoSearch isScrolled={isScrolled} />

                {/* Phone Navbar */}
                <div className='flex sm:hidden justify-between items-center'>
                    <div className='flex justify-between items-center w-full'>
                    
                        <button onClick={toggleNavbarMenu} className="relative">
                            <img className={`cursor-pointer ${isHamOpen ? "h-6 px-2" : "h-10"}`} 
                                src={ isHamOpen ?  
                                    isScrolled ? (isHamHovered ? Close_Y : Close_G)  : (isHamHovered ? Close_G : Close_Y) 
                                    :
                                    isScrolled ? (isHamHovered ? Menu_Y : Menu_G)  : (isHamHovered ? Menu_G : Menu_Y) 
                                } 
                                alt={isHamOpen ? "close" : "menu"} 
                                onMouseEnter={handleEnterHam}
                                onMouseLeave={handleLeaveHam}
                            />
                        </button>

                        {SessionID.SessionID ? (
                            <Link to={`/my-profile/${UserData.UserObjectID}`}>
                                <img
                                    className="h-10 transition duration-200"
                                    src={ isScrolled ? (isUserHovered ? User_Y : User_G)  : (isUserHovered ? User_G : User_Y) }
                                    alt="user"
                                    onMouseEnter={handleEnterUser}
                                    onMouseLeave={handleLeaveUser}
                                />
                            </Link>
                            ) 
                            : 
                            (<button className="bg-[#f2da1d] text-[#33806b] text-xs font-bold px-4 py-[0.5rem] rounded-full shadow hover:opacity-90 transition duration-300" onClick={showSignUpForm}>Sign Up</button>)
                        }
                    </div>
                </div>

                {/* Mobile Menu */}
                <div id='PhoneList' ref={phoneListRef} className={`fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white text-black transition-transform duration-300 ease-in-out ${isHamOpen ? 'nav-phone-list-moveDown' : 'nav-phone-list-moveUp'}`}>
                    <div className="flex flex-col p-8 space-y-6">
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(); scrollTop0() }} to="/">HOME</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(); scrollTop0() }} to="/services">SERVICES</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(); scrollTop0() }} to='/explore'>EXPLORE</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(); scrollTop0() }} to="/about-us">ABOUT US</Link>
                    </div>
                </div>

                {/* Desktop Navbar */}
                <div className='hidden sm:flex justify-evenly items-center sm:w-[65%] md:w-[55%] lg:w-[50%]'>
                <label htmlFor="searchInput" className="lg:hidden justify-center items-center" onClick={ShowSmallSearch}>
                    <img  className="h-9 cursor-pointer" 
                        src={ isScrolled ? (isSearchHovered ? SearchIcon_Y : SearchIcon_G) : (isSearchHovered ? SearchIcon_G : SearchIcon_Y) }   
                        alt="search" 
                        onMouseEnter={handleEnterSearch}
                        onMouseLeave={handleLeaveSearch} 
                    />
                </label>
                <Link to='/services'><span className={`text-sm lg:text-base ${isScrolled ? 'text-[#33806B]' : 'text-[#f2da1d]'} ${isScrolled ? 'hover:text-[#f2da1d]' : 'hover:text-[#33806B]'} transition-colors`} onClick={scrollTop0}>SERVICES</span></Link>
                <Link to='/explore'><span className={`text-sm lg:text-base ${isScrolled ? 'text-[#33806B]' : 'text-[#f2da1d]'} ${isScrolled ? 'hover:text-[#f2da1d]' : 'hover:text-[#33806B]'} transition-colors`} onClick={scrollTop0}>EXPLORE</span></Link>
                <Link to='/about-us'><span className={`text-sm lg:text-base ${isScrolled ? 'text-[#33806B]' : 'text-[#f2da1d]'} ${isScrolled ? 'hover:text-[#f2da1d]' : 'hover:text-[#33806B]'} transition-colors`} onClick={scrollTop0}>ABOUT US</span></Link>

                {SessionID.SessionID ?
                    (<Link to={`/my-profile/${UserData.UserObjectID}`}>
                        <img
                            className="h-10 transition duration-200"
                            src={ isScrolled ? (isUserHovered ? User_Y : User_G)  : (isUserHovered ? User_G : User_Y) }
                            alt="user"
                            onMouseEnter={handleEnterUser}
                            onMouseLeave={handleLeaveUser}
                        />
                    </Link>) 
                    : 
                    (<button className="bg-[#f2da1d] text-[#33806b] font-bold px-6 py-3 rounded-full shadow hover:opacity-90 transition duration-300" onClick={showSignUpForm}>Sign Up</button>)
                }
            </div>
        </div>
            <div className='flex justify-between items-center h-1/3 w-full max-w-[1250px] mx-auto px-4 xl:px-0 '>
               
                <div className='flex items-center pl-1 border rounded-full border-[#33806b] w-full h-[80%]'>
                    <label htmlFor="searchInput" className="md:hidden flex justify-center items-center" onClick={ShowSmallSearch}>
                        <img  
                            className="h-6 cursor-pointer" 
                            src={ isScrolled ? (isSearchHovered ? SearchIcon_Y : SearchIcon_G)  : (isSearchHovered ? SearchIcon_G : SearchIcon_Y) }
                            alt="search" 
                            onMouseEnter={handleEnterSearch}
                            onMouseLeave={handleLeaveSearch} 
                        />
                        <input type="text" className="w-full ml-4 text-gray-800 placeholder-gray-500 text-xs bg-transparent focus:outline-none" placeholder={placeholder}/>
                    </label>
                </div>
            </div>
        </div>

        {/* ---------- modal (search -> map) ---------- */}
        {showMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4 md:mx-0 shadow-lg">
              <div className="flex justify-end p-2">
                <button className="text-gray-600 hover:text-gray-900" onClick={() => { setShowMap(false); setPickerStep("search"); setStatusMsg(""); }}>
                  ✕
                </button>
              </div>

              {pickerStep === 'search' ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Your Location</h3>
                  <input
                     ref={autocompleteInputRef}
                     placeholder="Search a new address"
                     className="w-full rounded-md border border-gray-200 p-3 mb-4 focus:outline-none bg-white text-gray-900"
                  />

                  <button
                    onClick={useMyCurrentLocation}
                    className="w-full mb-3 rounded-md border border-red-100 bg-white text-red-600 font-semibold p-3"
                  >
                    📍 Use My Current Location
                  </button>

                  <div className="text-sm text-gray-600 min-h-[24px]">{statusMsg}</div>

                  <div className="mt-6 flex justify-center">
                    <img src="https://i.imgur.com/3kP4F1M.png" alt="illustration" className="w-64 opacity-90" />
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Choose your location</h3>
                  <p className="text-sm text-gray-600 mb-3">{statusMsg || "Drag the marker or click the map to set location. Then Confirm."}</p>
                  <div ref={mapRef} className="w-full h-80 rounded-md mb-3" />
                  <div className="flex justify-center gap-3 pb-4">
                    <button className="px-4 py-2 rounded-md border" onClick={() => { setPickerStep('search'); setStatusMsg(''); }}>
                      Back
                    </button>
                    <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={confirmLocation}>
                      Confirm & Continue
                    </button>
                    <button className="px-4 py-2 rounded-md bg-red-500 text-white" onClick={clearSelected}>
                      Clear saved selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </>
    )
}

export default Navbar