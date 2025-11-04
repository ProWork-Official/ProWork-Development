// Packages
import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'

// Styles
import './Navbar.css'

import UpdateLocation from '../UpdateLocation'

// Functions
import { showSignUpForm } from '../SignUpForm/signUp'
import { MyContext } from '../../ContextAPI'

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
import DownArrowG from '../../Assets/down-arrowG.png';    
import DownArrowY from '../../Assets/down-arrowY.png';    


function Navbar() {
    const { UserData, SessionID, addss, showMap, setShowMap, setPickerStep, setStatusMsg } = useContext(MyContext);
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
  

    // Handle navbar scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) { setIsScrolled(true) }
            else { setIsScrolled(false) }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle dynamic placeholder
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

    function extractLocation2(addss) {
        const parts = addss.split(',').map(part => part.trim());
        const firstPart = parts[0];

        // Match plus codes like "9RQC+MR7"
        const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/i.test(firstPart);

        // Match house numbers like "122H/2J", "B-23", etc.
        const isHouseNumber = /[0-9]/.test(firstPart) && /[\/-]/.test(firstPart);
        const isOnlyNumber = /^[0-9]+$/.test(firstPart);
        const isNumberAndLetter = /^[0-9]+[a-zA-Z]$/.test(firstPart);



        if ((isPlusCode || isHouseNumber || isOnlyNumber || isNumberAndLetter) && parts.length > 1) {
            // Remove the first part and return the rest joined back with commas
            const filteredParts = parts.slice(1).join(', ');
            return truncateAddress(filteredParts, 2)
        } else {
            // Return the full address as-is
            const filteredParts = addss.trim();
            return truncateAddress(filteredParts, 2)
        }
    }

   const truncateAddress = (addr, words) => {
    if (!addr) return "";

    // Split the address by commas
    const parts = addr.split(",");
    
    // The first part is everything before the comma
    const firstPart = parts[0].trim();

    // If we only want the first two parts, split the remaining string into words
    const remainingPart = parts.slice(1).join(" ").trim();
    const remainingWords = remainingPart.split(/\s+/);

    // Concatenate the first part and the truncated second part
    let result = firstPart;

    // Add the second part after the first if there are remaining words
    if (remainingWords.length > 0 && words > 1) {
        result += ", " + remainingWords.slice(0, words - 1).join(" ");
    }
    if (result.length <= 15) {
        result += ", " + "Prayagraj"
    }

    return result;
    };


    return (
        <div className={`fixed top-0 left-0 right-0 flex flex-wrap justify-center h-20 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} ${isHamOpen ? 'bg-white shadow-md' : 'bg-transparent'}`} id='Navbar'>
            <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">

                {/* Brand Logo */}
                <Link to='/'><img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' /></Link>

                {/* My Location Component */}
                <div onClick={() => { setShowMap(true); setPickerStep("search"); setStatusMsg(""); }} className='flex flex-wrap w-[40%] xxs:w-[57%] ssm:w-[27%] md:w-[35%] h-[70%] md:h-[70%] cursor-pointer ml-1 sm:ml-4'>
                    <div className='w-full max-w-[150px] grid grid-cols-5 grid-rows-2'>
                    <div className={` w-full text-[12px] leading-loose col-span-4 row-span-1 ${isScrolled ? 'text-[#f2da1d]' : 'text-[#7ee3c8]'}`}>Your Location</div>

                    <div className='col-span-1 row-span-1 flex justify-center items-center'>
                        {isScrolled ? 
                        
                        <img src={DownArrowY} alt="" className='h-5' />
                        : 
                        <img src={DownArrowG} alt="" className='h-5' />
                        
                        }
                    </div>

                    <div className={`col-span-5 row-span-1 text-[10px] font-bold font-sans flex justify-start mmd:justify-between items-start mmd:items-center ${isScrolled ? 'text-[#33806b]' : 'text-[#f2da1d]'}`}>
                        <span title={addss || ""}>
                            {extractLocation1(addss? `${addss} ` : `${previousAddss}`)} - {addss ? extractLocation2(addss) : previousAddss? extractLocation2(previousAddss) : "Select your location"}
                        </span>
                    </div>
                    </div>
                </div>

                <div className='lg:w-[40%]'/>

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

                        {SessionID.SessionID ? 
                            <Link to={`/my-profile/${UserData.UserObjectID}`}>
                                <img
                                    className="h-10 transition duration-200"
                                    src={ isScrolled ? (isUserHovered ? User_Y : User_G)  : (isUserHovered ? User_G : User_Y) }
                                    alt="user"
                                    onMouseEnter={handleEnterUser}
                                    onMouseLeave={handleLeaveUser}
                                />
                            </Link>
                            : 
                            <button className="bg-[#f2da1d] text-[#33806b] text-xs font-bold px-4 py-[0.5rem] rounded-full shadow hover:opacity-90 transition duration-300" onClick={showSignUpForm}>Sign Up</button>
                        }
                    </div>
                </div>

                {/* Mobile Menu */}
                <div id='PhoneList' ref={phoneListRef} className={`fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white text-black transition-transform duration-300 ease-in-out ${isHamOpen ? 'nav-phone-list-moveDown' : 'nav-phone-list-moveUp'}`}>
                    <div className="flex flex-col p-8 space-y-6">
                        <Link className="text-2xl text-[#33806b] hover:text-[#f2da1d] transition-colors" onClick={ () => { toggleNavbarMenu(); scrollTop0() }} to="/">HOME</Link>
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
           
            
            {showMap && <UpdateLocation />}
        </div>
    )
}

export default Navbar