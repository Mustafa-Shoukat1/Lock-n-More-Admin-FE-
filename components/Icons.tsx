import React from 'react';

export const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.0003 2.00024C6.47746 2.00024 2.00024 6.47746 2.00024 12.0003C2.00024 13.9113 2.53678 15.6946 3.4658 17.2136L2.03052 22.4542L7.4222 21.0379C8.83516 21.8213 10.3638 22.2721 12.0003 22.2721C17.5232 22.2721 22.0004 17.7949 22.0004 12.0003C22.0004 6.47746 17.5232 2.00024 12.0003 2.00024ZM16.9209 17.0673C16.7196 17.6328 15.9189 18.0934 15.3402 18.217C14.9491 18.3005 14.4418 18.3582 12.7235 17.6433C10.5283 16.73 9.1098 14.4965 9.0002 14.3522C8.89116 14.2078 8.09458 13.1511 8.09458 12.0543C8.09458 10.9576 8.65604 10.4221 8.89146 10.1764C9.0732 9.98688 9.38096 9.89736 9.67064 9.89736C9.7651 9.89736 9.8516 9.90158 9.92728 9.90522C10.1513 9.91558 10.2638 9.92906 10.4121 10.2838C10.5969 10.7259 11.0463 11.8213 11.101 11.9333C11.1557 12.0454 11.2104 12.1979 11.136 12.346C11.0622 12.4942 10.9984 12.569 10.8893 12.6953C10.7803 12.8217 10.6654 12.9567 10.565 13.0818C10.4601 13.2031 10.3446 13.332 10.4727 13.5519C10.6013 13.7711 11.0454 14.4939 11.6974 15.0754C12.5385 15.8251 13.2198 16.0649 13.4608 16.1652C13.6393 16.2394 13.7917 16.2217 13.92 16.0741C14.0799 15.8899 14.2758 15.5973 14.4751 15.3183C14.6157 15.1207 14.7836 15.0939 14.9644 15.1609C15.1453 15.2278 16.1042 15.6997 16.3032 15.7999C16.5023 15.9002 16.6354 15.9493 16.6836 16.0315C16.7319 16.1137 16.7319 16.5028 16.9209 17.0673Z" fill="#25D366"/>
  </svg>
);

export const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#insta_grad)" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="url(#insta_grad)" strokeWidth="2"/>
    <circle cx="18" cy="6" r="1.5" fill="url(#insta_grad)"/>
    <defs>
      <linearGradient id="insta_grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F58529"/>
        <stop offset="0.5" stopColor="#DD2A7B"/>
        <stop offset="1" stopColor="#8134AF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16.5 3c-.172 2.26 1.074 4.38 3.5 4.5v3.5c-2.436 0-4.605-.811-6-2.864V17c0 2.761-2.239 5-5 5s-5-2.239-5-5 2.239-5 5-5c.342 0 .674.034 1 .1v3.1c-.322-.13-.654-.2-1-.2-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2V3h3.5z" fill="currentColor"/>
  </svg>
);

export const AppLogo = ({ className = "", compact = false }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="flex items-center font-black text-2xl tracking-tight">
      {!compact && (
        <span className="text-slate-900 dark:text-white mr-1.5 font-outfit uppercase">LOCKS</span>
      )}
      <div className="relative flex items-center justify-center">
        <svg width="34" height="40" viewBox="0 0 34 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Red Shield Outline */}
          <path 
            d="M17 0L2 6.5V18.5C2 28.5 8.5 36.5 17 40C25.5 36.5 32 28.5 32 18.5V6.5L17 0Z" 
            fill="#E11D48" 
          />
          {/* White Shield Interior */}
          <path 
            d="M17 4L5 9.2V18.5C5 26.5 10 33.5 17 36.5C24 33.5 29 26.5 29 18.5V9.2L17 4Z" 
            fill="white" 
          />
          {/* Central 'N Text */}
          <text 
            x="50%" 
            y="62%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fill="#1E293B" 
            fontSize="16" 
            fontWeight="900" 
            fontFamily="Outfit, sans-serif"
          >
            'N
          </text>
        </svg>
      </div>
      {!compact && (
        <span className="text-slate-900 dark:text-white ml-1.5 font-outfit uppercase">MORE</span>
      )}
    </div>
  </div>
);
