import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import BackgroundShape from '../../Components/Feedback/backgroundShape'
import FeedbackForm from "../../Components/Feedback/FeedbackForm";

function MediaSlideshow({ media, onVideoPlay, onVideoPause }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!media || media.length === 0) return;
    setCurrent(0);
  }, [media]);

  useEffect(() => {
    if (!media || media.length <= 1 || playing) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % media.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [media, playing]);

  const file = media && media.length > 0 ? media[current] : null;
  if (!file) return null;

  return (
    <div className="w-full flex justify-center items-center mb-4 relative">
      {file.type.startsWith("image/") ? (
        <img
          src={file.url}
          alt="testimonial media"
          className="w-full h-60 object-cover rounded"
        />
      ) : file.type.startsWith("video/") ? (
        <video
          src={file.url}
          controls
          className="w-full h-60 object-cover rounded"
          onPlay={() => {
            setPlaying(true);
            onVideoPlay && onVideoPlay();
          }}
          onPause={() => {
            setPlaying(false);
            onVideoPause && onVideoPause();
          }}
          onEnded={() => {
            setPlaying(false);
            onVideoPause && onVideoPause();
          }}
        />
      ) : null}
      {media.length > 1 && (
        <div className="absolute right-4 top-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {current + 1}/{media.length}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial, onMediaChange, onVideoPlay, onVideoPause }) {
  const fileInputRef = useRef();

  const handleMediaUpload = (e) => {
  const newFiles = Array.from(e.target.files);
  // Combine existing and new, but max 5
  const combined = [
    ...(testimonial.media || []),
    ...newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      file,
    })),
  ].slice(0, 5);
  onMediaChange(combined);
};

  return (
    <div className="bg-gradient-to-br from-green-300 via-yellow-50 to-yellow-200 rounded-2xl p-2 shadow-md border border-green-300 hover:shadow-lg transition-all relative">
      <h3 className="text-green-900 font-semibold text-lg">{testimonial.name}</h3>
      <p className="text-green-700 text-sm mb-2">{testimonial.role}</p>
      <MediaSlideshow media={testimonial.media} 
        onVideoPlay={onVideoPlay}
        onVideoPause={onVideoPause}
      />
      <p className="text-green-800 italic mb-4">"{testimonial.feedback}"</p>
      <div className="mt-2">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleMediaUpload}
          disabled={testimonial.media && testimonial.media.length >= 5}
        />
        <button
          type="button"
          className="text-sm text-black-700 underline"
          onClick={() => fileInputRef.current.click()}
          disabled={testimonial.media && testimonial.media.length >= 5}
        >
          {testimonial.media && testimonial.media.length >= 5
            ? "Max 5 media uploaded"
            : "Upload Images/Videos"}
        </button>
      </div>
    </div>
  );
}
      
function WorkerTestimonialCard({ testimonial, onMediaChange, onVideoPlay, onVideoPause }) {
  const fileInputRef = useRef();

  const handleMediaUpload = (e) => {
  const newFiles = Array.from(e.target.files);
  // Combine existing and new, but max 5
  const combined = [
    ...(testimonial.media || []),
    ...newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      file,
    })),
  ].slice(0, 5);
  onMediaChange(combined);
};
      

  return (
    <div className="bg-gradient-to-br from-green-300 via-yellow-50 to-yellow-200 p-6 rounded-2xl shadow-md border border-green-300 hover:shadow-lg transition-all relative">
      <h4 className="text-[#33806b] font-bold">{testimonial.name}</h4>
      <span className="text-sm text-gray-500 mb-2 block">{testimonial.role}</span>
      <MediaSlideshow media={testimonial.media}
        onVideoPlay={onVideoPlay}
        onVideoPause={onVideoPause}
      />
      <p className="text-gray-700 mb-4 italic">“{testimonial.feedback}”</p>
      <div className="mt-2">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleMediaUpload}
          disabled={testimonial.media && testimonial.media.length >= 5}
        />
        <button
          type="button"
          className="text-sm text-black underline"
          onClick={() => fileInputRef.current.click()}
          disabled={testimonial.media && testimonial.media.length >= 5}
        >
          {testimonial.media && testimonial.media.length >= 5
            ? "Max 5 media uploaded"
            : "Upload Images/Videos"}
        </button>
      </div>
    </div>
  );
}

