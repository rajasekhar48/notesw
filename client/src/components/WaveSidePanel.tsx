// WaveSidePanelFull.tsx
import React from "react";

interface WaveSidePanelFullProps {
  image?: string;
  className?: string;
}

const WaveSidePanelFull: React.FC<WaveSidePanelFullProps> = ({
  image,
  className = "",
}) => {
  const src = image ?? "/images/your-image.jpg";

  return (
    <div className={`hidden lg:block lg:flex-1 relative ${className}`}>
      {/* single image filling the whole right column */}
      <img
        src={src}
        alt="decorative"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default WaveSidePanelFull;
