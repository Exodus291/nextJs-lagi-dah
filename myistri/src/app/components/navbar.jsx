'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Settings, FileText, ShoppingCart, LayoutGrid, ChevronDown, User, LogOut, Clock } from 'lucide-react';
import api from '../../lib/api';

const ASSET_SERVER_URL = process.env.NEXT_PUBLIC_ASSET_SERVER_URL;

// Custom hook for user data management
const useUserData = () => {
  const [userData, setUserData] = useState({
    name: '',
    avatarUrl: null,
    avatarInitial: '',
    isLoading: true,
    error: null
  });
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      const userProfile = response.data.user;
      
      if (!userProfile) {
        throw new Error("User data not found in response");
      }
      
      setUserData({
        name: userProfile.name || 'Pengguna',
        avatarUrl: userProfile.profilePictureUrl || null,
        avatarInitial: (userProfile.name || 'P').charAt(0).toUpperCase(),
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserData(prev => ({
        ...prev,
        name: 'Gagal memuat',
        avatarInitial: '!',
        isLoading: false,
        error: error.message
      }));
      
      if (error.response?.status === 401) {
        router.push('/Login');
      }
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userData, refetchUserData: fetchUserProfile };
};

// Custom hook for scroll detection
const useScrollDetection = (threshold = 20) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};

// Custom hook for outside click detection
const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
};

