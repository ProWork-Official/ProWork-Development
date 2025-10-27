// Package
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import axios from 'axios'

// Utils
import UserInfo from '../../Utils/UserInfo.jsx'

// Assets
import ProworkLogo from '../../Assets/ProworkLogo.png';

// Components
import ProfileBlock from '../../Components/ProfileBlock/ProfileBlock'

// Functions
import { URL, toastFailure } from '../../func.jsx'
import { MyContext } from '../../ContextAPI'

function Profile() {

  const { setSendOTP,setPhoneNumber, UserData, PersonalFormData, removeSessionID } = useContext(MyContext);
  
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

 

  // If no user data available
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
      <Helmet><title>Pro Work - Account</title></Helmet>

      {/* Profile navbar */}
      <div className='flex justify-center bg-[#f2da1d] h-20 w-full z-50 transition-all duration-300 '>
        <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
          <Link to='/'> <img src={ProworkLogo} alt="" className='h-[4.5rem]' /> </Link>
          <button className='bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md' onClick={LogOut}>Log Out</button>
        </div>
      </div>

      {/* Left Part */}
      <div className='w-full mmd:w-[50%] lg:w-[40%] z-50 bg-white'>
       
        <div className='w-full pt-4 px-4 h-12 bg-[#f2da1d]'>
          <div className='flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]'>
            <h1 className='text-[#33806b] text-4xl sm:text-6xl'>P</h1>
          </div>
        </div>

        <div className='w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start'>
          <div className='w-1/2 sm:w-[55%] h-24  py-1 sm:h-36 flex flex-col flex-wrap justify-start'>
            <h2 className='text-sm sm:text-xl w-full text-start '>{PersonalFormData ? PersonalFormData.Name : 'Complete Your Profile'}</h2>
            {true && <p className='text-gray-600 text-[10px] sm:text-sm pt-1 pb-4'>{PersonalFormData ? PersonalFormData.Email : ''}</p> }
            {PersonalFormData ?
            <Link to='/account/my-profile'>
              <button className='bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 '>Edit Profile</button>
            </Link>
            :
            <Link to='/account/my-profile'>
              <button className='bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 '>Add Profile</button>
            </Link>
            }
          </div>
        </div>

        
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

      {/* Right Part */}
      <div className="hidden mmd:flex flex-wrap mmd:w-[50%] lg:w-[60%] pb-[70px] z-50 bg-white">

        <div className='w-full pt-4 px-4 h-12 bg-[#f2da1d]' />
        
        <div className='w-full h-full px-8 py-4'>
          <div className='w-full h-full border border-[#33806b] rounded-lg relative '>
            <div className=' w-full h-full overflow-y-auto'>

              {/* Title */}
              <h1 className='text-lg text-[#33806b] bg-white mb-4 rounded-t-lg shadow-lg py-2 px-4 absolute w-full top-0 left-0'>
                Account
              </h1>

              {/* Content */}
              <div className='pt-16 px-4 pb-4 flex flex-col justify-center'>

               
                <div className="flex w-full flex-wrap justify-center">
                  <div className="flex w-full justify-center">
                    <fieldset className="h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-8">
                      <legend className="text-[#33806b]">Phone Number</legend>
                      <input
                        className="border-0 focus:outline-none w-[95%] text-[#33806b] placeholder-[#33806b]"
                        name="PhoneNumber"
                        placeholder="+91-9450066558"
                        type="text"
                        value={UserData?.UserNumber || ''}
                        readOnly
                      />
                    </fieldset>
                  </div>
                  {/* {error.Name && <span className="errormassDiv text-red-500 mb-6 -mt-8 w-[95%] pl-4">{error.Name}</span>} */}
                </div> 
                

                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile