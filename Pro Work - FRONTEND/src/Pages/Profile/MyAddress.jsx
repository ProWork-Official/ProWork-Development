// Package
import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import axios from 'axios'
import Next from "../../Assets/next.png"

// Utils
import UserInfo from '../../Utils/UserInfo.jsx'

import ProworkLogo from '../../Assets/ProworkLogo.png';

// Components
import ProfileBlock from '../../Components/ProfileBlock/ProfileBlock'
import PersonalForm from '../../Components/UserForm/PersonalForm'
import PersonalLabel from '../../Components/UserForm/PersonalLabel'
import PersonalFormEdit from '../../Components/UserForm/PersonalFormEdit'
import AddressForm from '../../Components/UserForm/AddressForm'
import AddressLabel from '../../Components/UserForm/AddressLabel'
import AddressFormEdit from '../../Components/UserForm/AddressFormEdit'
import UpdateLocation from '../../Components/UpdateLocation.jsx'

// Functions
import { URL, toastFailure } from '../../func.jsx'
import { togglePersonalForm, togglePersonalLabel, toggleAddressForm, toggleAddressLabel } from '../../Components/UserForm/funcUserForm'
import { MyContext } from '../../ContextAPI'
function MyAddress() {

    const { setSendOTP,setPhoneNumber, UserData, PersonalFormData, AddressFormData, WorkerFormData, EditPersonalDetails, EditAddressDetails, removeSessionID } = useContext(MyContext);
    const [showLocation, setShowLocation] = useState(false);

  // Logging out user
  async function LogOut(){
    const response =  await axios.post(`${URL}/user/logout`, {'status': "Log me out",}, { withCredentials: true,  headers: { 'Content-Type': 'multipart/form-data' }, })
    if(response.status == 204){
      toastFailure('Logged Out')
      setTimeout(() =>{
        removeSessionID('SessionID');
        setSendOTP(false)
        setPhoneNumber("")
        // making send otp button clickable again
        const SendOTPBtn = document.getElementById("send-OTP-BTN")
        SendOTPBtn.disabled = false;
        SendOTPBtn.classList.add('opacityfull');
        SendOTPBtn.classList.remove('opacityhalf');
      }, 2500)
    } else if (response.status == 401 || response.status == 500){
      toastFailure("Something went wrong, Please try again");
    } else {
      toastFailure("Something went wrong, Please try again");
    }
  }
  
  if(!UserData.UserObjectID){
    return (
      <div className="flex flex-wrap justify-center items-center h-1/2 w-screen pt-20 p-6">
        <div className="w-screen overflow-x-auto shadow-shadow10px shadow-[#1d6955] rounded-xl bg-white" id='BookingTable'>
          <div className="p-6 text-center">
            <UserInfo />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No User Available</h2>
            <p className="text-gray-600">Please check back later or contact support if you believe this is an error.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div  className='flex flex-wrap w-screen'>

        <div className='flex justify-center bg-[#f2da1d] h-20 w-full z-40 transition-all duration-300 '>
            <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
                <Link to='/'> <img src={ProworkLogo} alt="" className='h-[4.5rem]' /> </Link>
                <button className='bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md' onClick={LogOut}>Log Out</button>
            </div>
        </div>

        <div className=' h-[99vh] bg-white z-[45] grid grid-cols-1 lg:grid-cols-3 grid-rows-12' >

            {/* 1 */}
            <div class="col-span-1 row-span-5">
                <div className='pt-4 px-4 h-12 bg-[#f2da1d]'>
                    <div className='flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]'>
                        <h1 className='text-[#33806b] text-4xl sm:text-6xl'>P</h1>
                    </div>
                </div>

                <div className='w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start'>
                    <div className='w-1/2 sm:w-[55%] h-24 sm:h-36 flex flex-wrap justify-start items-start pt-12'>
                        <h2 className='text-sm sm:text-xl w-full text-start '>Complete Your Profile</h2>
                        <Link to='/account/my-profile'><button className='bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 '>Add Profile</button></Link>
                    </div>
                </div>
            </div>

            {/* 2 */}
            <div class="hidden lg:flex col-span-2 row-span-1 bg-[#f2da1d]"></div>

            {/* 4 */}
            <div class="hidden lg:flex col-span-2 row-span-11 px-8 py-4 pb-[46px]">
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

            {/* 5 */}
            <div className='col-span-1 row-span-7'>
                <div className='flex flex-wrap pb-8 justify-center xs:justify-start pt-4 w-full max-w-[450px]'>
                    <Link className='w-full' to='/account/my-address'>
                      <ProfileBlock heading1='Address' />
                    </Link>
                    
                    <Link className='w-full' to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
                      <ProfileBlock heading1='Bookings' />
                    </Link>
                    <Link className='w-full' to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
                      <ProfileBlock heading1='Register as Worker' />
                    </Link>
                    <Link className='w-full' to={`/my-profile/${UserData.UserObjectID}/my-booking`}>
                      <ProfileBlock heading1='Customer Support' />
                    </Link>
                </div>
            </div>
            

        </div>
    </div>
  )
}

export default MyAddress