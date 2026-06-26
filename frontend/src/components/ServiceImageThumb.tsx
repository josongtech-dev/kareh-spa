import React from 'react';
import { FiLayers } from 'react-icons/fi';
import { backendAssetUrl } from '../api/config';

export type ServiceImageThumbProps = {
  imageUrl?: string | null;
  alt?: string;
  size?: number;
  className?: string;
};

const ServiceImageThumb: React.FC<ServiceImageThumbProps> = ({
  imageUrl,
  alt = '',
  size = 40,
  className = '',
}) => {
  const url = imageUrl ? backendAssetUrl(imageUrl) : '';
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={`rounded-3 object-fit-cover border border-secondary border-opacity-10 flex-shrink-0 bg-light ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const iconSize = Math.max(14, Math.round(size * 0.45));
  return (
    <div
      className={`bg-purple bg-opacity-10 rounded-3 text-purple d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <FiLayers size={iconSize} />
    </div>
  );
};

export default ServiceImageThumb;
