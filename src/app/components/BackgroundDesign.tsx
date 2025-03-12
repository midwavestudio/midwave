'use client';

const BackgroundDesign = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0d] via-[#0f0f13] to-[#09090b]"></div>
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'url("/images/noise.svg")', 
             backgroundRepeat: 'repeat'
           }}></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, #b85a00 1px, transparent 1px), linear-gradient(to bottom, #b85a00 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           }}></div>
    </div>
  );
};

export default BackgroundDesign; 