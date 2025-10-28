import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import './Contact.css'
import gmail from '../../Assets/gmail.png'
import mobile from '../../Assets/mobile.png'
import whatsapp from '../../Assets/whatsapp.png'
import { URL } from '../../func.jsx'
import { toastSuccess, toastFailure } from '../../func.jsx'

const Contact = () => {
  const supportEmail = "prowork24.7customercare@gmail.com";
  const phoneNumber = "+919450066558";

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [usage, setUsage] = useState({ countLast24h: 0, nextAllowed: null });
  const [disabled, setDisabled] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);

  useEffect(() => {
    // fetch usage on mount
    async function fetchUsage() {
      try {
        const res = await fetch(`${URL}/contact/usage`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUsage(data || { countLast24h: 0, nextAllowed: null });
          setDisabled(Boolean(data?.countLast24h >= 2));
        } else {
          // ignore if not authenticated or other error
          setUsage({ countLast24h: 0, nextAllowed: null });
        }
      } catch (err) {
        console.error('Usage fetch error', err);
      }
    }
    fetchUsage();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCooldownModal = (msg) => {
    setShowCooldownModal(true);
    setTimeout(() => {}, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) {
      return setShowCooldownModal(true);
    }

    try {
      const payload = { name: formData.name, email: formData.email, message: formData.message };
      const res = await fetch(`${URL}/contact`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 201) {
        const data = await res.json().catch(() => null);
        setFormData({ name: '', email: '', message: '' });
        typeof toastSuccess === 'function' ? toastSuccess('Message sent — thank you!') : alert('Message sent');

        // refresh usage
        const usageRes = await fetch(`${URL}/contact/usage`, { credentials: 'include' });
        if (usageRes.ok) {
          const u = await usageRes.json();
          setUsage(u);
          setDisabled(Boolean(u?.countLast24h >= 2));
        }
      } else if (res.status === 429) {
        const err = await res.json().catch(() => ({ message: 'Limit reached' }));
        setDisabled(true);
        setUsage((prev) => ({ ...prev, nextAllowed: err.availableAt || err.nextAllowed || prev.nextAllowed }));
        setShowCooldownModal(true);
        typeof toastFailure === 'function' ? toastFailure(err.message || 'Limit reached') : null;
      } else {
        const err = await res.json().catch(()=>({ message: 'Failed to send' }));
        typeof toastFailure === 'function' ? toastFailure(err.message || 'Failed to send') : alert(err.message || 'Failed to send');
      }
    } catch (err) {
      console.error('Contact submit error', err);
      typeof toastFailure === 'function' ? toastFailure('Network error') : alert('Network error');
    }
  };

  function redirectToWhatsApp() {
    const number = 918400732040;
    const message = encodeURIComponent("Hello! I would like to inquire about your services on ProWork.");
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, "_blank");
  }

  const cooldownMessage = usage?.nextAllowed
    ? `You reached the 2-message limit. You can send again after: ${new Date(usage.nextAllowed).toLocaleString()}.`
    : 'You have reached the 2 messages limit for 24 hours. Please try again later.';

  return (
    <div className='flex flex-col pt-20 w-full min-h-screen mt-8'>
      <Helmet>
        <title>Pro Work - Contact Us</title>
        <meta
          name="description"
          content="Need help? Contact ProWork support team for queries, bookings, complaints or partnerships. We’re here to help you in Prayagraj."
        />
        <link rel="canonical" href="https://prowork.org.in/contact-us" />
      </Helmet>

      <img src={whatsapp} alt="Whats App logo" className='fixed h-12 right-4 bottom-4 z-50 cursor-pointer' onClick={redirectToWhatsApp} />
      <div className="w-full max-w-[1250px] mx-auto px-4 xl:px-0 mb-8">
        <div className="mb-8">
          <h1 className='text-3xl md:text-4xl lg:text-5xl mb-4 text-[#33806b]'>Contact Us</h1>
          <p className='text-sm md:text-base lg:text-lg text-gray-700 text-justify'>We’d love to hear from you! Whether you have a question or need support, we’re here to help.</p>
        </div>

        <div className="w-full mt-8 lg:mt-0 flex flex-wrap bg-white shadow-lg rounded-lg border border-gray-200">
          <div className='w-full md:w-1/2 p-4 lg:p-8'>
            <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A9D8A] transition duration-300"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A9D8A] transition duration-300"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A9D8A] transition duration-300"
                rows="5"
                required
              />

              <button
                type="submit"
                onClick={(e) => { if (disabled) { e.preventDefault(); setShowCooldownModal(true); } }}
                disabled={disabled}
                className={`w-full py-3 px-6 text-white rounded-lg font-semibold transition duration-300 ${disabled ? 'bg-[#3A9D8A]  opacity-50 cursor-not-allowed' : 'bg-[#3A9D8A] hover:bg-[#2f8a77]'}`}
              >
                Send Message
              </button>
            </form>
            {/* brief status */}
            <div className="mt-3 text-sm text-gray-600">
              {disabled ? 'You have reached the daily limit of 2 messages.' : `You have sent ${usage?.countLast24h || 0} message(s) in the last 24 hours.`}
            </div>
          </div>

          <div className="w-full md:w-1/2 py-6 md:py-0 flex flex-wrap justify-center items-center">
            <div className='mt-2 shadow-2xl sm:h-48 sm:w-96 m-4 sm:m-0 p-4 rounded-xl border-gray-700 flex flex-wrap'>
              <h2 className='w-full text-2xl'>Need help? Reach us here.</h2>
              <a className="flex justify-center items-center  py-3 pr-4 rounded-lg font-semibold transition duration-300 "
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}`}
                target="_blank" rel="noopener noreferrer"
              >
                <img src={gmail} alt="" className='h-20 g h gmail' />
              </a>

              <a className="flex justify-center items-center  py-3 pl-4 rounded-lg font-semibold transition duration-300" href={`tel:${phoneNumber}`}>
                <img src={mobile} alt="" className=' g h link' />
              </a>
            </div>

            <div className='mt-2 shadow-2xl sm:h-48 sm:w-96 m-4 sm:m-0 p-4 rounded-xl border-gray-700 flex flex-wrap'>
              <h2 className='w-full text-2xl'>Any other issue?.</h2>
              <h2 className='w-full text-base text text-gray-500'>We truly understands your concern and is committed to resolving your issues with utmost care. Contact us here!</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Cooldown modal */}
      {showCooldownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <p className="text-gray-800 mb-4">{cooldownMessage}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowCooldownModal(false)} className="px-4 py-2 rounded bg-[#33806b] text-white">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
