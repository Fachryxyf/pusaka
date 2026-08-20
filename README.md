# Pusaka

Platform alat & API lokal Indonesia. Satu registry, dua muka: alat harian untuk orang awam
(`/`) dan katalog API untuk developer (`/dev`, menyusul).

Live: **https://pusaka.fachryxyf.com**

Dokumen perencanaan: [`SPEC.md`](./SPEC.md) · [`TASKS.md`](./TASKS.md) ·
[`REFERENCE.md`](./REFERENCE.md) · [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ·
[`UI-SPEC.md`](./UI-SPEC.md) · [`BACKLOG-API.md`](./BACKLOG-API.md).

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # memvalidasi registry lalu build
npm run tes        # tes registry + mirror (tanpa jaringan)
npm run mirror     # segarkan snapshot public/mirror/ (butuh jaringan)
npx tsx scripts/tes-client.ts   # tes lib/client.ts ke API sungguhan (butuh jaringan)
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
| `scripts/` | validasi registry, tes, probe (menyusul) |

Menambah API: salin blok YAML dari [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ke
`registry/apis/<slug>.yml`. Jangan tulis dari nol — nilai `params[].contoh` wajib berkutip.
Untuk sumber di luar seed, panggil dulu dengan `curl`, catat bentuk responsnya ke
[`REFERENCE.md`](./REFERENCE.md), baru tulis kodenya.

## Hosting

Ekspor statis (`output: 'export'`) ke GitHub Pages, dipicu tiap push ke `xyf`.
Tidak ada sisi server, jadi tidak ada `/api/proxy` — API tanpa CORS seperti NASA/JPL
dilayani dari `public/mirror/`, yang disegarkan tiap 6 jam oleh workflow terpisah.
Alasan lengkapnya di [`SPEC.md`](./SPEC.md) §3.1.

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
