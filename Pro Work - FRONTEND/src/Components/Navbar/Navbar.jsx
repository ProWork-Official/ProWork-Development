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
      const mapRef = useRef(null);
      const markerRef = useRef(null);
      const [showMap, setShowMap] = useState(false);
      const [loadingMap, setLoadingMap] = useState(false);
      const [statusMsg, setStatusMsg] = useState("");
      const [selected, setSelected] = useState(null); // {lat,lng}

      const [addss, setAdss] = useState("");
    
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
        setAdss(cityCandidates[5])

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

          console.log("KKK")

        if ((inUttarPradesh && inPrayagraj) || inBounds) {
          console.log('inside')
          // success — save selected coords and redirect
          localStorage.setItem("selected_coords", `${lat},${lng}`);
          setStatusMsg("Location saved. Redirecting...");
          setTimeout(() => setShowMap(false), 400);
        } else {
          console.log('outside')
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
        <div className={`fixed top-0 left-0 right-0 flex flex-wrap justify-center h-[120px] w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} ${isHamOpen ? 'bg-white shadow-md' : 'bg-transparent'}`} id='Navbar'>
            <div className="flex justify-between items-center h-2/3 w-full max-w-[1250px] mx-auto px-4 xl:px-0">

                {showMap && 
                <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }} className={showMap ? "fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[100]" : "hidden"}>
      <div style={{ width: "100%", maxWidth: 900, textAlign: "center", background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
                <>
            <h2 style={{ marginBottom: 8 }}>Choose your location (drag marker or click map)</h2>
            <p style={{ marginBottom: 12, color: "#444" }}>{statusMsg || "Drag the marker or click the map to set location. Then Confirm."}</p>

            <div ref={mapRef} style={{ width: "100%", height: 400, borderRadius: 8, marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setShowMap(false); setStatusMsg(""); }} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" }}>
                Cancel
              </button>

              <button onClick={confirmLocation} style={{ padding: "8px 14px", borderRadius: 6, background: "#33806b", color: "white", border: "none" }}>
                Confirm location
              </button>

              <button onClick={clearSelected} style={{ padding: "8px 14px", borderRadius: 6, background: "#ef4444", color: "white", border: "none" }}>
                Clear saved selection
              </button>
            </div>
          </>
          </div>
          </div>
                }

                {/* Brand Logo */}
                <Link to='/' ><img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' /></Link>

                {/* My Location Component */}
                <div onClick={() => setShowMap(true)} className='flex flex-wrap w-[40%] xxxs:w-[50%] xxs:w-[55%] ssm:w-[27%] h-[60%] md:h-[70%] md:ml-4 ml-1 pt-3 xxxs:pt-2 px-2 mt-1 cursor-pointer'>
                    <div className=' w-full text-[12px] xxxs:text-[14px] md:text-sm text-[#f2da1d] leading-loose'>Your Location</div>
                    <div className='text-[10px] xxxs:text-[12px] font-bold md:text-sm font-sans text-[#33806b] flex justify-between items-center'>
                        {/* 36/7, kajipur naini... */}
                        {addss ? addss : "Select your location"}
                        
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
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(),  scrollTop0() }} to="/">HOME</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(),  scrollTop0() }} to="/services">SERVICES</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(),  scrollTop0() }} to='/explore'>EXPLORE</Link>
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(),  scrollTop0() }} to="/about-us">ABOUT US</Link>
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
  )
}

export default Navbar