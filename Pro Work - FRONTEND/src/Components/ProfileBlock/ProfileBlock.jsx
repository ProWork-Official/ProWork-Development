import next_icon from '../../Assets/next_W.png'

function ProfileBlock(props) {
  return (
    <div className='flex bg-[#33806b] items-center justify-between shadow-md hover:shadow-lg hover:shadow-[#33806b] shadow-[#33806b] rounded-xl px-4 py-[14px] cursor-pointer mx-4 my-2'>
      <h2 className='text-lg text-white'>{props.heading1}</h2>                  
      <img className='h-6' src={next_icon} alt="" />
    </div>
  )
}

export default ProfileBlock