// Package
import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

// Component
import WorkerFormEdit from '../../Components/WorkerForm/WorkerFormEdit'
import ServiceForm from '../../Components/WorkerForm/ServiceForm'

// Functions
import { toggleWorkerEdit, toggleServiceForm } from '../../Components/WorkerForm/funcWorkerForm'
import { MyContext } from '../../ContextAPI'

function WorkerProfile() {
  const { UserData, WorkerFormData, ServiceFormData, EditWorkerDetails, setEditWorkerDetails, showBankForm, setShowBankForm } = useContext(MyContext);
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    // console.log("isService changed to:", ServiceFormData.isService);
    // Do something when it changes
  }, [ServiceFormData.isService]);

  useEffect(() => {
    console.log("WorkerFormData in WorkerProfile:", WorkerFormData);
  }, [WorkerFormData]);
  

  // console.log(WorkerFormData)


  return (
    <div className='flex flex-wrap pt-20 w-full'>
      <Helmet><title>Pro Work - My Worker Profile</title></Helmet>

      {EditWorkerDetails && <WorkerFormEdit /> }

      <ServiceForm />


      <div className="w-full px-4 flex flex-wrap justify-between items-center mb-6">

        <div className='text-xs sm:text-lg text-gray-500'>
          <Link to='/'><span className='hover:text-green-800'>Home</span> / </Link>
          <Link to='/account'><span className='hover:text-green-800'>Profile</span> / </Link>
          <span className='text-gray-400'>Shop Profile</span>
        </div>

        <div>
          {ServiceFormData.isService ? 
            <Link to={`/my-profile/${UserData.UserObjectID}/my-worker-profile/${WorkerFormData.WorkerObjectID}/my-wallet`}><button className='mr-4 rounded-md bg-[#188e6d] mt-4 2xs:mt-0  px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Show Wallet</button></Link>
            :
            <button onClick={() => toggleServiceForm(true) } className='mr-4 rounded-md bg-[#188e6d] mt-4 2xs:mt-0  px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Add Service</button>
          }
          <button onClick={() => { setEditWorkerDetails(true), setTimeout(() => { toggleWorkerEdit(true) }, 200); }} className="rounded-md bg-[#f2da1d] mt-4 2xs:mt-0 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-[#33806b] shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33806b]">Edit Profile</button>
        </div>
      </div>

      <div className="w-full px-4 flex justify-center flex-wrap mt-6">
        <div className="w-full sm:w-11/12">

          {/* Mobile Carousel */}
          <div className="block sm:hidden relative">
            <div className="overflow-hidden rounded-lg shadow-md border border-[#33806b]/30">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)`}}>
                {[WorkerFormData.ShopPhoto1, WorkerFormData.ShopPhoto2, WorkerFormData.ShopPhoto3].map((photo, idx) => (
                  <div key={idx} className="flex-shrink-0 w-full h-64">
                    <img src={photo} alt={`Shop ${idx + 1}`} className="object-cover w-full h-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? 2 : prev - 1))} className="absolute top-1/2 left-2 -translate-y-1/2 bg-[#33806b] text-white rounded-full p-2 hover:bg-[#2a6b58] transition">
              ‹
            </button>
            <button onClick={() => setCurrentIndex((prev) => (prev === 2 ? 0 : prev + 1))} className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#33806b] text-white rounded-full p-2 hover:bg-[#2a6b58] transition">
              ›
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-3 space-x-2">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${ currentIndex === idx ? 'bg-[#f2da1d]' : 'bg-[#33806b]/40 hover:bg-[#33806b]/70'}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            <div className="h-[400px] row-span-2 col-span-2 overflow-hidden rounded-lg border border-[#33806b]/30 shadow-sm hover:shadow-md transition">
              <img src={WorkerFormData.ShopPhoto1} alt="Shop" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"/>
            </div>
            <div className="h-[190px] overflow-hidden rounded-lg border border-[#f2da1d]/50 shadow-sm hover:shadow-md transition">
              <img src={WorkerFormData.ShopPhoto2} alt="Shop" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"/>
            </div>
            <div className="h-[190px] overflow-hidden rounded-lg border border-[#f2da1d]/50 shadow-sm hover:shadow-md transition">
              <img src={WorkerFormData.ShopPhoto3} alt="Shop" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"/>
            </div>
          </div>
        </div>
      </div>


      <div className='w-full flex justify-center sm:px-4'>
        <div className='w-full px-4 sm:p-0 bg-white shadow-lg'>
          <div className="border-b border-gray-300 pb-12 sm:px-8 w-full">

            <div className="w-full bg-gray-50 min-h-screen p-4 sm:py-8">

              {/* Section Header */}
              <div className="bg-[#33806b] text-white rounded-xl shadow-lg p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between">
    <h2 className="text-3xl font-bold tracking-wide">Worker & Owner Details</h2>
    {/* <div className="mt-4 sm:mt-0 bg-[#f2da1d] text-[#33806b] font-semibold px-5 py-2 rounded-md shadow hover:brightness-95 transition-all duration-200">
      View Verification Status
    </div> */}
  </div>

  {/* Main Info Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">

    {/* SHOP DETAILS SECTION */}
    <div className="col-span-6">
      <h3 className="text-2xl font-semibold text-[#33806b] mb-4 border-b-2 border-[#f2da1d] inline-block">
        🏪 Worker Details
      </h3>
    </div>

    {/* Shop Info Cards */}
    <div className="col-span-6 bg-white rounded-xl shadow-md border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Shop Name</label>
        <p className="mt-1 capitalize text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopName}
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Shop Category</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopCategory}
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Area</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {Array.isArray(WorkerFormData.Area)
            ? WorkerFormData.Area.join(", ")
            : WorkerFormData.Area || ""}
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-[#33806b]">Shop Description</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopDescription}
        </p>
      </div>
      <div className="sm:col-span-3">
        <label className="block text-sm font-semibold text-[#33806b]">Shop Address</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopAddress}
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">City</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.City}
        </p>
      </div>
    </div>

    {/* OWNER DETAILS SECTION */}
    <div className="col-span-6 mt-10">
      <h3 className="text-2xl font-semibold text-[#33806b] mb-4 border-b-2 border-[#f2da1d] inline-block">
        👤 Owner Details
      </h3>
    </div>

    <div className="col-span-6 bg-white rounded-xl shadow-md border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Full Name</label>
        <p className="mt-1 capitalize text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.FullName}
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Email Address</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopEmail}
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#33806b]">Phone Number</label>
        <p className="mt-1 text-gray-800 bg-gray-50 rounded-md px-3 py-2 border border-gray-200 shadow-sm">
          {WorkerFormData.ShopPhoneNumber}
        </p>
      </div>
    </div>

    {/* DOCUMENTS SECTION */}
    <div className="col-span-6 mt-10">
      <h3 className="text-2xl font-semibold text-[#33806b] mb-4 border-b-2 border-[#f2da1d] inline-block">
        🗂️ Owner’s ID Documents
      </h3>
    </div>

    <div className="col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Aadhar Front */}
      <div className="bg-white rounded-xl border border-[#33806b]/40 shadow-sm hover:shadow-lg p-4 flex flex-col items-center transition-transform hover:scale-105">
        <div className="w-full h-52 overflow-hidden rounded-lg border-2 border-[#f2da1d]/60">
          <img
            src={WorkerFormData.AadharFront}
            alt="Aadhar Front"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="mt-3 text-[#33806b] font-semibold">Aadhar Front</span>
      </div>

      {/* Aadhar Back */}
      <div className="bg-white rounded-xl border border-[#33806b]/40 shadow-sm hover:shadow-lg p-4 flex flex-col items-center transition-transform hover:scale-105">
        <div className="w-full h-52 overflow-hidden rounded-lg border-2 border-[#f2da1d]/60">
          <img
            src={WorkerFormData.AadharBack}
            alt="Aadhar Back"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="mt-3 text-[#33806b] font-semibold">Aadhar Back</span>
      </div>

      {/* Pan Card */}
      <div className="bg-white rounded-xl border border-[#33806b]/40 shadow-sm hover:shadow-lg p-4 flex flex-col items-center transition-transform hover:scale-105">
        <div className="w-full h-52 overflow-hidden rounded-lg border-2 border-[#f2da1d]/60">
          <img
            src={
              WorkerFormData.PanCard &&
              WorkerFormData.PanCard.startsWith("http")
                ? WorkerFormData.PanCard
                : ""
            }
            alt="Pan Card"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="mt-3 text-[#33806b] font-semibold">Pan Card</span>
      </div>
    </div>
  </div>
</div>


            <div className="mt-10 grid grid-cols-1  gap-x-6 gap-y-8 sm:grid-cols-6">
              
              

             

             

            
              

             


              


              {/* Sub Service  */}
              
              {ServiceFormData?.isService && Array.isArray(ServiceFormData?.Services) && (
  <div className="col-span-2 sm:col-span-6 grid grid-cols-1 gap-y-6">

    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#33806b] text-white rounded-lg px-6 py-4 shadow-md">
      <h2 className="text-2xl font-semibold">Service Name & Charges</h2>
      <button
        type="button"
        onClick={() => toggleServiceForm(true)}
        className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#f2da1d] text-[#33806b] font-semibold shadow hover:brightness-95 transition-all duration-200"
      >
        Edit Services
      </button>
    </div>

    {/* Service List */}
    <div className="grid grid-cols-1 gap-6 mt-4">
      {ServiceFormData.Services.map((serviceGroup, groupIdx) => (
        <div
          key={groupIdx}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5"
        >
          {/* Simple service (no sub-services) */}
          {serviceGroup.Charge !== undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#33806b] mb-1">
                  Service
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                  {serviceGroup.ServiceName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#33806b] mb-1">
                  Charge
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                  Rs.{serviceGroup.Charge}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Complex service with sub-services */}
              <h3 className="text-lg font-semibold text-[#33806b] mb-3 border-b border-[#f2da1d] pb-1">
                {groupIdx + 1}. {serviceGroup.ServiceName}
              </h3>

              {serviceGroup.SubServices.map((sub, subIdx) => (
                <div
                  key={subIdx}
                  className="mb-5 bg-gray-50 rounded-md p-4 border border-gray-200"
                >
                  <h4 className="text-md font-medium text-[#33806b] mb-3">
                    {sub.Service}
                  </h4>

                  {/* Subservice with details */}
                  {Array.isArray(sub.Details) ? (
                    sub.Details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-[#33806b] mb-1">
                            Detail
                          </label>
                          <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                            {detail.Detail}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#33806b] mb-1">
                            Charge
                          </label>
                          <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                            Rs.{detail.Charge}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#33806b] mb-1">
                          Charge
                        </label>
                        <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900">
                          Rs.{sub.Charge}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  </div>
)}





          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default WorkerProfile