export default function Feedback() {
  const [showForm, setShowForm] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [workerTestimonials, setWorkerTestimonials] = useState([]);

  // Carousel and view states
  const [customerRow, setCustomerRow] = useState(0);
  const [workerRow, setWorkerRow] = useState(0);
  const [viewAllCustomer, setViewAllCustomer] = useState(false);
  const [viewAllWorker, setViewAllWorker] = useState(false);

  const CARDS_PER_ROW = 3;
  const customerRows = Math.ceil(testimonials.length / CARDS_PER_ROW);
  const workerRows = Math.ceil(workerTestimonials.length / CARDS_PER_ROW);
  const [isCustomerFading, setIsCustomerFading] = useState(false);
  const [isWorkerFading, setIsWorkerFading] = useState(false);
  const [isAnyCustomerVideoPlaying, setIsAnyCustomerVideoPlaying] = useState(false);
  const [isAnyWorkerVideoPlaying, setIsAnyWorkerVideoPlaying] = useState(false);

   useEffect(() => {
      if (viewAllWorker || isAnyWorkerVideoPlaying) return;
      const interval = setInterval(() => {
        setIsWorkerFading(true);
        setTimeout(() => {
          setWorkerRow((prev) => (prev + 1) % workerRows);
          setIsWorkerFading(false);
        }, 500);
      }, 6000);
      return () => clearInterval(interval);
    }, [workerRows, viewAllWorker, isAnyWorkerVideoPlaying]);

   useEffect(() => {
      if (viewAllCustomer || isAnyCustomerVideoPlaying) return;
      const interval = setInterval(() => {
        setIsCustomerFading(true);
        setTimeout(() => {
          setCustomerRow((prev) => (prev + 1) % customerRows);
          setIsCustomerFading(false);
        }, 500);
      }, 6000);
      return () => clearInterval(interval);
    }, [customerRows, viewAllCustomer, isAnyCustomerVideoPlaying]);

  const displayedTestimonials = viewAllCustomer
    ? testimonials
    : testimonials.slice(customerRow * CARDS_PER_ROW, (customerRow + 1) * CARDS_PER_ROW);

  const displayedWorkerTestimonials = viewAllWorker
    ? workerTestimonials
    : workerTestimonials.slice(workerRow * CARDS_PER_ROW, (workerRow + 1) * CARDS_PER_ROW);

  const handleCustomerMediaChange = (idx, mediaFiles) => {
    setTestimonials((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, media: mediaFiles } : t))
    );
  };

  const handleWorkerMediaChange = (idx, mediaFiles) => {
    setWorkerTestimonials((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, media: mediaFiles } : t))
    );
  };

  const handleAddFeedback = (feedback) => {
    if (feedback.userType === "customer") {
      setTestimonials(prev => [...prev, { ...feedback, media: feedback.image ? [{ url: URL.createObjectURL(feedback.image), type: feedback.image.type }] : [] }]);
      setCustomerRow(0);    
    } else {
      setWorkerTestimonials(prev => [...prev, { ...feedback, media: feedback.image ? [{ url: URL.createObjectURL(feedback.image), type: feedback.image.type }] : [] }]);
      setWorkerRow(0);
    }
    setShowForm(false);
  };

  return (
   <div className="relative min-h-screen bg-white overflow-x-hidden">
      
      {/* USE THE NEW BACKGROUND COMPONENT HERE */}
      <BackgroundShape />
    <div className="relative z-10 flex flex-col pt-20 w-screen mt-8">
      <Helmet>
        <title>Pro Work - Feedback</title>
      </Helmet>

      <div className="w-full max-w-[1250px] mx-auto px-4 xl:px-0 mb-4"> {/* Changed from fixed width to responsive */}
        <div className="bg-[#f2da1d] border-2 border-[#33806b] rounded-xl lg:rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 mb-8">
          <h1 className='text-3xl md:text-4xl lg:text-5xl mb-4 text-[#33806b]'>Feedback</h1>
          <p className='text-sm md:text-base lg:text-lg text-gray-700 text-justify'>ProWork was founded by <b>Harshika Yadav and Ayush Jaiswal</b> with a clear vision: to empower local professionals and simplify your access to household services. Your experience is the most important part of our journey.
          We are committed to our mission of doing great, and every piece of feedback is reviewed responsibly by our team to help us improve.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              className="bg-[#33806b] text-white px-4 py-2 rounded hover:bg-[#24604e] transition"
              onClick={() => setShowForm(true)}
            >
              Add Feedback
            </button>
          </div>
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <FeedbackForm
                  onClose={() => setShowForm(false)}
                  onAddFeedback={handleAddFeedback}
                />
              </div>
            </div>
          )}
        </div>  
          

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 text-center mb-8">
          What Our Customers Say
        </h1>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6 transition-opacity duration-500 ${isCustomerFading ? 'opacity-0' : 'opacity-100'}`}>
           {displayedTestimonials.map((testimonial, index) => (
             <TestimonialCard
               key={index}
               testimonial={testimonial}
               onMediaChange={(mediaFiles) =>
                 handleCustomerMediaChange(
                   testimonials.indexOf(testimonial),
                   mediaFiles
                  )
                }
                onVideoPlay={() => setIsAnyCustomerVideoPlaying(true)}
                onVideoPause={() => setIsAnyCustomerVideoPlaying(false)}
              />
            ))}
        </div>
        <span
          className="cursor-pointer text-green-700 underline block text-center mt-2"
          onClick={() => setViewAllCustomer((v) => !v)}
        >
          {viewAllCustomer ? "View Less" : "View All"}
        </span>
      </div>
      

      <section className="py-16 px-6 lg:px-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#33806b] mb-4">
            What Our Worker Say
          </h2>
          <p className="text-gray-600">
            Real feedback from professionals growing their business with Pro
            Work.
          </p>
        </div>
        <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-500 ${isWorkerFading ? 'opacity-0' : 'opacity-100'}`}>
           {displayedWorkerTestimonials.map((testimonial, idx) => (
             <WorkerTestimonialCard
               key={idx}
               testimonial={testimonial}
               onMediaChange={(mediaFiles) =>
                  handleWorkerMediaChange(
                   workerTestimonials.indexOf(testimonial),
                   mediaFiles
                  )
                }
                onVideoPlay={() => setIsAnyWorkerVideoPlaying(true)}
                onVideoPause={() => setIsAnyWorkerVideoPlaying(false)}
              />
            ))}
         </div>
        <span
          className="cursor-pointer text-[#33806b] underline block text-center mt-2"
          onClick={() => setViewAllWorker((v) => !v)}
        >
          {viewAllWorker ? "View Less" : "View All"}
        </span>
      </section>
    </div>
   </div> 
  );
}
