# SPEC — Pusaka: Platform Alat & API Lokal Indonesia

> Dokumen ini adalah **sumber kebenaran teknis**. Baca sampai habis sebelum nulis kode.
> Daftar pekerjaan ada di [`TASKS.md`](./TASKS.md).
>
> Nama project: **Pusaka** — warisan yang dijaga turun-temurun. Dipilih karena inti platform ini
> memang pelestarian: menyelamatkan data publik Indonesia sebelum sumbernya mati (lihat §2 dan §8).
> Nama paket npm: `pusaka` / scope `@pusaka` (sudah dicek kosong di npm per 2026-08-06).

---

## 1. Ringkasan

Satu platform Next.js dengan **dua muka di atas satu katalog**:

- **Muka awam** (`/`) — alat-alat harian buat orang Indonesia biasa. Ga perlu ngerti API.
- **Muka developer** (`/dev`) — katalog API, dokumentasi tergenerate, playground, dashboard status.

Bahannya: [DAFTAR-API-LOKAL-INDONESIA](https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA)
milik farizdotid — 151 API, 20 kategori, lisensi **CC-BY-4.0**.

---

## 2. Kenapa project ini ada

Repo upstream bagus sebagai **daftar bacaan**, tapi punya empat lubang yang sudah diverifikasi:

| # | Lubang | Bukti |
|---|---|---|
| 1 | Field `status` manual, ga pernah diupdate | 150 dari 151 entry berstatus `true` |
| 2 | `check.ts` upstream cuma ping **halaman dokumentasi**, bukan API-nya | 76 dari 151 entry (50%) dokumentasinya nunjuk ke `github.com`, yang selalu balas 200 |
| 3 | **Ga ada field base URL / endpoint sama sekali** | Skema upstream cuma `apiName, status, documentationUrl, developer, description, authentication` |
| 4 | Banyak yang sudah mati | 22 dari 50 repo tersampel (44%) tanpa commit >2 tahun |

**Lubang no. 3 adalah alasan utama project ini ada.** Dataset upstream tidak bisa dipanggil
program. Kita menambahkan lapisan itu.

### Pola kematian API lokal Indonesia

Ini hasil probe langsung, dan ini yang membentuk seluruh desain:

| Penyebab | Bukti |
|---|---|
| **Tagihan hosting jebol**, bukan kode rusak | `dayoffapi.vercel.app` → **402 Payment Required**<br>`api-berita-indonesia.vercel.app` → **402 Payment Required** |
| Domain/server hilang | `alamat.thecloudalert.com` → connection failed |
| **SPA balas 200 buat path apa pun** (mati tapi keliatan hidup) | `bukuacak.vercel.app/api/v1/book` → 200 tapi `Content-Type: text/html` |
| Data kosong tapi tetap 200 | `ibnux.github.io/BMKG-importer/cuaca/501195.json` → `[]` |
| Paling awet: statis + domain pemerintah | `data.bmkg.go.id`, `api.bmkg.go.id` → 200, JSON, CORS `*` |

**Konsekuensi desain langsung:**
- Kita **tidak** deploy di Vercel (lihat §3).
- Probe **wajib** memvalidasi `Content-Type` + isi, bukan cuma status code (lihat §9).
- Wajib ada lapisan **mirror** supaya alat tetap jalan saat sumbernya mati (lihat §8).

---

## 3. Keputusan yang sudah dikunci

| Hal | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Pilihan pemilik project |
| Styling | **Tailwind CSS** | — |
| Hosting | **GitHub Pages** (ekspor statis) di `pusaka.fachryxyf.com` | Diubah dari Cloudflare Pages pada 2026-08-20 — lihat §3.1. Alasan intinya sama: dua API di daftar ini mati kena **402** di Vercel, jadi hosting project ini harus **gagal tertutup**, bukan menagih. GitHub Pages tidak punya kuota yang bisa membengkak jadi tagihan. |
| Pengguna | **Dua-duanya** (awam + developer) | Satu registry, dua muka |
| Tempo | Tanpa tenggat, bertahap | Tiap tahap harus menghasilkan sesuatu yang kepake |
| Posisi | Standalone + atribusi CC-BY-4.0 | Bukan fork, bukan pesaing |
| Bahasa UI | **Bahasa Indonesia** | i18n EN nyusul, bukan sekarang |

