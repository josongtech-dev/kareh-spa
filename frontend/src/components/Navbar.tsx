import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' }
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nextScrolled = window.scrollY > 50;
          setScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav 
      className={`navbar navbar-expand-lg navbar-dark fixed-top site-navbar ${scrolled ? 'is-scrolled' : ''}`}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="60" className="brand-luxury" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
        </Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        <div className="d-none d-lg-block">
          <ul className="navbar-nav ms-auto align-items-center fw-medium text-uppercase" style={{ fontSize: '13px', letterSpacing: '2px' }}>
            {navItems.map((item) => (
              <li className="nav-item px-lg-2" key={item.path}>
                <Link 
                  className={`nav-link premium-nav-link position-relative text-white ${location.pathname === item.path ? 'active' : 'opacity-75'}`}
                  to={item.path}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-4 mt-3 mt-lg-0">
              <Link className="btn btn-gold py-2 px-4 shadow-sm" style={{ fontSize: '12px' }} to="/booking">
                SCHEDULE YOUR VISIT
              </Link>
            </li>
          </ul>
        </div>

        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
          <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold tracking-widest text-gradient">MENU</span>
              <button
                className="btn btn-link text-white p-0 border-0"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX size={26} />
              </button>
            </div>
            <ul className="list-unstyled m-0 d-flex flex-column gap-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    className={`mobile-drawer-link text-decoration-none ${location.pathname === item.path ? 'active' : ''}`}
                    to={item.path}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="btn btn-gold w-100 mt-4" to="/booking">
              SCHEDULE YOUR VISIT
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
