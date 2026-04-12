import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCut, FaMagic, FaClock, FaLeaf, FaHeart, FaStar, FaSprayCan, FaHands } from 'react-icons/fa';

const serviceCategories = [
  {
    title: "Kareh's Barbershop",
    subtitle: "Glow up starts here",
    accent: "var(--bright-purple)",
    icon: <FaCut />,
    services: [
      { name: "Executive Shave", price: "Ksh 1,000", detail: "Signature hot towel finish" },
      { name: "Kids Shave", price: "Ksh 500", detail: "Gentle & trendy styles" },
      { name: "Beard Sculpture", price: "Ksh 600", detail: "Trim & shape definition" },
      { name: "Precision Hairline", price: "Ksh 400", detail: "Sharp & clean finish" },
    ]
  },
  {
    title: "Professional Coloring",
    subtitle: "Vibrant & Lasting",
    accent: "var(--magenta)",
    icon: <FaMagic />,
    services: [
      { name: "Dye (Subaru / Tancho)", price: "Ksh 1,200+", detail: "Rich, deep tones" },
      { name: "Cream of Nature Dye", price: "Ksh 2,000", detail: "Nourishing formula" },
      { name: "Black Heena / Shampoo", price: "Ksh 800+", detail: "Organic & safe dyeing" },
      { name: "Beard Dye Specialists", price: "Ksh 700", detail: "Uniform color blending" },
    ]
  },
  {
    title: "The Spa Sanctuary",
    subtitle: "Unknot your hair & stress",
    accent: "var(--bright-purple)",
    icon: <FaLeaf />,
    services: [
      { name: "Full Body Massage", price: "Ksh 3,500", detail: "Relaxing aromatherapy" },
      { name: "Body Waxing", price: "Ksh 2,000+", detail: "Smooth skin treatment" },
      { name: "Deep Cleansing Facials", price: "Ksh 3,000", detail: "Rejuvenating skin glow" },
      { name: "Make up & Artistry", price: "Ksh 3,500", detail: "Bridal & event makeup" },
    ]
  },
  {
    title: "Nails & Hair Art",
    subtitle: "Tips, Toes & Total Glow",
    accent: "var(--magenta)",
    icon: <FaHands />,
    services: [
      { name: "Braiding & Weaving", price: "Ksh 2,500+", detail: "Master craftsmanship" },
      { name: "Gel, Tips & Acrylic", price: "Ksh 2,000+", detail: "Professional nail art" },
      { name: "Signature Manicure", price: "Ksh 1,500", detail: "Detail-oriented care" },
      { name: "Luxury Pedicure", price: "Ksh 2,000", detail: "Full massage & scrub" },
    ]
  }
];

const ServicesPage: React.FC = () => {
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
          <div className="row g-5">
            {serviceCategories.map((cat, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="col-lg-6"
              >
                <div className="glass-panel p-4 p-md-5 rounded-5 border-start border-white border-opacity-10 h-100 position-relative overflow-hidden">
                  <div className="position-absolute opacity-5 top-0 end-0 p-4 fs-1">
                    {cat.icon}
                  </div>
                  
                  <div className="mb-5">
                    <span className="text-gradient tracking-widest text-uppercase small fw-bold d-block mb-1">{cat.subtitle}</span>
                    <h2 className="Oswald display-5 fw-bold mb-0 text-uppercase">{cat.title}</h2>
                  </div>

                  <div className="row g-4">
                    {cat.services.map((item, i) => (
                      <div key={i} className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h4 className="Outfit fw-semibold m-0 fs-5">{item.name}</h4>
                          <span className="text-gradient Oswald fs-5">{item.price}</span>
                        </div>
                        <p className="small opacity-50 m-0 Outfit">{item.detail}</p>
                        <div className="w-100 mt-3 bg-white opacity-10" style={{ height: '1px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
              <Link to="/booking" className="btn btn-purple px-5 py-4 fw-bold Oswald fs-5">RESERVE NOW</Link>
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