// Avatar component
const Avatar = ({ userData, resolvedAvatarUrl, size = 'w-7 h-7', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  useEffect(() => {
    // Reset imageError when resolvedAvatarUrl changes (e.g., user uploads a new pic)
    setImageError(false);
  }, [resolvedAvatarUrl]);

  if (userData.isLoading) {
    return (
      <div className={`${size} bg-gray-200 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`${size} bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold overflow-hidden ${className}`}>
      {resolvedAvatarUrl && !imageError ? (
        <img 
          src={resolvedAvatarUrl} 
          alt={userData.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        userData.avatarInitial || 'U'
      )}
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = ({ width = 'w-16', height = 'h-5' }) => ( // Default height h-5
  <div className={`${width} ${height} bg-gray-300/50 animate-pulse rounded-sm`} />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  
  const { userData, refetchUserData } = useUserData();
  const isScrolled = useScrollDetection(20);
  
  const dropdownRef = useOutsideClick(() => setActiveDropdown(null));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleDropdown = useCallback((dropdown) => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
      router.push('/Login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/Login');
    }
  }, [router]);

  const resolvedAvatarUrl = useMemo(() => {
    const path = userData.avatarUrl;

    if (!path) return null;

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/')) {
      let serverOrigin = '';
      if (ASSET_SERVER_URL) {
        serverOrigin = ASSET_SERVER_URL.replace(/\/$/, '');
      } else if (api?.defaults?.baseURL) {
        try {
          const apiUrlObject = new URL(api.defaults.baseURL);
          serverOrigin = apiUrlObject.origin;
        } catch (e) {
          console.warn("Could not parse api.defaults.baseURL:", api.defaults.baseURL, e);
        }
      }
      return serverOrigin ? `${serverOrigin}${path}` : path;
    }
    
    return path; // Fallback for non-standard paths, or could be default image
  }, [userData.avatarUrl]);

  const menuItems = useMemo(() => [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Transaksi', href: '/Transaksi', icon: ShoppingCart },
    { name: 'Menu', href: '/Menu', icon: LayoutGrid },
    { name: 'Laporan', href: '/Laporan', icon: FileText },
  ], []);

  const pengaturanItems = useMemo(() => [
    {
      id: 'profile',
      type: 'profile',
      href: '/Account',
      icon: User,
      name: userData.name || 'Profile'
    },
    { 
      id: 'endShift', 
      name: 'End Shift', 
      href: '/', 
      type: 'link',
      icon: Clock
    },
    { 
      id: 'logout', 
      name: 'Logout', 
      action: handleLogout, 
      type: 'action',
      icon: LogOut
    },
  ], [userData.name, handleLogout]);

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled
      ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-pink-100'
      : 'bg-gradient-to-r from-pink-400 via-pink-300 to-rose-300'
  }`;

  const linkClasses = (isActive = false) => 
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
      isScrolled
        ? `text-pink-700 hover:bg-pink-50 hover:text-pink-800 ${isActive ? 'bg-pink-100 text-pink-800 font-semibold' : ''}`
        : `text-white hover:bg-white/20 hover:backdrop-blur-sm ${isActive ? 'bg-white/30 backdrop-blur-md font-semibold' : ''}`
    }`;

  const mobileMenuClasses = `md:hidden transition-all duration-300 ease-in-out ${
    isOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0' // Adjusted max-h for better fit
  } overflow-y-auto`; // Added overflow-y-auto

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center space-x-2" aria-label="MyIstri Home">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm" role="img" aria-label="heart">❤️</span>
              </div>
              <span className={`font-bold text-xl transition-colors duration-300 ${
                isScrolled ? 'text-pink-600' : 'text-white'
              }`}>
                MyIstri
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={linkClasses(router.pathname === item.href)} // Example active state
                  aria-label={`Navigate to ${item.name}`}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </a>
              ))}

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown('pengaturan')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                    isScrolled
                      ? 'text-pink-700 hover:bg-pink-50 hover:text-pink-800'
                      : 'text-white hover:bg-white/20 hover:backdrop-blur-sm'
                  }`}
                  aria-expanded={activeDropdown === 'pengaturan'}
                  aria-haspopup="true"
                  aria-label="User menu"
                  id="user-menu-button"
                >
                  <Avatar userData={userData} resolvedAvatarUrl={resolvedAvatarUrl} />
                  
                  {userData.isLoading ? (
                    <LoadingSkeleton width="w-20" height="h-5" />
                  ) : (
                    <span className="max-w-[120px] truncate"> {/* max-w increased slightly */}
                      {userData.name.split(' ')[0]}
                    </span>
                  )}
                  
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === 'pengaturan' ? 'rotate-180' : ''
                    }`} 
                    aria-hidden="true" 
                  />
                </button>

                {/* Dropdown Content */}
                {activeDropdown === 'pengaturan' && (
                  <div 
                    className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl z-50 py-1 border border-gray-200" // Increased width
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    {pengaturanItems.map((item) => {
                      const commonClasses = "flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors duration-150 focus:outline-none focus:bg-pink-50";
                      
                      if (item.type === 'profile') {
                        return (
                          <a
                            key={item.id}
                            href={item.href}
                            className={`${commonClasses} py-3`} // Slightly more padding for profile
                            role="menuitem"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Avatar 
                              userData={userData} 
                              resolvedAvatarUrl={resolvedAvatarUrl} 
                              size="w-8 h-8"
                              className="mr-3"
                            />
                            <span className="font-medium truncate">
                              {userData.isLoading ? 'Loading...' : userData.name}
                            </span>
                          </a>
                        );
                      } else if (item.type === 'link') {
                        return (
                          <a
                            key={item.id}
                            href={item.href}
                            className={commonClasses}
                            role="menuitem"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.icon && <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />}
                            {item.name}
                          </a>
                        );
                      } else if (item.type === 'action') {
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.action();
                              setActiveDropdown(null);
                            }}
                            className={commonClasses}
                            role="menuitem"
                          >
                            {item.icon && <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />}
                            {item.name}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                isScrolled
                  ? 'text-pink-600 hover:bg-pink-50'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-menu"
            >
              {hasMounted ? (
                isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" /> // Default for SSR/initial render
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={mobileMenuClasses} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-pink-100">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-50 hover:text-pink-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-2" aria-hidden="true" />
              <span className="font-medium">{item.name}</span>
            </a>
          ))}

          {/* Mobile Settings Section */}
          <div className="border-t border-pink-100 mt-2 pt-2">
            <p className="px-3 text-sm text-pink-500 font-semibold mb-1">Pengaturan</p>
            {pengaturanItems.map((item) => {
              const commonMobileClasses = "flex items-center w-full text-left px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-50 hover:text-pink-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2";

              if (item.type === 'profile') {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`${commonMobileClasses} py-3`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Avatar 
                      userData={userData} 
                      resolvedAvatarUrl={resolvedAvatarUrl} 
                      size="w-8 h-8" 
                      className="mr-3"
                    />
                    <span className="font-medium truncate">
                      {userData.isLoading ? 'Loading...' : userData.name}
                    </span>
                  </a>
                );
              } else if (item.type === 'link') {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={commonMobileClasses}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />}
                    <span className="font-medium">{item.name}</span>
                  </a>
                );
              } else if (item.type === 'action') {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className={commonMobileClasses}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />}
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
