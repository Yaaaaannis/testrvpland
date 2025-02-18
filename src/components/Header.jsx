import React from 'react';

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-8">
      {/* Empty div for spacing */}
      <div className="w-32"></div>

      {/* Centered Logo SVG */}
      <div className="absolute left-1/2 -translate-x-1/2 pt-16">
        <img src="/logo.svg" alt="Logo" />
      </div>

      {/* Navigation buttons */}
      <nav className="flex gap-6 font-sans">
        <button className="text-white hover:text-gray-300 transition-colors">
          Button 1
        </button>
        <button className="text-white hover:text-gray-300 transition-colors">
          Button 2
        </button>
        <button className="text-white hover:text-gray-300 transition-colors">
          Button 3
        </button>
      </nav>
    </header>
  );
}

export default Header; 