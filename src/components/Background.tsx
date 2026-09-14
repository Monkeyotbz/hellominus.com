import React, { useEffect, useState } from 'react';

// Fondos por defecto (Colombia)
const DEFAULT_BACKGROUNDS = [
  'https://images.pexels.com/photos/2884864/pexels-photo-2884864.jpeg',
];

type BackgroundProps = {
  children: React.ReactNode;
  backgrounds?: string[];
  className?: string;
  minHeight?: string; // ejemplo: 'min-h-[70vh]'
};

const Background: React.FC<BackgroundProps> = ({ children, backgrounds, className, minHeight }) => {
  const slides = backgrounds && backgrounds.length > 0 ? backgrounds : DEFAULT_BACKGROUNDS;
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div
      className={`${className ?? ''} w-full relative overflow-x-hidden transition-[background-image] duration-700`}
      style={{
        backgroundImage: `url(${slides[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: minHeight ?? undefined,
      }}
    >
      <div className="relative z-20">{children}</div>
    </div>
  );
};

export default Background;
