import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import simmitLogo from '../SIMMIT-LOGO.png';

interface SimmitLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showBadge?: boolean;
}

const sizeMap = {
  sm: { icon: 'h-6 w-6', text: 'text-sm', title: 'text-lg' },
  md: { icon: 'h-8 w-8', text: 'text-base', title: 'text-2xl' },
  lg: { icon: 'h-10 w-10', text: 'text-lg', title: 'text-3xl' },
};

const SimmitLogo: React.FC<SimmitLogoProps> = ({ size = 'md', subtitle, showBadge = false }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.simmit-logo-shine',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.to('.simmit-logo-pulse', {
        scale: 1.03,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const classes = sizeMap[size];

  return (
    <div
      ref={rootRef}
      className="flex items-center gap-3"
      data-flip-id="simmit-logo"
    >
      <div className="simmit-logo-pulse flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50">
        <img src={simmitLogo} alt="SIMMIT" className={`${classes.icon} object-contain`} />
      </div>
      <div className="simmit-logo-shine">
        {showBadge && (
          <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/70">Pioneer Beta</p>
        )}
        <h1 className={`font-title text-white ${classes.title}`}>
          SIMMIT <span className="text-[#741cd9] simmit-glow">AI QUEST</span>
        </h1>
        {subtitle && (
          <p className={`text-[#003322]/70 ${classes.text}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SimmitLogo;
