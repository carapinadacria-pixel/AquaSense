interface AquaLogoProps {
  size?: 'sm' | 'md' | 'hero';
  className?: string;
}

export function AquaLogo({ size = 'sm', className = '' }: AquaLogoProps) {
  const dimensions =
    size === 'hero'
      ? 'w-20 h-24'
      : size === 'md'
        ? 'w-10 h-12'
        : 'w-7 h-8';

  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${dimensions} shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Subtle concentric outer droplet contour matching PDF Page 1 */}
      <path
        d="M40 4C40 4 8 41.2 8 61.5C8 79.45 22.33 93 40 93C57.67 93 72 79.45 72 61.5C72 41.2 40 4 40 4Z"
        stroke="#45B5DC"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      {/* Primary filled cerulean droplet */}
      <path
        d="M40 12C40 12 14 43.4 14 60.8C14 75.27 25.64 86.5 40 86.5C54.36 86.5 66 75.27 66 60.8C66 43.4 40 12 40 12Z"
        fill="#0D76A8"
      />
      {/* Wi-Fi signal waves inside droplet */}
      <path
        d="M24.5 52.5C28.8 48.2 34.1 46 40 46C45.9 46 51.2 48.2 55.5 52.5"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M29.8 58.2C32.6 55.4 36.1 54 40 54C43.9 54 47.4 55.4 50.2 58.2"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M35.2 63.8C36.5 62.5 38.2 61.8 40 61.8C41.8 61.8 43.5 62.5 44.8 63.8"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="69.5" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}
