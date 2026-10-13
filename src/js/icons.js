// SEVEN — inline SVG icon set (offline, Material-style 24px line icons).
// Each entry is the inner markup of a 24x24 viewBox drawn with currentColor strokes.

const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5h4v5"/>',
  people:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.5a3 3 0 0 1 0 5.6"/><path d="M17.5 14.6c2 .6 3.4 2.4 3.4 5.4"/>',
  receipt:
    '<path d="M6 3h12v16l-2-1.4-2 1.4-2-1.4L10 19l-2-1.4L6 19Z"/><path d="M9 8h6M9 11.5h6"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevronLeft: '<path d="M14.5 6 8.5 12l6 6"/>',
  chevronRight: '<path d="M9.5 6l6 6-6 6"/>',
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  print:
    '<path d="M7 9V4h10v5"/><rect x="5" y="9" width="14" height="7" rx="1.5"/><path d="M8 16h8v4H8z"/>',
  share:
    '<circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="M8.1 10.9 14.9 7M8.1 13.1 14.9 17"/>',
  edit: '<path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17Z"/><path d="M14.5 6.5l3 3"/>',
  trash: '<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M6 15V5h10"/>',
  phone: '<path d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v4c0 1-1 1.6-2 1.5A16 16 0 0 1 4.5 6C4.3 5 5 4 5 4Z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8 3.5v3M16 3.5v3"/>',
  wallet: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 9h16"/><circle cx="17" cy="13" r="1.2"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>',
  bank: '<path d="M4 9 12 4l8 5"/><path d="M6 9v8M10 9v8M14 9v8M18 9v8M4 19h16"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.4 11 15.4 16 9.6"/>',
  warning: '<path d="M12 4 3 19h18Z"/><path d="M12 10v4M12 16.5v.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
  shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6Z"/><path d="M9 12l2 2 4-4"/>',
  eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.6"/>',
  save: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 4v5h6V4M8 19v-5h8v5"/>',
  upload: '<path d="M12 15V5M8.5 8.5 12 5l3.5 3.5"/><path d="M5 16v3h14v-3"/>',
  download: '<path d="M12 5v10M8.5 11.5 12 15l3.5-3.5"/><path d="M5 16v3h14v-3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
  hospital: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
  location: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  verified: '<path d="M12 3l2.2 2 3-.3 1 2.9 2.3 1.9-1.3 2.6.4 3-2.9 1-1.6 2.5-2.9-.8-2.9.8-1.6-2.5-2.9-1 .4-3L3.5 9.5 5.8 7.6 6.8 4.7l3 .3Z"/><path d="M9 12l2 2 4-4.2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M20 20H4"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8Z"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h3v3M20 14v6h-6"/>',
  box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4Z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  note: '<path d="M6 4h9l4 4v12H6Z"/><path d="M15 4v4h4M9 13h6M9 16h4"/>',
  microscope: '<path d="M6 20h12M9 20V9a3 3 0 0 1 6 0v3"/><path d="M7 12h10"/>',
  sparkle: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
  link: '<path d="M10 14a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1"/><path d="M14 10a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5l3 1.8"/>',
  archive: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v10h13V9M10 13h4"/>',
};

export function icon(name, cls = '', size = '') {
  const body = P[name] || P.info;
  const style = size ? ` style="width:${size};height:${size}"` : '';
  const klass = cls ? ` class="${cls}"` : '';
  return `<svg${klass}${style} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function hasIcon(name) {
  return Object.prototype.hasOwnProperty.call(P, name);
}
