// Package
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import axios from 'axios'

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

// Functions
import { URL, toastFailure } from '../../func.jsx'
import { togglePersonalForm, togglePersonalLabel, toggleAddressForm, toggleAddressLabel } from '../../Components/UserForm/funcUserForm'
import { MyContext } from '../../ContextAPI'

function Profile() {
  const { setSendOTP,setPhoneNumber, UserData, PersonalFormData, AddressFormData, WorkerFormData, EditPersonalDetails, EditAddressDetails, removeSessionID } = useContext(MyContext);

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
    <div className='flex flex-col w-screen '>
      <Helmet><title>Pro Work - My Profile</title></Helmet>

      <div className='w-full h-4/6 bg-white z-[45] flex flex-wrap justify-between border-2 border-red-700' >

        <div className='flex justify-center bg-[#f2da1d] h-20 w-full z-50 transition-all duration-300 border-2 border-blue-700'>
          <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
            <Link to='/'> <img src={ProworkLogo} alt="" className='h-[4.5rem]' /> </Link>
            <button className='bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md' onClick={LogOut}>Log Out</button>
          </div>
        </div>

        <div className='h-1/2 w-full bg-white border-2 border-blue-700'> 

          <div className='pt-4 px-4 h-12 bg-[#f2da1d]'>
            <div className='flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]'>
              <h1 className='text-[#33806b] text-4xl sm:text-6xl'>P</h1>
            </div>
          </div>

          <div className='w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start'>
            <div className='w-1/2 sm:w-[55%] h-24 sm:h-40 flex flex-wrap justify-start items-start pt-4'>
              <h2 className='text-sm sm:text-xl w-full text-start '>Complete Your Profile</h2>
              <Link to='/account/my-profile'><button className='bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 '>Add Profile</button></Link>
            </div>
          </div>

          <div className='px-4'>
            {PersonalFormData.isPersonal ? 
              <h1 className='text-2xl sm:text-4xl text-[#33806b]'>{PersonalFormData.Name}</h1> 
              : 
              <h1 className='text-lg xs:text-2xl text-[#33806b]'>User_{UserData.UserObjectID.substring(5, 17)}</h1> 
            }
            <h3 className='text-lg sm:text-xl pt-3 text-[#33806b]'>{UserData.UserNumber}</h3>
          </div>
        </div>
        
      

        <div className='flex flex-wrap pb-8 justify-center xs:justify-start pt-4 w-full max-w-[450px] border-2 border-blue-700'>
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

  

       

{/* 
<div class="grid grid-cols-3 grid-rows-6 gap-4">
  <div class="bg-blue-500 col-span-3 row-span-2">Child 1</div>
  <div class="bg-teal-500 col-span-3">Child 2</div>
  <div class="bg-red-500 row-span-2">Child 3</div>
  <div class="bg-green-500 col-span-2 row-span-4">Child 4</div> 
  <div class="bg-yellow-500 row-span-2">Child 5</div> 
</div> */}




      </div>
    </div>
  )
}

export default Profile