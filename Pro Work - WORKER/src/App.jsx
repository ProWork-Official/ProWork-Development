// Package
import { useState, useEffect, useContext } from 'react';
import { Route, Routes, useLocation} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from 'react-hot-toast';
import { MyContext } from './ContextAPI';

// Utils
import UserInfo from './Utils/UserInfo';
import WorkerInfo from './Utils/WorkerInfo';

// Components
import Navbar from './Components/Navbar/Navbar'
import Footer from './Components/Navbar/Footer'
import SignUpForm from './Components/SignUpForm/SignUpForm'
import OTPForm from './Components/SignUpForm/OTPForm'

// Pages
import Profile from './Pages/Profile/Profile'
import EditProfilePage from './Pages/Profile/EditProfile';
import WorkerProfile from './Pages/WorkerProfile/WorkerProfile'
import WorkerRegister from './Pages/WorkerRegister/WorkerRegister';
import Error404 from './Pages/Error404/Error404'
import ProtectedRoutes from './Pages/ProtectedRoutes'
import Success from './Pages/Success/Success'
import Failed from './Pages/Failed/Failed.jsx';
import MyWork from './Pages/MyWork/MyWork'
import Terms from './Pages/Terms/Terms'
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy'
import Explore from './Pages/Explore/Explore'
import About from './Pages/About/About'
import Contact from './Pages/Contact/Contact.jsx';
import Feedback from './Pages/Feedback/Feedback.jsx';
import Wallet from './Pages/Wallet/Wallet.jsx'
import ChangeLocation from './Pages/ChangeLocation';


function App() {
  const { SendOTP } = useContext(MyContext);
  const location = useLocation();
  
  return (
    <div className='flex justify-center items-start flex-wrap'>
      <Helmet><title>Pro Work - Worker</title></Helmet>
      <Toaster/>

      <UserInfo />
      <WorkerInfo />

      <Navbar />
      {SendOTP ? <OTPForm /> : <SignUpForm />}
      
      <div id='Body-routes' className="body-routes">
        <Routes location={location} key={location.pathname} >
        <Route path='/' element={<WorkerRegister/>}/>
          <Route path='/explore' element={<Explore/>}/>
          <Route path='/about-us' element={<About/>}/>
          <Route path='/contact-us' element={<Contact/>}/>
          <Route path='/register-with-us' element={<WorkerRegister/>}/>
          <Route path='/terms-of-service' element={<Terms/>}/>
          <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
          <Route path='/feedback' element={<Feedback/>}/>
          <Route path='/change-location' element={<ChangeLocation/>} />

          <Route element={<ProtectedRoutes/>}>
            <Route path='/payment_success?' element={<Success/>}/>
            <Route path='/payment_failed?' element={<Failed/>}/>
            <Route path='/my-profile/:id' element={<Profile/>}/>
            <Route path="/my-profile/edit-profile" element={<EditProfilePage/>} /> 
            <Route path='/my-profile/:id/my-worker-profile/:id' element={<WorkerProfile/>}/>
            <Route path='/my-profile/:id/my-work/:id' element={<MyWork/>}/>
            <Route path='/my-profile/:id/my-worker-profile/:id/my-wallet' element={<Wallet/>}/>
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App