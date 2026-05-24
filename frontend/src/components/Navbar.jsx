import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const logoUrl = "/images/logo.png";
  const scrolledLogo = "/images/logo-scrolled.png";
  const currentPath = location.pathname;

  const getLogoUrl = () => {
    return (scrolled || currentPath !== '/') ? scrolledLogo : logoUrl;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);
  const isActive = (path) => currentPath === path;

  const getLinkClass = (path) => {
    const baseClasses = 'font-medium border-b-2 transition-colors duration-200';
    const isScrolledOrNotHome = scrolled || currentPath !== '/';

    if (isActive(path)) {
      return `${baseClasses} text-pink-500 border-pink-500`;
    }
    return `${baseClasses} border-transparent ${
      isScrolledOrNotHome ? 'text-black' : 'text-white'
    } hover:text-pink-500 hover:border-pink-500`;
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent text-white'
      } ${currentPath !== '/' || scrolled ? 'text-foreground' : ''}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            {/* <img src={logoUrl} alt="Logo" className="h-20 w-auto" /> */}
            <motion.img 
              key={getLogoUrl()}
              src={getLogoUrl()} 
              alt="Logo" 
              className="h-20 w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['/', '/gallery', '/about', '/contact'].map((path) => (
              <Link
                key={path}
                to={path}
                className={getLinkClass(path)}
              >
                {path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            ))}
            <Button asChild variant="default">
              <Link to="/contact">Book Now</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden focus:outline-none ${scrolled || currentPath !== '/' ? 'text-foreground' : 'text-white'}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t text-foreground"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {['/', '/gallery', '/about', '/contact'].map((path) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={`py-2 border-b-2 transition-colors duration-200 ${
                    isActive(path)
                      ? 'text-pink-500 border-pink-500'
                      : 'text-foreground border-transparent hover:text-pink-500 hover:border-pink-500'
                  }`}
                >
                  {path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
                </Link>
              ))}
              <Button asChild variant="default" className="w-full">
                <Link to="/contact" onClick={closeMenu}>Book Now</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
