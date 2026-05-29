import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

const Consultation = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    concern: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans pb-10">
      {/* Hero Section */}
      <div className="relative h-[25vh] min-h-[200px] flex items-center justify-center bg-[#054425] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/footer_pattern.png')] bg-repeat opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-serif font-bold mb-2 tracking-wide"
          >
            Expert Ayurvedic Consultation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-[#D4AF37] font-medium"
          >
            Discover your Dosha. Restore your balance.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Info Column */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
            Why Consult an Ayurvedic Expert?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Ayurveda is a 5,000-year-old system of natural healing that focuses on the individual's unique constitution (Prakriti). Our experienced Vaidyas (Ayurvedic Doctors) provide personalized holistic treatment plans involving diet, lifestyle modifications, and authentic herbal formulations to help you achieve optimal health and beauty from within.
          </p>

          <div className="space-y-4">
            {[
              { title: "Personalized Assessment", desc: "In-depth analysis of your unique mind-body type (Dosha) and underlying imbalances." },
              { title: "Holistic Approach", desc: "Treatment plans that integrate herbal remedies, dietary advice, and lifestyle modifications." },
              { title: "Expert Guidance", desc: "Consult directly with certified Ayurvedic practitioners with years of clinical experience." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-3"
              >
                <div className="mt-1 bg-[#F4F8F5] p-1.5 rounded-full text-[#054425] shrink-0 h-8 w-8 flex items-center justify-center">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-brand-pink/5 border border-brand-pink/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">Have a quick question?</h3>
            <p className="text-sm text-gray-600 mb-4">You can also reach out to us via WhatsApp for quick inquiries regarding our products.</p>
            <a href="https://wa.me/919896472169?text=Hello%20Sada%20Bharat,%20I%20have%20an%20inquiry." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 relative">
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="w-20 h-20 bg-[#F4F8F5] rounded-full flex items-center justify-center text-[#054425] mb-6">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Request Received!</h2>
              <p className="text-gray-600 mb-8 max-w-sm">
                Thank you for reaching out. Our team will contact you shortly to confirm your consultation time and provide further details.
              </p>
              <button 
                onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', phone: '', date: '', time: '', concern: '' }); }}
                className="bg-[#054425] text-white px-8 py-3 rounded-full font-bold text-sm tracking-wider hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Book Another Session
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Book Your Session</h2>
              <p className="text-sm text-gray-500 mb-8">Fill out the form below to request an appointment with our Ayurvedic experts.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all" placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Preferred Date *</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Preferred Time *</label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select required name="time" value={formData.time} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all appearance-none">
                        <option value="" disabled>Select a slot</option>
                        <option value="Morning (10 AM - 12 PM)">Morning (10 AM - 12 PM)</option>
                        <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                        <option value="Evening (5 PM - 7 PM)">Evening (5 PM - 7 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Primary Concern / Health Issue</label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                    <textarea name="concern" value={formData.concern} onChange={handleChange} rows="3" className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-[#054425] focus:bg-white focus:ring-1 focus:ring-[#054425] outline-none transition-all resize-none" placeholder="Briefly describe the health issue..."></textarea>
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-gold text-white py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2">
                  Request Appointment
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consultation;
