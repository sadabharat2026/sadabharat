import React from 'react';
import { motion } from 'framer-motion';
import ScrollHeading from '../shared/ScrollHeading';

import blogFloating1 from '../../assets/images/cat_wellness.png';
import blogFloating2 from '../../assets/images/cat_skincare_new.png';
import blogFloating3 from '../../assets/images/cat_haircare_new.png';
import blogFloating4 from '../../assets/images/cat_essentialoils_new.png';
import insta1 from '../../assets/images/blog_skincare.png';
import insta2 from '../../assets/images/blog_haircare.png';
import insta3 from '../../assets/images/blog_vit_c.png';
import insta4 from '../../assets/images/cat_bathbody_new.png';
import catSkincare from '../../assets/images/cat_skincare.png';
import catWellness from '../../assets/images/cat_wellness.png';
import promoImage from '../../assets/images/promo.png';

const floatingImages = [
  { src: blogFloating1, size: 'w-16 h-20 md:w-24 md:h-32', top: '10%', left: '8%', delay: 0 },
  { src: blogFloating2, size: 'w-14 h-18 md:w-20 md:h-28', top: '22%', left: '22%', delay: 1 },
  { src: blogFloating3, size: 'w-18 h-24 md:w-28 md:h-36', top: '5%', left: '40%', delay: 0.5 },
  { src: blogFloating4, size: 'w-16 h-20 md:w-24 md:h-32', top: '18%', left: '60%', delay: 1.5 },
  { src: insta1, size: 'w-14 h-18 md:w-20 md:h-28', top: '10%', left: '78%', delay: 0.2 },
  { src: insta2, size: 'w-16 h-20 md:w-24 md:h-32', top: '48%', left: '10%', delay: 0.8 },
  { src: insta3, size: 'w-18 h-24 md:w-28 md:h-36', top: '55%', left: '42%', delay: 1.2 },
  { src: insta4, size: 'w-14 h-18 md:w-20 md:h-28', top: '52%', left: '72%', delay: 0.4 },
];

const visionPoints = [
  'Exceptional product quality',
  'Seamless digital shopping experiences',
  'Strong customer relationships',
];

const missionPoints = [
  'Offer carefully curated, high-quality products',
  'Ensure reliable and efficient delivery experiences',
  'Build long-term trust through transparency',
  'Continuously improve through innovation and feedback',
  'Expand while maintaining Indian values and authenticity',
];

const differentiators = [
  'Quality First Approach - Every product is selected with care',
  'Customer-Centric Thinking - Your satisfaction drives everything we do',
  'Transparency & Trust - Clear policies and honest communication',
  'Growing Brand Vision - Built for long-term value',
];

const promisePoints = ['Smooth', 'Reliable', 'Delightful'];

