import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCut, FaMagic, FaLeaf, FaHands, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { serviceApi } from '../api/services';
import ServiceImageThumb from '../components/ServiceImageThumb';
import shaveImg from '../assets/shave2.jpeg';
import braidImg from '../assets/braid3.jpeg';
import nailImg from '../assets/nail2.jpeg';

const MAX_INITIAL_SERVICES = 4;

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categoryVisuals: Record<string, { subtitle: string; accent: string; icon: React.ReactNode }> = {
    "Kareh's Barbershop": { subtitle: 'Glow up starts here', accent: 'var(--bright-purple)', icon: <FaCut /> },
    "Professional Coloring": { subtitle: 'Vibrant & Lasting', accent: 'var(--magenta)', icon: <FaMagic /> },
    'The Spa Sanctuary': { subtitle: 'Unknot your hair & stress', accent: 'var(--bright-purple)', icon: <FaLeaf /> },
    'Nails & Hair Art': { subtitle: 'Tips, Toes & Total Glow', accent: 'var(--magenta)', icon: <FaHands /> }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceApi.getAll();
        const data = response.data?.data || response.data || [];
        const rows = Array.isArray(data) ? data : [];
        setServices(rows.filter((s: any) => (s.status || 'Active') === 'Active'));
        setLoadError('');
      } catch (error) {
        console.error('Failed to load services page data:', error);
        setLoadError('Unable to load services right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, any[]>();
    services.forEach((service: any) => {
      const categoryName = service.category_name || service.category || 'General Services';
      if (!map.has(categoryName)) map.set(categoryName, []);
      map.get(categoryName)!.push(service);
    });
    return Array.from(map.entries()).map(([title, list]) => ({
      title,
      services: list,
      ...(
        categoryVisuals[title] || {
          subtitle: 'Premium treatments tailored for you',
          accent: 'var(--bright-purple)',
          icon: <FaLeaf />
        }
      )
    }));
  }, [services]);

  return (
    <div className="bg-black min-vh-100 text-white overflow-hidden position-relative">
      <div className="mesh-glow"></div>
      
      {/* Header section with impact */}
      <section className="py-5 mt-5 position-relative">
        <div className="container py-5 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gradient tracking-widest text-uppercase fw-bold d-block mb-3">Kareh&apos;s Spa &amp; Barbershop</span>
            <h1 className="display-2 fw-bold Oswald mb-3">OUR <span className="text-playfair italic">Premium</span> MENU</h1>
            <p className="lead opacity-75 Outfit fw-light mx-auto" style={{ maxWidth: '800px' }}>
              Every service at Kareh's is an experience. We combine artistry with relaxation to ensure you leave looking and feeling your absolute best.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="pb-5">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <p className="opacity-50 mb-0">Loading services...</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="alert alert-warning border-0 rounded-4">
              {loadError}
            </div>
          )}

          <div className="row g-5">
            {groupedCategories.map((cat, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="col-lg-6"
              >
                <div className="glass-panel p-4 p-md-5 rounded-5 border-start border-white border-opacity-10 h-100 position-relative overflow-hidden">
                  <div className="position-absolute opacity-5 top-0 end-0 p-4 fs-1" style={{ color: cat.accent }}>
                    {cat.icon}
                  </div>
                  
                  <div className="mb-5">
                    <span className="text-gradient tracking-widest text-uppercase small fw-bold d-block mb-1">{cat.subtitle}</span>
                    <h2 className="Oswald display-5 fw-bold mb-0 text-uppercase">{cat.title}</h2>
                  </div>

                  {(() => {
                    const isExpanded = expandedCategories.has(cat.title);
                    const visibleServices = isExpanded ? cat.services : cat.services.slice(0, MAX_INITIAL_SERVICES);
                    const hasMore = cat.services.length > MAX_INITIAL_SERVICES;
                    return (
                      <>
                        <div className="row g-4">
                          {visibleServices.map((item, i) => (
                            <div key={i} className="col-12">
                              <div className="d-flex gap-3 align-items-start">
                                <ServiceImageThumb
                                  imageUrl={item.image_url}
                                  alt={item.name || 'Service'}
                                  size={72}
                                  className="flex-shrink-0 mt-1"
                                />
                                <div className="flex-grow-1 min-w-0">
                                  <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                                    <h4 className="Outfit fw-semibold m-0 fs-5">{item.name || 'Unnamed Service'}</h4>
                                  </div>
                                  <p className="small opacity-50 m-0 Outfit">{item.description || 'Premium treatment'}</p>
                                </div>
                              </div>
                              <div className="w-100 mt-3 bg-white opacity-10" style={{ height: '1px' }}></div>
                            </div>
                          ))}
                        </div>
                        {hasMore && (
                          <div className="text-center mt-4">
                            <button
                              onClick={() => {
                                setExpandedCategories(prev => {
                                  const next = new Set(prev);
                                  if (isExpanded) next.delete(cat.title);
                                  else next.add(cat.title);
                                  return next;
                                });
                              }}
                              className="btn btn-outline-light rounded-pill px-5 py-2 fw-medium tracking-widest text-uppercase"
                              style={{ fontSize: '12px', letterSpacing: '1px' }}
                            >
                              {isExpanded ? (
                                <>Show less <FaChevronUp className="ms-2" /></>
                              ) : (
                                <>Show all in category <FaChevronDown className="ms-2" /></>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel p-4 p-md-5 rounded-5 border border-warning border-opacity-50">
            <span className="badge bg-warning text-dark mb-3 px-3 py-2 tracking-widest text-uppercase" style={{ fontSize: '10px' }}>Exclusive Spaces</span>
            <h3 className="display-6 fw-bold Oswald mb-3">Couple Massage &amp; Private Chamber</h3>
            <p className="Outfit opacity-75 mb-3">
              We offer dedicated Couple Massage Rooms for clients who want to enjoy treatment together, plus a fully Private Chamber where your session is handled in complete privacy.
            </p>
            <p className="Outfit opacity-50 mb-4">
              Your private room means no interruptions and personalized care from start to finish.
            </p>
            <Link to="/booking" className="btn btn-outline-warning rounded-pill px-5 py-3 fw-bold tracking-widest text-uppercase" style={{ fontSize: '12px' }}>
              Reserve Private Session
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="Oswald fw-bold text-uppercase mb-2">Style Highlights</h3>
            <p className="opacity-50 Outfit mb-0">A preview of recent work across our categories.</p>
          </div>
          <div className="row g-4">
            {[
              { img: shaveImg, title: 'Barbering Precision' },
              { img: braidImg, title: 'Signature Braiding' },
              { img: nailImg, title: 'Modern Nail Art' },
            ].map((item) => (
              <div className="col-md-4" key={item.title}>
                <div className="rounded-5 overflow-hidden border border-white border-opacity-10">
                  <img src={item.img} alt={item.title} loading="lazy" decoding="async" className="w-100 object-fit-cover" style={{ height: '260px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFER SECTION */}
      <section className="py-5 overflow-hidden">
        <div className="container">
           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel p-5 rounded-5 border border-warning border-opacity-50 position-relative" style={{ background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.05) 0%, rgba(106, 13, 173, 0.05) 100%)' }}>
              <div className="row align-items-center">
                 <div className="col-md-8 mb-4 mb-md-0">
                    <span className="badge bg-warning text-dark mb-3 px-3 py-2 tracking-widest text-uppercase" style={{ fontSize: '10px' }}>Limited Time Package</span>
                    <h3 className="display-5 fw-bold Oswald mb-3">THE KAREH <span className="text-playfair italic">Signature</span> GLOW</h3>
                    <p className="lead opacity-75 Outfit fw-light mb-4" style={{ lineHeight: '1.8' }}>
                      Transform your energy with our ultimate holistic package. Book our premium Full Body Massage and Deep Cleansing Facial, and receive our Signature Manicure completely on us.
                    </p>
                    <ul className="list-unstyled opacity-75 mb-0 Outfit d-flex flex-column gap-2 mb-4">
                      <li>✨ 90-minute Aromatherapy Massage</li>
                      <li>✨ Deep Cleansing Derma Facial</li>
                      <li><span className="text-gold">✨ Complimentary Signature Manicure</span></li>
                    </ul>
                    <Link to="/booking" className="btn btn-outline-warning rounded-pill px-5 py-3 fw-bold tracking-widest text-uppercase" style={{ fontSize: '12px' }}>Claim Your Glow</Link>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-5">
        <div className="container py-5 text-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            className="p-5 rounded-5 glass-panel border border-white border-opacity-10"
          >
            <h3 className="Oswald display-6 fw-bold mb-4">READY FOR YOUR <span className="text-gradient">GLOW UP</span>?</h3>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <Link to="/booking" className="btn btn-purple px-5 py-4 fw-bold Oswald fs-5">SCHEDULE YOUR VISIT</Link>
              <a href="tel:0743695893" className="btn btn-link glass-btn px-5 py-4 text-decoration-none Outfit text-white">CALL US</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Links Footer Section */}
      <div className="py-5 text-center border-top border-white border-opacity-10">
         <p className="small opacity-25 tracking-widest text-uppercase m-0">@Kareh&apos;sBarbershop&amp;spa • Milele Mall • Ngong Town</p>
      </div>

    </div>
  );
};

export default ServicesPage;
