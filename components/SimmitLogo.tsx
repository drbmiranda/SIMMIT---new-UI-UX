import React from 'react';
import simmitLogo from '../design-SIMMIT/logo.svg';

interface SimmitLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showBadge?: boolean;
}

const sizeMap = {
  sm: { logo: 'h-6', subtitle: 'text-xs' },
  md: { logo: 'h-8', subtitle: 'text-sm' },
  lg: { logo: 'h-10', subtitle: 'text-base' },
};

const SimmitLogo: React.FC<SimmitLogoProps> = ({ size = 'md', subtitle, showBadge = false }) => {
  const classes = sizeMap[size];

  return (
    <div className="flex items-center gap-3" data-flip-id="simmit-logo">
      <img src={simmitLogo} alt="SIMMIT" className={`w-auto ${classes.logo}`} />
      {(showBadge || subtitle) && (
        <div>
          {showBadge && <p className="text-[10px] uppercase tracking-[0.3em] text-[#003322]/70">Pioneer Beta</p>}
          {subtitle && <p className={`text-[#003322]/70 ${classes.subtitle}`}>{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

export default SimmitLogo;
