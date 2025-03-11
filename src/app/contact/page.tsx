import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="heading-lg text-white mb-4">Get in Touch</h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Ready to elevate your digital presence? Let's discuss how Midwave Studio can transform 
                your vision into a compelling digital experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#0f0f13] p-6 rounded-lg border border-[#b85a00]/20">
                <div className="bg-[#b85a00]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                <p className="text-gray-400">
                  <a href="tel:+14155551234" className="hover:text-[#b85a00] transition-colors">
                    (415) 555-1234
                  </a>
                </p>
              </div>
              
              <div className="bg-[#0f0f13] p-6 rounded-lg border border-[#b85a00]/20">
                <div className="bg-[#b85a00]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-gray-400">
                  <a href="mailto:hello@midwavestudio.com" className="hover:text-[#b85a00] transition-colors">
                    hello@midwavestudio.com
                  </a>
                </p>
              </div>
              
              <div className="bg-[#0f0f13] p-6 rounded-lg border border-[#b85a00]/20">
                <div className="bg-[#b85a00]/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <p className="text-gray-400">
                  123 Design Avenue<br />
                  San Francisco, CA 94103
                </p>
              </div>
            </div>
            
            <ContactForm />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 