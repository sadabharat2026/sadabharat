import React from 'react';
import HeroCarousel from './HeroCarousel';
import Categories from './Categories';
import TrendingOffers from './TrendingOffers';
import FeaturedProducts from './FeaturedProducts';
import BestSellers from './BestSellers';
import FeaturesBar from './FeaturesBar';
import Testimonials from './Testimonials';
import InstagramFeed from './InstagramFeed';

const Home = () => {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero Carousel Banner Section */}
      <HeroCarousel />
      
      {/* Shop by Category Circle Icons Section */}
      <Categories />
      
      {/* 3 Trending Offers Banner Cards Section */}
      <TrendingOffers />
      
      {/* Best Selling Products Swiper Slider */}
      <BestSellers />
      
      {/* Recommended For You Swiper Slider */}
      <FeaturedProducts />

      {/* Customer Testimonials - just before footer */}
      <Testimonials />

      {/* Instagram Feed Section */}
      <InstagramFeed />
      
      {/* Bottom Features Banner Bar (100% Natural, etc.) */}
      <FeaturesBar />
    </div>
  );
};

export default Home;
