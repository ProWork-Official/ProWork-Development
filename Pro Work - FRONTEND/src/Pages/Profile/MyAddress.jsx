// src/Pages/Profile/MyAddress.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Next from "../../Assets/next.png";
import ProworkLogo from "../../Assets/ProworkLogo.png";
import MapLogo from "../../Assets/MapLogo.gif";
import GPS from "../../Assets/gps.png";
import searcH from "../../Assets/search.png";
import locationIcon from "../../Assets/gps.png";
import Plus from "../../Assets/plus.png";
import CustomMarkerImg from "../../Assets/gps.png"; // marker png image

import UserInfo from "../../Utils/UserInfo.jsx";
import ProfileBlock from "../../Components/ProfileBlock/ProfileBlock";

import { URL, toastFailure } from "../../func.jsx";
import { MyContext } from "../../ContextAPI";
import { loadScript } from "../../Components/LocationGate"; // path from Pages/Profile -> Components
import { useDebounce } from "../../Components/Hooks/useDebounce";

function MyAddress() {
  const { setSendOTP, setPhoneNumber, UserData, removeSessionID, setAdss, setShowMap, setPickerStep, setStatusMsg  } = useContext(MyContext);

  const [showLocation, setShowLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    loadSavedAddresses();
    // keep saved list in sync if another tab changes it
    const handleStorage = (e) => {
      if (e.key === "saved_addresses") loadSavedAddresses();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function loadSavedAddresses() {
    try {
      const raw = localStorage.getItem("saved_addresses");
      setSavedAddresses(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setSavedAddresses([]);
    }
  }

  // Handler called by the modal when it closes or after save
  const handleLocationClose = () => {
    setShowLocation(false);
    loadSavedAddresses();
  };

  const selectAddressOnPage = (addr) => {
    if (!addr) return;
    setAdss && setAdss(addr.completeAddress);
    try {
      localStorage.setItem("selected_address", addr.completeAddress);
      if (addr.coords) localStorage.setItem("selected_coords", `${addr.coords.lat},${addr.coords.lng}`);
    } catch (e) {}
  };

  async function LogOut() {
    try {
      const response = await axios.post(
        `${URL}/user/logout`,
        { status: "Log me out" },
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 204) {
        toastFailure("Logged Out");
        setTimeout(() => {
          removeSessionID("SessionID");
          setSendOTP(false);
          setPhoneNumber("");
          const SendOTPBtn = document.getElementById("send-OTP-BTN");
          if (SendOTPBtn) {
            SendOTPBtn.disabled = false;
            SendOTPBtn.classList.add("opacityfull");
            SendOTPBtn.classList.remove("opacityhalf");
          }
        }, 2500);
      } else {
        toastFailure("Something went wrong, Please try again");
      }
    } catch (err) {
      toastFailure("Something went wrong, Please try again");
    }
  }

  if (!UserData?.UserObjectID) {
    return (
      <div className="flex flex-wrap justify-center items-center h-1/2 w-screen pt-20 p-6">
        <div className="w-screen overflow-x-auto shadow-shadow10px shadow-[#1d6955] rounded-xl bg-white" id="BookingTable">
          <div className="p-6 text-center">
            <UserInfo />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No User Available</h2>
            <p className="text-gray-600">Please check back later or contact support if you believe this is an error.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap w-screen">
      <div className="flex justify-center bg-[#f2da1d] h-20 w-full z-40 transition-all duration-300 ">
        <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
          <Link to="/">
            <img src={ProworkLogo} alt="" className="h-[4.5rem]" />
          </Link>
          <button className="bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md" onClick={LogOut}>
            Log Out
          </button>
        </div>
      </div>

      <div className="h-[99vh] bg-white z-[45] grid grid-cols-1 lg:grid-cols-3 grid-rows-12">
        <div className="col-span-1 row-span-5">
          <div className="pt-4 px-4 h-12 bg-[#f2da1d]">
            <div className="flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]">
              <h1 className="text-[#33806b] text-4xl sm:text-6xl">P</h1>
            </div>
          </div>

          <div className="w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start">
            <div className="w-1/2 sm:w-[55%] h-24 sm:h-36 flex flex-wrap justify-start items-start pt-12">
              <h2 className="text-sm sm:text-xl w-full text-start ">Complete Your Profile</h2>
              <Link to="/account/my-profile">
                <button className="bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 ">
                  Add Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex col-span-2 row-span-1 bg-[#f2da1d]" />

        <div className="hidden lg:flex col-span-2 row-span-11 px-8 py-4 pb-[46px]">
          <div className="w-full h-full border border-[#33806b] rounded-lg relative bg-slate-50">
            <div className="w-full h-full overflow-y-auto">
              <h1 className="text-lg text-[#33806b] bg-white flex gap-4 items-center mb-4 rounded-t-lg shadow-lg p-2 absolute w-full top-0 left-0">
                <img src={Next} alt="" className="rotate-180 h-6" />
                Address
              </h1>
              <div className="pt-16 px-4 pb-4">
                {/* OPEN embedded UpdateLocation modal */}
                <div
                    onClick={() => {
                      try { localStorage.setItem("auto_open_add", "1"); } catch (e) {}
                      // open the *global* modal same as Navbar does
                      setShowMap(true);
                      setPickerStep("search");
                      setStatusMsg("");
                    }}
                    className="w-full py-4 px-6 border bg-white border-red-700 rounded-xl cursor-pointer"
                 >
                    + Add New Address
                </div>

                {/* {showLocation && <UpdateLocationModal onClose={handleLocationClose} autoOpenAdd={true} />} */}

                <h2 className="pt-12 px-2">Saved Address</h2>

                <div className="mt-4 space-y-2">
                  {savedAddresses.length === 0 ? (
                    <div className="w-full mt-2 py-4 px-6 border bg-white rounded-xl text-sm text-gray-500">
                      No saved addresses yet. Click + Add New Address to add.
                    </div>
                  ) : (
                    savedAddresses.map((a) => (
                      <div key={a.id} className="w-full p-4 bg-white rounded-xl border flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{a.type} {a.pinCode ? `• ${a.pinCode}` : ""}</div>
                          <div className="text-xs text-gray-600">{a.completeAddress}</div>
                          {a.building && <div className="text-xs text-gray-500">Building: {a.building}</div>}
                          {a.landmark && <div className="text-xs text-gray-500">Landmark: {a.landmark}</div>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => selectAddressOnPage(a)} className="px-3 py-1 bg-[#42DCB3] text-white rounded-md text-sm">
                            Select
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 2 */}
            <div className="hidden lg:flex col-span-2 row-span-1 bg-[#f2da1d]"></div>

            {/* 4 */}
            <div className="hidden lg:flex col-span-2 row-span-11 px-8 py-4 pb-[46px]">
                <div className='w-full h-full border border-[#33806b] rounded-lg relative bg-slate-50'>
                    <div className=' w-full h-full overflow-y-auto'>
                        <h1 className='text-lg text-[#33806b] bg-white flex gap-4 items-center mb-4 rounded-t-lg shadow-lg p-2 absolute w-full top-0 left-0'>
                          <img src={Next} alt="" className='rotate-180 h-6'/>
                            Address
                        </h1>
                        <div className='pt-16 px-4 pb-4'>
                        <div onClick={() => setShowLocation(true)} className='w-full py-4 px-6 border bg-white border-red-700 rounded-xl'>+ Add New Address</div>
                        {showLocation && <UpdateLocation setShowLocation={setShowLocation} />}
                        <h2 className='pt-12 px-2'>Saved Address</h2>
                        <div className='w-full mt-2 py-4 px-6 border bg-white border-red-700 rounded-xl'>Add New Address</div>
                      </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col flex-grow relative items-center pt-2 justify-between text-center text-gray-600 overflow-y-auto" id="ColorCustomScroll">
                <button onClick={useMyCurrentLocation} className="flex w-full mb-3 z-10 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center">
                  <img src={GPS} alt="gps" className="h-6 mr-3" /> Use My Current Location
                </button>

                <button onClick={startAddNewAddress} className="flex justify-between z-10 w-full mb-3 rounded-md border border-[#f2da1d] bg-white text-[#33806b] font-semibold p-3 items-center">
                  <div className="flex items-center"><img src={Plus} alt="gps" className="h-6 mr-3" /> Add New Address</div>
                  <img src={Next} alt="gps" className="h-6 mr-3" />
                </button>

                <div className="text-sm text-gray-600 min-h-[24px] pt-8 text-center z-10 ">{statusMsg}</div>

                <div className="p-2 rounded-md flex items-center absolute top-28 justify-center mb-6"><img src={MapLogo} alt="" className="h-28" /></div>

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
                        <button onClick={() => handleSelectSavedAddress(a)} className="px-3 py-2 bg-[#42DCB3] text-white rounded-md">Select</button>
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
                  <input ref={autocompleteInputRef} placeholder="Search on map (area, street name...)" className="w-full bg-transparent outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="text-xl text-gray-500">&times;</button>}
                </label>

                {predictions.length > 0 && (
                  <div className="mt-1 max-h-60 overflow-y-auto bg-white rounded shadow border">
                    {predictions.map((p) => (
                      <div key={p.place_id} onClick={() => handlePredictionClick(p)} className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0">
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
                <button className="px-4 py-2 rounded-md w-[98%] bg-emerald-600 text-white" onClick={confirmLocation}> Confirm & Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Address details form (after Confirm & Continue in add-new flow) */}
        {showAddressForm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
            <form onSubmit={handleSaveAddress} className="bg-white w-[95%] sm:w-[90%] max-w-lg rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Add Address Details</h3>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Save Address as</label>
                <div className="flex gap-3">
                  {["Home", "Work", "Others"].map((t) => (
                    <button type="button" key={t} onClick={() => setAddressForm((p) => ({ ...p, type: t }))} className={`px-3 py-2 rounded-md border ${addressForm.type === t ? "bg-[#42DCB3] text-white border-transparent" : "bg-white text-gray-700 border-gray-200"}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Complete address</label>
                <textarea value={addressForm.completeAddress} onChange={(e) => setAddressForm((p) => ({ ...p, completeAddress: e.target.value }))} className="w-full border rounded-md p-2 text-sm" rows={2} required />
              </div>

              <div className="mb-3"><label className="block text-sm font-medium mb-1">Building name / Floor</label><input value={addressForm.building} onChange={(e) => setAddressForm((p) => ({ ...p, building: e.target.value }))} className="w-full border rounded-md p-2 text-sm" /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Landmark (optional)</label><input value={addressForm.landmark} onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))} className="w-full border rounded-md p-2 text-sm" /></div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Pin code</label>
                <input value={addressForm.pinCode} onChange={(e) => setAddressForm((p) => ({ ...p, pinCode: e.target.value }))} className="w-full border rounded-md p-2 text-sm" placeholder="6-digit pin code" required />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => { setShowAddressForm(false); setIsAddingNewAddress(false); }} className="px-4 py-2 rounded-md border">Edit</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-[#42DCB3] text-white">Save Address</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyAddress;
