import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ekspor statis: situs disajikan GitHub Pages, yang tidak punya sisi server.
  // Konsekuensinya tidak ada route handler — /api/proxy (SPEC §10) baru mungkin
  // kalau nanti pindah ke host yang menjalankan Worker. Sampai itu, API tanpa CORS
  // dilayani lapisan mirror (SPEC §8 lapis 3).
  output: 'export',
  images: {
    // Pengoptimal gambar Next butuh sisi server; di ekspor statis wajib dimatikan.
    unoptimized: true,
  },
  // GitHub Pages menyajikan /alat/gempa/index.html untuk /alat/gempa.
  trailingSlash: true,
}

export default nextConfig
