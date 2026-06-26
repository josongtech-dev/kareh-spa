import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDarkMode?: boolean;
  children?: React.ReactNode;
  confirmButtonClassName?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDarkMode = false,
  children,
  confirmButtonClassName = 'btn-danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`position-relative p-4 rounded-4 shadow-lg ${isDarkMode ? 'bg-dark text-white border border-secondary border-opacity-25' : 'bg-white text-dark'}`}
            style={{ width: '92%', maxWidth: '420px' }}
          >
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 rounded-circle bg-danger bg-opacity-10 text-danger me-2">
                <FiAlertTriangle />
              </div>
              <h5 className="mb-0 fw-bold">{title}</h5>
            </div>
            <p className={`small mb-4 ${isDarkMode ? 'text-secondary' : 'text-muted'}`}>{message}</p>
            {children}
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary rounded-pill px-3" onClick={onClose}>{cancelText}</button>
              <button className={`btn ${confirmButtonClassName} rounded-pill px-3`} onClick={onConfirm}>{confirmText}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
