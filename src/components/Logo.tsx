import React from 'react';

const FOLDER_PATH = 'M13,13 Q13,5 21,5 L49,5 Q54,5 57,10 L62,17 Q65,21 71,21 L109,21 Q117,21 117,29 L117,91 Q117,99 109,99 L21,99 Q13,99 13,91 Z';
const QUOTE_PATH = 'M9.75,0 C16.9,0 21.45,5.2 21.45,12.35 C21.45,18.85 16.9,23.4 10.4,24.05 C6.5,32.5 -1.3,40.95 -11.7,45.5 C-3.9,37.7 1.3,29.9 1.3,23.4 C-5.2,20.8 -9.1,16.25 -9.1,9.75 C-9.1,2.6 -1.95,0 9.75,0 Z';

interface LogoIconProps {
  size?: number;
  /** 'navy' for light backgrounds (default), 'white' for dark backgrounds
   * (e.g. the navy footer CTA) where a navy folder would disappear. */
  variant?: 'navy' | 'white';
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 32, variant = 'navy', className = '' }) => {
  const folderFill = variant === 'white' ? '#FFFFFF' : '#14137B';
  const height = Math.round((size * 110) / 130);
  return (
    <svg width={size} height={height} viewBox="0 0 130 110" className={className}>
      <path d={FOLDER_PATH} fill={folderFill} />
      <g fill="#66D100" transform="translate(37,44)"><path d={QUOTE_PATH} /></g>
      <g fill="#66D100" transform="translate(65,44)"><path d={QUOTE_PATH} /></g>
    </svg>
  );
};

interface LogoProps {
  /** 'horizontal': icon beside wordmark (nav bars, footers). 'stacked':
   * icon above wordmark (hero moments, empty states). 'icon': mark only. */
  layout?: 'horizontal' | 'stacked' | 'icon';
  size?: number;
  variant?: 'navy' | 'white';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ layout = 'horizontal', size = 32, variant = 'navy', className = '' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-[#14137B]';
  const wordmark = (
    <span className={`font-logo font-extrabold ${textColor}`} style={{ fontSize: size * 0.6 }}>
      CaptionDrive
    </span>
  );

  if (layout === 'icon') {
    return <LogoIcon size={size} variant={variant} className={className} />;
  }

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <LogoIcon size={size} variant={variant} />
        {wordmark}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} variant={variant} />
      {wordmark}
    </div>
  );
};
