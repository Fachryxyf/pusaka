<div align="center">

# Pusaka

**Alat harian dari data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca —
plus katalog API lokal yang statusnya dipantau otomatis.**

[![Deploy](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml)
[![Mirror](https://github.com/Fachryxyf/pusaka/actions/workflows/mirror.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/mirror.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%2B%20TypeScript%20%2B%20Tailwind%204-black.svg)](#struktur)
[![API terverifikasi](https://img.shields.io/badge/API%20terverifikasi-7-success.svg)](./registry/apis)
[![Alat](https://img.shields.io/badge/alat-3-success.svg)](./alat)
[![Tahap](https://img.shields.io/badge/tahap-2%20dari%207-yellow.svg)](./TASKS.md)

[Situs](https://pusaka.fachryxyf.com) · [Spesifikasi](./SPEC.md) · [Daftar pekerjaan](./TASKS.md) ·
[Bentuk response API](./REFERENCE.md) · [Registry](./registry/apis) · [Backlog 151 API](./BACKLOG-API.md)

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

## Alat yang sudah jalan

| Alat | Sumber | Catatan |
|---|---|---|
| [Info Gempa](https://pusaka.fachryxyf.com/alat/gempa/) | BMKG | gempa terkini, dirasakan, dan M≥5,0 + peta shakemap |
| [Objek Dekat Bumi](https://pusaka.fachryxyf.com/alat/objek-dekat-bumi/) | NASA/JPL SSD-CNEOS | pendekatan 60 hari, bola api atmosfer, objek yang dipantau Sentry |
| [Data Wilayah](https://pusaka.fachryxyf.com/alat/wilayah/) | idn-area | provinsi sampai desa, kode Kemendagri bertitik yang cocok dengan BMKG |

Menyusul sesuai [`TASKS.md`](./TASKS.md): Jadwal Sholat, Prakiraan Cuaca,
Al-Qur'an, Kode Pos, Berita, lalu muka developer (katalog + playground + dashboard status).

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
| `alat/<slug>/` | modul alat muka awam |
| `scripts/mirror.ts` | menulis snapshot, menolak yang di bawah `minUkuranByte` |
| `scripts/` | validasi registry, tes, probe (menyusul) |

Menambah API: salin blok YAML dari [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ke
`registry/apis/<slug>.yml`. Jangan tulis dari nol — nilai `params[].contoh` wajib berkutip.
Untuk sumber di luar seed, panggil dulu dengan `curl`, catat bentuk responsnya ke
[`REFERENCE.md`](./REFERENCE.md), baru tulis kodenya.

## Hosting

Ekspor statis (`output: 'export'`) ke GitHub Pages di `pusaka.fachryxyf.com`, dipicu tiap
push ke `xyf`. Tidak ada sisi server, jadi tidak ada `/api/proxy` — API tanpa CORS seperti
NASA/JPL dilayani dari `public/mirror/`, yang disegarkan tiap 6 jam oleh workflow terpisah.
Alasan lengkapnya di [`SPEC.md`](./SPEC.md) §3.1.

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

Kode di repo ini: [MIT](./LICENSE).

Katalog API (`registry/apis/*.yml` dan dokumen riset) diturunkan dari karya ber-lisensi
CC BY 4.0 — lihat Atribusi di bawah. Data yang diambil saat alat dijalankan tetap milik
penerbit aslinya dan tidak dilisensikan ulang oleh repo ini.

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
