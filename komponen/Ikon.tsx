// Ikon garis monokrom, bukan emoji: tampilannya konsisten di semua sistem
// (emoji dirender beda-beda per OS dan tidak bisa diwarnai).
const JALUR: Record<string, React.ReactNode> = {
  gempa: (
    // Gelombang seismik
    <path d="M2 12h3.5l2-6 3 12 3-9 2.5 3H21" />
  ),
  orbit: (
    // Benda kecil pada lintasan
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-24 12 12)" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="20" cy="8.5" r="1.6" />
    </>
  ),
  waktu: (
    // Jam
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  peta: (
    // Penanda lokasi
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
}

export type NamaIkon = keyof typeof JALUR

export function Ikon({ nama, className = '' }: { nama: NamaIkon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {JALUR[nama]}
    </svg>
  )
}