---

### 3.1 Konsekuensi ekspor statis — dibaca sebelum menyentuh `lib/client.ts`

GitHub Pages hanya menyajikan berkas. **Tidak ada sisi server**, jadi:

| Yang hilang | Gantinya |
|---|---|
| `app/api/proxy/route.ts` (§10) | Tidak ada. API `cors: none`/`locked` dilayani **lapis 3 mirror** (§8) |
| `app/api/status/route.ts` (§9) | Ditulis sebagai berkas statis ke `public/status.json` oleh workflow, bukan route handler |
| Pengoptimal gambar Next | `images.unoptimized: true` di `next.config.ts` |

Karena itu `next.config.ts` memakai `output: 'export'` dan `trailingSlash: true`
(Pages menyajikan `/alat/gempa/index.html` untuk `/alat/gempa`).

**Mirror pindah ke `public/mirror/<slug>.json`, bukan `data/mirror/` seperti §4.**
Alasannya: di ekspor statis hanya isi `public/` yang bisa diambil browser, dan lapis 3
dijalankan di browser. `data/health/` tetap di tempatnya karena hanya dibaca saat build.

Kalau suatu saat proxy sungguh dibutuhkan (misalnya untuk API `cors: none` yang
berparameter, yang tidak bisa di-mirror), pilihan hostingnya kembali ke Cloudflare
Pages + Workers dan §10 berlaku lagi apa adanya. Sampai itu terjadi, **jangan menulis
route handler** — ia akan gagal senyap di produksi karena tidak ikut terekspor.

---

## 4. Struktur folder

```
somethinggood/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # muka awam — grid alat + pencarian
│   ├── alat/[slug]/page.tsx        # halaman tiap alat
│   ├── dev/
│   │   ├── page.tsx                # katalog API: cari + filter
│   │   ├── api/[slug]/page.tsx     # dokumentasi + playground
│   │   └── status/page.tsx         # dashboard uptime
│   └── api/
│       ├── proxy/route.ts          # CORS proxy (allowlist!)
│       └── status/route.ts         # status.json publik
│
├── registry/
│   ├── schema.ts                   # skema zod + tipe TS
│   └── apis/<slug>.yml             # SUMBER KEBENARAN, satu file per API
│
├── alat/                           # modul alat awam
│   └── <slug>/index.tsx            # satu folder satu alat
│
├── lib/
│   ├── registry.ts                 # loader + validator YAML
│   ├── client.ts                   # fetch 3 lapis (langsung → proxy → mirror)
│   └── useApi.ts                   # hook React dipakai semua alat
│
├── scripts/
│   ├── probe.ts                    # health check endpoint asli
│   ├── mirror.ts                   # snapshot data statis
│   └── sync-upstream.ts            # tarik & diff data farizdotid
│
├── data/
│   ├── health/<slug>.json          # riwayat uptime, rolling 90 hari
│   └── mirror/<slug>.json          # snapshot data
│
└── .github/workflows/
    ├── probe.yml                   # tiap 6 jam
    ├── mirror.yml                  # mingguan
    └── sync.yml                    # mingguan
```

**Aturan emas:** nambah API = nambah **1 file YAML**. Nambah alat = nambah **1 folder** di `alat/`.
Kalau nambah fitur butuh ngubah lebih dari itu, arsitekturnya salah — berhenti dan pikir ulang.

---

## 5. Kontrak data — `registry/schema.ts`

