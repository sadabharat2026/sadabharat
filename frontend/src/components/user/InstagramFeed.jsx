import React, { useState, useEffect } from 'react';
import { FiInstagram } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ScrollHeading from '../shared/ScrollHeading';

const InstagramFeed = () => {
  const [instaPosts, setInstaPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/instagram');
        if (res.data?.success && res.data?.data?.posts) {
          // Filter out hidden posts and take the first 5
          const visiblePosts = res.data.data.posts
            .filter(post => post.status !== 'Hide')
            .slice(0, 5);
          setInstaPosts(visiblePosts);
        }
      } catch (error) {
        console.error('Error fetching Instagram posts:', error);
      }
    };
    fetchPosts();
  }, []);

  if (instaPosts.length === 0) return null;

  return (
    <section className="pt-2 pb-6 md:pt-4 md:pb-8 bg-white overflow-hidden">
      <div className="w-full px-4 md:px-8 relative z-10 max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-4 md:mb-6">
          <ScrollHeading as="div" className="flex items-center justify-center w-10 h-10 bg-[#F2F6E8] rounded-full mb-3 text-[#054425]">
            <FiInstagram size={20} />
          </ScrollHeading>
          <ScrollHeading 
            as="h2"
            className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight mb-1"
          >
            Follow Us on Instagram
          </ScrollHeading>
          <ScrollHeading
            as="a"
            href="https://www.instagram.com/sadabharatayurvedic?utm_source=qr"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[#D4AF37] hover:text-[#054425] transition-colors"
          >
            @sadabharatayurvedic
          </ScrollHeading>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          {instaPosts.map((post, index) => (
            <motion.a
              key={post._id || index}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative aspect-square overflow-hidden group rounded-xl ${index === 4 ? 'hidden md:block' : ''}`}
            >
              <img 
                src={post.image} 
                alt={`Instagram Post ${post.id}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <FiInstagram size={32} className="text-white scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-100" />
              </div>
            </motion.a>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default InstagramFeed;
