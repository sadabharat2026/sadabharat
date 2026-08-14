import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { getWhatsAppHref, handleWhatsAppClick } from '../../utils/whatsapp';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-12 bg-white relative overflow-hidden border-y border-brand-pink/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-[11px] md:text-[13px] font-black mb-1 text-brand-dark uppercase tracking-[0.3em]">Contact Us On WhatsApp</h2>
          <p className="text-[8px] md:text-[9px] text-gray-400 mb-6 font-bold uppercase tracking-widest">Get Instant Ritual Support & Organic Updates.</p>
          
          <a 
            href={getWhatsAppHref()}
            onClick={handleWhatsAppClick()}
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-brand-dark text-white px-10 py-3 rounded-none text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#25D366] transition-all active:scale-95 shadow-lg group"
          >
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-[#25D366] transition-colors">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            Send Message
          </a>
          
          <p className="text-[7px] text-gray-400 mt-6 italic uppercase tracking-tighter opacity-70">
            Available Mon-Sat (10AM - 7PM) <br />
            Our Ritualists are waiting for your <span className="text-brand-pink font-bold">Divine Connection</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
