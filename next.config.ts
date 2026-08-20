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
    // Host gambar pihak ketiga yang dipakai alat. Meski unoptimized, daftar ini
    // menahan URL dari host lain masuk ke <Image> — data API tidak kita kendalikan.
    remotePatterns: [
      // Peta guncangan gempa (UI-SPEC Alat 1).
      { protocol: 'https', hostname: 'data.bmkg.go.id', pathname: '/DataMKG/TEWS/**' },
      // Ikon cuaca yang URL-nya datang dari field .image (UI-SPEC Alat 4).
      { protocol: 'https', hostname: 'api-apps.bmkg.go.id', pathname: '/storage/icon/**' },
      // Gambar berita. Host-nya milik media masing-masing dan datang dari RSS, jadi
      // daftarnya panjang dan bisa berubah — inilah alasan remotePatterns dipakai
      // meski images.unoptimized aktif: URL dari host lain tidak boleh lolos.
      { protocol: 'https', hostname: 'akcdn.detik.net.id' },
      { protocol: 'https', hostname: 'awsimages.detik.net.id' },
      { protocol: 'https', hostname: 'cdn.antaranews.com' },
      { protocol: 'https', hostname: 'static.republika.co.id' },
      { protocol: 'https', hostname: 'img.okezone.com' },
      { protocol: 'https', hostname: 'blue.kumparan.com' },
      { protocol: 'https', hostname: 'gdb.voanews.com' },
    ],
  },
  // GitHub Pages menyajikan /alat/gempa/index.html untuk /alat/gempa.
  trailingSlash: true,
}

export default nextConfig
