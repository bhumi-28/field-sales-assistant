const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function UsersIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-5" />
    </svg>
  );
}

export function TrendingUpIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function AlertTriangleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}