const S = `fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

export const REASON_ICONS_INNER: Record<string, string> = {
  // Car with crash X marks
  vehicle: `
    <path ${S} d="M5 11l2-5h10l2 5"/>
    <rect ${S} x="2" y="11" width="20" height="6" rx="1"/>
    <circle ${S} cx="7" cy="17" r="2"/>
    <circle ${S} cx="17" cy="17" r="2"/>
    <line ${S} x1="20" y1="4" x2="22" y2="6"/>
    <line ${S} x1="22" y1="4" x2="20" y2="6"/>
    <line ${S} x1="10" y1="14" x2="14" y2="14"/>
  `,
  // Wrench
  maintenance: `
    <path ${S} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  `,
  // Paw print
  animal: `
    <circle cx="9" cy="9" r="2" fill="#ffffff"/>
    <circle cx="15" cy="9" r="2" fill="#ffffff"/>
    <circle cx="6" cy="13" r="1.5" fill="#ffffff"/>
    <circle cx="18" cy="13" r="1.5" fill="#ffffff"/>
    <path fill="#ffffff" d="M12 22c-3.5 0-6-1.8-6-4 0-1.5 1-2.8 2.5-3.3.7-.3 1.4-.9 1.8-1.8.4-.8.9-1.2 1.7-1.2s1.3.4 1.7 1.2c.4.9 1.1 1.5 1.8 1.8C17 15.2 18 16.5 18 18c0 2.2-2.5 4-6 4z"/>
  `,
  // Cloud with lightning bolt
  tree: `
    <path ${S} d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    <polyline ${S} points="13 11 9 17 15 17 11 23"/>
  `,
};

export const REASON_LABELS: Record<string, string> = {
  vehicle: 'Vehicle Crash',
  maintenance: 'Maintenance',
  animal: 'Animal Damage',
  tree: 'Natural Disaster',
};

export const getIconSvg = (reason: string, size: number = 24) => {
  const inner = REASON_ICONS_INNER[reason];
  if (!inner) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${inner}</svg>`;
};
