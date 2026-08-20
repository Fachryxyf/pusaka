# Berkontribusi ke Pusaka

Terima kasih sudah mau bantu. Repo ini punya beberapa aturan yang tidak biasa — semuanya
lahir dari bug yang sudah benar-benar terjadi, bukan dari selera.

## Baca ini dulu

1. [`SPEC.md`](./SPEC.md) §12 "Jangan mengarang" — ini inti seluruh project.
2. [`TASKS.md`](./TASKS.md) bagian "Aturan yang berlaku untuk SEMUA task".
3. [`NOTICE.md`](./NOTICE.md) kalau perubahanmu menyentuh data atau mirror.

## Empat aturan yang tidak boleh dilanggar

1. **Jangan menebak nama field.** Ambil dari [`REFERENCE.md`](./REFERENCE.md). Kalau
   endpoint yang kamu butuhkan belum ada di sana: panggil dengan `curl`, lihat responsnya,
   catat ke `REFERENCE.md`, **baru** tulis kodenya. Urutan ini tidak boleh dibalik.
2. **Kirim User-Agent deskriptif.** BMKG membalas 403 untuk `Mozilla/5.0` telanjang.
3. **Baca body response sampai habis.** Jangan pakai batas baca — response terbesar
   341 KB, dan pembacaan terpotong bikin API sehat kelihatan rusak.
4. **Status 200 + JSON sah belum cukup.** Tiga API di katalog membalas bungkus normal
   dengan isi kosong. Karena itu tiap endpoint punya `minUkuranByte`.
5. **Hormati batas permintaan.** myQuran membalas **429 pada permintaan kedua dalam satu
   detik**, dan body-nya teks biasa — bukan JSON. Alat yang memuat beberapa bagian dari satu
   API **wajib memuatnya berurutan**, pakai argumen `aktif` pada `useApi`. Jangan serentak.

## Menambah API ke registry

- Salin blok YAML dari [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) — jangan tulis dari nol.
  Nilai `params[].contoh` **wajib berkutip** (`'1301'`, `'08'`), kalau tidak YAML
  mengubahnya jadi integer dan validasi gagal.
- Isi `provenance` sejujurnya. **`unknown` adalah jawaban yang benar** kalau penerbit tidak
  menyatakan lisensi. Jangan menuliskan lisensi yang "terdengar aman".
- `mirror: true` hanya kalau `provenance.kebijakanMirror` bisa kamu isi dengan dasar yang
  nyata. Skema akan menolaknya kalau masih `unknown`.
- **Ketersediaan bukan izin.** API yang hidup tidak otomatis boleh jadi alat di muka awam.
  API unofficial dan scraper tetap hanya di katalog developer.

## Menambah alat

- Baca bagian alat yang bersangkutan di [`UI-SPEC.md`](./UI-SPEC.md) sebelum menulis
  komponennya. Pengikatan tiap elemen UI ke jalur field sudah ditentukan di sana.
- Kelima keadaan wajib ditangani: `loading`, `error`, `kosong`, `mirror`, `normal`
  (UI-SPEC §1.1). Alat dianggap belum selesai kalau ada yang bolong.
- Alat **tidak boleh** memanggil `fetch` sendiri. Selalu lewat `useApi`.
- Jangan tampilkan nilai yang tidak ada di response asli. Lebih baik menampilkan lebih
  sedikit daripada `undefined`.

## Aturan tampilan

- **Tidak ada emoji** di kode, dokumen, maupun UI. Ikon memakai
  `komponen/Ikon.tsx` (SVG garis monokrom).
- **Tidak ada kontrol bawaan browser** yang tampilannya tidak bisa ditata: `alert()`,
  `confirm()`, `prompt()`, dan `<select>` mentah. Untuk dropdown, pakai
  `komponen/Pilih.tsx`.
- **Indikator fokus tidak boleh dihilangkan.** Boleh diganti (`.fokus-cincin`), tidak boleh
  dimatikan — itu satu-satunya petunjuk posisi bagi pengguna papan tombol.
- **Jangan tampilkan nilai turunan yang belum pasti benar.** Kalau sebuah hitungan
  bergantung pada asumsi yang tidak dijamin data (mis. zona waktu yang tidak ada di
  response), sembunyikan hitungannya dan katakan alasannya. Daftar lengkapnya di
  [`UI-SPEC.md`](./UI-SPEC.md) §1.4.
- Mobile-first. Tiap kontrol punya `<label>`; placeholder bukan label.

## Sebelum membuka pull request

```bash
npm run build          # wajib lolos tanpa error tipe; ikut memvalidasi registry
npm run lint
npm run tes            # registry + mirror, tanpa jaringan
npm run tes:jaringan   # client + rantai wilayah, butuh jaringan
```

Semuanya harus lolos. CI menjalankan hal yang sama pada tiap pull request.

Dalam deskripsi PR, tulis: apa yang berubah, bagaimana kamu memverifikasinya, dan kalau
menyentuh data API — endpoint mana yang kamu panggil sungguhan.

## Yang jangan dilakukan

- Jangan menghapus catatan riset yang "jelek". Bagian tentang API yang mati kena 402, SPA
  yang membalas HTML 200, scraper mati, dan dua sumber kode wilayah yang tidak kompatibel
  adalah bagian paling berguna dari repo ini.
- Jangan menambahkan dependency untuk sesuatu yang bisa diselesaikan beberapa baris kode.
- Jangan commit ke `xyf` langsung; buka pull request.
- Jangan menaikkan frekuensi workflow mirror/probe di bawah 6 jam. Banyak API ini dibiayai
  developernya dari kantong sendiri.

## Lisensi kontribusi

Dengan mengirimkan pull request, kamu setuju kontribusi kodemu dilisensikan MIT, dan
kontribusi pada katalog/dokumen mengikuti ketentuan di [`NOTICE.md`](./NOTICE.md).
