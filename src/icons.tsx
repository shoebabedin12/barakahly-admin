type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {children}
    </svg>
  );
}

export function IconSquares2x2({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconRectangleStack({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h12A2.25 2.25 0 0 1 20.25 6v3A2.25 2.25 0 0 1 18 11.25H6A2.25 2.25 0 0 1 3.75 9V6A2.25 2.25 0 0 1 6 3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.25h15M5.25 18h13.5" />
    </Icon>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.169.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </Icon>
  );
}

export function IconBookmark({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.32 3.75h11.36a1.5 1.5 0 0 1 1.5 1.5v15l-7.18-4.5-7.18 4.5v-15a1.5 1.5 0 0 1 1.5-1.5Z" />
    </Icon>
  );
}

export function IconCube({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-4.5-9 4.5m18 0-9 4.5m9-4.5v9l-9 4.5M3 7.5l9 4.5M3 7.5v9l9 4.5m0-9v9" />
    </Icon>
  );
}

export function IconSwatch({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-7.5Z" />
      <circle cx="8.25" cy="13.5" r="1.25" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 12h5M12.5 15h5" />
    </Icon>
  );
}

export function IconArrowsPointingOut({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </Icon>
  );
}

export function IconArchiveBox({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v3H3.75v-3ZM4.5 9.75v8.25a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V9.75M10.125 13.5h3.75" />
    </Icon>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 0h8.25m0 0a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 1 3 0m0 0H21m-2.25 0V13.5m0 0H15m3.75 0-1.72-3.44a1.5 1.5 0 0 0-1.34-.81H15M15 13.5V6.75A.75.75 0 0 0 14.25 6H3.75A.75.75 0 0 0 3 6.75v10.5a.75.75 0 0 0 .75.75h1.5" />
    </Icon>
  );
}

export function IconShoppingCart({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5l.4 2m0 0L6 14.25h11.25l2-8.25H4.15M4.15 5h15.6M7.5 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm10.5 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </Icon>
  );
}

export function IconBanknotes({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9Zm0 0V6a1.5 1.5 0 0 1 1.5-1.5h16.5A1.5 1.5 0 0 1 21.75 6v2.25M12 15a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    </Icon>
  );
}

export function IconShoppingBag({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.75V5.25a3 3 0 1 1 6 0v1.5m-8.25 0h10.5l.75 12.75a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5L3.75 6.75Z" />
    </Icon>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </Icon>
  );
}

export function IconTicket({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6a3 3 0 0 0 3 3v1.5a3 3 0 0 1 0 6V18a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-1.5a3 3 0 0 0 0-6V9a3 3 0 0 0 3-3h9ZM9 3v18" strokeDasharray="1 3" />
    </Icon>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.48 3.499 2.06 4.626 5.043.464c.884.081 1.24 1.18.57 1.759l-3.808 3.31 1.12 4.938c.196.865-.738 1.545-1.5 1.088L12 17.347l-4.33 2.937c-.762.457-1.696-.223-1.5-1.088l1.12-4.938-3.808-3.31c-.67-.579-.314-1.678.57-1.76l5.043-.463 2.06-4.626c.354-.795 1.483-.795 1.836 0Z" />
    </Icon>
  );
}

export function IconEnvelope({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-.828.672-1.5 1.5-1.5h16.5c.828 0 1.5.672 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75Zm0 0 9.75 6.75 9.75-6.75" />
    </Icon>
  );
}

export function IconCog6Tooth({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.216.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7.665 7.665 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </Icon>
  );
}

export function IconCreditCard({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 6.75h19.5A1.5 1.5 0 0 1 23.25 8.25v9a1.5 1.5 0 0 1-1.5 1.5H2.25a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5ZM5.25 15h3" />
    </Icon>
  );
}

export function IconPhoto({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.25" cy="9" r="1.5" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 17.25 4.5-4.5 3 3 5.25-5.25 4.5 4.5" />
    </Icon>
  );
}

export function IconNewspaper({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h6.75a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-9A2.25 2.25 0 0 1 5.25 7.5H12Zm0 0V5.25A2.25 2.25 0 0 1 14.25 3h2.25M9 12.75h6M9 16.5h6M9 9h1.5" />
    </Icon>
  );
}

export function IconAdjustmentsHorizontal({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M3.75 6H7.5m0 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm-3.75 12h9.75m6-12h3.75M13.5 12h6.75m-16.5 0h.75m0 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm12.75 6a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0h3.75m-16.5 0h9.75" />
    </Icon>
  );
}

export function IconChartBar({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h3.75V21H3v-7.5ZM10.125 8.25h3.75V21h-3.75V8.25ZM17.25 3h3.75v18h-3.75V3Z" />
    </Icon>
  );
}

export function IconDocumentChartBar({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 12.75v-1.5a3.375 3.375 0 0 0-3.375-3.375H5.25m9.75 4.875v2.625m-4.5-2.625v2.625m-4.5 0v2.625M19.5 14.25v2.25a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25v-2.25M13.5 3.75V6a1.5 1.5 0 0 0 1.5 1.5h2.25" />
    </Icon>
  );
}

export function IconShieldCheck({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7-7.5 3v6c0 4.5 3.15 8.7 7.5 9.75 4.35-1.05 7.5-5.25 7.5-9.75v-6l-7.5-3Z" />
    </Icon>
  );
}

export function IconUserGroup({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.941-3.197a5.971 5.971 0 0 0-.941 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </Icon>
  );
}

export function IconKey({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </Icon>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="8.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 1.5" />
    </Icon>
  );
}

export function IconBars3({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
    </Icon>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-3.227-1.591 1.591M5.25 12H3m3.227-4.773L4.636 5.636M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </Icon>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15.5A9.75 9.75 0 1 1 8.5 2.25a7.5 7.5 0 0 0 13.25 13.25Z" />
    </Icon>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </Icon>
  );
}

export function IconXMark({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </Icon>
  );
}

export function IconArrowRightStartOnRectangle({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H9m9 0-3-3m3 3-3 3" />
    </Icon>
  );
}

export function IconCalendarDays({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3.75" y="4.5" width="16.5" height="16.5" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M8 3v3M16 3v3M7.5 13.5h.008v.008H7.5V13.5Zm0 3h.008v.008H7.5v-3.008Zm4.5-3h.008v.008H12V13.5Zm0 3h.008v.008H12v-3.008Zm4.5-3h.008v.008h-.008V13.5Z" />
    </Icon>
  );
}

export function IconChartPie({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.75a7.5 7.5 0 0 1 6.75 6.75h-6.75V3.75Z" />
    </Icon>
  );
}

export function IconExclamationCircle({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="8.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v4.5m0 3h.008v.008H12V15.75Z" />
    </Icon>
  );
}

export function IconExclamationTriangle({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </Icon>
  );
}

export function IconReceiptPercent({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V21l1.5-.9L6 21l1.5-.9L9 21l1.5-.9L12 21l1.5-.9L15 21l1.5-.9L18 21l1.5-.9L21 21V7.5A4.5 4.5 0 0 0 16.5 3h-9A4.5 4.5 0 0 0 3 7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 15.75 7.5-7.5M9 9h.008v.008H9V9Zm6 6h.008v.008H15V15Z" />
    </Icon>
  );
}

export function IconArrowTrendingDown({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 6 8.5 8.5 4-4 6.5 6.5M21.25 12v5.25H16" />
    </Icon>
  );
}

export function IconArrowTrendingUp({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 8.5-8.5 4 4 6.5-6.5M21.25 12V6.75H16" />
    </Icon>
  );
}

export function IconBuildingStorefront({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21M3.75 9.75V21h16.5V9.75M2.25 9.75h19.5l-1.5-5.25a1.5 1.5 0 0 0-1.443-1.5H5.193A1.5 1.5 0 0 0 3.75 4.5l-1.5 5.25ZM8.25 21v-4.5A.75.75 0 0 1 9 15.75h1.5a.75.75 0 0 1 .75.75V21" />
    </Icon>
  );
}

export function IconSparkles({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09ZM18.26 8.72 18 9.75l-.26-1.03a3.38 3.38 0 0 0-2.46-2.46L14.25 6l1.03-.26a3.38 3.38 0 0 0 2.46-2.46L18 2.25l.26 1.03a3.38 3.38 0 0 0 2.46 2.46l1.03.26-1.03.26a3.38 3.38 0 0 0-2.46 2.46Z"
      />
    </Icon>
  );
}
