import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactCTA from '../components/ContactCTA';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Midwave Studio',
  description: 'Discover our comprehensive range of high-fidelity digital design and software development services tailored for luxury real estate, boutique travel, and creative studios.',
  keywords: ['design services', 'software development', 'digital strategy', 'UX design', 'brand identity'],
};

const ServicePage = () => {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 md:py-32 border-b border-amber-700/20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Elevating Digital <span className="text-amber-500">Experiences</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10">
              We craft bespoke digital solutions that blend stunning aesthetics with 
              powerful functionality for discerning clients nationwide.
            </p>
          </div>
        </div>
      </section>
      
      {/* Detailed Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-24">
            {/* Digital Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Digital Design</h2>
                <p className="text-gray-400 mb-6">
                  Our design approach combines visual excellence with strategic thinking to create 
                  immersive digital experiences that captivate and engage your audience.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">User Interface Design</h3>
                      <p className="text-gray-400">Crafting intuitive and visually stunning interfaces that elevate your digital presence.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">User Experience Design</h3>
                      <p className="text-gray-400">Creating seamless user journeys that enhance engagement and drive conversions.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Brand Identity</h3>
                      <p className="text-gray-400">Developing cohesive visual systems that communicate your brand's unique value proposition.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 h-64 md:h-auto bg-gradient-to-br from-amber-500/10 to-amber-700/20 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
            </div>
            
            {/* Software Development */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="h-64 md:h-auto bg-gradient-to-br from-amber-500/10 to-amber-700/20 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Software Development</h2>
                <p className="text-gray-400 mb-6">
                  We engineer robust digital solutions that power seamless experiences, combining technical excellence with design thinking.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Web Application Development</h3>
                      <p className="text-gray-400">Building responsive, scalable web applications using modern frameworks and technologies.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Mobile App Development</h3>
                      <p className="text-gray-400">Creating native and cross-platform mobile experiences that delight users and drive engagement.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Custom Solutions</h3>
                      <p className="text-gray-400">Developing tailored software solutions to address your unique business challenges.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Digital Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Digital Strategy</h2>
                <p className="text-gray-400 mb-6">
                  We transform business objectives into strategic digital roadmaps that drive growth, engagement, and measurable results.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Digital Transformation</h3>
                      <p className="text-gray-400">Guiding your business through the complexities of digital evolution to stay competitive.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">User Research & Testing</h3>
                      <p className="text-gray-400">Understanding your users' needs and behaviors to inform design and development decisions.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="text-amber-500 mr-4 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Analytics & Optimization</h3>
                      <p className="text-gray-400">Continuously improving your digital presence through data-driven insights and iterative enhancements.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 h-64 md:h-auto bg-gradient-to-br from-amber-500/10 to-amber-700/20 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Process Section */}
      <section className="py-24 bg-[#0f0f13]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Process</h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              We follow a structured yet flexible approach to ensure your vision is realized with precision and excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#09090b] p-8 rounded-lg border border-[#b85a00]/30 shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300">
              <div className="text-5xl font-bold text-amber-500 mb-4">01</div>
              <h3 className="text-xl font-bold text-white mb-3">Discovery</h3>
              <p className="text-gray-400">Understanding your goals, audience, and vision through comprehensive research and consultation.</p>
            </div>
            
            <div className="bg-[#09090b] p-8 rounded-lg border border-[#b85a00]/30 shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300">
              <div className="text-5xl font-bold text-amber-500 mb-4">02</div>
              <h3 className="text-xl font-bold text-white mb-3">Strategy</h3>
              <p className="text-gray-400">Developing a tailored approach that aligns with your objectives and resonates with your audience.</p>
            </div>
            
            <div className="bg-[#09090b] p-8 rounded-lg border border-[#b85a00]/30 shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300">
              <div className="text-5xl font-bold text-amber-500 mb-4">03</div>
              <h3 className="text-xl font-bold text-white mb-3">Creation</h3>
              <p className="text-gray-400">Bringing your vision to life through iterative design and development, with regular client feedback.</p>
            </div>
            
            <div className="bg-[#09090b] p-8 rounded-lg border border-[#b85a00]/30 shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300">
              <div className="text-5xl font-bold text-amber-500 mb-4">04</div>
              <h3 className="text-xl font-bold text-white mb-3">Optimization</h3>
              <p className="text-gray-400">Refining and enhancing your digital presence through ongoing analysis and improvements.</p>
            </div>
          </div>
        </div>
      </section>
      
      <ContactCTA />
      <Footer />
    </main>
  );
};

export default ServicePage; 