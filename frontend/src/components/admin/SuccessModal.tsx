import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  isDarkMode?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message, 
  buttonText = "CONTINUE",
  isDarkMode = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999 }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`position-relative p-5 rounded-5 shadow-2xl text-center overflow-hidden ${isDarkMode ? 'bg-dark text-white border border-secondary border-opacity-25' : 'bg-white text-dark'}`}
            style={{ width: '90%', maxWidth: '400px' }}
          >
            {/* Animated Background Pulse */}
            <div className="position-absolute top-0 start-50 translate-middle-x w-100 h-100" style={{ zIndex: -1 }}>
               <div className="w-100 h-100 opacity-10 bg-success rounded-circle animate-pulse" style={{ filter: 'blur(50px)' }} />
            </div>

            <div className="mb-4 d-inline-block p-3 rounded-circle bg-success bg-opacity-10 text-success">
              <motion.div
                initial={{ rotate: -45, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FiCheckCircle size={64} />
              </motion.div>
            </div>

            <h2 className="brand-title h3 mb-2 fw-bold">{title}</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-secondary font-light' : 'text-secondary'}`}>
              {message}
            </p>

            <button 
              onClick={onClose}
              className="btn btn-purple w-100 py-3 rounded-pill fw-bold shadow-lg transition-all hover-scale"
            >
              {buttonText}
            </button>

            <style dangerouslySetInnerHTML={{ __html: `
              .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.1; transform: scale(1); }
                50% { opacity: 0.15; transform: scale(1.1); }
              }
              .hover-scale:hover { transform: scale(1.02); }
              .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
            `}} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
