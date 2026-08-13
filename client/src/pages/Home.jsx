import React from 'react';
import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import NewArrivals from '../components/home/NewArrivals';
import TrendingNow from '../components/home/TrendingNow';
import SaleBanner from '../components/home/SaleBanner';
import FeaturedProducts from '../components/home/FeaturedProducts';
// import BlogPreview from '../components/home/BlogPreview';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <main>
      <title>Fade Find — Premium Fashion Clothing Store</title>
      <Hero />
      <Categories />
      <NewArrivals />
      {/* <TrendingNow /> */}
      <SaleBanner />
      <FeaturedProducts />
      {/* <BlogPreview /> */}
      <Newsletter />
    </main>
  );
}
