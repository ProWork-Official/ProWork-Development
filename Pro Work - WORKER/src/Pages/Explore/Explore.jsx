import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
function Explore() {
  return (
    <div className='flex flex-col pt-20 w-screen mt-8'>
      <Helmet>
        <title>Pro Work - Explore</title>
          <meta
            name="description"
            content="Explore all the home and personal services offered by ProWork in Prayagraj. Verified professionals, fair pricing, quick booking."
          />
          <link rel="canonical" href="https://prowork.org.in/explore" />
        </Helmet>
      <div className="w-full max-w-[1250px] mx-auto px-4 xl:px-0">
        <div className="mb-8">
          <h1 className='text-3xl md:text-4xl lg:text-5xl mb-4 font-bold text-[#33806b]'>Explore</h1>
          <p className='text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed'>
            We are here to provide you with the best work at the most affordable price with just one click. No hassle of walking out and finding the right person for your work, because we have already done that for you. At ProWork, we employ experienced workers to solve your daily problems.
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
  {/* <!-- Idea Box --> */}
  <div className="bg-[#f2da1d] border-2 border-[#33806b] rounded-xl lg:rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1f2937] mb-6 md:mb-8">Idea</h2>
    <p className="text-base md:text-lg lg:text-xl text-[#1f2937] leading-relaxed mb-4">
      The idea of ProWork first sparked in the minds of our founders during their college days. With passion and persistence, they spent a year shaping that vision—turning a simple idea into a powerful business plan through careful planning and flawless execution.
    </p>
    <Link to="#" className="inline-block text-right w-full hover:text-[#33806b] transition-colors duration-300">
      <span className="text-lg md:text-xl lg:text-2xl font-semibold hover:underline">Read more</span>
    </Link>
  </div>

  {/* <!-- Starting Box --> */}
  <div className="bg-[#33806b] border-2 border-[#f2da1d] rounded-xl lg:rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">Starting</h2>
    <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed mb-4">
      On January 1st, 2025, we proudly launched our ProWork website. It's a moment of celebration, filled with joy and excitement. As we stand at the beginning of this journey, we have a clear vision for the future and a well-defined plan to execute, ensuring we continue to grow and serve with excellence.
    </p>
    <Link to="#" className="inline-block text-right w-full hover:text-[#f2da1d] transition-colors duration-300">
      <span className="text-lg md:text-xl lg:text-2xl font-semibold hover:underline">Read more</span>
    </Link>
  </div>
</div>



      </div>
    </div>
  )
}

export default Explore