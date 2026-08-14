import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiArrowRight } from 'react-icons/fi';

// Import images (assuming we'll move the generated ones here)
import contactHero from '../../assets/images/contact_hero.png';
import contactThumb from '../../assets/images/contact_thumb.png';
import { getWhatsAppHref, handleWhatsAppClick } from '../../utils/whatsapp';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-brand-pink selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-12 pb-2 md:pb-6 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-8">
            {/* Left Column: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-brand-gold  uppercase tracking-[0.2em] text-[9px] md:text-xs mb-1 block"
              >
                Inquire With Us
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-7xl font-decorative font-black italic text-[#5C2E3E] leading-[0.9] mb-3"
                style={{ letterSpacing: '-0.01em' }}
              >
                Let's <br />
                <span className="relative">
                  Connected
                  <span className="absolute -bottom-0.5 right-0 flex space-x-0.5">
                    <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full"></span>
                  </span>
                </span>
                <span className="text-brand-pink ">!!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-500 text-xs md:text-sm  max-w-sm mx-auto lg:mx-0 leading-relaxed font-['Poppins']"
              >
                "Because every drop of wellness, every ritual, and every touch of nature deserves to be remembered."
              </motion.p>
            </div>

            {/* Right Column: Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0]
              }}
              transition={{
                opacity: { duration: 1 },
                scale: { duration: 1 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="flex-1 relative w-full max-w-[260px] md:max-w-xs mx-auto lg:mx-0"
            >
              <div className="relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden aspect-[4/5] shadow-xl border-[6px] border-white/50">
                <img
                  src={contactHero}
                  alt="Beauty and Nature"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-pink/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-gold/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-6 md:py-10 bg-brand-pink/5 border-y border-brand-pink/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-center">
            {/* Contact Details Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 md:gap-x-12">
              <ContactInfo
                icon={<FiMail size={16} />}
                label="Email us at"
                value="care@sadabharat.com"
                href="mailto:care@sadabharat.com"
              />
              <ContactInfo
                icon={<FiPhone size={16} />}
                label="Talk to us"
                value="+91 97727 77736"
                href="tel:+919772777736"
              />
              <ContactInfo
                icon={<FiPhone size={16} />}
                label="WhatsApp"
                value="+91 97727 77736"
                href={getWhatsAppHref()}
                onClick={handleWhatsAppClick()}
              />
              <ContactInfo
                icon={<FiInstagram size={16} />}
                label="Follow our journey"
                value="@sadabharatayurvedic"
                href="https://instagram.com/sadabharatayurvedic/"
              />
              <ContactInfo
                icon={<FiMapPin size={16} />}
                label="Visit our HQ"
                value={<>Sada Bharat Ayurvedic HQ<br />Fatehabad-125050 Haryana</>}
                href="#"
              />
            </div>

            {/* Small Image Overlay Design */}
            <div className="lg:col-span-2 relative mt-6 lg:mt-0 flex items-center justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                animate={{ y: [0, 8, 0] }}
                transition={{
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="w-40 md:w-52 h-52 md:h-64 rounded-[1.5rem] overflow-hidden shadow-lg border-4 md:border-6 border-white group">
                  <img
                    src={contactThumb}
                    alt="Product Detail"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Float CTA */}
                <motion.a
                  href={getWhatsAppHref()}
                  onClick={handleWhatsAppClick()}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -bottom-4 -right-2 md:-right-6 bg-[#5C2E3E] text-white px-5 py-3 rounded-full  uppercase tracking-widest text-[8px] flex items-center gap-2 shadow-xl group transition-all"
                >
                  Connect With Us
                  <FiArrowRight className="text-brand-pink group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Maps Section - Compact */}
      <section className="py-8 bg-white border-t border-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-brand-pink/5 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full space-y-4">
              <div className="inline-block px-3 py-1 bg-white rounded-full border border-brand-pink/10 shadow-sm">
                <span className="text-[9px]  text-brand-pink uppercase tracking-widest">Store Locator</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-decorative font-black italic text-[#5C2E3E] leading-tight ">
                Our Physical <span className="text-brand-gold">Sanctuary</span>
              </h2>
              <p className="text-[10px] md:text-xs text-gray-500 font-['Poppins'] max-w-sm leading-relaxed">
                Step into our HQ to experience the essence of pure Ayurvedic wellness in person.
              </p>

              <div className="pt-2">
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-dark text-white px-6 py-3 rounded-xl text-[9px]  uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-pink transition-all w-fit shadow-lg"
                >
                  <FiMapPin size={12} /> Get Directions
                </a>
              </div>
            </div>

            <div className="flex-1 w-full h-[250px] md:h-[320px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white group relative">
              <iframe
                title="Store Location"
                src="https://maps.google.com/maps?q=29.513181,75.450953&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Social Bar */}
      <footer className="py-8 bg-brand-pink/5 overflow-hidden border-t border-brand-pink/10">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex space-x-8 mb-4">
            <SocialIcon icon={<FiInstagram />} href="https://instagram.com/sadabharatayurvedic/" />
            <SocialIcon icon={<FiFacebook />} href="https://facebook.com/sadabharatayurvedic/" />
            <SocialIcon icon={<FiTwitter />} href="#" />
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest ">
            Stay Inspired &bull; Sada Bharat Ayurvedic
          </p>
        </div>
      </footer>
    </div>
  );
};

const ContactInfo = ({ icon, label, value, href, onClick }) => (
  <motion.a
    href={href}
    onClick={onClick}
    target={href?.startsWith('http') ? '_blank' : undefined}
    rel={href?.startsWith('http') ? 'noreferrer' : undefined}
    whileHover={{ x: 5 }}
    className="flex items-center gap-3 md:gap-4 group cursor-pointer min-w-0"
  >
    <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[7px] md:text-[8px] uppercase  text-gray-400 tracking-[0.2em] mb-0.5">{label}</p>
      <p className="text-brand-dark  text-[10px] md:text-[13px] break-all md:break-words leading-tight group-hover:text-brand-pink transition-colors">{value}</p>
    </div>
  </motion.a>
);

const SocialIcon = ({ icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-brand-pink/10 hover:text-brand-dark hover:border-brand-pink transition-all"
  >
    {icon}
  </a>
);

export default Contact;
