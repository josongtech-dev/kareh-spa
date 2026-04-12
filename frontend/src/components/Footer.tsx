import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="text-white py-5 position-relative" style={{ background: '#0d001a' }}>
      <div className="container position-relative z-index-1">
        <div className="row g-5">
          <div className="col-lg-4 col-md-6">
            <h4 className="mb-4 brand-title" style={{ color: 'var(--gold)', letterSpacing: '1px' }}>KAREH&apos;S SPA &amp; BARBERSHOP</h4>
            <p className="mb-4 text-light" style={{ opacity: 0.8 }}>
              Experience the ultimate glow up and relaxation. Unknot your hair &amp; your stress with our premium services.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><FaFacebook /></a>
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><FaInstagram /></a>
              <a href="#" className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}><FaTiktok /></a>
            </div>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h5 className="mb-4 brand-title" style={{ color: 'var(--neon-pink)' }}>CONTACT INFO</h5>
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
            <h5 className="mb-4 brand-title" style={{ color: 'var(--neon-pink)' }}>QUICK LINKS</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="/" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Home</a></li>
              <li><a href="/services" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Our Services</a></li>
              <li><a href="/booking" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Book Appointment</a></li>
              <li><a href="/login" className="text-decoration-none text-light text-warning" style={{ opacity: 0.8 }}>Staff Portal</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="text-center text-light" style={{ opacity: 0.6, fontSize: '0.9rem' }}>
          <p className="mb-0">&copy; {new Date().getFullYear()} Kareh&apos;s Spa &amp; Barbershop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
