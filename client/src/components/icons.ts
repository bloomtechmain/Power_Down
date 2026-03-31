export const REASON_ICONS_INNER: Record<string, string> = {
  vehicle: `
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0-4 0m-6 0a2 2 0 1 0-4 0" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  maintenance: `
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  animal: `
    <path d="M11 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" fill="#ffffff"/>
    <path d="M20 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" fill="#ffffff"/>
    <path d="M7 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" fill="#ffffff"/>
    <path d="M18 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" fill="#ffffff"/>
    <path d="M11.52 18.21A4 4 0 0 1 9.49 20H15a4.01 4.01 0 0 1-2.12-1.78l-1.36-2z" fill="#ffffff"/>
  `,
  tree: `
    <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 22v-3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `
};

export const getIconSvg = (reason: string, size: number = 24) => {
  const inner = REASON_ICONS_INNER[reason];
  if (!inner) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${inner}</svg>`;
};
