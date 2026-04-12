import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarCheck, FaInfoCircle, FaTimes, FaStethoscope, FaCut, FaMagic, FaHands, FaLeaf } from 'react-icons/fa';
import heroImg from '../assets/hero.png';
import barberImg from '../assets/barbershop.png';
import salonImg from '../assets/salon.png';

const specialists = [
  { id: '1', name: 'James Kariuki', role: 'Master Barber', img: barberImg, expertise: 'Specializes in precision fades, traditional hot towel shaves, and skin-fade artistry with 8+ years of experience.', icon: <FaCut />, bio: 'James has won multiple grooming awards and is known for his attention to detail and creative hairline designs.' },
  { id: '2', name: 'Sarah Wambui', role: 'Lead Hair Stylist', img: salonImg, expertise: 'Expert in complex braiding, weaving, and organic hair treatment programs. Bridal hair enthusiast.', icon: <FaMagic />, bio: 'Sarah has over 10 years of experience in salon management and is a certified color specialist.' },
  { id: '3', name: 'Grace Njeri', role: 'Spa Therapist', img: heroImg, expertise: 'Certified in Swedish massage, aromatherapy, and chemical-free skincare facials.', icon: <FaLeaf />, bio: 'Grace focuses on holistic wellness and therapeutic techniques that relieve deep-seated muscle tension.' },
  { id: '4', name: 'Anita Kemunto', role: 'Nail Artist', img: salonImg, expertise: 'Specialist in 3D nail art, acrylic extensions, and luxury spa pedicures with a focus on hygiene.', icon: <FaHands />, bio: 'Anita is the go-to specialist for trendsetting nail designs and long-lasting acrylic perfection.' },
];

