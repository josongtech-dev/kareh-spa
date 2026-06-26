import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { FaArrowRight, FaPlay, FaStar, FaInstagram } from 'react-icons/fa';
import hairCutVideo from '../assets/hair_cut.mp4';
import spaVideo from '../assets/spa.mp4';
import manicureVideo from '../assets/manicure.mp4';
import heroPoster from '../assets/spa.jpg';
import massageImg from '../assets/massage.jpg';
import ctaImg from '../assets/spa2.jpg';
import braid4Img from '../assets/braid4.jpeg';
import shave3Img from '../assets/shave3.jpeg';
import nail5Img from '../assets/nail5.jpeg';
import braid6Img from '../assets/braid6.jpeg';
import shave4Img from '../assets/shave4.jpeg';
import nailVideo from '../assets/nailvid.mp4';

const HomePage: React.FC = () => {
  const heroVideos = useMemo(() => [hairCutVideo, spaVideo, manicureVideo], []);
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowDataMode, setIsLowDataMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMotionPreference);
    } else {
      mediaQuery.addListener(updateMotionPreference);
    }

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection as
      | { saveData?: boolean; effectiveType?: string }
      | undefined;
    if (connection) {
      setIsLowDataMode(Boolean(connection.saveData) || connection.effectiveType === '2g');
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateMotionPreference);
      } else {
        mediaQuery.removeListener(updateMotionPreference);
      }
    };
  }, []);

  const shouldAutoplayVideos = !prefersReducedMotion && !isLowDataMode;

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
      <section className="home-hero-section position-relative d-flex align-items-center justify-content-center py-5" style={{ overflow: 'hidden' }}>
        <motion.div 
          className="position-absolute w-100 h-100 top-0 left-0" 
          initial={{ scale: 1.15, opacity: 0.2 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{ zIndex: 0 }}
        >
          <video
            className="w-100 h-100 object-fit-cover"
            autoPlay={shouldAutoplayVideos}
            muted
            playsInline
            preload={shouldAutoplayVideos ? 'metadata' : 'none'}
            poster={heroPoster}
            key={heroVideos[heroVideoIndex]}
            onEnded={shouldAutoplayVideos ? () => setHeroVideoIndex((prev) => (prev + 1) % heroVideos.length) : undefined}
          >
            <source src={heroVideos[heroVideoIndex]} type="video/mp4" />
          </video>
          <div className="position-absolute w-100 h-100 top-0 left-0" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }}></div>
        </motion.div>

        <div className="mesh-glow opacity-50"></div>

        <div className="container position-relative mt-5 pt-5" style={{ zIndex: 2 }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
            
            <motion.div variants={fadeUp} className="mb-4 d-inline-flex px-4 py-2 rounded-pill glass-panel">
              <span className="text-gold fw-semibold tracking-widest text-uppercase" style={{ fontSize: '0.75rem' }}>Elegance Defined • Ngong Town</span>
            </motion.div>

            <motion.div variants={fadeUp} className="position-relative d-inline-block mb-4">
              <h1 className="m-0 fw-bold display-1 lh-1 hero-title-glow" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
                KAREH&apos;S <span className="text-playfair fw-light">Spa</span>
              </h1>
              <div className="position-absolute w-100 bg-purple opacity-25" style={{ height: '30%', bottom: '10%', zIndex: -1, filter: 'blur(30px)' }}></div>
            </motion.div>

            <motion.h2 variants={fadeUp} className="display-6 fw-light mb-5 text-playfair">
              Unknot Your Hair &amp; <span className="text-gradient fw-bold italic text-uppercase fs-2 Oswald">Your Stress!</span>
            </motion.h2>

            <motion.div variants={fadeUp} className="d-flex flex-wrap justify-content-center gap-4 align-items-center mb-5">
              <Link to="/booking" className="btn btn-purple px-5 py-3">
                SCHEDULE YOUR VISIT <FaArrowRight className="ms-2" />
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
                <img src={braid6Img} alt="Experience" loading="lazy" decoding="async" className="w-100 rounded-5 shadow-lg object-fit-cover home-editorial-image" style={{ height: '500px' }} />
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

      <section className="py-5" style={{ background: '#0b0b0b' }}>
        <div className="container py-3">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-5">
            <span className="text-gold text-uppercase tracking-widest border-bottom border-warning border-opacity-25 pb-2 mb-4 d-inline-block">Exclusive Experience</span>
            <h2 className="display-4 fw-bold Oswald mb-3">Private Comfort, <span className="text-playfair italic fw-normal text-capitalize">Premium Care</span></h2>
            <p className="lead opacity-75 mx-auto Outfit fw-light" style={{ maxWidth: '760px', lineHeight: '1.8' }}>
              Enjoy our Couple Massage Rooms for shared wellness sessions and our Private Chamber service where you receive treatment in your own uninterrupted room.
            </p>
          </motion.div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="glass-panel p-5 rounded-5 h-100 border border-white border-opacity-10">
                <h4 className="Oswald text-gold h3 mb-3">Couple Massage Rooms</h4>
                <p className="Outfit opacity-75 mb-0">A calming shared room designed for partners and friends who want to unwind together while receiving synchronized premium massage care.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="glass-panel p-5 rounded-5 h-100 border border-white border-opacity-10">
                <h4 className="Oswald text-gold h3 mb-3">Private Chamber</h4>
                <p className="Outfit opacity-75 mb-0">A fully private service room for clients who prefer exclusivity, peace, and focused one-on-one attention without interruptions.</p>
              </div>
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
              { img: shave3Img, title: "Modern Barbering", desc: "Precision Cuts & Shaves", services: ["Executive Shave", "Beard Sculpting", "Kids Shave"] },
              { img: braid4Img, title: "Luxe Hair & Salon", desc: "Braiding & Expert Styling", services: ["Braiding", "Weaving", "Professional Dye"] },
              { img: massageImg, title: "Spa & Wellness", desc: "Rejuvenate Your Spirit", services: ["Body Massage", "Body Waxing", "Facials & Makeup"] },
              { img: nail5Img, title: "Nail Artistry", desc: "Total Glow for Your Hands", services: ["Gel, Tips & Acrylic", "Manicure", "Luxury Pedicure"] }
            ].map((card, idx) => (
              <div className="col-12 col-md-6 col-lg-3" key={idx}>
                <motion.div 
                  variants={imageReveal} 
                  className="position-relative overflow-hidden group rounded-5 premium-card-hover" 
                  style={{ height: '500px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <img src={card.img} alt={card.title} loading="lazy" decoding="async" className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover-scale-110" style={{ transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)' }} />
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

      {/* THE KAREH EDIT & TESTIMONIALS */}
      <section className="py-5 bg-black position-relative overflow-hidden">
        <div className="container py-5">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-5">
              <span className="text-gold text-uppercase tracking-widest border-bottom border-warning border-opacity-25 pb-2 mb-4 d-inline-block">Testimonials & Social</span>
              <h2 className="display-4 fw-bold mb-3 Oswald">THE <span className="text-playfair italic fw-normal text-capitalize">Kareh</span> EDIT</h2>
              <p className="lead opacity-75 mx-auto Outfit fw-light" style={{ maxWidth: '600px', lineHeight: '1.8' }}>
                Stories of transformation, whispered by our clients and showcased in our sanctuary. Discover our latest insights into the world of wellness.
              </p>
            </motion.div>
            
            <div className="row g-5 align-items-center">
               <div className="col-lg-6">
                 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-panel p-5 rounded-5 border-start border-warning border-4 position-relative h-100 d-flex flex-column justify-content-center">
                    <FaStar className="text-gold position-absolute opacity-25" style={{ fontSize: '120px', top: '-30px', left: '-30px', zIndex: 0 }} />
                    <div className="position-relative" style={{ zIndex: 1 }}>
                       <div className="d-flex mb-4 gap-1">
                         {[1,2,3,4,5].map(i => <FaStar key={i} className="text-gold" />)}
                       </div>
                       <h4 className="Oswald fw-light text-playfair lh-base mb-5 fs-4" style={{ letterSpacing: '0.5px' }}>
                         "One of my favourite places. I've been going to Kareh's Spa for over a year now. They are a full service sanctuary and tend to do everything with absolute perfection. A true one stop shop for all my beauty needs."
                       </h4>
                       <div className="d-flex align-items-center">
                          <div className="rounded-circle overflow-hidden me-3 border border-warning" style={{ width: '60px', height: '60px' }}>
                            <img src={shave4Img} className="w-100 h-100 object-fit-cover" alt="Client" loading="lazy" decoding="async" />
                          </div>
                          <div>
                            <p className="m-0 fw-bold Oswald tracking-widest fs-5">SARAH M.</p>
                            <p className="m-0 small opacity-75 text-uppercase tracking-widest font-monospace" style={{ fontSize: '10px' }}>Loyal Client</p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               </div>
               <div className="col-lg-6">
                 <div className="row g-4">
                    {[
                      { img: nail5Img, handle: "@karehs_spa", date: "2 days ago" },
                      { img: nailVideo, isVideo: true, handle: "@karehs_spa", date: "1 week ago" }
                    ].map((item, id) => (
                      <div className="col-6" key={id}>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={imageReveal} className="position-relative rounded-4 overflow-hidden group premium-card-hover" style={{ height: '300px' }}>
                           {item.isVideo ? (
                            <video
                              src={item.img}
                              className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover-scale-110"
                              autoPlay={shouldAutoplayVideos}
                              muted
                              loop
                              playsInline
                              preload="none"
                              style={{ transition: 'transform 1.5s ease' }}
                            />
                           ) : (
                             <img src={item.img} className="w-100 h-100 object-fit-cover transition-all duration-700 group-hover-scale-110" alt="Instagram" loading="lazy" decoding="async" style={{ transition: 'transform 1.5s ease' }} />
                           )}
                           <div className="position-absolute inset-0 top-0 left-0 w-100 h-100 d-flex flex-column justify-content-between p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%)' }}>
                              <div className="text-end">
                                <FaInstagram className="fs-4 text-white drop-shadow" />
                              </div>
                              <div>
                                <p className="m-0 small fw-bold tracking-widest mb-1">{item.handle}</p>
                                <p className="m-0 text-white-50" style={{ fontSize: '11px' }}>{item.date}</p>
                              </div>
                           </div>
                        </motion.div>
                      </div>
                    ))}
                 </div>
                 <div className="text-center mt-5">
                    <Link to="/gallery" className="btn btn-outline-light rounded-pill px-5 py-3 tracking-widest text-uppercase" style={{ fontSize: '12px' }}>
                       <FaInstagram className="me-2 mb-1 fs-5" /> Explore Gallery
                    </Link>
                 </div>
               </div>
            </div>
        </div>
      </section>

      {/* FULL WIDTH CALL TO ACTION */}
      <section className="home-cta-section position-relative py-5 overflow-hidden" style={{ display: 'flex', alignItems: 'center' }}>
        <div
          className="position-absolute w-100 h-100 top-0 left-0 bg-dark"
          style={{
            backgroundImage: `url(${ctaImg})`,
            backgroundSize: 'cover',
            backgroundAttachment: shouldAutoplayVideos ? 'fixed' : 'scroll',
            opacity: 0.15
          }}
        ></div>
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
                  SCHEDULE YOUR VISIT
                </Link>
            </div>

          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

