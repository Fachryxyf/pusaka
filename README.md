<div align="center">

# Pusaka

**Alat harian dari data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca —
plus katalog API lokal yang statusnya dipantau otomatis.**

[![Deploy](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml)
[![CI](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Katalog: CC BY 4.0](https://img.shields.io/badge/katalog-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%2B%20TypeScript%20%2B%20Tailwind%204-black.svg)](#struktur)
[![API terdaftar](https://img.shields.io/badge/API%20terdaftar-23-informational.svg)](./registry/apis)
[![Alat](https://img.shields.io/badge/alat-9-informational.svg)](./alat)
[![Tahap](https://img.shields.io/badge/tahap-5%20dari%207-yellow.svg)](./TASKS.md)
[![Lisensi data](https://img.shields.io/badge/data-lihat%20NOTICE-lightgrey.svg)](./NOTICE.md)

[Situs](https://pusaka.fachryxyf.com) · [Katalog API](https://pusaka.fachryxyf.com/dev/) ·
[Status](https://pusaka.fachryxyf.com/dev/status/) ·
[Spesifikasi](./SPEC.md) · [Daftar pekerjaan](./TASKS.md) ·
[Bentuk response API](./REFERENCE.md) · [Registry](./registry/apis) ·
[Backlog 151 API](./BACKLOG-API.md) · [Batas lisensi](./NOTICE.md) · [Kontribusi](./CONTRIBUTING.md)

</div>

---

## Kenapa ini ada

Katalog API lokal yang jadi bahan project ini punya satu lubang besar: **tidak ada field
base URL atau endpoint sama sekali**, jadi datanya tidak bisa dipanggil program. Field
`status`-nya juga manual — 150 dari 151 entry berstatus `true`, padahal 38 di antaranya
sudah mati. Pusaka menambahkan lapisan yang hilang itu: satu registry berisi endpoint yang
sungguh dipanggil, ambang ukuran response untuk menangkap scraper mati, dan snapshot mirror
supaya alatnya tetap jalan saat sumbernya tumbang.

Rinciannya di [`SPEC.md`](./SPEC.md) §2.

## Soal angka dan tanggal

Angka di badge adalah **jumlah yang terdaftar di registry**, bukan klaim bahwa semuanya
hidup saat kamu membacanya. Status API berubah terus — itu justru premis project ini
(lihat [`SPEC.md`](./SPEC.md) §2).

| Yang diklaim | Artinya |
|---|---|
| 23 API terdaftar | ada 23 berkas di `registry/apis/`, semuanya pernah dipanggil sungguhan dan lolos validasi skema |
| 55 endpoint | jumlah yang diprobe tiap 6 jam; hasil terakhir 55 sehat, 0 gagal |
| 151 API di backlog | inventaris upstream, bertingkat menurut kesiapan di [`BACKLOG-API.md`](./BACKLOG-API.md) |
| Snapshot riset | **6 Agustus 2026** untuk katalog awal · **20 Agustus 2026** untuk NASA/JPL, batas paginasi idn-area, dan seluruh data lisensi · **21 Agustus 2026** untuk batas permintaan myQuran, bentuk dan zona waktu prakiraan BMKG, tag HTML dan ukuran response equran.id, batas hasil kodepos.vercel.app, serta probe ulang seluruh 14 sumber berita |

**Status hidup/mati sekarang punya stempel waktu.** Sejak Tahap 3, seluruh 32 endpoint
diprobe tiap 6 jam langsung ke alamat aslinya, dan hasilnya terbuka:

- Dashboard: [pusaka.fachryxyf.com/dev/status](https://pusaka.fachryxyf.com/dev/status/)
- Machine-readable: [`status.json`](https://pusaka.fachryxyf.com/status.json) — riwayat
  rolling 90 hari, CORS terbuka

Badge di atas tetap menghitung jumlah **terdaftar**, bukan jumlah yang hidup saat ini.
Untuk itu, lihat dashboard.

## Alat yang sudah jalan

| Alat | Sumber | Catatan |
|---|---|---|
| [Info Gempa](https://pusaka.fachryxyf.com/alat/gempa/) | BMKG | gempa terkini, dirasakan, dan M≥5,0 + peta shakemap |
| [Objek Dekat Bumi](https://pusaka.fachryxyf.com/alat/objek-dekat-bumi/) | NASA/JPL SSD-CNEOS | pendekatan 60 hari, bola api atmosfer, objek yang dipantau Sentry |
| [Data Wilayah](https://pusaka.fachryxyf.com/alat/wilayah/) | idn-area | provinsi sampai desa, kode Kemendagri bertitik yang cocok dengan BMKG |
| [Jadwal Sholat](https://pusaka.fachryxyf.com/alat/sholat/) | myQuran | 518 kota, penanda waktu berikutnya (hanya kalau kota sezona dengan pembaca) |
| [Prakiraan Cuaca](https://pusaka.fachryxyf.com/alat/cuaca/) | BMKG + idn-area | per tiga jam sampai tingkat desa, jam mengikuti zona lokasinya |
| [Al-Qur'an](https://pusaka.fachryxyf.com/alat/quran/) | equran.id | 114 surat, Arab + transliterasi + terjemahan, murottal 6 qari |
| [Kode Pos](https://pusaka.fachryxyf.com/alat/kodepos/) | sooluh | cari dari nama wilayah, atau deteksi dari lokasi perangkat |
| [Berita](https://pusaka.fachryxyf.com/alat/berita/) | berita-indo-api | 9 media nasional, waktu terbit di zona pembaca, peringatan sumber basi |
| [Harga Emas](https://pusaka.fachryxyf.com/alat/harga-emas/) | logam-mulia-api | 18 sumber, dibandingkan per gram, buyback kosong tidak ditulis nol |

**Tahap 2, 3, dan 4 tuntas.** Menyusul sesuai [`TASKS.md`](./TASKS.md): lapisan proxy —
yang menunggu pindah hosting — lalu sinkronisasi upstream dan riset 41 API di tier C.

## Untuk developer

Katalog aslinya tidak punya field base URL maupun endpoint sama sekali, jadi datanya tidak
bisa dipanggil program. Lapisan itu yang ditambahkan di sini:

| Halaman | Isinya |
|---|---|
| [`/dev`](https://pusaka.fachryxyf.com/dev/) | katalog dengan pencarian + filter kategori, autentikasi, dan status |
| [`/dev/api/<slug>`](https://pusaka.fachryxyf.com/dev/api/gempa-bmkg/) | dokumentasi tergenerate dari registry, hak pakai data, dan playground per endpoint |
| [`/dev/status`](https://pusaka.fachryxyf.com/dev/status/) | uptime 30 hari, latency, riwayat per endpoint |
| [`/status.json`](https://pusaka.fachryxyf.com/status.json) | riwayat probe 90 hari, CORS terbuka |

Playground memakai `lib/client.ts` yang sama dengan alat — tidak ada jalur fetch kedua di
project ini. Untuk API tanpa CORS, tombol Kirim dinonaktifkan dengan alasan yang disebutkan,
dan salinan `curl` disediakan sebagai jalan keluarnya.

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # memvalidasi registry lalu build
npm run tes          # tes registry, mirror, teks, status (tanpa jaringan)
npm run probe        # health check semua endpoint, tulis public/status.json
npm run tes:jaringan # tes client + rantai wilayah ke API sungguhan
npm run mirror       # segarkan snapshot public/mirror/
```

## Struktur

| Jalur | Isinya |
|---|---|
| `registry/apis/*.yml` | sumber kebenaran tiap API — base URL, endpoint, ambang ukuran |
| `registry/schema.ts` | skema zod |
| `lib/registry.ts` | loader + validator YAML (Node, pakai `fs`) |
| `lib/client.ts` | pengambil data lapis 1 (langsung) + lapis 3 (mirror) |
| `public/mirror/*.json` | snapshot API `mirror: true` — satu-satunya jalan bagi API tanpa CORS |
| `lib/useApi.ts` | hook yang dipakai semua alat — alat tidak memanggil `fetch` sendiri |
| `komponen/` | `Pilih` (dropdown), `PemilihWilayah`, `PemutarAudio`, `TeksBertag`, `Ikon`, keadaan |
| `alat/<slug>/` | modul alat muka awam |
| `scripts/mirror.ts` | menulis snapshot, menolak yang di bawah `minUkuranByte` |
| `lib/probe.ts` | mesin health check — enam mode kematian, bisa diuji tanpa berkas |
| `public/status.json` | riwayat probe 90 hari; ini juga **penyimpanannya**, lihat `SPEC.md` §9 |
| `scripts/` | validasi registry, tes, probe (menyusul) |

Menambah API: salin blok YAML dari [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ke
`registry/apis/<slug>.yml`. Jangan tulis dari nol — nilai `params[].contoh` wajib berkutip.
Untuk sumber di luar seed, panggil dulu dengan `curl`, catat bentuk responsnya ke
[`REFERENCE.md`](./REFERENCE.md), baru tulis kodenya.

## Hosting

Ekspor statis (`output: 'export'`) ke GitHub Pages di `pusaka.fachryxyf.com`, dipicu tiap
push ke `xyf` dan tiap 6 jam. Tidak ada sisi server, jadi tidak ada `/api/proxy` — API tanpa
CORS seperti NASA/JPL dilayani dari `public/mirror/`, yang disegarkan **saat deploy** dan
ikut masuk artefak. Tidak ada workflow yang punya izin tulis ke repo. Snapshot yang
ter-commit adalah benih untuk pengembangan lokal, bukan yang dilayani produksi.
Alasan lengkapnya di [`SPEC.md`](./SPEC.md) §3.1.

## Keamanan & kontribusi

- Kerentanan: **jangan buka issue publik** — lihat [`SECURITY.md`](./SECURITY.md).
- Mau ikut ngerjain: [`CONTRIBUTING.md`](./CONTRIBUTING.md), dan baca
  [`SPEC.md`](./SPEC.md) §12 dulu.
- CI menjalankan lint, tes registry, dan build pada tiap pull request. Tes yang
  memanggil API pihak ketiga dipisah supaya BMKG yang sedang mati tidak membuat
  seluruh CI merah.

## Aturan yang tidak boleh dilanggar

Empat aturan ini lahir dari jebakan yang sudah menelan korban waktu riset:

1. **Jangan tebak nama field.** Ambil dari [`REFERENCE.md`](./REFERENCE.md). BMKG memakai
   `Infogempa.gempa.Magnitude`, bukan `data.magnitude`.
2. **Kirim User-Agent deskriptif.** BMKG membalas **403** untuk `Mozilla/5.0` telanjang.
3. **Baca body sampai habis.** Response terbesar 341 KB; pembacaan terpotong bikin API
   sehat kelihatan rusak.
4. **Status 200 + JSON sah belum cukup.** Tiga API di katalog membalas bungkus normal
   dengan isi kosong. Itu sebabnya tiap endpoint punya `minUkuranByte`.

## Kontributor

<a href="https://github.com/Fachryxyf/pusaka/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Fachryxyf/pusaka" alt="Kontributor Pusaka" />
</a>

Mau ikut? Baca [`CONTRIBUTING.md`](./CONTRIBUTING.md) dulu — repo ini punya beberapa aturan
yang tidak biasa, dan semuanya lahir dari bug yang sudah benar-benar terjadi.

Cara berkontribusi yang paling berguna, dari yang paling mudah:

| Kontribusi | Yang perlu dilakukan |
|---|---|
| Lapor API yang mati atau berubah | buka [issue "API mati"](https://github.com/Fachryxyf/pusaka/issues/new?template=api-mati.md) dengan hasil `curl` dan tanggalnya |
| Tambah API baru ke registry | panggil endpointnya, catat bentuk responsnya ke [`REFERENCE.md`](./REFERENCE.md), **baru** tulis YAML-nya |
| Riset API yang belum terverifikasi | 39 kandidat menunggu di [`BACKLOG-API.md`](./BACKLOG-API.md) tier C |
| Buat alat baru | baca bagian alatnya di [`UI-SPEC.md`](./UI-SPEC.md), lalu ikuti pola di `alat/` |
| Perbaiki lisensi yang `unknown` | kalau kamu menemukan pernyataan lisensi sebuah API, perbarui `provenance` di registry-nya |

Yang terakhir itu bernilai lebih dari yang terlihat: **12 dari 23 API masih `unknown`**, dan
tiap satu yang terjawab membuat lebih banyak data boleh di-mirror — artinya lebih banyak alat
yang tetap jalan saat sumbernya mati.

## Lisensi

Repo ini memuat empat jenis bahan dengan status hukum yang berbeda, dan MIT **tidak**
berlaku untuk semuanya:

| Bahan | Status |
|---|---|
| Kode (`app/`, `alat/`, `lib/`, `komponen/`, `scripts/`) | [MIT](./LICENSE) |
| Katalog turunan (`BACKLOG-API.md`, `REGISTRY-SEED.md`, `registry/apis/`) | CC BY 4.0, atribusi ke farizdotid |
| Snapshot (`public/mirror/`) | milik penerbit aslinya, **tidak** dilisensikan ulang |
| Data saat alat dijalankan | milik penerbit aslinya |

Rinciannya, termasuk dasar hak salin tiap mirror, ada di [`NOTICE.md`](./NOTICE.md).
Tiap API di registry punya field `provenance` yang mencatat lisensi, atribusi yang
diwajibkan, dan tanggal pemeriksaannya. Kalau penerbit tidak menyatakan lisensi, isinya
`unknown` — bukan tebakan.

## Atribusi

Katalog API diturunkan dari
[DAFTAR-API-LOKAL-INDONESIA](https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA)
oleh farizdotid, dipakai di bawah lisensi
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Data tiap alat milik penerbit aslinya masing-masing:

- BMKG — gempa & prakiraan cuaca
- NASA/JPL Solar System Dynamics (SSD-CNEOS) — objek dekat Bumi
- myQuran, equran.id — jadwal sholat & Al-Qur'an
- emsifa — data wilayah Indonesia