const BookingPage: React.FC = () => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<typeof specialists[0] | null>(null);

  return (
    <div className="bg-black min-vh-100 py-5 position-relative overflow-hidden">
      <div className="mesh-glow opacity-30"></div>
      
      {/* Expertise Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed inset-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
            style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel rounded-5 p-4 p-md-5 position-relative"
              style={{ maxWidth: '600px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="btn btn-link position-absolute top-0 end-0 m-4 text-white p-0" onClick={() => setActiveModal(null)}>
                <FaTimes size={24} />
              </button>
              
              <div className="row g-4 align-items-center">
                <div className="col-md-5">
                   <img src={activeModal.img} alt={activeModal.name} className="w-100 rounded-4 shadow-lg" />
                </div>
                <div className="col-md-7">
                   <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="text-gradient fs-2">{activeModal.icon}</div>
                      <span className="text-gradient tracking-widest text-uppercase fw-bold small">{activeModal.role}</span>
                   </div>
                   <h2 className="Oswald display-6 fw-bold mb-3">{activeModal.name}</h2>
                   <p className="Outfit fw-semibold text-gold mb-2">EXPERTISE:</p>
                   <p className="Outfit opacity-75 small mb-3">{activeModal.expertise}</p>
                   <p className="Outfit opacity-50 small m-0">{activeModal.bio}</p>
                   
                   <button 
                     className="btn btn-purple mt-4 w-100" 
                     onClick={() => { setSelectedSpecialist(activeModal.id); setActiveModal(null); }}
                   >
                     SELECT AS MY SPECIALIST
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-panel rounded-5 p-4 p-md-5 overflow-hidden position-relative"
            >
              <div className="row">
                <div className="col-lg-7">
                  <span className="text-gradient tracking-widest text-uppercase d-block mb-2 fw-bold">Reservation</span>
                  <h2 className="display-4 fw-bold Oswald mb-4">BOOK YOUR <span className="text-playfair italic">Session</span></h2>
                  
                  <form className="mt-5">
                    <div className="row g-4">
                      {/* Personal Info */}
                      <div className="col-md-6">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Full Name</label>
                        <input type="text" className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-3 Outfit shadow-none focus-border-purple" style={{ border: '1px solid rgba(255,255,255,0.1)' }} placeholder="Your Name" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Phone Number</label>
                        <input type="tel" className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-3 Outfit shadow-none" style={{ border: '1px solid rgba(255,255,255,0.1)' }} placeholder="07xx xxx xxx" />
                      </div>

                      {/* Service Selection */}
                      <div className="col-12">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Select Service</label>
                        <select className="form-select bg-transparent border-white border-opacity-10 text-white rounded-4 p-3 Outfit shadow-none" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                          <option className="bg-dark">Select Category</option>
                          <option className="bg-dark" value="barber">Barbershop & Grooming</option>
                          <option className="bg-dark" value="salon">Hair & Salon</option>
                          <option className="bg-dark" value="nails">Nails & Art</option>
                          <option className="bg-dark" value="spa">Massage & Waxing</option>
                        </select>
                      </div>

                      {/* Interactive Specialist Selection */}
                      <div className="col-12 mt-4">
                        <label className="form-label small tracking-widest text-uppercase opacity-50 mb-3 d-block">Choose Your Specialist (Optional)</label>
                        <div className="row g-3">
                          {specialists.map((spec) => (
                            <div className="col-sm-6 col-md-3" key={spec.id}>
                              <div 
                                className={`position-relative rounded-4 p-2 transition-all cursor-pointer border ${selectedSpecialist === spec.id ? 'border-purple bg-purple bg-opacity-10' : 'border-white border-opacity-10'}`}
                                onClick={() => setSelectedSpecialist(spec.id)}
                              >
                                <div className="aspect-ratio-square rounded-3 overflow-hidden mb-2" style={{ height: '120px' }}>
                                   <img src={spec.img} alt={spec.name} className="w-100 h-100 object-fit-cover" />
                                </div>
                                <h6 className="Oswald m-0 small text-uppercase lh-sm">{spec.name}</h6>
                                <p className="Outfit opacity-50 m-0" style={{ fontSize: '10px' }}>{spec.role}</p>
                                <button 
                                  type="button" 
                                  className="btn btn-link p-0 text-gradient small fw-bold mt-1 text-decoration-none" 
                                  style={{ fontSize: '10px' }}
                                  onClick={(e) => { e.stopPropagation(); setActiveModal(spec); }}
                                >
                                  VIEW EXPERTISE
                                </button>
                                {selectedSpecialist === spec.id && (
                                   <div className="position-absolute top-0 end-0 p-2 text-purple"><FaCalendarCheck size={14} /></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="col-md-6 mt-4">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Preferred Date</label>
                        <input type="date" className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-3 Outfit shadow-none" style={{ border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                      </div>
                      <div className="col-md-6 mt-4">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Preferred Time</label>
                        <input type="time" className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-3 Outfit shadow-none" style={{ border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                      </div>

                      <div className="col-12 mt-5">
                        <button type="submit" className="btn btn-purple w-100 py-3 Oswald fs-5 tracking-widest">
                          CONFIRM RESERVATION
                        </button>
                        <p className="text-center mt-3 small opacity-50 d-flex align-items-center justify-content-center gap-2 Outfit">
                           <FaInfoCircle size={12} /> We will call you to confirm your slot within 15 minutes.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="col-lg-5 mt-5 mt-lg-0">
                   <div className="p-4 rounded-5 h-100 d-flex flex-column justify-content-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <h4 className="Oswald text-gradient mb-4">VISIT US</h4>
                      <p className="Outfit opacity-75 mb-4 fw-light">
                        Located in the heart of Ngong Town, offering a serene escape from the urban hustle.
                      </p>
                      
                      <div className="mb-4">
                        <span className="d-block small tracking-widest text-uppercase opacity-50 mb-1">Location</span>
                        <p className="m-0 fw-bold Outfit">Milele Mall, 1st Floor</p>
                        <p className="m-0 Outfit fw-light opacity-50">Ngong Town, Kenya</p>
                      </div>
                      
                      <div className="mb-4">
                        <span className="d-block small tracking-widest text-uppercase opacity-50 mb-1">Hours</span>
                        <p className="m-0 fw-bold Outfit">Mon - Sat: 8:00 AM - 9:00 PM</p>
                        <p className="m-0 fw-bold Outfit">Sunday: 10:00 AM - 7:00 PM</p>
                      </div>
                      
                      <div>
                        <span className="d-block small tracking-widest text-uppercase opacity-50 mb-1">Contact</span>
                        <p className="m-0 fw-bold Outfit">+254 743 695 893</p>
                        <p className="m-0 fw-bold Outfit">karehspa2024@gmail.com</p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
