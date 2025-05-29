'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, FileText, ShoppingCart, LayoutGrid, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Transaksi', href: '/Transaksi', icon: ShoppingCart },
    { name: 'Menu', href: '/Menu', icon: LayoutGrid },
    { name: 'Laporan', href: '/Laporan', icon: FileText },
  ];

  const pengaturanItems = [
    { name: 'End Shift', href: '/' },
    { name: 'Logout', href: '/Login' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-pink-100' 
        : 'bg-gradient-to-r from-pink-400 via-pink-300 to-rose-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className={`font-bold text-xl transition-colors duration-300 ${
                isScrolled ? 'text-pink-600' : 'text-white'
              }`}>
                POS App
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 ${
                    isScrolled
                      ? 'text-pink-700 hover:bg-pink-50 hover:text-pink-800'
                      : 'text-white hover:bg-white/20 hover:backdrop-blur-sm'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              ))}

              {/* Dropdown Pengaturan */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('pengaturan')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                    isScrolled
                      ? 'text-pink-700 hover:bg-pink-50 hover:text-pink-800'
                      : 'text-white hover:bg-white/20 hover:backdrop-blur-sm'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'pengaturan' && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 py-2">
                    {pengaturanItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-pink-700 hover:bg-pink-50 hover:text-pink-800"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                isScrolled
                  ? 'text-pink-600 hover:bg-pink-50'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-pink-100">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-50 hover:text-pink-800 transition-all duration-200 transform hover:scale-105"
            >
              <item.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{item.name}</span>
            </a>
          ))}

          {/* Mobile Dropdown Pengaturan */}
          <div className="border-t border-pink-100 mt-2 pt-2">
            <p className="px-3 text-sm text-pink-500 font-semibold mb-1">Pengaturan</p>
            {pengaturanItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-50 hover:text-pink-800 transition-all duration-200 transform hover:scale-105"
              >
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
