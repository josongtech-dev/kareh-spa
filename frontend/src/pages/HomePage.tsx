import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { FaArrowRight, FaPlay, FaStar, FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import heroImg from '../assets/hero.png';
import barberImg from '../assets/barbershop.png';
import salonImg from '../assets/salon.png';

const HomePage: React.FC = () => {
  // Motion Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const imageReveal: Variants = {
    hidden: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
    visible: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.5, ease: [0.19, 1, 0.22, 1] } }
  };

  return (
    <div className="home-page bg-black text-white">
      
      {/* HERO SECTION - REFINED */}
      <section className="position-relative d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <motion.div 
          className="position-absolute w-100 h-100 top-0 left-0" 
          initial={{ scale: 1.15, opacity: 0.2 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{ zIndex: 0 }}
        >
          <img src={heroImg} alt="Hero" className="w-100 h-100 object-fit-cover" />
          <div className="position-absolute w-100 h-100 top-0 left-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }}></div>
        </motion.div>

        <div className="mesh-glow opacity-50"></div>

        <div className="container position-relative mt-5 pt-5" style={{ zIndex: 2 }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
            
            <motion.div variants={fadeUp} className="mb-4 d-inline-flex px-4 py-2 rounded-pill glass-panel">
              <span className="text-gold fw-semibold tracking-widest text-uppercase" style={{ fontSize: '0.75rem' }}>Elegance Defined • Ngong Town</span>
            </motion.div>

            <motion.div variants={fadeUp} className="position-relative d-inline-block mb-4">
              <h1 className="m-0 fw-bold display-1 lh-1" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
                KAREH&apos;S <span className="text-playfair fw-light">Spa</span>
              </h1>
              <div className="position-absolute w-100 bg-purple opacity-25" style={{ height: '30%', bottom: '10%', zIndex: -1, filter: 'blur(30px)' }}></div>
            </motion.div>

            <motion.h2 variants={fadeUp} className="display-6 fw-light mb-5 text-playfair">
              Unknot Your Hair &amp; <span className="text-gradient fw-bold italic text-uppercase fs-2 Oswald">Your Stress!</span>
            </motion.h2>

            <motion.div variants={fadeUp} className="d-flex flex-wrap justify-content-center gap-4 align-items-center mb-5">
              <Link to="/booking" className="btn btn-purple px-5 py-3">
                SECURE APPOINTMENT <FaArrowRight className="ms-2" />
              </Link>
              <button className="btn btn-link glass-btn rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <FaPlay className="text-white ms-1" />
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 2, duration: 1 }}
              className="mt-5 opacity-50 d-none d-md-block"
            >
              <div className="mx-auto" style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, var(--gold), transparent)' }}></div>
              <span className="text-uppercase tracking-widest mt-2 d-block" style={{ fontSize: '10px' }}>Scroll</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EDITORIAL SECTION */}
      <section className="py-5 bg-black position-relative overflow-hidden">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="text-gold text-uppercase tracking-widest border-bottom border-warning border-opacity-25 pb-2 mb-4 d-inline-block">The Experience</span>
                <h2 className="display-4 fw-bold mb-4 Oswald">Where Grooming Meets <span className="text-playfair italic fw-normal text-capitalize">Serenity</span></h2>
                <p className="lead opacity-75 mb-4 Outfit fw-light" style={{ lineHeight: '1.8' }}>
                  At Kareh's, we believe that self-care is not a luxury, but a ritual of restoration. Our sanctuary combines traditional craftsmanship with modern luxury to give you an experience that goes beyond the mirror.
                </p>
                <div className="row g-4 mt-2">
                  <div className="col-sm-6">
                    <div className="p-4 glass-panel rounded-4">
                      <h4 className="Oswald text-gold h5">Expert Stylists</h4>
                      <p className="small opacity-50 m-0">Master artisans dedicated to your unique vision.</p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-4 glass-panel rounded-4">
                      <h4 className="Oswald text-gold h5">Premium Products</h4>
                      <p className="small opacity-50 m-0">Only the finest organic and luxury care lines.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6 position-relative">
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={imageReveal}
                className="position-relative"
              >
                <div className="position-absolute w-100 h-100 border border-warning translate-middle-x translate-middle-y top-50 start-50 opacity-25" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', zIndex: -1, width: '110%', height: '110%' }}></div>
                <img src={salonImg} alt="Experience" className="w-100 rounded-5 shadow-lg object-fit-cover" style={{ height: '500px' }} />
                <div className="position-absolute bottom-0 start-0 glass-panel p-4 m-4 rounded-4 shadow-lg border-start border-warning border-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {[1,2,3,4,5].map(i => <FaStar key={i} className="text-gold" style={{ fontSize: '12px' }} />)}
                  </div>
                  <p className="m-0 fw-bold small Oswald">OVER 1,000+ HAPPY CLIENTS</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC SERVICE GALLERY */}
      <section className="py-5" style={{ background: '#080808' }}>
        <div className="container py-5 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-5 ">
              <h2 className="display-3 fw-bold Oswald mb-3">CURATED <span className="text-gold">SERVICES</span></h2>
              <p className="opacity-50 tracking-widest text-uppercase" style={{ fontSize: '12px' }}>Choose your transformation</p>
            </motion.div>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }} 
            variants={staggerContainer} 
            className="row g-4 justify-content-center"
          >
            {[
              { img: barberImg, title: "Modern Barbering", desc: "Precision Cuts & Shaves", services: ["Executive Shave", "Beard Sculpting", "Kids Shave"] },
              { img: salonImg, title: "Luxe Hair & Salon", desc: "Braiding & Expert Styling", services: ["Braiding", "Weaving", "Professional Dye"] },
              { img: heroImg, title: "Spa & Wellness", desc: "Rejuvenate Your Spirit", services: ["Body Massage", "Body Waxing", "Facials & Makeup"] },
              { img: salonImg, title: "Nail Artistry", desc: "Total Glow for Your Hands", services: ["Gel, Tips & Acrylic", "Manicure", "Luxury Pedicure"] }
            ].map((card, idx) => (
              <div className="col-12 col-md-6 col-lg-3" key={idx}>
                <motion.div 
                  variants={imageReveal} 
                  className="position-relative overflow-hidden group rounded-5" 
                  style={{ height: '500px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <img src={card.img} alt={card.title} className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover-scale-110" style={{ transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)' }} />
                  <div className="position-absolute inset-0 top-0 left-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}></div>
                  
                  <div className="position-absolute bottom-0 w-100 p-4 text-start">
                    <h3 className="h4 fw-bold Oswald mb-1">{card.title}</h3>
                    <p className="text-gradient text-playfair small mb-3">{card.desc}</p>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {card.services.map(s => <span key={s} className="badge rounded-pill bg-white text-black py-1 px-2 fw-medium" style={{ fontSize: '8px' }}>{s}</span>)}
                    </div>
                    <Link to="/services" className="btn btn-outline-light rounded-pill px-3 py-1 mt-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>EXPLORE</Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FULL WIDTH CALL TO ACTION */}
      <section className="position-relative py-5 overflow-hidden" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="position-absolute w-100 h-100 top-0 left-0 bg-dark" style={{ backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', opacity: 0.15 }}></div>
        <div className="mesh-glow"></div>
        
        <div className="container position-relative py-5 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
            <span className="text-gold text-uppercase tracking-widest d-block mb-3">Wait no more</span>
            <h2 className="display-2 fw-bold mb-4 Oswald lh-1">YOUR <span className="text-playfair italic">Ultimate</span> GLOW UP IS JUST A TAP AWAY</h2>
            <p className="fs-5 opacity-75 mb-5 mx-auto Outfit fw-light" style={{ maxWidth: '750px' }}>
              Experience the pinnacle of grooming and relaxation. Limited spots available for this week.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/booking" className="btn btn-gold px-5 py-4 fw-bold shadow-lg Oswald h4 mb-0">
                  RESERVE YOUR SPOT NOW
                </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="py-5 border-top border-white border-opacity-10">
        <div className="container py-4">
          <div className="row g-4 align-items-center">
            <div className="col-md-4 text-center text-md-start">
               <h3 className="brand-title h4 m-0 text-gradient">KAREH&apos;S SPA</h3>
               <p className="small opacity-50 mt-2 mb-0 Outfit">
                 Ngong Town, Milele Mall, 1st Floor.<br/>
                 Call: 0743 695 893<br/>
                 Email: karehspa2024@gmail.com
               </p>
            </div>
            <div className="col-md-4 text-center">
               <div className="d-flex justify-content-center gap-4">
                 <a href="https://instagram.com/karehs_barbershop_spa" className="text-white opacity-50 hover-opacity-100 transition-all"><FaInstagram size={18}/></a>
                 <a href="#" className="text-white opacity-50 hover-opacity-100 transition-all"><FaFacebookF size={18}/></a>
                 <a href="#" className="text-white opacity-50 hover-opacity-100 transition-all"><FaTwitter size={18}/></a>
               </div>
               <p className="small tracking-widest text-uppercase opacity-25 mt-3" style={{ fontSize: '10px' }}>@Kareh&apos;sBarbershop&amp;spa</p>
            </div>
            <div className="col-md-4 text-center text-md-end">
               <p className="small opacity-50 m-0 Outfit">Developed by <span className="text-white fw-medium">JosongTech</span></p>
               <div className="mt-2">
                 <Link to="/privacy" className="small text-decoration-none text-white opacity-25 me-3">Privacy</Link>
                 <Link to="/terms" className="small text-decoration-none text-white opacity-25">Terms</Link>
               </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;

