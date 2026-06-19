import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConsultationCTA = ({ onChatClick }) => {
  return (
    <section className="w-full">
      <div className="bg-[#054425] rounded-2xl p-5 md:p-6 text-center relative overflow-hidden group max-w-lg mx-auto shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out -skew-x-12"></div>
        <div className="relative z-10 mx-auto">
          <h2 className="text-lg md:text-xl font-serif font-black text-white mb-1.5 leading-tight italic transform group-hover:scale-105 transition-transform duration-500">
            Divine <span className="text-brand-gold">Personalization</span>
          </h2>
          <p className="text-white/80 text-[8.5px] md:text-[9.5px] mb-4 font-serif leading-relaxed px-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            Connect with our master consultants for a bespoke organic curation tailored to your unique skin essence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button 
              onClick={onChatClick}
              className="w-full sm:w-auto bg-brand-gold text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[8.5px] shadow-2xl hover:bg-white hover:text-brand-gold transition-all text-center"
            >
              Live Chat
            </button>
            <a 
              href="https://wa.me/919896472169?text=Hello%20Sada Bharat%20Shringar,%20I%20have%20an%20inquiry%20regarding%20your%20products."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-white/5 text-white backdrop-blur-md px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[8.5px] border border-white/10 text-center"
            >
              WhatsApp Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationCTA;
