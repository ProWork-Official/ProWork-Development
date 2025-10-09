// src/Pages/Profile/MyProfile.jsx
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import NextY from "../../Assets/next_Y.png";

// Utils
import UserInfo from "../../Utils/UserInfo.jsx";

// Assets
import ProworkLogo from "../../Assets/ProworkLogo.png";

// Components
import ProfileBlock from "../../Components/ProfileBlock/ProfileBlock";

// Functions
import { URL, toastFailure } from "../../func.jsx";
import { MyContext } from "../../ContextAPI";

function MyProfile() {
  const { setSendOTP, setPhoneNumber, UserData, removeSessionID } = useContext(MyContext);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // control state
  const [saved, setSaved] = useState(false); // whether personal details already saved in DB
  const [editing, setEditing] = useState(false); // whether user is currently editing the name
  const [loading, setLoading] = useState(false); // disable buttons while network request
  const [message, setMessage] = useState(""); // small status message for the user
   // NEW state for delete modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load existing personal details on mount
  useEffect(() => {
    let mounted = true;
    const fetchPersonal = async () => {
      try {
        const resp = await axios.get(`${URL}/user/personal`, { withCredentials: true });
        // your backend returns 200 with an array, or 204 if none
        if (!mounted) return;
        if (resp.status === 200 && Array.isArray(resp.data) && resp.data.length > 0) {
          const pd = resp.data[0];
          setName(pd.Name || "");
          setEmail(pd.Email || "");
          setSaved(true);
          setEditing(false);
          setMessage("");
        } else if (resp.status === 204) {
          // no personal info yet
          setSaved(false);
          setEditing(true); // allow entering details
        } else {
          setSaved(false);
          setEditing(true);
        }
      } catch (err) {
        // 401/other errors will show toast
        console.error("Error fetching personal details:", err);
        setMessage("");
        // Not fatal — keep form editable for user
      }
    };
    fetchPersonal();
    return () => {
      mounted = false;
    };
  }, [UserData.UserObjectID]);
 
  // If no user data available - keep your previous behavior
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

  

  // Logout function (unchanged logic)
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

  // Handle create (first-time save) and edit (name change)
    const handleSubmit = async (e) => {
    e && e.preventDefault();
    setMessage("");

    // If details are already saved and user clicked the main button (Edit Details),
    // enter editing mode (don't attempt to save).
    if (saved && !editing) {
      setEditing(true);
      // optional: focus name input if you added a ref (see below)
      return;
    }

    if (!name || name.trim().length === 0) {
      setMessage("Please enter a name.");
      return;
    }

    // First-time save (email must be provided)
    if (!saved) {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setMessage("Please enter a valid email.");
        return;
      }

      setLoading(true);
      try {
        const payload = {
          LocalPersonalFormData: { Name: name.trim(), Email: email.trim() },
          UserObjectID: UserData.UserObjectID,
        };
        const resp = await axios.post(`${URL}/user/personal`, payload, { withCredentials: true });
        if (resp.status === 201) {
          setSaved(true);
          setEditing(false);
          setMessage("Details saved successfully.");
        } else {
          setMessage("Unexpected response from server.");
        }
      } catch (err) {
        console.error("Error saving personal details:", err);
        const srvMsg = err?.response?.data?.message;
        if (srvMsg) toastFailure(srvMsg);
        else toastFailure("Unable to save details. Try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // saved === true and editing === true -> update name only (PATCH)
    if (saved && editing) {
      setLoading(true);
      try {
        const payload = {
          EditPersonalFormData: { Name: name.trim() },
          UserObjectID: UserData.UserObjectID,
        };
        const resp = await axios.patch(`${URL}/user/personal/edit`, payload, { withCredentials: true });
        if (resp.status === 201 || resp.status === 200) {
          setEditing(false);
          setMessage("Name updated.");
        } else {
          setMessage("Unexpected response from server.");
        }
      } catch (err) {
        console.error("Error updating name:", err);
        toastFailure("Unable to update. Try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    };


    // NEW: delete account handler
  const handleDeleteAccount = async () => {
    if (!UserData?.UserObjectID) return;
    setDeleting(true);
    setMessage("");
    try {
      // call DELETE /user/delete
      const resp = await axios.delete(`${URL}/user/delete`, { withCredentials: true });
      // backend returns 204 on success
      if (resp.status === 204 || resp.status === 200) {
        // clear client-side session/state/local storage
        try {
          localStorage.removeItem("selected_address");
          localStorage.removeItem("selected_coords");
          localStorage.removeItem("saved_addresses");
        } catch (e) {}
        // clear cookies/session in app context
        removeSessionID && removeSessionID("SessionID");
        setSendOTP && setSendOTP(false);
        setPhoneNumber && setPhoneNumber("");
        // close modal and redirect to home
        setIsModalOpen(false);
        navigate("/", { replace: true });
      } else {
        toastFailure("Could not delete account. Try again.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      const srvMsg = err?.response?.data?.message;
      if (srvMsg) toastFailure(srvMsg);
      else toastFailure("Error deleting account. Try again.");
    } finally {
      setDeleting(false);
    }
  };  


  // Clicking "Edit Details" should enable editing the name
  const handleEditClick = () => {
    setEditing(true);
    setMessage("");
  };

  // Button label logic:
  // - not saved => "Save Details"
  // - saved && !editing => "Edit Details"
  // - saved && editing => "Save Changes"
  const buttonLabel = !saved ? "Save Details" : saved && !editing ? "Edit Details" : "Save Changes";

  return (
    <div className="flex flex-wrap w-screen">
      <Helmet>
        <title>Pro Work - Account</title>
      </Helmet>

      {/* Profile navbar */}
      <div className="flex justify-center bg-[#f2da1d] h-20 w-full z-50 transition-all duration-300 ">
        <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
          <Link to="/">
            <img src={ProworkLogo} alt="" className="h-[4.5rem]" />
          </Link>
          <button className="bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md" onClick={LogOut}>
            Log Out
          </button>
        </div>
      </div>

      {/* Left Part */}
      <div className="flex flex-wrap w-full mmd:w-[50%] lg:w-[40%] z-50 bg-white">
        <div className="w-full pt-4 px-4 h-12 bg-[#f2da1d]">
          <div className="flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]">
            <h1 className="text-[#33806b] text-4xl sm:text-6xl">P</h1>
          </div>
        </div>

        <div className="w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start">
          <div className="w-1/2 sm:w-[55%] h-24  py-1 sm:h-36 flex flex-col flex-wrap justify-start">
            <h2 className="text-sm sm:text-xl w-full text-start ">{saved ? name : 'Complete Your Profile'}</h2>
            {true && <p className="text-gray-600 text-[10px] sm:text-sm pt-1 pb-4">{/* show email if saved */}{saved ? email : ""}</p>}
            {saved ?
            <Link to="/account/my-profile">
              <button className="bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 ">Edit Profile</button>
            </Link>
            :
            <Link to="/account/my-profile">
              <button className="bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 ">Add Profile</button>
            </Link>
            }
          </div>
        </div>

        <div className="hidden mmd:flex flex-wrap pb-8 justify-center xs:justify-start pt-4 w-full max-w-[450px]">
          <Link className="w-full" to="/account/my-address">
            <ProfileBlock heading1="Address" />
          </Link>
          <Link className="w-full" to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
            <ProfileBlock heading1="Bookings" />
          </Link>
          <Link className="w-full" to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
            <ProfileBlock heading1="Register as Worker" />
          </Link>
          <Link className="w-full" to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
            <ProfileBlock heading1="Customer Support" />
          </Link>
        </div>
      </div>

      {/* Right Part */}
      <div className="flex flex-wrap w-full h-[90vh] mmd:h-auto mmd:w-[50%] lg:w-[60%] pb-[70px] z-50 bg-white">
        <div className="hidden mmd:flex w-full pt-4 px-4 h-12 bg-[#f2da1d]" />

        <div className="w-full h-full px-8 py-4">
          <div className="w-full h-full border border-[#33806b] rounded-lg relative ">
            <div className=" w-full h-full overflow-y-auto">
              {/* Title */}
              <Link to='/account' className='flex items-center text-lg text-[#33806b] bg-white mb-4 rounded-t-lg shadow-lg py-2 px-4 absolute w-full top-0 left-0'>
                <img src={NextY} alt="" className='rotate-180 h-8' />
                Profile
              </Link>

              {/* Content */}
              <div className="pt-16 px-4 pb-4 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex w-full flex-wrap justify-center">
                    <div className="flex w-full justify-center">
                      <fieldset className="h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-2">
                        <legend className="text-[#33806b]">Name</legend>
                        <input
                          className="border-0 focus:outline-none w-[95%] text-[#33806b] placeholder-[#33806b]"
                          name="Name"
                          placeholder="Enter your name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={saved && !editing} // only editable if not saved or in editing mode
                        />
                      </fieldset>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap justify-center">
                    <div className="flex w-full justify-center">
                      <fieldset className="h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-2">
                        <legend className="text-[#33806b]">Email</legend>
                        <input
                          className="border-0 focus:outline-none w-[95%] text-[#33806b] placeholder-[#33806b]"
                          name="Email"
                          placeholder="Enter your email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={saved} // email editable only prior to saving
                          required={!saved}
                        />
                      </fieldset>
                    </div>
                  </div>

                  <div className="w-full flex justify-end px-4">
                    <button
                      className="h-12 w-[50%] lg:w-[25%] border-2 border-[#f2da1d] rounded-xl shadow-lg shadow-[#33806b] bg-[#33806b] text-white disabled:opacity-60"
                      id="send-OTP-BTN"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : buttonLabel}
                    </button>
                  </div>

                  {message && <div className="text-sm text-center text-gray-700 mt-2">{message}</div>}
                </form>

                {/* Delete account UI kept as-is */}
                <>
                  {/* ...existing form markup etc. */}
                  <div className="w-full flex flex-wrap mt-8 absolute bottom-4 left-0 px-8">
                    <button onClick={() => setIsModalOpen(true)} className="text-[#e45b5b] mb-2">
                      Delete Account
                    </button>
                    <h2 className="w-full text-xs text-neutral-500 text-sans">Deleting your account will remove all your bookings, wallet amount and any reviews created by you.</h2>
                  </div>

                  {/* Confirmation Modal */}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
                      <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] sm:w-1/3">
                        <h2 className="text-xl font-bold text-center text-red-600">Confirm Account Deletion</h2>
                        <p className="mt-4 text-center text-gray-800">
                          Once you confirm, your Pro Work account and all associated data will be permanently removed. This action cannot be undone. Do you want to continue?
                        </p>

                        <div className="mt-6 flex justify-center space-x-4">
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-60"
                            disabled={deleting}
                          >
                            {deleting ? "Deleting..." : "Confirm Delete"}
                          </button>

                          <button
                            onClick={() => setIsModalOpen(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                            disabled={deleting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default MyProfile;
