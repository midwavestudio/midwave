import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactCTA from '../components/ContactCTA';
import ServicesContent from '../components/ServicesContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Midwave Studio',
  description: 'Discover our comprehensive range of high-fidelity digital design and software development services tailored for luxury real estate, boutique travel, and creative studios.',
  keywords: ['design services', 'software development', 'digital strategy', 'UX design', 'brand identity'],
};

const ServicePage = () => {
  return (
    <main className="min-h-screen bg-[#09090b] relative">
      <Header />
      <ServicesContent />
      <ContactCTA />
      <Footer />
    </main>
  );
};

export default ServicePage; 