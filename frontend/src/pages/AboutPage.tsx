import React from 'react';
import { motion } from 'framer-motion';
import { FaAward, FaUsers, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import salonImg from '../assets/salon.png';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-black min-vh-100 text-white py-5 overflow-hidden">
      <div className="mesh-glow opacity-25"></div>
      
      <div className="container py-5 mt-5">
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <span className="text-gradient tracking-widest text-uppercase fw-bold d-block mb-3">Our Identity</span>
              <h1 className="display-3 fw-bold Oswald mb-4">THE STORY OF <span className="text-playfair italic">Kareh&apos;s</span></h1>
              <p className="lead Outfit fw-light opacity-75 mb-4" style={{ lineHeight: '1.8' }}>
                Kareh's Spa & Barbershop was born out of a passion for high-end grooming and ultimate relaxation. Located at the heart of Ngong Town in Milele Mall, we set out to create a sanctuary where artistry meets serenity.
              </p>
              <p className="Outfit fw-light opacity-50 mb-5">
                Our mission is simple: to "Unknot your hair & your stress." We believe that every person deserves a moment of restoration, and we've designed every detail of our studio to provide exactly that—the ultimate glow up.
              </p>
              
              <div className="row g-4">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-3">
                     <div className="text-gradient fs-2"><FaAward /></div>
                     <div>
                       <h5 className="Oswald m-0">PREMIUM QUALITY</h5>
                       <p className="small opacity-50 m-0">Only world-class products</p>
                     </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-3">
                     <div className="text-gradient fs-2"><FaUsers /></div>
                     <div>
                       <h5 className="Oswald m-0">EXPERT TEAM</h5>
                       <p className="small opacity-50 m-0">Master artisans</p>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="col-lg-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ duration: 1 }}
               className="position-relative"
            >
              <div className="position-absolute w-100 h-100 border border-purple translate-middle-x translate-middle-y top-50 start-50 opacity-10" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', zIndex: -1, width: '110%', height: '110%' }}></div>
              <img src={salonImg} alt="Our Studio" className="w-100 rounded-5 shadow-lg border border-white border-opacity-10" />
            </motion.div>
          </div>
        </div>

        {/* Philosophy Section */}
        <section className="py-5 my-5">
           <div className="text-center mb-5">
              <h2 className="display-4 fw-bold Oswald text-uppercase">OUR <span className="text-gradient">Philosophy</span></h2>
           </div>
           <div className="row g-4 justify-content-center">
             {[
               { icon: <FaClock />, title: "Time to Rest", desc: "We don't rush perfection. Every session is allocated the time required for excellence." },
               { icon: <FaMapMarkerAlt />, title: "Community Hub", desc: "Proudly serving Ngong Town, creating a home for refinement and style." },
               { icon: <FaAward />, title: "Continuous Artistry", desc: "Our team stays ahead of global trends to bring you the best styles daily." }
             ].map((item, idx) => (
               <div className="col-md-4" key={idx}>
                 <motion.div 
                    whileHover={{ y: -10 }}
                    className="glass-panel p-5 rounded-5 h-100 text-center"
                 >
                   <div className="text-gradient fs-1 mb-4">{item.icon}</div>
                   <h4 className="Oswald mb-3">{item.title}</h4>
                   <p className="Outfit opacity-50 small m-0">{item.desc}</p>
                 </motion.div>
               </div>
             ))}
           </div>
        </section>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          className="text-center py-5"
        >
          <h3 className="display-6 Oswald fw-bold mb-4">EXPERIENCE THE <span className="text-gradient">KAREH&apos;S WAY</span></h3>
          <p className="Outfit opacity-50 mb-5">Join the thousands who have transformed their look with us.</p>
          <div className="d-flex flex-wrap justify-content-center gap-4">
             <button className="btn btn-purple px-5 py-4 fw-bold Oswald fs-5">VISIT OUR STUDIO</button>
             <button className="btn btn-link glass-btn px-5 py-4 text-decoration-none Outfit text-white">OUR SERVICES</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