const AboutSection = () => {
  return (
    <div className="w-full">
      {/* Top Floating Gallery Section */}
      <div className="relative w-full h-[250px] md:h-[350px] bg-brand-pink/20 overflow-hidden flex items-center justify-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-brand-pink/10 pointer-events-none"></div>
        
        {/* Floating Images */}
        <div className="absolute inset-0 z-10">
          {floatingImages.map((img, index) => (
            <motion.div
              key={index}
              className={`absolute ${img.size} rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border-4 border-white/30`}
              style={{ top: img.top, left: img.left }}
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, 0, -2, 0]
              }}
              transition={{ 
                duration: 6 + index % 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: img.delay 
              }}
            >
              <img src={img.src} alt="About context" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        {/* Section Heading Overlay (Optional, based on style) */}
        <div className="relative z-20 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-decorative font-black text-brand-dark drop-shadow-lg tracking-tighter italic"
            style={{ textShadow: '2px 2px 4px rgba(255, 255, 255, 0.5)' }}
          >
            Our Story
          </motion.h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Main Text Content */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.8 }}
              className="bg-[#054425] text-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
            >
              {/* Decorative circle */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              
              <ScrollHeading as="h2" className="text-2xl md:text-4xl font-serif font-bold mb-4 italic border-b border-white/20 pb-4">
                About Us
              </ScrollHeading>
              <p className="text-sm md:text-base leading-relaxed opacity-90  tracking-wide">
                At Sada Bharat Ayurvedic, wellness is a way of life. It is about harmony, nature, and purity.
                We are an authentic Indian Ayurvedic brand offering thoughtfully curated remedies and products
                with a seamless, trustworthy shopping experience.
              </p>
              <p className="text-sm md:text-base leading-relaxed opacity-90  tracking-wide mt-4">
                From herb selection to customer-first service, every detail is built on one promise:
                deliver pure Ayurveda you can trust and experiences you can cherish. We are a growing community
                that celebrates natural healing, vitality, and well-being.
              </p>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em]  opacity-70">
                  Quality You Can Trust, Experiences You Can Cherish
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-3"
            >
              <ScrollHeading as="h2" className="text-2xl md:text-4xl font-serif font-bold text-brand-dark italic">
                Our Vision
              </ScrollHeading>
              <ul className="text-gray-600 leading-relaxed font-['Poppins'] space-y-2">
                {visionPoints.map((point) => (
                  <li key={point} className="flex gap-2 items-start">
                    <span className="text-brand-pink ">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 leading-relaxed font-['Poppins']">
                We aim to inspire confidence and elegance in every customer while expanding our reach globally.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-2"
            >
              <ScrollHeading as="h2" className="text-2xl md:text-3xl font-serif font-bold text-brand-dark italic">
                Our Mission
              </ScrollHeading>
              <ul className="text-gray-600 leading-relaxed font-['Poppins'] space-y-2">
                {missionPoints.map((point) => (
                  <li key={point} className="flex gap-2 items-start">
                    <span className="text-brand-pink ">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-2"
            >
              <ScrollHeading as="h2" className="text-2xl md:text-3xl font-serif font-bold text-brand-dark italic">
                What Makes Us Different
              </ScrollHeading>
              <ul className="text-gray-600 leading-relaxed font-['Poppins'] space-y-2">
                {differentiators.map((point) => (
                  <li key={point} className="flex gap-2 items-start">
                    <span className="text-brand-pink ">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-2"
            >
              <ScrollHeading as="h2" className="text-2xl md:text-3xl font-serif font-bold text-brand-dark italic">
                Our Promise
              </ScrollHeading>
              <p className="text-gray-600 leading-relaxed font-['Poppins']">
                Every order is more than a transaction. It is a relationship built on trust.
              </p>
              <p className="text-gray-600 leading-relaxed font-['Poppins']">
                We are committed to making every experience smooth, reliable, and delightful.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {promisePoints.map((point) => (
                  <span
                    key={point}
                    className="px-3 py-1 text-xs  uppercase tracking-wider rounded-full bg-brand-pink/10 text-brand-dark border border-brand-pink/20"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Images with Labels */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-24 self-start space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
            >
              <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
                <div className="bg-brand-pink/80 backdrop-blur-md px-6 py-1 rounded-full border border-white/30 shadow-sm">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white ">
                    •• Skincare ••
                  </span>
                </div>
              </div>
              <img src={catSkincare} alt="Category Skincare" className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
            >
              <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
                <div className="bg-brand-pink/80 backdrop-blur-md px-6 py-1 rounded-full border border-white/30 shadow-sm">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white ">
                    •• Wellness ••
                  </span>
                </div>
              </div>
              <img src={catWellness} alt="Category Wellness" className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
            >
              <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
                <div className="bg-brand-pink/80 backdrop-blur-md px-6 py-1 rounded-full border border-white/30 shadow-sm">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white ">
                    •• Our Brand ••
                  </span>
                </div>
              </div>
              <img src={promoImage} alt="Sada Bharat Ayurvedic Brand" className="w-full h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
