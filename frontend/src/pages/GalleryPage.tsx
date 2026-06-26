import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import MediaLightbox, { type GalleryMediaItem } from '../components/MediaLightbox';
import facialImg from '../assets/facial2.jpg';
import facialAltImg from '../assets/facial4.jpg';
import haircutImg from '../assets/haircut.jpg';
import massageImg from '../assets/massage2.jpg';
import manicureImg from '../assets/manicure2.jpg';
import pedicureImg from '../assets/pedicure2.jpg';
import spaImg from '../assets/spa.jpg';
import braid1 from '../assets/braided1.jpeg';
import braid2 from '../assets/braid2.jpeg';
import braid3 from '../assets/braid3.jpeg';
import braid4 from '../assets/braid4.jpeg';
import braid5 from '../assets/braid5.jpeg';
import braid6 from '../assets/braid6.jpeg';
import nail1 from '../assets/nail1.jpeg';
import nail2 from '../assets/nail2.jpeg';
import nail3 from '../assets/nail3.jpeg';
import nail4 from '../assets/nail4.jpeg';
import nail5 from '../assets/nail5.jpeg';
import shave1 from '../assets/shave1.jpeg';
import shave2 from '../assets/shave2.jpeg';
import shave3 from '../assets/shave3.jpeg';
import shave4 from '../assets/shave4.jpeg';
import hairCutVideo from '../assets/hair_cut.mp4';
import manicureVideo from '../assets/manicure.mp4';
import manicureVideoAlt from '../assets/manicure1.mp4';
import massageVideo from '../assets/massage.mp4';
import massageVideoAlt from '../assets/massage2.mp4';
import pedicureVideo from '../assets/pedicure.mp4';
import pedicureVideoAlt from '../assets/pedicure2.mp4';
import spaVideo from '../assets/spa.mp4';
import nailVideo from '../assets/nailvid.mp4';
import shaveVideo from '../assets/shavevideo.mp4';
import shaveVideoAlt from '../assets/shavevid2.mp4';

const galleryItems: GalleryMediaItem[] = [
  { src: facialImg, type: 'image', category: 'Facials', title: 'Deep Glow Facial Session' },
  { src: haircutImg, type: 'image', category: 'Barbering', title: 'Precision Fade & Beard' },
  { src: massageImg, type: 'image', category: 'Spa', title: 'Relaxation Massage Session' },
  { src: manicureImg, type: 'image', category: 'Nails', title: 'Luxury Manicure Finish' },
  { src: pedicureImg, type: 'image', category: 'Pedicure', title: 'Classic Foot Rejuvenation' },
  { src: spaImg, type: 'image', category: 'Wellness', title: 'Signature Spa Ambience' },
  { src: facialAltImg, type: 'image', category: 'Makeup', title: 'Bridal Glow Transformation' },
  { src: braid1, type: 'image', category: 'Braiding', title: 'Neat Knotless Braids' },
  { src: braid2, type: 'image', category: 'Braiding', title: 'Protective Styling Session' },
  { src: braid3, type: 'image', category: 'Braiding', title: 'Creative Braiding Finish' },
  { src: braid4, type: 'image', category: 'Braiding', title: 'Fresh Braids & Styling' },
  { src: braid5, type: 'image', category: 'Braiding', title: 'Elegant Daily Braids' },
  { src: braid6, type: 'image', category: 'Braiding', title: 'Long Lasting Braids' },
  { src: nail1, type: 'image', category: 'Nails', title: 'Polished Nail Styling' },
  { src: nail2, type: 'image', category: 'Nails', title: 'Glossy Gel Application' },
  { src: nail3, type: 'image', category: 'Nails', title: 'Nail Art Detailing' },
  { src: nail4, type: 'image', category: 'Nails', title: 'Color Pop Set' },
  { src: nail5, type: 'image', category: 'Nails', title: 'Signature Nail Craft' },
  { src: shave1, type: 'image', category: 'Barbering', title: 'Sharp Hairline Finish' },
  { src: shave2, type: 'image', category: 'Barbering', title: 'Classic Barbershop Cut' },
  { src: shave3, type: 'image', category: 'Barbering', title: 'Modern Fade Styling' },
  { src: shave4, type: 'image', category: 'Barbering', title: 'Premium Grooming Session' },
  { src: hairCutVideo, type: 'video', category: 'Barbering', title: 'Hair Cut Process', poster: shave3 },
  { src: manicureVideo, type: 'video', category: 'Nails', title: 'Manicure Treatment Reel', poster: nail2 },
  { src: manicureVideoAlt, type: 'video', category: 'Nails', title: 'Nail Finish Reel', poster: nail5 },
  { src: massageVideo, type: 'video', category: 'Spa', title: 'Massage Experience', poster: massageImg },
  { src: massageVideoAlt, type: 'video', category: 'Spa', title: 'Relaxation Session Reel', poster: spaImg },
  { src: pedicureVideo, type: 'video', category: 'Pedicure', title: 'Pedicure Process', poster: pedicureImg },
  { src: pedicureVideoAlt, type: 'video', category: 'Pedicure', title: 'Foot Care Session', poster: pedicureImg },
  { src: spaVideo, type: 'video', category: 'Wellness', title: 'Spa Ambience Reel', poster: spaImg },
  { src: nailVideo, type: 'video', category: 'Nails', title: 'Nail Video Highlight', poster: nail3 },
  { src: shaveVideo, type: 'video', category: 'Barbering', title: 'Shave Video Highlight', poster: shave1 },
  { src: shaveVideoAlt, type: 'video', category: 'Barbering', title: 'Clipper Work Highlight', poster: shave4 },
];

const GalleryPage: React.FC = () => {
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return galleryItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const activeMedia = activeIndex !== null ? galleryItems[activeIndex] : null;

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
          {paginatedItems.map((item, idx) => {
            const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
            return (
            <motion.div 
              key={`${item.src}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="col-12 col-md-6 col-lg-4"
            >
              <button
                type="button"
                className="position-relative overflow-hidden rounded-5 group w-100 border-0 p-0 bg-transparent"
                style={{ height: '400px', border: '1px solid rgba(255,255,255,0.05)' }}
                onClick={() => setActiveIndex(absoluteIndex)}
              >
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-100 h-100 object-fit-cover transition-all duration-1000 group-hover-scale-110"
                    style={{ transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)' }}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-100 h-100 object-fit-cover transition-all duration-1000 group-hover-scale-110"
                    style={{ transition: 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)' }}
                  />
                )}
                <div className="position-absolute inset-0 bg-gradient-dark opacity-0 group-hover-opacity-100 transition-all duration-500 d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <span className="badge bg-dark text-white border border-white border-opacity-25 mb-2 align-self-start">
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </span>
                  <span className="text-gradient small fw-bold tracking-widest text-uppercase mb-1">{item.category}</span>
                  <h4 className="Oswald h5 m-0">{item.title}</h4>
                </div>
              </button>
            </motion.div>
          )})}
        </div>

        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-5">
          <button
            type="button"
            className="btn btn-outline-light rounded-pill px-4"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`btn rounded-pill px-3 ${page === currentPage ? 'btn-purple' : 'btn-outline-light'}`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-outline-light rounded-pill px-4"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
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

      {activeMedia && (
        <MediaLightbox
          isOpen={activeIndex !== null}
          item={activeMedia}
          onClose={() => setActiveIndex(null)}
          onNext={() => setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length))}
          onPrev={() => setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length))}
        />
      )}
    </div>
  );
};

export default GalleryPage;