```ts
import { z } from 'zod'

export const ParamSchema = z.object({
  nama: z.string(),
  contoh: z.string(),
  wajib: z.boolean().default(false),
  keterangan: z.string().optional(),
})

export const EndpointSchema = z.object({
  id: z.string(),                                   // unik dalam satu API
  method: z.enum(['GET', 'POST']).default('GET'),
  path: z.string(),                                 // relatif ke baseUrl, boleh punya {placeholder}
  deskripsi: z.string(),
  params: z.array(ParamSchema).default([]),
  headers: z.record(z.string()).default({}),        // header wajib selain User-Agent
  contohPath: z.string(),                           // path lengkap siap panggil, WAJIB — dipakai probe
  minUkuranByte: z.number().int().positive(),       // ambang bawah; di bawah ini = scraper mati
  contohResponse: z.unknown().optional(),           // dipotong, buat docs
})

export const ApiSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nama: z.string(),
  kategori: z.string(),
  deskripsi: z.string(),
  developer: z.object({ nama: z.string(), profil: z.string().url().nullable() }),
  dokumentasi: z.string().url(),
  upstreamName: z.string().nullable(),              // buat pemetaan balik ke data farizdotid
  auth: z.enum(['none', 'apikey', 'oauth']),
  cors: z.enum(['open', 'locked', 'none', 'unknown']).default('unknown'),
  baseUrl: z.string().url(),
  mirror: z.boolean().default(false),
  endpoints: z.array(EndpointSchema).min(1),
})

export type Api = z.infer<typeof ApiSchema>
export type Endpoint = z.infer<typeof EndpointSchema>
```

**`contohPath` itu wajib dan penting.** Itu yang dipanggil `probe.ts`. Tanpa itu, probe ga tahu
harus manggil apa, dan kita balik jadi seburuk `check.ts` upstream.

Bedanya dengan `path`: `path` boleh punya `{placeholder}`, `contohPath` harus siap dipanggil
apa adanya. Tiap `{placeholder}` di `path` **wajib** punya entry `params` bernama sama.

**Kenapa ada `headers`:** sebagian API menolak permintaan tanpa header tertentu, dan
gejalanya menyesatkan. `dua-dhikr.vercel.app/categories` membalas **400 Bad Request**
tanpa `Accept-Language: id` — bukan 404, jadi kelihatan seperti endpoint yang rusak
padahal cuma kurang header. `lib/client.ts` dan `scripts/probe.ts` **wajib** mengirim
`headers` dari registry, digabung dengan User-Agent bawaan.

> **Jangan menulis YAML dari nol.** 18 API / 29 endpoint sudah tersedia lengkap dan
> tervalidasi di [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) — tinggal salin.
> Catatan penting: nilai `params[].contoh` **wajib string berkutip** (`'1301'`, `'08'`),
> karena tanpa kutip YAML mengubahnya jadi integer dan validasi zod gagal.

### Contoh YAML lengkap

```yaml
# registry/apis/gempa-bmkg.yml
slug: gempa-bmkg
nama: Info Gempa BMKG
kategori: cuaca
deskripsi: Data gempa bumi terkini, terbaru, dan yang dirasakan, langsung dari BMKG.
developer:
  nama: BMKG
  profil: https://bmkg.go.id
dokumentasi: https://data.bmkg.go.id/gempabumi/
upstreamName: Data BMKG
auth: none
cors: open
baseUrl: https://data.bmkg.go.id
mirror: false
endpoints:
  - id: autogempa
    method: GET
    path: /DataMKG/TEWS/autogempa.json
    deskripsi: Gempa bumi terkini (satu kejadian terakhir).
    params: []
    contohPath: /DataMKG/TEWS/autogempa.json
  - id: terkini
    method: GET
    path: /DataMKG/TEWS/gempaterkini.json
    deskripsi: 15 gempa bumi M >= 5.0 terakhir.
    params: []
    contohPath: /DataMKG/TEWS/gempaterkini.json
  - id: dirasakan
    method: GET
    path: /DataMKG/TEWS/gempadirasakan.json
    deskripsi: 15 gempa bumi terakhir yang dirasakan masyarakat.
    params: []
    contohPath: /DataMKG/TEWS/gempadirasakan.json
```

---

## 6. Sumber data TERVERIFIKASI

Semua di bawah ini sudah dites tanggal **2026-08-06**: status 200, `Content-Type` JSON,
isi benar, dan header `Access-Control-Allow-Origin: *`. **Boleh langsung dipakai tanpa riset ulang.**

### 6.1 Gempa — BMKG
`baseUrl: https://data.bmkg.go.id`

