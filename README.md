<div align="center">

# Pusaka

**Alat harian dari data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca —
plus katalog API lokal yang statusnya dipantau otomatis.**

[![Deploy](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml)
[![CI](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Katalog: CC BY 4.0](https://img.shields.io/badge/katalog-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%2B%20TypeScript%20%2B%20Tailwind%204-black.svg)](#struktur)
[![API terdaftar](https://img.shields.io/badge/API%20terdaftar-8-informational.svg)](./registry/apis)
[![Alat](https://img.shields.io/badge/alat-7-informational.svg)](./alat)
[![Tahap](https://img.shields.io/badge/tahap-2%20dari%207-yellow.svg)](./TASKS.md)
[![Lisensi data](https://img.shields.io/badge/data-lihat%20NOTICE-lightgrey.svg)](./NOTICE.md)

[Situs](https://pusaka.fachryxyf.com) · [Spesifikasi](./SPEC.md) · [Daftar pekerjaan](./TASKS.md) ·
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
| 8 API terdaftar | ada 8 berkas di `registry/apis/`, semuanya pernah dipanggil sungguhan dan lolos validasi skema |
| 22 API di seed | [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) memuat 22 blok YAML / 43 endpoint siap tempel |
| 151 API di backlog | inventaris upstream, bertingkat menurut kesiapan di [`BACKLOG-API.md`](./BACKLOG-API.md) |
| Snapshot riset | **6 Agustus 2026** untuk katalog awal · **20 Agustus 2026** untuk NASA/JPL, batas paginasi idn-area, dan seluruh data lisensi · **21 Agustus 2026** untuk batas permintaan myQuran, bentuk dan zona waktu prakiraan BMKG, tag HTML dan ukuran response equran.id, serta batas hasil kodepos.vercel.app |

Status hidup/mati yang sesungguhnya baru akan punya stempel waktu setelah Tahap 3
(probe otomatis tiap 6 jam + `status.json` publik). Sampai itu ada, jangan baca badge
sebagai health check.

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

Menyusul sesuai [`TASKS.md`](./TASKS.md): Berita, lalu muka developer
(katalog + playground + dashboard status).

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # memvalidasi registry lalu build
npm run tes          # tes registry + mirror (tanpa jaringan)
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
