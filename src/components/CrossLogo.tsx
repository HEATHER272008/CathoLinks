import { cn } from "@/lib/utils";

interface CrossLogoProps {
  className?: string;
  size?: number;
}

export const CrossLogo = ({ className, size = 80 }: CrossLogoProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="glow-effect smooth-transition"
      >
        <defs>
          <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(220, 80%, 45%)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(220, 85%, 60%)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Vertical bar */}
        <rect 
          x="40" 
          y="10" 
          width="20" 
          height="80" 
          rx="4" 
          fill="url(#crossGradient)"
          className="animate-pulse"
        />
        
        {/* Horizontal bar */}
        <rect 
          x="20" 
          y="30" 
          width="60" 
          height="20" 
          rx="4" 
          fill="url(#crossGradient)"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};