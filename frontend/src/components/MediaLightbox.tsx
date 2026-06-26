import React, { useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export type GalleryMediaItem = {
  src: string;
  type: 'image' | 'video';
  category: string;
  title: string;
  poster?: string;
};

type MediaLightboxProps = {
  isOpen: boolean;
  item: GalleryMediaItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const MediaLightbox: React.FC<MediaLightboxProps> = ({ isOpen, item, onClose, onNext, onPrev }) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onPrev();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0, 0, 0, 0.92)', zIndex: 1080 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <button
        type="button"
        className="btn btn-link text-white position-absolute top-0 end-0 m-4 fs-4"
        onClick={onClose}
        aria-label="Close media viewer"
      >
        <FaTimes />
      </button>

      <button
        type="button"
        className="btn btn-dark rounded-circle position-absolute start-0 ms-3 ms-md-4"
        style={{ width: '48px', height: '48px' }}
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous media"
      >
        <FaChevronLeft />
      </button>

      <div
        className="px-2 px-md-5 w-100 d-flex flex-column align-items-center"
        style={{ maxWidth: '1200px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-100 rounded-4 overflow-hidden border border-white border-opacity-25">
          {item.type === 'video' ? (
            <video
              src={item.src}
              poster={item.poster}
              controls
              autoPlay
              playsInline
              className="w-100"
              style={{ maxHeight: '75vh', background: '#000' }}
            />
          ) : (
            <img
              src={item.src}
              alt={item.title}
              className="w-100"
              style={{ maxHeight: '75vh', objectFit: 'contain', background: '#000' }}
            />
          )}
        </div>
        <div className="text-center mt-3">
          <span className="small text-uppercase tracking-widest text-gradient fw-bold">{item.category}</span>
          <h4 className="mt-2 mb-0 Oswald text-white">{item.title}</h4>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-dark rounded-circle position-absolute end-0 me-3 me-md-4"
        style={{ width: '48px', height: '48px' }}
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next media"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default MediaLightbox;
