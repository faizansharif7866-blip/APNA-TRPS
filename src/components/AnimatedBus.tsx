import React from 'react';

interface AnimatedBusProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showRoad?: boolean;
  className?: string;
}

export const AnimatedBus: React.FC<AnimatedBusProps> = ({
  size = 'md',
  showRoad = false,
  className = '',
}) => {
  const dimensions = {
    sm: { width: 44, height: 26 },
    md: { width: 68, height: 38 },
    lg: { width: 110, height: 60 },
    hero: { width: 160, height: 86 },
  }[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      {/* Animated Bus Container with gentle suspension float */}
      <div className="relative animate-[bounce_3s_ease-in-out_infinite]">
        
        {/* Headlight Glow Cone */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-6 pointer-events-none opacity-60 z-0"
          style={{
            background: 'radial-gradient(ellipse at left, rgba(251, 191, 36, 0.45), transparent 75%)',
            transform: 'translateX(85%) rotate(-5deg)',
          }}
        />

        {/* Detailed SVG Volvo Multi-Axle Luxury Coach */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 160 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md overflow-visible relative z-10"
        >
          {/* Defs for gradients */}
          <defs>
            {/* Bus Body Metallic Navy Gradient */}
            <linearGradient id="apnaBusBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="40%" stopColor="#0A192F" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            {/* Aerodynamic Gold Fleet Stripe */}
            <linearGradient id="apnaGoldStripe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Tinted Glass Gradient */}
            <linearGradient id="busGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.95" />
            </linearGradient>

            {/* Wheel Rim Gradient */}
            <linearGradient id="wheelRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Bus Main Chassis & Aerodynamic Roof */}
          <path
            d="M 12 70 
               L 142 70 
               C 152 70, 156 64, 156 54 
               L 155 36 
               C 154 22, 145 12, 132 10 
               L 20 10 
               C 10 10, 6 16, 6 26 
               L 6 62 
               C 6 68, 8 70, 12 70 Z"
            fill="url(#apnaBusBody)"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />

          {/* Roof AC Unit with cooling vents */}
          <path
            d="M 40 10 L 44 4 L 115 4 L 118 10 Z"
            fill="#0F172A"
            stroke="#D4AF37"
            strokeWidth="1"
          />
          <line x1="52" y1="7" x2="105" y2="7" stroke="#64748B" strokeWidth="1" strokeDasharray="3 2" />

          {/* Aerodynamic Signature Gold Wave Ribbon */}
          <path
            d="M 6 48 
               Q 65 52, 90 42 
               T 155 36 
               L 155 44 
               Q 115 50, 85 58 
               T 6 60 Z"
            fill="url(#apnaGoldStripe)"
            opacity="0.95"
          />

          {/* Lower accent gold line */}
          <path
            d="M 8 64 L 152 64"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />

          {/* Passenger Tinted Windows - Upper Sleeper Deck */}
          <g fill="url(#busGlass)" stroke="#0F172A" strokeWidth="1">
            <rect x="24" y="15" width="16" height="11" rx="2" />
            <rect x="44" y="15" width="16" height="11" rx="2" />
            <rect x="64" y="15" width="16" height="11" rx="2" />
            <rect x="84" y="15" width="16" height="11" rx="2" />
            <rect x="104" y="15" width="16" height="11" rx="2" />
          </g>

          {/* Passenger Tinted Windows - Lower Deck */}
          <g fill="url(#busGlass)" stroke="#0F172A" strokeWidth="1">
            <rect x="24" y="30" width="16" height="13" rx="2" />
            <rect x="44" y="30" width="16" height="13" rx="2" />
            <rect x="64" y="30" width="16" height="13" rx="2" />
            <rect x="84" y="30" width="16" height="13" rx="2" />
            <rect x="104" y="30" width="16" height="13" rx="2" />
          </g>

          {/* Front Curved Windshield & Chauffeur Cabin */}
          <path
            d="M 124 15 
               L 134 15 
               C 144 17, 151 26, 152 38 
               L 124 38 Z"
            fill="url(#busGlass)"
            stroke="#0F172A"
            strokeWidth="1"
          />

          {/* Warm Interior Silhouette Light Highlights in Sleeper Windows */}
          <circle cx="32" cy="20" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="52" cy="20" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="72" cy="20" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="92" cy="20" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="112" cy="20" r="1.5" fill="#FEF08A" opacity="0.8" />

          {/* Driver Silhouette */}
          <circle cx="132" cy="28" r="3" fill="#0A192F" />
          <path d="M 128 36 C 128 32, 136 32, 136 36 Z" fill="#0A192F" />

          {/* Front Headlights & Fog Lamps with Bright Beam */}
          <ellipse cx="153" cy="54" rx="2.5" ry="4" fill="#FDE047" />
          <circle cx="152" cy="62" r="2" fill="#F59E0B" />

          {/* Rear Tail Red Stop Lights */}
          <rect x="5" y="46" width="2" height="6" rx="1" fill="#EF4444" />
          <rect x="5" y="56" width="2" height="4" rx="1" fill="#DC2626" />

          {/* Wheel Arch Cutouts */}
          <path d="M 22 70 A 12 12 0 0 1 46 70 Z" fill="#030712" />
          <path d="M 106 70 A 12 12 0 0 1 130 70 Z" fill="#030712" />
          <path d="M 126 70 A 12 12 0 0 1 150 70 Z" fill="#030712" />

          {/* Wheel 1 (Front Axle) with Spoke Animation */}
          <g transform="translate(138, 70)">
            {/* Rubber Tire */}
            <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
            <circle cx="0" cy="0" r="7" fill="url(#wheelRim)" />
            {/* Rotating Hubcap Spokes */}
            <g className="animate-[spin_1.5s_linear_infinite] origin-center">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#0F172A" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="2.5" fill="#D4AF37" />
            </g>
          </g>

          {/* Wheel 2 (Middle Axle) with Spoke Animation */}
          <g transform="translate(118, 70)">
            <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
            <circle cx="0" cy="0" r="7" fill="url(#wheelRim)" />
            <g className="animate-[spin_1.5s_linear_infinite] origin-center">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#0F172A" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="2.5" fill="#D4AF37" />
            </g>
          </g>

          {/* Wheel 3 (Rear Axle) with Spoke Animation */}
          <g transform="translate(34, 70)">
            <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
            <circle cx="0" cy="0" r="7" fill="url(#wheelRim)" />
            <g className="animate-[spin_1.5s_linear_infinite] origin-center">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#0F172A" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="2.5" fill="#D4AF37" />
            </g>
          </g>
        </svg>

      </div>

      {/* Optional Highway Dash Road Effect */}
      {showRoad && (
        <div className="w-full flex flex-col items-center mt-0.5 overflow-hidden">
          <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
            <div 
              className="absolute inset-0 w-[200%] h-full animate-[pulse_1s_linear_infinite]"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 8px, transparent 8px, transparent 16px)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
