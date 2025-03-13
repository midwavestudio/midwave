'use client';

import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import Services from './components/Services';
import CallToAction from './components/CallToAction';
import BackgroundDesign from './components/BackgroundDesign';

export default function Home() {
  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      <Header />
      
      <main>
        <Hero />
        <FeaturedProjects />
        <Services />
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  );
}
