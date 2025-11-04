import {useState} from 'react'

function FeedbackForm({ onClose, onAddFeedback }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [feedback , setFeedback ] = useState('')
  const [image, setImage] = useState(null)
  const [userType, setUserType] = useState('customer')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onAddFeedback({ name, role, feedback, image, userType,})
  }
   
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-[#33806b]">Add Feedback</h2>
      <label className="font-semibold">
        I am a
        <select
          className="mt-1 p-2 border rounded w-full"
          value={userType}
          onChange={e => setUserType(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="worker">Worker</option>
        </select>
      </label>
      <label className="font-semibold">
        Full Name
        <input
          type="text"
          className="mt-1 p-2 border rounded w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>
       <label className="font-semibold">
        Role
        <input
          type="text"
          className="mt-1 p-2 border rounded w-full resize-y min-h-[80px] max-h-[200px]"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        />
      </label>
      <label className="font-semibold">
        Feedback
        <input
          type="text"
          className="mt-1 p-2 border rounded w-full resize-y min-h-[80px] max-h-[200px]"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          required
        />
      </label>
      <label className="font-semibold">
        Image
        <input
          type="file"
          accept="image/*"
          className="mt-1 p-2 border rounded w-full"
          onChange={e => setImage(e.target.files[0])}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-[#33806b] text-white hover:bg-[#24604e]"
        >
          Add
        </button>
      </div>
    </form>
  )
}

export default FeedbackForm