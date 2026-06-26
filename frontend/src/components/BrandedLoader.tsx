import React from 'react';

type BrandedLoaderProps = {
  message?: string;
  fullScreen?: boolean;
};

const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  message = 'Preparing your glow-up...',
  fullScreen = true
}) => {
  return (
    <div className={`kareh-loader ${fullScreen ? 'kareh-loader-fullscreen' : ''}`} role="status" aria-live="polite" aria-label="Loading">
      <div className="kareh-loader-ring" />
      <div className="kareh-loader-ring kareh-loader-ring-alt" />
      <p className="kareh-loader-text mb-0">{message}</p>
    </div>
  );
};

export default BrandedLoader;
