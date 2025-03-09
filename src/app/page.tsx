import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import FeaturedProjects from './components/FeaturedProjects';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Header />
      <Hero />
      <Services />
      <FeaturedProjects />
      <Footer />
    </main>
  );
}
