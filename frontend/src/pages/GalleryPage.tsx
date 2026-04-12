import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.png';
import barberImg from '../assets/barbershop.png';
import salonImg from '../assets/salon.png';

const galleryItems = [
  { img: salonImg, category: "Braiding", title: "Intricate Box Braids" },
  { img: barberImg, category: "Barbering", title: "Precision Fade & Beard" },
  { img: heroImg, category: "Spa", title: "Relaxation Session" },
  { img: salonImg, category: "Nails", title: "Acrylic Artistry" },
  { img: barberImg, category: "Barbering", title: "Classic Hot Towel Shave" },
  { img: heroImg, category: "Makeup", title: "Bridal Transformation" },
  { img: salonImg, category: "Weaving", title: "Luxe Hair Installation" },
  { img: barberImg, category: "Barbering", title: "Kids Trendy Cut" },
];

const GalleryPage: React.FC = () => {
  return (
    <div className="bg-black min-vh-100 text-white py-5">
      <div className="mesh-glow opacity-30"></div>
      
      <div className="container py-5 mt-5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-5"
        >
          <span className="text-gradient tracking-widest text-uppercase d-block mb-2 fw-bold">Masterpieces</span>
          <h1 className="display-3 fw-bold Oswald mb-3">OUR <span className="text-playfair italic">Gallery</span></h1>
          <p className="lead opacity-50 mx-auto Outfit fw-light" style={{ maxWidth: '700px' }}>
            A glimpse into the artistry and transformations created daily at Kareh's Spa & Barbershop.
          </p>
        </motion.div>

        <div className="row g-4">
          {galleryItems.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="col-12 col-md-6 col-lg-4"
            >
              <div className="position-relative overflow-hidden rounded-5 group" style={{ height: '400px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-100 h-100 object-fit-cover transition-all duration-1000 group-hover-scale-110" 
                  style={{ transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)' }}
                />
                <div className="position-absolute inset-0 bg-gradient-dark opacity-0 group-hover-opacity-100 transition-all duration-500 d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <span className="text-gradient small fw-bold tracking-widest text-uppercase mb-1">{item.category}</span>
                  <h4 className="Oswald h5 m-0">{item.title}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          className="mt-5 pt-5 text-center"
        >
          <p className="Outfit opacity-50 mb-4">Follow us on Instagram for daily updates of our work.</p>
          <a href="https://instagram.com/karehs_barbershop_spa" target="_blank" rel="noopener noreferrer" className="btn btn-purple px-5 py-3 tracking-widest fw-bold Oswald">
            FOLLOW US @KAREHSPA
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default GalleryPage;
