# Kebijakan Keamanan

## Melaporkan kerentanan

**Jangan buka issue publik untuk kerentanan keamanan.**

Pakai [Private vulnerability reporting](https://github.com/Fachryxyf/pusaka/security/advisories/new)
di tab Security repo ini. Laporan lewat jalur itu hanya terlihat oleh pemilik repo sampai
perbaikannya siap.

Sertakan kalau bisa: langkah reproduksi, dampak yang kamu perkirakan, dan versi/commit yang
kamu uji. Tidak perlu proof-of-concept yang merusak.

Saya mengerjakan ini sendiri di waktu luang, jadi tidak ada janji SLA. Yang bisa saya
janjikan: laporan akan dibaca, dan kalau valid akan diperbaiki atau dicatat terbuka
sebagai keterbatasan yang diketahui.

## Cakupan

Situs ini adalah **ekspor statis tanpa sisi server** — tidak ada basis data, tidak ada
sesi, tidak ada akun, dan tidak ada rahasia yang dikirim ke browser. Konsekuensinya,
seluruh permukaan serangan yang biasa (SQL injection, authentication bypass, IDOR) tidak
berlaku di sini.

Yang **masuk cakupan**:

- XSS lewat data pihak ketiga. Response API tidak kami kendalikan; kalau ada jalan
  menjadikannya kode yang dieksekusi, itu bug. Perhatian khusus pada field ber-HTML
  seperti `deskripsi` di equran.id.
- Kebocoran rahasia di repo, artefak build, atau log workflow.
- Rantai pasok: dependency berbahaya, action yang tidak dipatok, atau workflow yang bisa
  dibajak lewat pull request.
- Pembajakan alur deploy sehingga isi `pusaka.fachryxyf.com` bisa diubah pihak lain.
- SSRF **kalau** proxy (SPEC §10) suatu saat diaktifkan. Saat ini proxy belum ada.

Yang **di luar cakupan**:

- Kerentanan di API pihak ketiga yang kami panggil. Laporkan ke penerbitnya masing-masing;
  kami senang tahu, tapi tidak bisa memperbaikinya.
- Ketiadaan security header yang butuh sisi server (CSP dengan nonce, HSTS preload).
  GitHub Pages tidak mengizinkan header kustom — ini keterbatasan yang diketahui, bukan
  temuan.
- Rate limiting. Tidak ada endpoint milik kami yang bisa dihabiskan.
- Laporan otomatis dari scanner tanpa dampak nyata yang dijelaskan.

## Yang sudah diberlakukan

- Tidak ada rahasia di repo. Tidak ada kunci API yang dibutuhkan — ketujuh API di registry
  berstatus `auth: none`.
- Workflow memakai izin serendah mungkin, dan token bawaan tidak dititipkan ke checkout
  yang tidak membutuhkannya.
- `lib/client.ts` menolak response yang `Content-Type`-nya bukan JSON, jadi HTML dari
  sumber yang membalas asal tidak pernah sampai ke parser.
- Alat tidak memakai `dangerouslySetInnerHTML`. Kalau nanti dibutuhkan untuk field
  ber-HTML, sanitasinya wajib lebih dulu (`UI-SPEC.md` §1.3).
- Dependency dipatok ke versi tepat, dan Dependabot mengawasi pembaruannya.
