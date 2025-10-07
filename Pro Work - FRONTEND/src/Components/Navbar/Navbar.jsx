// Packages
import { useState, useEffect, useContext, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import UpdateLocation from '../UpdateLocation'

// Styles
import './Navbar.css'

// Components
import AlgoSearch from '../AlgoSearch/AlgoSearch'

// Functions
import { showSignUpForm } from '../SignUpForm/signUp'
import { MyContext } from '../../ContextAPI'
import { loadScript } from '../LocationGate'

// Assets
import Menu_Y from '../../Assets/equal_Y.png'
import Menu_G from '../../Assets/equal_G.png'
import Close_Y from '../../Assets/close_Y.png';
import Close_G from '../../Assets/close_G.png';
import User_Y from '../../Assets/user_Y.png'
import User_G from '../../Assets/user_G.png'
import SearchIcon_Y from "../../Assets/nav_search_Y.png";
import SearchIcon_G from "../../Assets/nav_search_G.png";
import ProworkLogo from '../../Assets/ProworkLogo.png';
import DownArrow from '../../Assets/down-arrow.png';    


function Navbar() {
  const { UserData, SessionID, addss, showMap, setShowMap, pickerStep, setPickerStep, statusMsg, setStatusMsg } = useContext(MyContext);
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
  
    
  

  




    const truncateAddress = (addr, words) => {
      if (!addr) return "";
      const parts = addr.trim().split(/\s+/);
    //   console.log(parts);
      if (parts.length <= words) return addr;
      return parts.slice(0, words).join(" ") + "...";
    };

    function extractLocation2(addss) {
    const parts = addss.split(',').map(part => part.trim());
    const firstPart = parts[0];

    // Match plus codes like "9RQC+MR7"
    const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/i.test(firstPart);

    // Match house numbers like "122H/2J", "B-23", etc.
    const isHouseNumber = /[0-9]/.test(firstPart) && /[\/-]/.test(firstPart);

    if ((isPlusCode || isHouseNumber) && parts.length > 1) {
        // Remove the first part and return the rest joined back with commas
        const filteredParts = parts.slice(1).join(', ');
        return truncateAddress(filteredParts, 2)
    } else {
        // Return the full address as-is
        const filteredParts = addss.trim();
        return truncateAddress(filteredParts, 2)
    }
}



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

    const previousAddss = localStorage.getItem("selected_address");

    function extractLocation1(address) {
    if (!address || typeof address !== 'string') return '';

    const parts = address.split(',').map(part => part.trim());
    if (parts.length === 0) return '';

    // Lowercase lists for checking
    const roadKeywords = [
        'road', 'street', 'marg', 'station', 'circle', 'lane', 'nagar',
        'bazaar', 'unnamed', 'highway', 'expressway', 'bypass', 'rd'
    ];

    const commercialKeywords = [
        'shop', 'floor', 'gate', 'centre', 'crossing', 'apartment', 'complex',
        'service', 'building', 'hospital', 'mall', 'near', 'opp', 'opposite', 'hall', 'landmark'
    ];

    const genericAreas = [
        'prayagraj', 'uttar pradesh', 'india', 'division', 'state', 'country'
    ];

    // Helper to check if a part should be skipped
    const shouldSkip = (part) => {
        const partLower = part.toLowerCase();

        // Skip if numeric-like (e.g. "44", "5d", "9/5", "211001")
        if (/^\d{3,6}$/.test(part)) return true;

        // Skip if road/infrastructure/commercial/broad location
        if (roadKeywords.some(k => partLower.includes(k))) return true;
        if (commercialKeywords.some(k => partLower.includes(k))) return true;
        if (genericAreas.some(k => partLower === k || partLower.includes(k))) return true;

        return false;
    };

    // Try to find the most specific usable location, starting from the middle of the address
    const middleStart = Math.floor(parts.length / 2);
    for (let i = middleStart; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!shouldSkip(part)) return part;
    }
    for (let i = middleStart - 1; i >= 0; i--) {
        const part = parts[i].trim();
        if (!shouldSkip(part)) return part;
    }

    return '';
}


    return (
        <>
        <div className={`fixed top-0 left-0 right-0 flex flex-wrap justify-center h-[120px] sm:h-20 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} ${isHamOpen ? 'bg-white shadow-md' : 'bg-transparent'}`} id='Navbar'>
            <div className="flex justify-between items-center h-2/3 sm:h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">

                {/* Brand Logo */}
                <Link to='/' ><img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' /></Link>

                {/* My Location Component */}
                <div onClick={() => { setShowMap(true); setPickerStep("search"); setStatusMsg(""); }} className='flex flex-wrap w-[40%] xxxs:w-[50%] xxs:w-[55%] ssm:w-[27%] h-[60%] md:h-[70%] md:ml-4 ml-1 pt-3 xxxs:pt-2 px-2 mt-1 cursor-pointer'>
                    <div className=' w-full text-[12px] xxxs:text-[14px] md:text-sm text-[#f2da1d] leading-loose'>Your Location</div>
                    <div className='text-[10px] xxxs:text-[12px] font-bold md:text-sm font-sans text-[#33806b] flex justify-between items-center'>
                        <span title={addss || ""}>
                            {extractLocation1(addss? addss : previousAddss)} - {addss ? extractLocation2(addss) : previousAddss? extractLocation2(previousAddss) : "Select your location"}
                        {/* {addss ? truncateAddress(addss, 2) : previousAddss? truncateAddress(previousAddss, 3) : "Select your location"} */}
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
                    (<Link to='account'>
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
            <div className='flex sm:hidden justify-between items-center h-1/3 w-full max-w-[1250px] mx-auto px-4 xl:px-0 '>
               
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
        {showMap && <UpdateLocation />}
        </>
    )
}

export default Navbar