| Endpoint | Path |
|---|---|
| autogempa | `/DataMKG/TEWS/autogempa.json` |
| terkini | `/DataMKG/TEWS/gempaterkini.json` |
| dirasakan | `/DataMKG/TEWS/gempadirasakan.json` |

```json
{"Infogempa":{"gempa":{"Tanggal":"06 Agu 2026","Jam":"09:59:47 WIB",
"DateTime":"2026-08-06T02:59:47+00:00","Coordinates":"-1.17,120.06",
"Lintang":"1.17 LS","Bujur":"120.06 BT","Magnitude":"4.1","Kedalaman":"10 km",
"Wilayah":"Pusat gempa berada di darat 32 km Timur Laut Sigi",
"Potensi":"Gempa ini dirasakan untuk diteruskan pada masyarakat",
"Dirasakan":"III Sigi","Shakemap":"20260806095947.mmi.jpg"}}}
```
Catatan: `autogempa` isinya **objek**, `terkini`/`dirasakan` isinya **array**. Beda bentuk — hati-hati saat parsing.
Shakemap jadi gambar di `https://data.bmkg.go.id/DataMKG/TEWS/{Shakemap}`.

### 6.2 Wilayah Indonesia — emsifa
`baseUrl: https://www.emsifa.com/api-wilayah-indonesia/api`

| Endpoint | Path |
|---|---|
| provinsi | `/provinces.json` |
| kabupaten | `/regencies/{provinceId}.json` |
| kecamatan | `/districts/{regencyId}.json` |
| kelurahan | `/villages/{districtId}.json` |

```json
[{"id":"11","name":"ACEH"},{"id":"32","name":"JAWA BARAT"}]
[{"id":"3201","province_id":"32","name":"KABUPATEN BOGOR"}]
```
Statis → **set `mirror: true`**. Ini kandidat mirror paling penting: datanya ga berubah dan
dipakai alat lain sebagai fondasi.

### 6.3 Jadwal Sholat — myQuran v2
`baseUrl: https://api.myquran.com/v2`

| Endpoint | Path |
|---|---|
| daftarKota | `/sholat/kota/semua` |
| jadwal | `/sholat/jadwal/{kotaId}/{tahun}/{bulan}/{tanggal}` |

```json
{"status":true,"request":{"path":"/sholat/jadwal/1301/2026/08/06"},
"data":{"id":1301,"lokasi":"KOTA JAKARTA","daerah":"DKI JAKARTA",
"jadwal":{"tanggal":"Kamis, 06/08/2026","imsak":"04:35","subuh":"04:45",
"terbit":"05:59","dhuha":"06:28","dzuhur":"12:02","ashar":"..."}}}
```
`bulan`/`tanggal` pakai **dua digit** (`08`, bukan `8`). Daftar kota statis → `mirror: true`.

### 6.4 Al-Qur'an — equran.id v2
`baseUrl: https://equran.id/api/v2`

| Endpoint | Path |
|---|---|
| daftarSurat | `/surat` |
| detailSurat | `/surat/{nomor}` |

```json
{"code":200,"message":"Data retrieved successfully",
"data":[{"nomor":1,"nama":"الفاتحة","namaLatin":"Al-Fatihah","jumlahAyat":7,
"tempatTurun":"Mekah","arti":"Pembukaan","deskripsi":"..."}]}
```
Alternatif setara: `https://api.myquran.com/v2/quran/surat/{n}` (juga terverifikasi hidup,
punya `audio_url`). Boleh didaftarkan sebagai API kedua.

### 6.5 Prakiraan Cuaca — BMKG resmi
`baseUrl: https://api.bmkg.go.id`

| Endpoint | Path |
|---|---|
| prakiraan | `/publik/prakiraan-cuaca?adm4={kodeDesa}` |

```json
{"lokasi":{"adm1":"32","adm2":"32.04","adm3":"32.04.15","adm4":"32.04.15.2003",
"provinsi":"Jawa Barat","kotkab":"Bandung","kecamatan":"Pangalengan",
"desa":"Warnasari","lon":107.516107484,"lat":-7.1907847687,
"timezone":"Asia/Jakarta"},"data":[...]}
```
### ⚠️ KOREKSI PENTING — sumber wilayah untuk alat Cuaca

