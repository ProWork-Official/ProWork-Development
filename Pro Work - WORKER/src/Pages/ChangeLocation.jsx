import { useContext } from "react";
import { MyContext } from "../ContextAPI";
import ProworkLogo from '../Assets/ProworkLogo.png'
import UpdateLocation from "../Components/UpdateLocation";

export default function ChangeLocation() {
  const { showMap, setShowMap } = useContext(MyContext);

  return (
    <div className="z-[100] fixed top-0 left-0 w-full h-full bg-gray-50 flex flex-wrap items-center justify-center pt-6">
      <img src={ProworkLogo} alt="" className='w-[74px] lg:w-[90px]' />
      <div className="w-full h-[90%] bg-white p-8 rounded-lg shadow-2xl space-y-8 mt-2">
        {!showMap ? 
          <div>
            {/* Heading */}
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              Location Not Supported
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-6">
              This service is available only in Prayagraj, Uttar Pradesh. Please update your location to continue."
            </p>

            {/* Buttons Section */}
            <button onClick={() => setShowMap(true)} className="px-6 py-3 w-full sm:w-auto bg-[#33806b] text-[#f2da1d] rounded-lg hover:bg-[#296354] transition duration-300">
              Change Location
            </button>
          </div> 
          :
          <UpdateLocation />
        }
      </div>
    </div>
  );
}
