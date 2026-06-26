import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="text-white py-5 position-relative" style={{ background: '#0d001a' }}>
      <div className="container position-relative z-index-1">
        {/* Membership CTA Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 rounded-4 border-1 d-flex flex-md-row flex-column align-items-center justify-content-between gap-4" style={{ borderColor: 'rgba(255, 190, 11, 0.2)' }}>
              <div className="text-md-start text-center">
                <h4 className="brand-title text-gold mb-2">Create your account today & become a member</h4>
                <p className="mb-0 text-light opacity-75">Start earning loyalty points today and get instant services at your convenience.</p>
              </div>
              <a href="/register" className="btn-gold text-decoration-none d-inline-block text-nowrap">REGISTER NOW</a>
            </div>
          </div>
        </div>

        <div className="row g-5">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-4">
              <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="60" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
              <h4 className="m-0 brand-title" style={{ color: 'var(--gold)', letterSpacing: '1px' }}>KAREH&apos;S SPA &amp; BARBERSHOP</h4>
            </div>
            <p className="mb-4 text-light" style={{ opacity: 0.8 }}>
              Experience the ultimate glow up and relaxation. Unknot your hair &amp; your stress with our premium services.
            </p>
            <div className="d-flex gap-3">
              <a
                href="https://www.facebook.com/amorfashions/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center social-luxury"
                style={{ width: '40px', height: '40px' }}
                aria-label="Visit Kareh's Spa Facebook"
                title="Open Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/karesspa/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center social-luxury"
                style={{ width: '40px', height: '40px' }}
                aria-label="Visit Kareh's Spa Instagram"
                title="Open Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@karehs.spa.and.be"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center social-luxury"
                style={{ width: '40px', height: '40px' }}
                aria-label="Visit Kareh's Spa TikTok"
                title="Open TikTok"
              >
                <FaTiktok />
              </a>
            </div>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h5 className="mb-4 brand-title" style={{ color: 'var(--magenta)' }}>CONTACT INFO</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center gap-3">
                <FaMapMarkerAlt className="text-warning fs-5" />
                <span className="text-light" style={{ opacity: 0.8 }}>Ngong Town, Milele Mall, 1st Floor</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-3">
                <FaPhoneAlt className="text-warning fs-5" />
                <span className="text-light" style={{ opacity: 0.8 }}>0743 695 893</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-3">
                <FaEnvelope className="text-warning fs-5" />
                <span className="text-light" style={{ opacity: 0.8 }}>karehspa2024@gmail.com</span>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-12">
            <h5 className="mb-4 brand-title" style={{ color: 'var(--magenta)' }}>QUICK LINKS</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="/" className="text-decoration-none text-light premium-link" style={{ opacity: 0.8 }}>Home</a></li>
              <li><a href="/services" className="text-decoration-none text-light premium-link" style={{ opacity: 0.8 }}>Our Services</a></li>
              <li><a href="/booking" className="text-decoration-none text-light premium-link" style={{ opacity: 0.8 }}>Schedule Your Visit</a></li>
              <li><a href="/login" className="text-decoration-none text-light text-warning premium-link" style={{ opacity: 0.8 }}>Sign into my account</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <div className="text-center text-light mb-4" style={{ opacity: 0.6, fontSize: '0.85rem' }}>
          <p className="mb-2">
            Developed by{' '}
            <a href="https://josongtech.com" target="_blank" rel="noopener noreferrer" className="text-white fw-medium text-decoration-none">
              JosongTech
            </a>
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="/privacy" className="text-decoration-none text-light opacity-75 hover-opacity-100">Privacy</a>
            <span className="opacity-25">|</span>
            <a href="/terms" className="text-decoration-none text-light opacity-75 hover-opacity-100">Terms</a>
          </div>
        </div>

        <div className="text-center text-light" style={{ opacity: 0.4, fontSize: '0.8rem' }}>
          <p className="mb-0">&copy; {new Date().getFullYear()} Kareh&apos;s Spa &amp; Barbershop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