`adm4` adalah kode Kemendagri **terkini**. Sempat diasumsikan bisa dikonversi dari kode
emsifa (§6.2) dengan menyisipkan titik. **Asumsi itu salah dan sudah diuji:**

| | idn-area | emsifa |
|---|---|---|
| Pangalengan | `32.04.15` | `3204040` |
| Warnasari | `32.04.15.2003` | `3204040005` |

Angkanya memang berbeda, bukan sekadar beda format. `3204040005` → `32.04.04.0005`
dijawab BMKG dengan **404 Data not found**.

**Sumber wilayah yang benar untuk Cuaca: `wilayah-idn-area`**
(`https://idn-area.up.railway.app`, CORS `*`, kode Kemendagri bertitik, cocok persis
dengan BMKG di keempat tingkat). Bentuk lengkapnya ada di `REFERENCE.md`.

Konsekuensinya: **tidak ada fungsi konversi kode wilayah di project ini.** Kode dipakai
apa adanya. Kalau kamu menemukan diri sedang menulis `keBertitik()` atau sejenisnya,
berhenti — kamu sedang memakai sumber yang salah.

Catatan ketahanan: idn-area di-hosting di `railway.app`, yang punya profil risiko tagihan
seperti Vercel. Karena itu ia diberi `mirror: true` — persis alasan lapisan mirror ada (§8).

---

### 6.6 Sebelas sumber terverifikasi lainnya

Riset lanjutan menemukan 11 API lagi yang terbukti mengeluarkan data JSON asli. Semuanya
sudah tercatat lengkap dengan base URL, path, dan status CORS di **`BACKLOG-API.md` tier A**
— jadi tidak diulang di sini. Sorotan yang paling berguna:

| Sumber | Kenapa penting |
|---|---|
| `kodepos.vercel.app` | **Kode pos terbaik.** CORS `*`, punya `/search/?q=` dan `/detect/?latitude=&longitude=`. Jauh lebih baik dari `nbc.vanmason.web.id` yang tanpa CORS |
| `logam-mulia-api.iamutaki.workers.dev` | Harga emas. Hosting di **Cloudflare Workers** → kecil kemungkinan mati kena tagihan, beda dari yang di Vercel |
| `quran-api-id.vercel.app` | Al-Qur'an lengkap, CORS `*`. Catatan: `/juz/{n}` rusak, `/surah` dan `/surah/{n}` sehat |
| `kotonogi-api.vercel.app` | Hiragana/Katakana, CORS `*`, datanya besar dan lengkap |
| `api-sekolah-indonesia.vercel.app` | Data sekolah se-Indonesia, CORS `*` |

Pengerjaannya sudah dipecah jadi task di `TASKS.md` **T7.4**.

---

### 6.7 Objek Dekat Bumi — NASA/JPL SSD-CNEOS

`baseUrl: https://ssd-api.jpl.nasa.gov` · ditangkap **2026-08-20** · tanpa kunci API

| Endpoint | Path |
|---|---|
| pendekatan | `/cad.api?body=Earth&date-min=now&date-max=%2B60&dist-max=0.05&sort=date&fullname=true` |
| bolaApi | `/fireball.api?limit=20&sort=-date` |
| risiko | `/sentry.api?ps-min=-3` |
| objek | `/sbdb.api?sstr={sstr}&phys-par=true` |

Satu-satunya sumber non-Indonesia di katalog, dimasukkan karena datanya global dan
lembaganya jauh lebih awet dari mana pun di daftar ini — persis lawan dari pola kematian di §2.

⚠️ **`cors: none`.** Sudah diuji dua kali, termasuk dengan header `Origin` disertakan:
balasannya tanpa `Access-Control-Allow-Origin` dan tanpa `Vary`. Jadi browser tidak bisa
memanggilnya langsung, dan alatnya **bergantung pada mirror** (§8 lapis 3) — bukan pada
proxy, yang tidak ada di ekspor statis (§3.1).

