import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  isDarkMode?: boolean;
  zIndex?: number;
}

const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = '950px',
  isDarkMode = false,
  zIndex = 9999
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-absolute w-100 h-100 bg-black bg-opacity-75"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`modal-container rounded-5 shadow-2xl overflow-hidden position-relative d-flex flex-column ${isDarkMode ? 'bg-dark border border-white border-opacity-10' : 'bg-white border border-black border-opacity-5'}`}
            style={{ maxWidth, width: '100%', maxHeight: '90vh', zIndex: zIndex + 1 }}
          >
            {/* Modal Header */}
            <div className="p-4 p-md-4 border-bottom border-opacity-10 d-flex justify-content-between align-items-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6a0dad 0%, #4a097d 100%)' }}>
              <div>
                <h2 className="h3 m-0 fw-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="m-0 mt-1 text-uppercase tracking-widest fw-bold text-white text-opacity-75" style={{ fontSize: '0.75rem' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="btn p-2 rounded-circle border-0 text-white hover-bg-white-10 d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 p-md-5 overflow-y-auto custom-scrollbar flex-grow-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
