# Pusaka

Platform alat & API lokal Indonesia. Satu registry, dua muka: alat harian untuk orang awam
(`/`) dan katalog API untuk developer (`/dev`, menyusul).

Dokumen perencanaan: [`SPEC.md`](./SPEC.md) · [`TASKS.md`](./TASKS.md) ·
[`REFERENCE.md`](./REFERENCE.md) · [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ·
[`UI-SPEC.md`](./UI-SPEC.md) · [`BACKLOG-API.md`](./BACKLOG-API.md).

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # memvalidasi registry lalu build
npm run tes        # tes registry (tanpa jaringan)
npx tsx scripts/tes-client.ts   # tes lib/client.ts ke API sungguhan (butuh jaringan)
```

## Struktur

| Jalur | Isinya |
|---|---|
| `registry/apis/*.yml` | sumber kebenaran tiap API — base URL, endpoint, ambang ukuran |
| `registry/schema.ts` | skema zod |
| `lib/registry.ts` | loader + validator YAML (Node, pakai `fs`) |
| `lib/client.ts` | pengambil data lapis 1 (langsung); proxy & mirror menyusul |
| `lib/useApi.ts` | hook yang dipakai semua alat — alat tidak memanggil `fetch` sendiri |
| `alat/<slug>/` | modul alat muka awam |
| `scripts/` | validasi registry, tes, probe (menyusul) |

Menambah API: salin blok YAML dari [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) ke
`registry/apis/<slug>.yml`. Jangan tulis dari nol — nilai `params[].contoh` wajib berkutip.

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

Data tiap alat milik penerbit aslinya masing-masing (BMKG, myQuran, equran.id, emsifa).