⚠️ **`cad` dan `fireball` bukan array objek.** Balasannya tabel: `fields` (nama kolom)
+ `data` (array of array). Kolom wajib dibaca lewat `fields.indexOf(nama)`; indeks tidak
boleh di-hardcode karena urutannya berubah saat param `fullname` dipakai. Sementara
`sentry` dan `scout` justru array objek — dua bentuk berbeda di satu API yang sama.
Tabel jebakan lengkapnya ada di `REFERENCE.md`.

---

## 7. Sumber yang GUGUR — jangan buang waktu

> **Inventaris lengkap seluruh 151 API ada di [`BACKLOG-API.md`](./BACKLOG-API.md)** —
> sudah diprobe dan dikelompokkan per tier kesiapan. Bagian di bawah ini cuma sorotan
> jebakan paling penting. Untuk daftar utuhnya, buka backlog.

Sudah dites dan **tidak layak pakai**. Jangan dites ulang kecuali mau cek apa sudah hidup lagi.

| Sumber | Masalah |
|---|---|
| `bukuacak.vercel.app/api/v1/*` | Balas **HTML** (SPA shell) buat path apa pun. API-nya mati. |
| `ibnux.github.io/BMKG-importer/cuaca/*.json` | Balas `[]` — kosong. Pakai §6.5 sebagai gantinya. |
| `dayoffapi.vercel.app` | **402 Payment Required** |
| `api-berita-indonesia.vercel.app` | **402 Payment Required** |
| `alamat.thecloudalert.com` | Connection failed |
| `bank.thecloudalert.com/api/daftar/get/` | 404 |
| `kbbi.raf555.dev/api/v1/entri/{kata}` | 404 — path perlu riset ulang lewat Swagger-nya |

### Butuh riset endpoint dulu — **jangan ditulis di UI sebelum diverifikasi**
KBBI · Daftar Bank · Libur Nasional · Data Sekolah.
Daftar lengkapnya (41 API) ada di `BACKLOG-API.md` tier C, dan pengerjaannya sudah
dipecah jadi task di `TASKS.md` **TAHAP 7**.

> **Berita, Kode Pos, dan Harga Emas sudah TIDAK di daftar ini** — ketiganya ditemukan hidup
> waktu riset tier C. Berita malah dapat 14 media nasional dengan CORS terbuka
> (`berita-indo-api.vercel.app`). Terjemahan justru turun ke tier D: host tujuannya
> `api-translate.azharimm.site` tidak bisa dijangkau.

Buat **Libur Nasional**: sumber aslinya mati. Kemungkinan besar harus di-mirror manual
dari SKB 3 Menteri sebagai `data/mirror/libur-nasional.json`. Itu justru contoh terbaik
kenapa lapisan mirror ada.

---

## 8. `lib/client.ts` — tiga lapis pengambilan data

Ini jantung platform. Jawaban langsung buat masalah 402 dan CORS.

```
Lapis 1  cors: open    → fetch langsung dari browser        (cepat, nol biaya)
Lapis 2  cors: locked  → lewat /api/proxy                   (BELUM ADA — lihat §3.1)
   |         cors: none
   ↓ gagal / API mati
Lapis 3  mirror        → public/mirror/<slug>.json + banner "Data per <tanggal>"
```

**Keadaan sekarang: lapis 1 dan 3 sudah jalan, lapis 2 tidak ada** karena situs
diekspor statis (§3.1). Untuk API `cors: none`, `ambil()` **langsung ke lapis 3** saat
dipanggil dari browser — tidak membuang satu putaran gagal lebih dulu. Endpoint
berparameter tidak bisa di-mirror (kombinasinya tak terbatas), jadi endpoint semacam itu
pada API tanpa CORS **belum boleh dijadikan alat awam**.

Aturan wajib:
- **Timeout 10 detik.** Jangan biarkan user lihat spinner selamanya.
- **Retry 1x** dengan jeda, cuma untuk error jaringan — jangan retry 4xx.
- **Validasi `Content-Type` mengandung `json`.** Kalau HTML, perlakukan sebagai gagal
  (lihat jebakan Bukuacak di §7). Ini bukan opsional.
