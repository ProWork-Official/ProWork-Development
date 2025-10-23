import React, { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import axios from 'axios'

// Utils
import UserInfo from '../../Utils/UserInfo.jsx'

// Assets
import ProworkLogo from '../../Assets/ProworkLogo.png'

// Components
import ProfileBlock from '../../Components/ProfileBlock/ProfileBlock'

// Functions / Context
import { URL, toastSuccess, toastFailure } from '../../func.jsx'
import { MyContext } from '../../ContextAPI'

// EditProfile page (Worker app)
// Layout closely follows FRONTEND/src/pages/Profile.jsx but renders an inline
// personal-details form (create + edit) using the same endpoints used by
// PersonalForm and PersonalFormEdit.

export default function EditProfilePage(){
  const {
    setSendOTP,
    setPhoneNumber,
    UserData,
    PersonalFormData,
    WorkerFormData,
    setPersonalFormData,
    loadingState,
    setLoadingState,
    removeSessionID
  } = useContext(MyContext)

  const [form, setForm] = useState({ Name: '', Email: '', PhoneNumber: '' })
  const [errors, setErrors] = useState({})

  useEffect(()=>{
    // prefill with context values when available
    setForm({
      Name: PersonalFormData?.Name || PersonalFormData?.name || '',
      Email: PersonalFormData?.Email || PersonalFormData?.email || '',
      PhoneNumber: UserData?.UserNumber || ''
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PersonalFormData, UserData])

  // Logout re-used from other files (keeps behaviour consistent)
  async function LogOut(){
    try{
      const response =  await axios.post(`${URL}/user/logout`, {'status': "Log me out"}, { withCredentials: true,  headers: { 'Content-Type': 'multipart/form-data' } })
      if(response.status === 204){
        toastFailure('Logged Out')
        setTimeout(() =>{
          removeSessionID('SessionID');
          setSendOTP(false)
          setPhoneNumber("")
          const SendOTPBtn = document.getElementById("send-OTP-BTN")
          if(SendOTPBtn){
            SendOTPBtn.disabled = false;
            SendOTPBtn.classList.add('opacityfull');
            SendOTPBtn.classList.remove('opacityhalf');
          }
        }, 2500)
      } else {
        toastFailure("Something went wrong, Please try again");
      }
    }catch(err){
      toastFailure("Something went wrong, Please try again");
      console.error(err)
    }
  }

  const handleChange = (e) =>{
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate(){
    const v = {}
    if(!form.Name) v.Name = 'Name is required'
    if(!form.Email) v.Email = 'Email is required'
    else if(!/\S+@\S+\.\S+/.test(form.Email)) v.Email = 'Email is not valid'
    setErrors(v)
    return Object.keys(v).length === 0
  }

  const handleSubmit = async (e) =>{
    e && e.preventDefault()
    if(!validate()) return
    setLoadingState(true)

    try{
      const UserObjectID = UserData?.UserObjectID

      if(PersonalFormData?.isPersonal){
        // edit
        const body = { EditPersonalFormData: { Name: form.Name, Email: form.Email, PhoneNumber: form.PhoneNumber }, UserObjectID }
        const res = await fetch(`${URL}/user/personal/edit`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) })
        if(res.status === 201){
          toastSuccess('Personal details updated successfully')
          setPersonalFormData({ Name: form.Name, Email: form.Email, isPersonal: true })
        } else {
          const data = await res.json().catch(()=>({ message: 'Unknown error' }))
          toastFailure(data.message || 'Something went wrong')
        }

      } else {
        // create
        const body = { LocalPersonalFormData: { Name: form.Name, Email: form.Email, PhoneNumber: form.PhoneNumber }, UserObjectID }
        const res = await fetch(`${URL}/user/personal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) })
        if(res.status === 201){
          toastSuccess('Personal details saved successfully')
          setPersonalFormData({ Name: form.Name, Email: form.Email, isPersonal: true })
        } else {
          const data = await res.json().catch(()=>({ message: 'Unknown error' }))
          toastFailure(data.message || 'Something went wrong')
        }
      }

    }catch(err){
      console.error(err)
      toastFailure('Something went wrong')
    }finally{
      setLoadingState(false)
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
    <div className='flex flex-wrap w-screen'>
      <Helmet><title>Pro Work - Edit Profile</title></Helmet>

      {/* Profile navbar */}
      <div className='flex justify-center bg-[#f2da1d] h-20 w-full z-50 transition-all duration-300 '>
        <div className="flex justify-between items-center h-full w-full max-w-[1250px] mx-auto px-4 xl:px-0">
          <Link to='/'><img src={ProworkLogo} alt="logo" className='h-[4.5rem]' /></Link>
          <button className='bg-[#33806b] text-[#f2da1d] hover:bg-[#317462] h-10 px-6 rounded-md' onClick={LogOut}>Log Out</button>
        </div>
      </div>

      {/* Left Part - profile card + nav links (copied from WORKER/profile.jsx structure) */}
      <div className='w-full mmd:w-[50%] lg:w-[40%] z-50 bg-white'>
        <div className='w-full pt-4 px-4 h-12 bg-[#f2da1d]'>
          <div className='flex justify-center items-center h-[120px] w-[120px] sm:h-40 sm:w-40 rounded-full bg-white border-4 border-[#f2da1d]'>
            <h1 className='text-[#33806b] text-4xl sm:text-6xl'>P</h1>
          </div>
        </div>

        <div className='w-full max-w-[350px] sm:max-w-[450px] flex justify-end items-start'>
          <div className='w-1/2 sm:w-[55%] h-24  py-1 sm:h-36 flex flex-col flex-wrap justify-start'>
            <h2 className='text-sm sm:text-xl w-full text-start '>{form.Name || 'Complete Your Profile'}</h2>
            <p className='text-gray-600 text-[10px] sm:text-sm pt-1 pb-4'>{form.Email || ''}</p>
            <Link to='/account/edit-profile'>
              <button className='bg-[#33806b] text-white text-xs hover:bg-[#317462] h-8 px-4 sm:px-6 rounded-lg sm:-mt-12 '>Edit Profile</button>
            </Link>
          </div>
        </div>

        <div className='flex flex-wrap pb-8 justify-center xs:justify-start pt-4 w-full max-w-[450px]'>
          <a className="w-full" href="http://localhost:4000" target="_blank" rel="noopener noreferrer">
            <ProfileBlock heading1="Login as User" />
          </a>

          {WorkerFormData?.isWorker ? (
            <Link className='w-full' to={`/my-profile/${WorkerFormData.UserObjectID}/my-worker-profile/${WorkerFormData.WorkerObjectID}`}>
              <ProfileBlock heading1='Worker Details' heading2='Edit Now' />
            </Link>
          ) : null}

          {WorkerFormData?.isWorker ? (
            <Link className='w-full' to={`/my-profile/${WorkerFormData.UserObjectID}/my-work/${WorkerFormData.WorkerObjectID}`}>
              <ProfileBlock heading1='My Work' heading2='View History' />
            </Link>
          ) : null}

          <Link className='w-full' to={`/my-profile/${WorkerFormData?.UserObjectID}/my-work/${WorkerFormData?.WorkerObjectID}`}>
            <ProfileBlock heading1='Customer Support' />
          </Link>
        </div>
      </div>

      {/* Right Part - Inline form with fields from PersonalForm + PersonalFormEdit */}
      <div className="hidden md:flex flex-wrap md:w-[50%] lg:w-[60%] pb-[70px] z-50 bg-white">
        <div className='w-full pt-4 px-4 h-12 bg-[#f2da1d]' />
        <div className='w-full h-full px-8 py-4'>
          <div className='w-full h-full border border-[#33806b] rounded-lg relative '>
            <div className=' w-full h-full overflow-y-auto'>

              {/* Title */}
              <h1 className='text-lg text-[#33806b] bg-white mb-4 rounded-t-lg shadow-lg py-2 px-4 absolute w-full top-0 left-0'>
                Edit Profile
              </h1>

              {/* Content */}
              <div className='pt-16 px-4 pb-4 flex flex-col justify-center'>
                <form className='flex flex-wrap justify-center' onSubmit={handleSubmit}>

                  <div className='flex w-full flex-wrap justify-center'>
                    <div className='flex w-full justify-center'>
                      <fieldset className=' h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-8'>
                        <legend className='text-[#33806b]'>Name</legend>
                        <input className='border-0 focus:outline-none w-[95%] text-[#33806b]' name='Name' placeholder='Enter name' type='text' value={form.Name} onChange={handleChange} />
                      </fieldset>
                    </div>
                    {errors.Name && <span className='errormassDiv text-red-500 mb-6 -mt-8 w-[95%] pl-4'>{errors.Name}</span>}
                  </div>

                  <div className='flex w-full flex-wrap justify-center'>
                    <div className='flex w-full justify-center'>
                      <fieldset className=' h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-8'>
                        <legend className='text-[#33806b]'>Email</legend>
                        <input className='border-0 focus:outline-none w-[95%] text-[#33806b]' name='Email' placeholder='Enter email' type='text' value={form.Email} onChange={handleChange} />
                      </fieldset>
                    </div>
                    {errors.Email && <span className='errormassDiv text-red-500 mb-6 -mt-8 w-[95%] pl-4'>{errors.Email}</span>}
                  </div>

                  <div className='flex w-full flex-wrap justify-center'>
                    <div className='flex w-full justify-center'>
                      <fieldset className=' h-16 w-[95%] pl-4 border-2 border-[#33806b] rounded-xl mb-8'>
                        <legend className='text-[#33806b]'>Phone Number</legend>
                        <input className='border-0 focus:outline-none w-[95%] text-[#33806b]' name='PhoneNumber' placeholder='+91-xxxx' type='text' value={form.PhoneNumber} onChange={handleChange} />
                      </fieldset>
                    </div>
                  </div>

                  <div className='flex w-full justify-center'>
                    <button id='send-OTP-BTN' className='h-12 w-[95%] border-2 border-white rounded-xl shadow-shadow5px shadow-black bg-[#188e6d] text-white' type='submit'>
                      {loadingState ? 'Saving...' : (PersonalFormData?.isPersonal ? 'Update Details' : 'Save Details')}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