- Kalau jatuh ke lapis 3, hook **wajib** mengembalikan `{ data, sumber: 'mirror', per: '<ISO date>' }`
  supaya UI bisa nampilin banner jujur.

`useApi.ts` membungkus ini jadi:
```ts
const { data, loading, error, sumber, per } = useApi('gempa-bmkg', 'autogempa')
```

Alat **tidak boleh** manggil `fetch` sendiri. Selalu lewat `useApi`.

---

## 9. `scripts/probe.ts` — aturan keras

Beda dari `check.ts` upstream: yang dipanggil **endpoint aslinya** (`baseUrl + contohPath`),
bukan halaman dokumentasi.

Untuk tiap endpoint, catat:
```ts
{ waktu, slug, endpointId, status, latencyMs, contentType, cors, ok }
```

`ok` bernilai `true` **hanya jika** semuanya terpenuhi:
1. status code < 400, **dan**
2. `Content-Type` mengandung `json`, **dan**
3. body ter-parse jadi JSON yang sah, **dan**
4. body **bukan** array/objek kosong, **dan**
5. ukuran body **>= `minUkuranByte`** endpoint tersebut.

> **Syarat 5 ditambahkan setelah syarat 1–4 terbukti bocor.** Ada mode kematian yang lolos
> semuanya: deployment hidup, framework membalas 200 JSON yang sah dan tidak kosong —
> tapi *scraper* di dalamnya sudah rusak, jadi payload-nya kosong di dalam bungkus.
>
> ```json
> {"method":"GET","status":true,"results":{"title":"","content":[]}}   // Lazy Media
> {"method":"GET","status":true,"results":[]}                          // Masak Apa
> ```
>
> Keduanya **lolos** syarat 1–4 dan akan dilaporkan sehat. Ambang ukuran menangkapnya.
> Isi `minUkuranByte` dari ukuran sungguhan yang tercatat di `REFERENCE.md`, ambil sekitar
> setengahnya sebagai ambang — cukup longgar untuk fluktuasi wajar, cukup ketat untuk
> menangkap payload yang mengempis.

> Syarat 2–4 itu ada karena probe versi awal kemakan jebakan Bukuacak — 200 + CORS `*`
> tapi isinya HTML. Kalau cuma cek status code, kita mengulang kesalahan upstream.

> ⚠️ **BACA BODY SAMPAI HABIS sebelum di-parse.** Jangan pernah `read(n)` dengan batas.
> Riset awal sempat cuma baca 2500 byte pertama, dan itu bikin semua API bersponse besar
> keliatan rusak: `quran-api-id/surah` (89KB), `/surah/{n}` (341KB), dan `kotonogi/full`
> (98KB) semuanya dilaporkan `JSONDecodeError` padahal sehat walafiat. **Ini kesalahan
> yang menghasilkan false negative diam-diam** — API sehat divonis mati, dan ga ada yang
> ngeh sampai ada yang ngecek manual. Kalau butuh batas, pakai batas yang besar
> (mis. 5MB) dan **laporkan terpotongnya sebagai error tersendiri**, jangan sebagai `ok: false`.

Hasilnya di-append ke `data/health/<slug>.json` (rolling 90 hari), lalu di-commit balik
oleh workflow. Probe juga **mengisi ulang field `cors`** di registry berdasarkan header asli.

Jalan tiap 6 jam. **Jangan lebih sering** — banyak API ini dihosting developer dari kantong sendiri.

---

## 10. `app/api/proxy/route.ts` — keamanan

- **Allowlist wajib.** Host yang boleh diproxy = kumpulan host `baseUrl` di registry. Selain itu → **403**.
  Open proxy bakal langsung dipakai buat abuse dan bikin Worker kita diblokir Cloudflare.
- Cuma izinkan **GET**.
- Rate limit per IP.
- Teruskan `Cache-Control` agresif (minimal 5 menit) — hormati server sumber.
- Jangan teruskan header `Cookie` / `Authorization` dari klien.

---

## 11. Konvensi

- **Penamaan pakai Bahasa Indonesia** untuk hal yang berhadapan dengan domain
  (`nama`, `kategori`, `deskripsi`, `alat`, `wilayah`). Istilah teknis tetap Inggris
  (`slug`, `endpoint`, `baseUrl`, `params`). Ikuti gaya yang sudah ada di `registry/schema.ts`.
- Komentar seperlunya saja, bahasa Indonesia, jelaskan **kenapa** bukan **apa**.
- Tiap alat = folder `alat/<slug>/index.tsx` yang meng-export komponen default + metadata
  (`judul`, `ikon`, `deskripsi`, `apiSlug`). Halaman `/alat/[slug]` merakit otomatis.
- Server Component secara default. `'use client'` cuma di komponen yang butuh interaksi.

---

## 12. Jangan mengarang — aturan untuk agent

Dokumen ini ditulis supaya kamu tidak perlu menebak apa pun. Kalau kamu merasa perlu
menebak, itu tandanya jawabannya ada di salah satu dokumen ini — **atau memang belum
diketahui, dan menebak akan merusak.**

| Kalau kamu butuh… | Ambil dari | JANGAN |
|---|---|---|
| Nama field response | **`REFERENCE.md`** | Jangan tebak dari nama API. BMKG pakai `Infogempa.gempa.Magnitude`, bukan `data.magnitude` |
| Tipe sebuah field | **`REFERENCE.md`** bagian "Jebakan tipe" | Jangan asumsikan angka itu `number` — banyak yang string |
| Base URL & path endpoint | **SPEC §6** dan **`BACKLOG-API.md` tier A** | Jangan karang path yang "masuk akal" seperti `/api/v1/list` |
| API mana yang hidup | **`BACKLOG-API.md`** | Jangan anggap semua yang ada di daftar upstream itu hidup — 38 sudah mati |
| Urutan pekerjaan | **`TASKS.md`** | Jangan lompat task, ada `Blocked by` |

### Tiga aturan keras

1. **Kalau sebuah endpoint tidak ada di `REFERENCE.md`, kamu belum boleh memakainya.**
   Panggil dulu dengan `curl`, lihat response aslinya, tambahkan ke `REFERENCE.md`,
   baru tulis kodenya. Urutan ini tidak boleh dibalik.

2. **Kalau sebuah nilai tidak muncul di response asli, jangan tampilkan di UI.**
   Lebih baik alatnya menampilkan lebih sedikit daripada menampilkan `undefined`
   atau angka karangan.

3. **Kalau hasil probe berbeda dengan yang tertulis di dokumen, dokumennya yang benar
   sampai kamu buktikan sebaliknya — lalu perbarui dokumennya.** Jangan diamkan selisih.
   Semua tabel di sini bertanggal 2026-08-06; API berubah, dan itu justru premis project ini.

### User-Agent — kesalahan yang sudah pernah terjadi

Kirim User-Agent yang jujur dan deskriptif (mis. `PusakaBot/1.0 (+<url repo>)`) di
`lib/client.ts` **dan** `scripts/probe.ts`.

BMKG membalas **403** untuk `Mozilla/5.0` telanjang dan untuk User-Agent default Python.
Waktu riset, empat endpoint BMKG sempat divonis mati gara-gara ini — padahal itu sumber
paling penting dan paling awet di seluruh katalog. Tabel lengkap UA mana yang lolos
ada di `REFERENCE.md`.

---

## 13. Yang harus dijaga

- **Atribusi CC-BY-4.0** ke `farizdotid/DAFTAR-API-LOKAL-INDONESIA` di README **dan** footer situs.
  Ini kewajiban lisensi, bukan sopan santun.
- **Hormati server sumber.** Cache agresif, jangan hajar API orang tiap render.
- **Jangan janjiin alat yang endpoint-nya belum diverifikasi.** Cek dulu, baru tulis di UI.
- API unofficial/scraper (LK21, Filmapik, dsb) — **jangan** dijadikan alat di muka awam
  karena risiko hukumnya. Boleh tetap ada di katalog developer.
- Kalau nemu sumber baru yang mati atau jebakan baru, **tulis di §7** biar orang berikutnya
  ga ngulang kerjaan.
