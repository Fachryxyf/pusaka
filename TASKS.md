# TASKS — Pusaka

> **Baca [`SPEC.md`](./SPEC.md) sampai habis sebelum ngerjain task apa pun** —
> terutama **§12 "Jangan mengarang"**. Tanpa itu kamu bakal ngulang riset yang sudah
> selesai dan kemakan jebakan yang sudah ketemu.

## Peta dokumen

| Dokumen | Isinya | Kapan dibuka |
|---|---|---|
| [`SPEC.md`](./SPEC.md) | Kenapa project ini ada, arsitektur, kontrak data, aturan keras | Sekali di awal, lalu rujuk sesuai kebutuhan |
| **[`REFERENCE.md`](./REFERENCE.md)** | **Bentuk response asli tiap endpoint** — nama field, tipe, contoh nilai | **Tiap kali nulis kode yang menyentuh data API** |
| **[`REGISTRY-SEED.md`](./REGISTRY-SEED.md)** | **22 file YAML siap tempel**, 43 endpoint, sudah divalidasi | T1.4 dan T7.4 — salin, jangan tulis ulang |
| **[`UI-SPEC.md`](./UI-SPEC.md)** | **Tampilan tiap alat** — tata letak, pengikatan field, kasus tepi | Tahap 2, sebelum menulis komponen alat |
| [`BACKLOG-API.md`](./BACKLOG-API.md) | Inventaris 151 API, bertingkat menurut kesiapan | Tahap 7, dan tiap kali nambah API |
| `TASKS.md` (ini) | Urutan pekerjaan + kriteria selesai | Terus-menerus |

## Cara pakai dokumen ini

- Kerjakan **berurutan**. Tiap task punya `Blocked by` — jangan lompat.
- Tiap task punya **Kriteria selesai** yang bisa diuji. Kalau belum lolos, task belum selesai.
- Tiap tahap (T1–T6) berdiri sendiri. Aman berhenti di akhir tahap mana pun tanpa ninggalin barang setengah jadi.
- Kalau nemu sumber API yang mati atau jebakan baru, **catat di `SPEC.md` §7** sebelum lanjut.

## Aturan yang berlaku untuk SEMUA task

1. `npm run build` **wajib lolos tanpa error tipe** sebelum sebuah task dianggap selesai.
2. Jangan pernah nambah alat yang endpoint-nya belum diverifikasi hidup + JSON (lihat SPEC §6 dan §7).
3. Jangan panggil `fetch` langsung di komponen alat — selalu lewat `useApi` (SPEC §8).
4. Jangan hardcode URL API di komponen. Semua URL hidup di `registry/apis/*.yml`.
5. **Nama field selalu diambil dari `REFERENCE.md`, tidak pernah ditebak.** Kalau endpoint
   yang kamu butuhkan belum ada di sana: panggil dengan `curl`, catat hasilnya ke
   `REFERENCE.md`, baru tulis kodenya.
6. **Selalu kirim User-Agent deskriptif** (`PusakaBot/1.0 (+<url repo>)`) di `client.ts`
   dan `probe.ts`. BMKG membalas 403 untuk UA `Mozilla/5.0` telanjang dan UA default Python.
7. **Baca body response sampai habis sebelum di-parse.** Jangan pakai batas baca —
   response terbesar 341 KB, dan pembacaan terpotong bikin API sehat keliatan rusak.
8. **Kirim `headers` dari registry**, digabung dengan User-Agent. Ada endpoint yang
   membalas **400** kalau headernya kurang (`dua-dhikr` butuh `Accept-Language: id`) —
   gejalanya mirip endpoint rusak padahal cuma kurang header.
9. **Tangani 429 (rate limit).** Sudah terbukti dengan angka: `api.myquran.com` membalas
   **429 pada permintaan kedua dalam satu detik**, dan body-nya **teks biasa, bukan JSON**.
   Jadi periksa 429 **sebelum** memeriksa `Content-Type`, lalu ulang sekali dengan jeda dari
   header `Retry-After`; jangan langsung vonis `ok: false`. Sudah tertangani di
   `lib/client.ts` (`sebab: 'batas'`). Alat yang memuat beberapa bagian dari satu API
   **wajib memuatnya berurutan, bukan serentak.**
10. **Hormati `minUkuranByte`.** Status 200 + JSON sah + tidak kosong **belum cukup** —
    ada API yang deployment-nya hidup tapi scraper-nya rusak, sehingga membalas bungkus
    normal dengan isi kosong. Tiga API di katalog mati dengan cara ini. Ambangnya sudah
    terisi di `REGISTRY-SEED.md` dari ukuran terukur.

---

# TAHAP 1 — Fondasi

Target akhir tahap: registry bisa dibaca dan divalidasi. Belum ada UI.

---

### T1.1 — Scaffold project
**Blocked by:** —

Inisialisasi Next.js di direktori ini (sudah ada `SPEC.md` + `TASKS.md`, jangan ketimpa).

- `npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"`
- Tambah dependency: `zod`, `yaml`, `tsx` (dev)
- `git init`, bikin `.gitignore` (pastikan `node_modules`, `.next`, `.env*` masuk)
- Setel `package.json` scripts: `dev`, `build`, `start`, `lint`, `probe`, `mirror`, `sync`

**Kriteria selesai:** `npm run dev` jalan, `localhost:3000` kebuka. `SPEC.md` & `TASKS.md` masih utuh.

---

### T1.2 — Skema registry
**Blocked by:** T1.1

Bikin `registry/schema.ts` — salin persis dari **SPEC §5**. Jangan diubah-ubah dulu.

**Kriteria selesai:** `import { ApiSchema } from '@/registry/schema'` ga error tipe.

---

### T1.3 — Loader registry
**Blocked by:** T1.2

Bikin `lib/registry.ts`:
- `muatSemuaApi(): Api[]` — baca semua `registry/apis/*.yml`, parse YAML, validasi lewat `ApiSchema`
- `muatApi(slug): Api | null`
- **Lempar error yang jelas** kalau ada YAML tidak sah atau `slug` kembar — sebutkan nama filenya

Fungsi ini dipanggil dari Server Component dan dari `scripts/*`, jadi harus jalan di Node
(pakai `fs`, jangan API browser).

**Kriteria selesai:** `npx tsx -e "import('./lib/registry').then(m=>console.log(m.muatSemuaApi().length))"` nyetak angka.

---

### T1.4 — Isi registry: 5 API terverifikasi
**Blocked by:** T1.3

**Jangan tulis YAML dari nol.** Semuanya sudah tersedia lengkap di
[`REGISTRY-SEED.md`](./REGISTRY-SEED.md) — salin apa adanya ke `registry/apis/<slug>.yml`.
Semua `baseUrl`, `path`, `contohPath`, dan `cors` di sana berasal dari panggilan sungguhan
dan sudah lolos validasi skema.

Untuk tahap ini ambil lima ini saja (sisanya menyusul di T7.4):

`gempa-bmkg` · `wilayah-emsifa` · `sholat-myquran` · `quran-equran` · `cuaca-bmkg`

Perhatikan dua hal yang gampang rusak kalau YAML-nya diketik ulang:
- Nilai `contoh` pada params **wajib string berkutip** (`'1301'`, `'08'`). Tanpa kutip,
  YAML mengubahnya jadi integer dan validasi zod gagal.
- Tiap `{placeholder}` di `path` harus punya entry `params` dengan nama yang sama persis.

**Kriteria selesai:** `muatSemuaApi()` mengembalikan **5** API tanpa error validasi.

---

### T1.5 — Tes validasi registry
**Blocked by:** T1.4

Tes yang mem-parse tiap `registry/apis/*.yml` lewat `ApiSchema`. Harus gagal kalau:
YAML tidak sah · `slug` kembar · `slug` beda dengan nama file · `endpoints` kosong ·
`contohPath` hilang · nilai `params[].contoh` bukan string.

Tambahkan satu pemeriksaan yang tidak tercakup zod tapi penting:
**tiap `{placeholder}` di `path` wajib punya entry `params` dengan nama yang sama, dan
sebaliknya.** Tanpa ini, playground bakal merender form yang tidak cocok dengan URL-nya,
atau mengirim URL yang masih menyisakan `{placeholder}` mentah.

> Pemeriksaan yang sama sudah dijalankan terhadap `REGISTRY-SEED.md` — 22 API / 43 endpoint
> lolos semua. Jadi kalau tesmu menolak isi seed, tesnya yang keliru, bukan datanya.

Jalankan sebagai bagian dari `npm run build` (atau pre-build script) supaya YAML rusak
ga bisa lolos ke produksi.

**Kriteria selesai:** tes lewat. Sengaja rusakin satu YAML → build gagal dengan pesan yang menyebut nama file.

---

# TAHAP 2 — Muka awam, 6 alat — SELESAI 2026-08-21

Target akhir tahap: situs live di GitHub Pages dengan 6 alat jalan.
**Tercapai dengan 8 alat**, karena Objek Dekat Bumi (NASA/JPL) ditambahkan di luar rencana
awal.
**Sudah layak dibagikan ke publik sejak T2.8** — tiga alat sisanya menyusul di atasnya.

> Tampilan tiap alat sudah dispesifikasikan lengkap di [`UI-SPEC.md`](./UI-SPEC.md),
> termasuk pengikatan tiap elemen UI ke jalur field yang sungguh ada. Baca bagian
> alat yang bersangkutan **sebelum** menulis komponennya.

---

### T2.1 — `lib/client.ts` lapis 1 — SELESAI 2026-08-20
**Blocked by:** T1.5

Baru lapis 1 dulu (fetch langsung). Lapis 2 & 3 nyusul di T5.

Wajib ada sejak sekarang (SPEC §8):
- timeout **10 detik**
- retry **1x** untuk error jaringan saja, jangan retry 4xx
- **validasi `Content-Type` mengandung `json`** — kalau HTML, anggap gagal
- bangun URL dari `baseUrl + path`, ganti `{placeholder}` dari params

**Kriteria selesai:** panggil `gempa-bmkg`/`autogempa` → dapat objek `Infogempa`.
Panggil URL yang balas HTML → dapat error, **bukan** sukses.

---

### T2.2 — `lib/useApi.ts` — SELESAI 2026-08-20
**Blocked by:** T2.1

Hook client-side pembungkus `client.ts`:
```ts
const { data, loading, error, sumber, per } = useApi('gempa-bmkg', 'autogempa', params?)
```
`sumber` bernilai `'langsung' | 'proxy' | 'mirror'`. Untuk sekarang selalu `'langsung'`,
tapi **bentuk kembaliannya sudah harus final** supaya T5 ga perlu bongkar semua alat.

**Kriteria selesai:** dipakai di satu komponen percobaan, nampilin data + state loading & error.

---

### T2.3 — Layout + kerangka halaman utama — SELESAI 2026-08-20
**Blocked by:** T2.2

- `app/layout.tsx` — header, footer (**wajib memuat atribusi CC-BY-4.0 ke farizdotid**, SPEC §13)
- `app/page.tsx` — grid kartu alat + kotak pencarian
- Daftar alat dibaca dari `alat/*/index.tsx` (metadata `judul`, `ikon`, `deskripsi`, `apiSlug`)
- Responsif, tema terang & gelap

**Kriteria selesai:** halaman utama nampilin kartu alat (boleh kosong dulu), footer ada atribusinya, rapi di layar HP.

---

### T2.4 — Kerangka halaman alat — SELESAI 2026-08-20
**Blocked by:** T2.3

`app/alat/[slug]/page.tsx` — merakit alat otomatis dari folder `alat/<slug>/`.
Sertakan `generateStaticParams` dan `generateMetadata` (judul + deskripsi per alat, buat SEO).
Slug tidak dikenal → `notFound()`.

**Kriteria selesai:** `/alat/apapun` yang ga ada → 404. Yang ada → me-render komponennya.

---

### T2.5 — Alat: Info Gempa — SELESAI 2026-08-20
**Blocked by:** T2.4

`alat/gempa/index.tsx`. Nampilin gempa terkini (magnitudo, wilayah, waktu, kedalaman),
peta shakemap kalau ada, dan daftar gempa dirasakan.

Ingat SPEC §6.1: `autogempa` itu **objek**, `terkini`/`dirasakan` itu **array**.

**Kriteria selesai:** angka yang tampil **sama persis** dengan isi
`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` saat itu.

---

### T2.6 — Alat: Data Wilayah Indonesia — SELESAI 2026-08-20
**Blocked by:** T2.4

`alat/wilayah/index.tsx`. Pemilih bertingkat: provinsi → kabupaten → kecamatan → desa.
Tiap tingkat baru dimuat setelah tingkat di atasnya dipilih.
Tampilkan kode wilayahnya, dan sediakan tombol salin.

**Pakai `wilayah-idn-area`, BUKAN `wilayah-emsifa`.** Kode keduanya tidak saling cocok —
lihat peringatan di UI-SPEC Alat 2 dan SPEC §6.5. Salah pilih di sini bikin alat Cuaca (T2.9)
rusak diam-diam dengan 404.

**Tidak ada fungsi konversi kode wilayah.** Kode idn-area sudah berformat Kemendagri
bertitik dan dipakai apa adanya oleh BMKG.

Spesifikasi tampilan lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 2.

> **Batas `limit` diperbaiki 2026-08-20.** Seed memakai `limit=50`; ternyata API menolak
> `limit>100` dengan 400, dan **tanpa `limit` responsnya berhalaman diam-diam**
> (13 desa Pangalengan hanya terkirim 10). Registry dinaikkan ke 100 — nilai maksimum
> yang sah. Tabelnya di `REFERENCE.md`.

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-wilayah.ts`: Jawa Barat →
Kabupaten Bandung → Pangalengan → Warnasari menghasilkan `32.04.15.2003`, jumlah item tiap
tingkat sama dengan `meta.pagination.total`, BMKG menerima kode itu apa adanya, dan kode
emsifa untuk desa yang sama (`3204040005`) memang berbeda.

---

### T2.7 — Alat: Jadwal Sholat — SELESAI 2026-08-21
**Blocked by:** T2.6

`alat/sholat/index.tsx`. Pilih kota (dari `/sholat/kota/semua`, kasih pencarian — daftarnya panjang),
tampilkan jadwal hari ini, dan tandai waktu sholat berikutnya.

**Tiga hal yang ditemukan saat mengerjakannya**, semuanya sudah masuk `REFERENCE.md`:

1. **Batas permintaan jauh lebih ketat dari dugaan.** Permintaan **kedua** dalam satu detik
   sudah dibalas **429**, dan body 429-nya **bukan JSON** (`Too Many Requests` teks biasa).
   `lib/client.ts` sekarang memeriksa 429 sebelum memeriksa `Content-Type`, memberinya
   `sebab: 'batas'`, dan mengulang sekali dengan jeda dari header `Retry-After`.
   Konsekuensi untuk alat: **muat berurutan, jangan serentak.**
2. **Tanggal satu digit ternyata diterima server** (`/2026/8/6` → 200). Registry tetap
   memakai dua digit karena perilaku tak terdokumentasi bisa berubah, tapi ini bukan lagi
   bug yang menunggu tanggal 1–9.
3. **Tidak ada field zona waktu di response.** Sudah diperiksa untuk kota di WIB, WITA,
   dan WIT — kunci `data` selalu `id, lokasi, daerah, jadwal`. Jamnya benar untuk zona
   masing-masing, tapi tidak bisa dibandingkan dengan jam perangkat pengguna. Karena itu
   alat **menyembunyikan** hitungan "berikutnya" kalau `jadwal.date` tidak sama dengan
   tanggal perangkat, dan mengatakannya di UI. Lebih baik tidak ada daripada salah.

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-sholat.ts` (6 tes): 518 kota,
`1301` = KOTA JAKARTA, jadwal 6 Agustus benar termasuk `tanggal` dan `date`, kedelapan
waktu berformat `HH:MM`, kota tidak ada → 400, dan dua permintaan beruntun tetap sukses
karena 429 diulang otomatis.

---

### T2.8 — Deploy ke GitHub Pages — SELESAI 2026-08-20
**Blocked by:** T2.7

> **Berubah dari rencana awal.** Task ini semula berbunyi "Deploy ke Cloudflare Pages"
> dengan `@cloudflare/next-on-pages`. Yang dikerjakan adalah **GitHub Pages** karena
> domain `pusaka.fachryxyf.com` sudah terpasang di sana. Alasan intinya tidak berubah —
> hosting harus **gagal tertutup**, bukan menagih (SPEC §2, §3).
>
> Konsekuensinya dicatat di **SPEC §3.1** dan wajib dibaca sebelum menyentuh
> `lib/client.ts`: tidak ada sisi server, jadi **`/api/proxy` (SPEC §10) tidak ada**, dan
> API tanpa CORS dilayani lapis 3 mirror. Kalau proxy suatu saat sungguh dibutuhkan,
> hostingnya kembali ke Cloudflare dan SPEC §10 berlaku lagi apa adanya.

Yang sudah terpasang:

- `output: 'export'` + `trailingSlash: true` + `images.unoptimized` di `next.config.ts`
- `public/CNAME` berisi domain, `public/.nojekyll` supaya `_next/` tidak dibuang Jekyll
- `.github/workflows/pages.yml` — deploy tiap push ke `xyf`
- penyegaran `public/mirror/` ikut di dalam `pages.yml`, tiap push + tiap 6 jam

**Kriteria selesai:** TERPENUHI — situs live di https://pusaka.fachryxyf.com, alat Gempa,
Objek Dekat Bumi, dan Wilayah jalan di produksi.

---

### T2.9 — Alat: Prakiraan Cuaca — SELESAI 2026-08-21
**Blocked by:** T2.8

`alat/cuaca/index.tsx`. Pemilih wilayah empat tingkat sampai desa, lalu prakiraan per tiga
jam untuk tiga hari. Kode `adm4` dari `wilayah-idn-area` dipakai **apa adanya**.

**Dua koreksi terhadap spesifikasi asli**, keduanya dari pengukuran langsung dan sudah masuk
`REFERENCE.md`:

1. **Bentuk `cuaca` bukan "3 hari × 8 butir".** Jumlah kelompok dan jumlah butir per
   kelompok **tidak tetap** — pengukuran 2026-08-21 memberi `8+8+2`, karena jendela
   prakiraannya berakhir di tengah hari. Yang dijamin: **tiap sub-array adalah satu tanggal
   kalender lokal**. Jadi label hari diambil dari `local_datetime` butir pertama, bukan dari
   indeks array.
2. **`lokasi.timezone` ADA** (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`), dan wajib
   dipakai. `local_datetime` adalah waktu dinding **di lokasi prakiraan**, bukan waktu
   pembaca — ketiga zona menghasilkan jam berbeda untuk momen UTC yang sama. Label
   "Hari ini/Besok/Lusa" dihitung lewat `Intl.DateTimeFormat` dengan `timeZone` dari
   response. Menyerahkan `local_datetime` ke `new Date()` juga dilarang: string tanpa
   penanda zona ditafsirkan berbeda antar mesin JS.

**Pemilih wilayah diangkat jadi `komponen/PemilihWilayah.tsx`** dan dipakai bersama alat
Wilayah — tidak ditulis dua kali (UI-SPEC Alat 4). Alat sekarang bisa mendeklarasikan
`apiPendukung` di metadatanya; halaman alat memuat API tambahan itu di server.

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-cuaca.ts` (8 tes): Warnasari
Pangalengan terbaca dari kode idn-area, `timezone` ada, `cuaca` bersarang dua tingkat dengan
`8+8+2` butir, tiap kelompok tepat satu tanggal lokal, `local_datetime = utc_datetime + 7`
untuk WIB dan `+9` untuk Jayapura, dan **kode emsifa bertitik tetap dijawab 404** — penjaga
terhadap godaan menulis fungsi konversi kode wilayah.

---

### T2.10 — Alat: Al-Qur'an — SELESAI 2026-08-21
**Blocked by:** T2.8

`alat/quran/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 5.

Kedua jebakan yang sudah tercatat terbukti benar: kunci audio berupa string berangka
(`audio["05"]`, dan `audio[5]` memang `undefined`), dan `data.deskripsi` mengandung HTML.

**Empat temuan tambahan**, semuanya masuk `REFERENCE.md`:

1. **Tag di `deskripsi` diperiksa pada seluruh 114 surat**, bukan cuma Al-Fatihah:
   `<i>` 554 kali, `<br>` 31 kali, dan `<a href="s002a001.htm">` **2 kali** — hanya di surat
   38. Tautan itu relatif ke berkas yang tidak ada di situs kita.
   **Yang diterapkan: tidak ada `dangerouslySetInnerHTML` sama sekali.**
   `komponen/TeksBertag.tsx` mengurai teksnya jadi potongan React; hanya `<i>` dan `<br>`
   dihormati, tag lain dibuang tapi isinya dipertahankan sebagai teks. Dengan begitu tidak
   ada jalur mana pun dari data API ke `innerHTML`.
2. **`/surat/2` berukuran 397 KB** — lebih besar dari 341 KB yang tercatat sebagai response
   terbesar di katalog. Bukti konkret aturan "baca body sampai habis" (SPEC §9).
3. **Nama qari tidak ada di response**, hanya di dalam URL-nya. Pemetaan `01`–`06` ke nama
   dicatat di `REFERENCE.md` dan dijaga tes: kalau URL-nya berubah, tesnya gagal.
4. **`suratSebelumnya` bertipe `false`, bukan `null`**, pada surat 1. Jadi
   `data.suratSebelumnya?.nomor` lolos tanpa peringatan tapi menghasilkan `undefined`.

Sekalian: `<audio controls>` diganti `komponen/PemutarAudio.tsx`, karena kontrol bawaan
dirender OS dan tidak bisa ditata (UI-SPEC §1.4).

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-quran.ts` (8 tes): 114 surat,
Al-Fatihah 7 ayat lengkap Arab + latin + terjemahan, kunci audio string dengan `audioFull[5]`
memang `undefined`, pemetaan qari masih cocok, `suratSebelumnya === false`, himpunan tag
deskripsi tetap `{a, br, i}`, Al-Baqarah utuh 286 ayat pada 387 KB, dan nomor 0/115 → 404.
Ditambah `scripts/tes-teks.ts` (7 tes) yang memaksa `<a>`, `<script>`, `<img onerror>`, dan
`javascript:` tidak pernah menjadi elemen.

---

### T2.11 — Alat: Kode Pos — SELESAI 2026-08-21
**Blocked by:** T2.8

`alat/kodepos/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 6.

Pakai `kodepos-sooluh` (`kodepos.vercel.app`) — CORS terbuka, jadi tidak menunggu proxy.
Jebakan penamaan yang sudah tercatat terbukti: `code` di akar adalah status `"OK"` (string),
`code` di dalam `data` adalah kode posnya (int).

**Tiga temuan tambahan**, semuanya masuk `REFERENCE.md`:

1. **Hasil dibatasi 20, tanpa paginasi dan tanpa `total`.** `?page=2` mengembalikan halaman
   pertama yang identik, dan `?limit=50` diabaikan — keduanya **tanpa galat**. Karena tidak
   ada `total`, tidak ada cara mengetahui berapa hasil sebenarnya. Alat menyebutkan batas ini
   saat hasilnya tepat 20, alih-alih berpura-pura itu semuanya.
2. **Koordinat `0,0` diterima** dan mengembalikan titik terdekat di Aceh. Jadi koordinat
   kosong yang terkirim sebagai `0` menghasilkan jawaban yang terlihat sah tapi salah. Alat
   memvalidasinya sebelum mengirim.
3. **Koordinat tidak sah membalas 404 berbunyi "This endpoint cannot be found"** —
   menyesatkan, karena endpointnya ada. Sementara pencarian tanpa hasil justru **200 dengan
   `data: []`**, yang berarti keadaan "kosong", bukan galat. Dua-duanya ditangani berbeda.

Lisensi repo sumbernya **Apache-2.0**, jadi mirror boleh secara hukum — tapi tidak
diaktifkan karena kedua endpoint berparameter dan tidak bisa di-snapshot.

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-kodepos.ts` (8 tes): "danasari"
mengembalikan 4 hasil dengan Ciamis = 46386, `code` akar dan `code` data terbukti beda tipe,
pencarian kosong 200 + `[]`, batas 20 tanpa `total`, deteksi `-6.2,106.816` → 10230 Kebon
Melati dengan `distance` 0,37, dan `0,0` tetap dijawab sehingga validasi di sisi kita
memang perlu. Penolakan izin lokasi ditangani dengan pesan per jenis galat
(`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`).

---

### T2.12 — Alat: Berita — SELESAI 2026-08-21
**Blocked by:** T2.8

`alat/berita/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 7.

Seluruh 14 sumber yang didaftarkan root API diprobe satu per satu. Hasilnya mengoreksi
beberapa hal yang tertulis di dokumen:

1. **5 dari 14 sumber MATI**, semuanya membalas **500 dengan body JSON**:
   Liputan6 (`Status code 404`), Tribun (`Status code 403`), Jawa Pos (`Status code 404`),
   Suara (`Status code 404`), dan Vice (`Cannot read property 'url' of undefined` — galat
   JavaScript mentah yang bocor). Ini mode kematian scraper: API-nya hidup, RSS di baliknya
   yang berubah atau memblokir. **Daftar sumber di alat tidak boleh disalin dari root API** —
   hanya kesembilan yang terbukti berisi yang didaftarkan di registry.
2. **Catatan lama tentang `antara-news` perlu dikoreksi.** Ia bukan mati: yang 404 hanya
   `/v1/antara-news/` (tanpa rubrik), karena root API memang tidak mencantumkan `all` untuk
   Antara. `/v1/antara-news/terkini` mengembalikan 50 item. Jadi Antara **masuk** ke pilihan,
   dengan `terkini` sebagai bawaan.
3. **Bentuk `data[]` BERBEDA di tiap sumber**, dan ini yang paling berpengaruh ke kode:
   `contentSnippet` hanya ada di CNN dan CNBC; tujuh sumber lain memakai `description` atau
   `content`. `image` bisa objek `{small,…}`, **string URL biasa** (Antara), atau **tidak ada
   sama sekali** (Tempo, BBC). Alat menormalkan kesembilannya jadi satu bentuk internal
   sebelum merender.
4. **`listType` di root tidak menjamin penyaringan.** CNN menyaring benar (100/100 tautan
   memuat `/teknologi/`), tapi `/v1/bbc-news/dunia` mengembalikan isi **identik** dengan
   tanpa rubrik. Rubrik hanya ditawarkan untuk sumber yang penyaringannya sudah dibuktikan.
5. **VOA hidup tapi datanya beku.** Berita terbarunya bertanggal 2025-03-15 — **523 hari**
   saat diperiksa. Endpointnya lolos **semua** syarat probe (200, JSON, tidak kosong, di atas
   `minUkuranByte`), jadi ini **mode kematian keenam yang belum tercatat di SPEC §9**:
   data sah tapi tidak diperbarui. Alat memberi peringatan kalau berita terbaru sebuah sumber
   lebih tua dari 7 hari, dan itu penanganan yang benar — menyembunyikan sumbernya justru
   menutupi masalahnya.

**Kriteria selesai:** TERPENUHI. Dibuktikan `scripts/tes-berita.ts` (9 tes): kesepuluh
endpoint di registry hidup dan berisi, kelima sumber mati **tetap** mati (tesnya gagal kalau
salah satu hidup lagi — kabar baik yang layak ditindaklanjuti), Antara 404 tanpa rubrik tapi
berisi dengan `/terkini`, bentuk per sumber masih sesuai catatan, semua berita punya judul +
tautan `http` + `isoDate` UTC, rubrik CNN menyaring 100/100, rubrik BBC tidak menyaring, VOA
berumur 523 hari, dan rubrik tak dikenal → 500.

---

# TAHAP 3 — Probe & status — SELESAI 2026-08-21

Target akhir tahap: status hidup/mati semua API terpantau otomatis dan terbuka untuk publik.

---

### T3.1 — `scripts/probe.ts` — SELESAI 2026-08-21
**Blocked by:** T2.8

Mesinnya di `lib/probe.ts` (bisa diuji tanpa menulis berkas), pemanggilnya di
`scripts/probe.ts`. Kelima syarat `ok` di SPEC §9 diberlakukan berurutan, dan 429
diperiksa **sebelum** `Content-Type` karena body 429 belum tentu JSON.

> **PENYIMPANAN RIWAYAT BERUBAH dari rancangan §4.** Riwayat tidak ditulis ke
> `data/health/<slug>.json` dan tidak di-commit balik, karena itu menuntut workflow
> ber-`contents: write` plus hak melewati ruleset branch — dua hal yang sengaja dihapus
> (SPEC §3.1).
>
> Gantinya: **situs yang sudah terbit adalah penyimpanannya.** Sebelum memprobe,
> `scripts/probe.ts` mengunduh `status.json` versi live, menambahkan hasil baru, lalu
> menulis ulang ke `public/status.json`. Rolling 90 hari dipangkas di sana. Tidak ada
> satu pun workflow yang butuh izin tulis ke repo.
>
> Konsekuensi yang harus diketahui: **`npm run probe` wajib ikut dijalankan di
> `pages.yml`.** Kalau tidak, tiap push biasa akan menerbitkan artefak tanpa
> `status.json`, dan seluruh riwayat hilang bersamanya.

Umur data dicatat sebagai `umurDataHari` tapi **tidak** memengaruhi `ok` — endpoint yang
datanya beku tetap bekerja, jadi memvonisnya mati akan salah (SPEC §9 mode keenam).
Field `cors` diisi ulang dari header asli tiap probe.

**Kriteria selesai:** TERPENUHI. `npm run probe` menulis `public/status.json`;
kesembilan API dengan 32 endpoint semuanya `ok: true`. Dibuktikan `scripts/tes-probe.ts`
(7 tes) tanpa perlu menambah YAML palsu ke registry: jebakan **Bukuacak** tertangkap
(`Content-Type 'text/html' bukan JSON`), host mati jadi `status 0` tanpa melempar, ambang
`minUkuranByte` dipaksakan, 404 ber-JSON sah tetap gagal, dan VOA yang datanya berumur
523 hari tetap `ok: true` dengan umurnya tercatat.

---

### T3.2 — Workflow probe — SELESAI 2026-08-21
**Blocked by:** T3.1

`.github/workflows/probe.yml` — cron tiap 6 jam + `workflow_dispatch`.

Beda dari rancangan: workflow ini **tidak commit** `data/health/` balik ke repo. Ia
menjalankan probe, lalu **men-deploy** — riwayatnya terbawa di dalam `status.json` yang
ikut terbit (lihat T3.1). Izinnya `contents: read`; yang ditambahkan hanya `pages: write`
dan `id-token: write`.

Jadwal 6 jam di `pages.yml` **dihapus** dan dipindah ke sini, supaya dua workflow tidak
berebut `concurrency: pages`.

**Kriteria selesai:** dipicu lewat `workflow_dispatch` → `status.json` di produksi
diperbarui, dengan titik riwayat bertambah alih-alih tergantikan.

---

### T3.3 — Dashboard status + `status.json` — SELESAI 2026-08-21
**Blocked by:** T3.2

- `app/dev/status/page.tsx` — ringkasan, daftar yang bermasalah, daftar **hidup tapi
  datanya tua**, lalu tiap API dengan uptime 30 hari, latency rata-rata, dan riwayat batang
  per endpoint. Warna bukan satu-satunya penanda: tiap batang punya `title` dan tiap deret
  punya ringkasan teks.
- **`public/status.json`** — berkas statis, bukan route handler (SPEC §3.1). GitHub Pages
  menyajikan `Access-Control-Allow-Origin: *` secara bawaan, sudah diverifikasi, jadi
  berkasnya bisa dipanggil program dari mana saja.

Halaman ini juga menangani keadaan **belum ada data**: kalau `public/status.json` tidak
ada (klon baru, atau sebelum probe pertama), halamannya tetap terbit dan mengatakan cara
menghasilkannya. Berkas rusak tidak menggagalkan build.

**Kriteria selesai:** TERPENUHI — `/dev/status` menampilkan kesembilan API dengan riwayat
asli, `curl https://pusaka.fachryxyf.com/status.json` membalas JSON sah.

---

### T3.4 — Penanda status di muka awam — SELESAI 2026-08-21
**Blocked by:** T3.3

Kartu alat yang API-nya gagal probe diberi penanda "lagi bermasalah", dan halaman alatnya
menampilkan banner berisi berapa endpoint yang bermasalah plus tautan ke `/dev/status`.
**Alatnya tidak disembunyikan** — pengguna berhak mencoba sendiri, dan jujur lebih berguna
daripada rapi.

Penandanya dibaca saat build lewat `lib/status.ts`, jadi tidak ada permintaan tambahan di
browser. Kalau `status.json` belum ada, petanya kosong dan tidak ada penanda yang muncul —
bukan penanda palsu.

**Kriteria selesai:** TERPENUHI — diuji dengan memaksa satu endpoint gagal
(`scripts/tes-status.ts`), penanda muncul di kartu dan banner muncul di halaman alat.

---

# TAHAP 4 — Muka developer — SELESAI 2026-08-21

Target akhir tahap: lubang no. 3 (SPEC §2) tertutup — dataset jadi bisa dipanggil mesin, lengkap dengan playground.
**Tercapai.** Katalog di `/dev`, dokumentasi tergenerate di `/dev/api/<slug>`, playground di
tiap endpoint, dan `status.json` yang bisa dipanggil program.

---

### T4.1 — Katalog API — SELESAI 2026-08-21
**Blocked by:** T3.4

`app/dev/page.tsx` — daftar semua API dari registry dengan pencarian dan tiga filter
(kategori, autentikasi, status), plus badge status dari data probe.

Tiap baris juga menampilkan jumlah endpoint, keadaan CORS, lisensi dari `provenance`, dan
penanda kalau API-nya punya mirror — semuanya dari registry, tidak ada yang ditulis tangan.

Satu catatan struktur: objek `Api` penuh **tidak** diteruskan ke Client Component. Yang
dikirim hanya `BarisApi` berisi field yang dipakai daftar, karena `contohResponse` bisa
besar dan tidak ada gunanya di sana.

Halaman ini juga menyatakan terus terang bahwa registry baru memuat 9 dari 151 API di
inventaris. Menyembunyikan angka itu akan membuat katalognya terlihat lebih lengkap
daripada kenyataannya.

**Kriteria selesai:** TERPENUHI — cari "gempa" ketemu, filter `auth: none` jalan, tiap
baris menautkan halaman detailnya. Dibuktikan `scripts/tes-dev.ts`.

---

### T4.2 — Halaman detail API — SELESAI 2026-08-21
**Blocked by:** T4.1

`app/dev/api/[slug]/page.tsx` — dokumentasi **tergenerate dari registry**: base URL, tiap
endpoint beserta tabel params (nama, contoh, wajib, keterangan), ambang `minUkuranByte`,
tautan dokumentasi asli, kredit pengembang, dan riwayat status per endpoint.

Ditambahkan di luar rencana awal: **bagian "Hak pakai data"** yang menampilkan seluruh
`provenance` — lisensi, redistribusi, atribusi yang diwajibkan, batas akses, dan kebijakan
mirror. Termasuk yang bernilai `unknown`, dengan keterangan bahwa `unknown` **bukan**
berarti bebas dipakai. Menyembunyikan ketidaktahuan justru membuat orang mengira haknya
sudah jelas.

Juga: daftar alat yang memakai API tersebut, dibaca dari `apiSlug` **dan** `apiPendukung` —
jadi `wilayah-idn-area` muncul sebagai dipakai alat Wilayah sekaligus alat Cuaca.

**Kriteria selesai:** TERPENUHI — `/dev/api/gempa-bmkg` menampilkan ketiga endpoint beserta
paramsnya. Diuji terhadap HTML hasil ekspor, bukan hanya kode sumbernya.

---

### T4.3 — Playground — SELESAI 2026-08-21
**Blocked by:** T4.2

`komponen/Playground.tsx` di halaman detail: form params terisi contoh dari registry, URL
yang terbentuk ditampilkan hidup, tombol Kirim, lalu status + latency + ukuran + sumber
dan response-nya.

Memakai **`lib/client.ts` yang sama** dengan alat — tidak ada jalur fetch kedua di project
ini. Efek sampingnya bagus: penanganan 429, pemeriksaan `Content-Type`, dan fallback mirror
otomatis berlaku juga di playground.

Untuk API `cors: none`/`locked`, tombol Kirim **dinonaktifkan** dengan penjelasan bahwa
penyebabnya header CORS, bukan API yang rusak — dan diarahkan memakai salinan `curl` yang
tidak terikat CORS.

Dua hal yang perlu dicatat:

- **Salinan `curl` menyertakan `User-Agent` deskriptif.** Tanpa itu, perintah untuk BMKG
  bisa dibalas 403 dan orang akan menyangka endpointnya mati (REFERENCE.md).
- **Tampilan response dipotong pada 40.000 karakter**, dan potongnya dikatakan beserta
  panjang aslinya. `/surat/2` berukuran 397 KB — menaruh seluruhnya di DOM membuat halaman
  tersendat.

**Kriteria selesai:** TERPENUHI. Kirim ke `gempa-bmkg`/`autogempa` di browser menampilkan
response asli. Untuk klaim "curl bisa ditempel dan jalan": **ketiga puluh dua** perintah
`curl` digenerate dengan logika yang sama lalu benar-benar dijalankan — semuanya
menghasilkan output, nol kosong.

---

# TAHAP 5 — Proxy & mirror

Target akhir tahap: alat tetap hidup walau API sumbernya mati. Ini fitur pembeda utama platform.

**Status: lapis 3 sudah jalan (T5.3, T5.4). Lapis 2 ditunda — lihat catatan di bawah.**

---

> **Urutan tahap ini berubah pada 2026-08-20.** Lapis 3 (mirror) sudah dikerjakan lebih
> awal — di luar urutan — karena `jpl-ssd` masuk registry dan API itu **tanpa CORS**,
> jadi tidak ada jalan lain untuk memanggilnya dari browser. Lapis 2 (proxy) justru
> mundur: ia butuh sisi server yang tidak ada di ekspor statis (SPEC §3.1).

### T5.1 — Proxy — DITUNDA, butuh pindah hosting
**Blocked by:** T4.3

`app/api/proxy/route.ts`, ikuti **SPEC §10**.

> **Tidak bisa dikerjakan di hosting sekarang.** GitHub Pages hanya menyajikan berkas;
> route handler tidak ikut terekspor dan akan **gagal senyap di produksi**. Jangan
> menulisnya sebelum hostingnya pindah — lihat SPEC §3.1.
>
> Kerjakan task ini hanya kalau muncul kebutuhan yang tidak bisa dijawab mirror, yaitu
> **endpoint berparameter pada API tanpa CORS** (kombinasi paramnya tak terbatas, jadi
> tidak bisa di-snapshot). Contoh yang sudah ada: `jpl-ssd/objek` (`/sbdb.api?sstr=`).
> Kalau itu terjadi, hostingnya kembali ke Cloudflare Pages + Workers dan SPEC §10
> berlaku apa adanya.

Saat dikerjakan nanti:
**Allowlist itu wajib, bukan opsional.** Host yang boleh = kumpulan host `baseUrl` di
registry. Selain itu → 403. Open proxy bakal dipakai orang buat abuse dan bikin Worker
kita diblokir. Cuma GET · rate limit per IP · cache minimal 5 menit · jangan teruskan
`Cookie`/`Authorization`.

**Kriteria selesai:** proxy ke host yang terdaftar → berhasil.
Proxy ke `https://example.com` → **403**. Ini tes keamanan, wajib lolos.

---

### T5.2 — `client.ts` lapis 2 — DITUNDA bersama T5.1
**Blocked by:** T5.1

Rutekan API `cors: locked`/`none` lewat proxy secara otomatis berdasarkan field `cors` di registry.
`sumber` jadi `'proxy'`. Aktifkan lagi tombol Kirim di playground untuk API tersebut.

Sampai itu terjadi, `ambil()` mengarahkan API `cors: none` **langsung ke lapis 3** saat
dipanggil dari browser, tanpa membuang satu putaran gagal lebih dulu.

**Kriteria selesai:** daftarkan satu API tanpa CORS → jalan dari browser lewat proxy tanpa error CORS di console.

---

### T5.3 — `scripts/mirror.ts` + workflow — SELESAI 2026-08-20
**Blocked by:** — (dikerjakan lebih awal, lihat catatan di atas)

Untuk tiap API ber-`mirror: true`, ambil semua endpoint tanpa parameter dan simpan ke
**`public/mirror/<slug>.json`** beserta stempel waktu `per`.

> **Lokasinya `public/mirror/`** (rancangan awal menaruhnya di `data/mirror/`).
> Lapis 3 dijalankan di browser, dan di ekspor statis hanya isi `public/` yang bisa
> diambil browser. Lihat SPEC §3.1.

Dua penjagaan yang wajib ada:
- **Snapshot di bawah `minUkuranByte` ditolak.** Snapshot kosong lebih buruk daripada
  tidak ada snapshot — ia menutupi kematian sumber, bukan menyelamatkannya.
- **Wajib ada dasar hak salin.** API `mirror: true` tidak lolos validasi kalau
  `provenance.kebijakanMirror` masih `unknown`. Menyalin data orang tanpa tahu haknya
  tidak boleh — lihat [`NOTICE.md`](./NOTICE.md).

Penyegaran dijalankan **di dalam workflow deploy** (`pages.yml`), tiap push dan tiap
6 jam lewat `schedule`. Rancangan awal memakai workflow terpisah yang commit balik ke
repo; itu dibatalkan karena menuntut izin tulis + hak melewati CI bagi bot. Lihat
SPEC §3.1. Snapshot di git adalah benih untuk pengembangan lokal, bukan yang dilayani
produksi.

**Kriteria selesai:** TERPENUHI — `npm run mirror` menghasilkan `public/mirror/jpl-ssd.json`
dan `public/mirror/wilayah-idn-area.json`. Diuji oleh `scripts/tes-mirror.ts`.

---

### T5.4 — `client.ts` lapis 3 — SELESAI 2026-08-20
**Blocked by:** T5.3

Kalau lapis 1 gagal (dan lapis 2 belum ada), jatuh ke `public/mirror/<slug>.json`.
Kembalikan `sumber: 'mirror'` + `per: '<tanggal>'`. UI **wajib** nampilin banner
"Data per <tanggal> — sumber aslinya sedang bermasalah".

**Kriteria selesai:** TERPENUHI — alat Objek Dekat Bumi berjalan **sepenuhnya** dari mirror
di browser, karena `jpl-ssd` tanpa CORS.
Yang **belum diuji**: paksa `baseUrl` alat Wilayah ke host mati, pastikan ia jatuh ke
mirror dan banner muncul. Kerjakan ini sebelum menganggap lapis 3 tuntas.

---

### T5.5 — Alat gelombang dua yang butuh proxy
**Blocked by:** T5.4

Riset endpoint aslinya dulu (SPEC §7 — jangan pakai path yang sudah tercatat gugur), verifikasi
hidup + JSON, baru bikin YAML dan alatnya. Kandidat: Kode Pos, RS Rujukan.

> Kode Pos ternyata **tidak** butuh proxy — `kodepos.vercel.app` CORS terbuka, jadi sudah
> dijadwalkan sebagai T2.11. Yang sungguh butuh proxy tinggal API `cors: none` yang
> berparameter.

**Kriteria selesai:** minimal 1 alat baru live, lewat proxy, dan `ok: true` di probe.

---

# TAHAP 6 — Sync & kontributor

Target akhir tahap: project bisa tumbuh tanpa kamu jadi satu-satunya yang ngerjain.

---

### T6.1 — `scripts/sync-upstream.ts`
**Blocked by:** T5.5

Tarik 20 file `data/<kategori>/id.json` dari repo farizdotid, bandingkan dengan registry
lewat field `upstreamName`. Laporkan: API baru di upstream yang belum ada di registry,
dan API di registry yang sudah hilang dari upstream.

**Kriteria selesai:** `npm run sync` melaporkan ~146 API upstream yang belum punya entry registry.

---

### T6.2 — Workflow sync + auto-issue
**Blocked by:** T6.1

`.github/workflows/sync.yml` — mingguan. Kalau ada API baru, buka GitHub issue berisi
template YAML yang tinggal diisi `baseUrl` + `endpoints`. Ini sekalian pintu masuk kontributor.
Jangan bikin issue duplikat.

**Kriteria selesai:** picu manual → issue kebuka dengan template yang benar. Picu lagi → **tidak** ada duplikat.

---

### T6.3 — Dokumentasi & atribusi
**Blocked by:** T6.2

- `README.md` — apa ini, kenapa ada (pakai bukti dari SPEC §2), cara jalanin, cara kontribusi
- `CONTRIBUTING.md` — cara nambah API (1 file YAML) dan cara nambah alat (1 folder), lengkap dengan contoh
- **Atribusi CC-BY-4.0** ke farizdotid di README **dan** footer situs — kewajiban lisensi
- `LICENSE` — pilih lisensi kode (MIT wajar); catat bahwa data turunan tunduk pada CC-BY-4.0
- Template issue buat lapor API mati

**Kriteria selesai:** orang lain bisa nambah satu API cuma dengan baca `CONTRIBUTING.md`, tanpa nanya.

---

# TAHAP 7 — Ekspansi registry ke 151 API

Target akhir tahap: **semua 151 API upstream masuk katalog developer** dengan status jujur,
dan setiap API yang terbukti hidup punya YAML lengkap yang bisa dipanggil.

> Semua task di tahap ini berpatokan pada **[`BACKLOG-API.md`](./BACKLOG-API.md)** —
> inventaris lengkap 151 API yang sudah diprobe dan dikelompokkan per tier.
> Baca bagian "Cara baca tingkatan" di sana dulu.

Ringkasan tier (hasil probe 2026-08-06):

| Tier | Jumlah | Artinya |
|---|---|---|
| A | 20 | Endpoint terverifikasi, data asli sudah keluar |
| B | **0** | **Tuntas** — kedua entry ternyata mati, sudah dipindah ke tier D |
| C | 39 | Host hidup tapi balas HTML — perlu riset manual |
| D | 42 | Mati / tidak terjangkau |
| E | 50 | Butuh API key / OAuth — sudah diriset, 48 dokumentasi hidup |

> **Otomatisasi sudah mentok di tier C.** Tiga gelombang riset otomatis (ekstraksi URL
> dari README, scraping halaman repo, tebak nama deployment di 9 platform, silang host ×
> path) menurunkan tier C dari 49 → 39. Gelombang terakhir cuma menghasilkan 3 temuan baru
> dari 43 percobaan.
>
> Sisa 39 itu **sudah diuji dan host-nya memang hidup** — 36 dari 37 yang dicek membalas 2xx.
> Jadi masalahnya bukan API-nya mati, melainkan path-nya tidak bisa ditebak mesin.
> **Sisanya harus dibaca manusia**: buka README dan halaman dokumentasinya satu per satu.
> Jangan buang waktu menulis pengais otomatis keempat.

**Urutan pengerjaan sengaja dibalik dari yang biasa**: tier D dan E dikerjakan **duluan**
meski keliatan paling ga menarik. Alasannya, keduanya cuma butuh metadata (ga perlu riset
endpoint sama sekali), tapi langsung bikin katalog developer terisi 88 dari 151 API.
Nilai terbesar per jam kerja ada di situ.

---

### T7.1 — Perluas skema registry untuk API tanpa endpoint
**Blocked by:** T6.3

Tier D dan E ga punya endpoint yang bisa dipanggil, tapi tetap harus masuk katalog.
Skema sekarang mewajibkan `endpoints` minimal 1 (SPEC §5) — itu menghalangi.

Ubah `registry/schema.ts`:
- `baseUrl` jadi opsional
- `endpoints` boleh kosong **hanya jika** `statusManual` terisi
- Tambah `statusManual: z.enum(['mati', 'perlu-auth', 'perlu-riset']).optional()`
- Tambah `catatan: z.string().optional()` — alasan, misal "402 Payment Required per 2026-08-06"

`probe.ts` **wajib melewati** entry yang `endpoints`-nya kosong — jangan sampai error.
Muka developer nampilin entry ini dengan badge yang sesuai, bukan sebagai "sedang bermasalah".

**Kriteria selesai:** YAML tanpa `endpoints` tapi ber-`statusManual` lolos validasi.
`npm run probe` jalan normal tanpa error dengan entry semacam itu di registry.

---

### T7.2 — Impor tier D: 38 API mati
**Blocked by:** T7.1

Semua entry tier D di `BACKLOG-API.md` (bagian "Tier D" dan "Tier D2") → YAML dengan
`statusManual: mati` dan `catatan` berisi alasan persisnya dari kolom "Catatan probe".

Jangan dites ulang. Sudah diprobe 2026-08-06.

**Kriteria selesai:** 38 YAML baru, semua lolos validasi, muncul di `/dev` dengan badge "mati".

---

### T7.3 — Impor tier E: 50 API berbayar/berkunci
**Blocked by:** T7.1

Semua entry tier E → YAML dengan `auth: apikey` atau `oauth` (sesuai kolom Auth di backlog)
dan `statusManual: perlu-auth`. Sertakan `dokumentasi` supaya orang tetap bisa baca caranya.

Ini bucket paling berharga buat developer yang lagi cari solusi berbayar: 20 di antaranya
kategori Finansial (payment gateway), 6 Jasa Pengiriman, 5 E-Commerce.

**Tier E sudah diriset terpisah (2026-08-07).** Kolom catatan di backlog sudah memuat
status dokumentasi, metode autentikasi yang terdeteksi, dan ada-tidaknya sandbox/free tier.
Salin ke field `catatan` di YAML.

Hasil risetnya:
- **48 dari 50 dokumentasi masih hidup** — wajar, ini layanan komersial, bukan project hobi
- Yang bermasalah cuma 2: **Cek Resi binderbyte** (dokumentasi balas 500) dan
  **Dana Enterprise** (host tidak bisa dijangkau). J&T dan TokoCrypto sempat kelihatan mati
  tapi ternyata cuma gangguan sesaat — sudah diuji ulang dan keduanya hidup.
- Metode auth terdeteksi di 23 dari 46 halaman. **Kosong berarti belum diketahui, bukan
  berarti tidak ada** — banyak dokumentasi berupa SPA yang isinya dirender JavaScript.

**`baseUrl` untuk tier E dikosongkan dan itu disengaja.** Ekstraksi otomatis menghasilkan
mayoritas nilai salah (`api.w.org` yang sebenarnya WordPress REST API, `rapidapi.com`,
atau host dokumentasinya sendiri) — hanya 2 dari 7 yang lolos saringan ketat ternyata benar.
Kalau mau mengisinya, **baca dokumentasinya satu per satu**. Jangan tebak.

**Kriteria selesai:** 50 YAML baru dengan `catatan` terisi dari backlog.
Filter `auth: apikey` di `/dev` nampilin semuanya. Tombol Kirim di playground
**nonaktif** untuk entry ini, dengan keterangan kenapa.

---

### T7.4 — Impor tier A: sisa API terverifikasi — SELESAI 2026-08-21
**Blocked by:** — (dikerjakan tanpa T7.1; lihat catatan)

Keempat belas API sisa di [`REGISTRY-SEED.md`](./REGISTRY-SEED.md) disalin ke registry.
Totalnya kini **23 API / 54 endpoint**, dan `npm run probe` melaporkan **54 ok, 0 gagal**.

> **T7.1 dilewati dengan sengaja.** Task itu meminta skema diperluas supaya bisa memuat API
> tanpa endpoint (tier D dan E). Yang dikerjakan di sini hanya tier A — API yang endpointnya
> sudah terverifikasi — jadi skema sekarang sudah cukup. Memperluas skema dulu berarti
> menambah kerumitan untuk sesuatu yang belum dipakai.

**Empat koreksi terhadap seed**, semuanya dari probe hari ini, bukan dari dokumen:

1. **`harga-emas` ternyata punya CORS terbuka.** Seed dan UI-SPEC menandainya "TANPA CORS —
   tunggu proxy". Kenyataannya `logam-mulia-api.iamutaki.workers.dev` membalas
   `Access-Control-Allow-Origin: *`, diuji dua kali termasuk dengan header `Origin`.
   Jadi Harga Emas **tidak** perlu menunggu proxy — ia bisa jadi alat kapan saja.
2. **`dua-dhikr/bahasa` ambangnya salah, bukan API-nya mati.** `minUkuranByte: 120` padahal
   responsnya 112 B. Probe melaporkan gagal, padahal endpointnya sehat. Ambangnya diturunkan
   ke 90.
3. **`doa-doa` tidak bisa diverifikasi lisensinya sama sekali** — repo sumbernya sudah 404 di
   GitHub. APInya masih hidup, tapi ini tercatat sebagai `unknown` yang benar-benar tidak
   diketahui, bukan yang belum diperiksa.
4. **`sekolah-indonesia` sesekali 504 lalu berhasil pada percobaan berikutnya** — kemungkinan
   cold start. Dicatat di deskripsi endpointnya supaya kegagalan sesaat tidak disimpulkan
   sebagai mati.

Empat belas provenance diisi dengan lisensi yang dibaca dari API GitHub hari ini: 8 MIT,
1 GPL-3.0, dan 5 `unknown` karena repo sumbernya tanpa berkas lisensi. **Tidak satu pun
mirror diaktifkan** — yang lisensinya boleh ternyata endpointnya berparameter atau datanya
berubah cepat, jadi tidak ada yang punya dasar dan kegunaan sekaligus.

Field `cors` di seluruh 23 API sudah dicocokkan dengan hasil ukur: 18 terbuka, 5 tanpa CORS,
tidak ada selisih.

**Kriteria selesai:** TERPENUHI — 23 entry, semuanya `ok: true` di `npm run probe`, dan
masing-masing punya halaman playground sendiri di `/dev/api/<slug>`.

---

### T7.5 — Tier B: SUDAH TUNTAS, tidak ada API yang perlu diriset
**Blocked by:** T7.4

Tier B habis. Riset 2026-08-07 memastikan ketiga kandidat yang menggantung ternyata mati,
dan semuanya sudah dipindah ke tier D beserta alasannya di `BACKLOG-API.md`:

| API | Sebab |
|---|---|
| The Lazy Media API | Scraper mati. `/api/games` balas `[]`, `/api/detail/...` balas objek dengan semua field kosong |
| Data COVID-19 Indonesia | Semua endpoint data balas **504 FUNCTION_INVOCATION_TIMEOUT**. Cuma root `/api` hidup karena respons statis |
| Masak Apa | Scraper mati. `/api/search/?q=` balas 200 dengan `results: []` |

**Yang perlu dikerjakan di task ini cuma satu:** pastikan `probe.ts` (T3.1) memakai
**syarat ke-5** — ambang `minUkuranByte`. Ketiga API di atas **lolos** syarat 1–4
(status 200, JSON sah, tidak kosong di tingkat akar) dan bakal dilaporkan sehat tanpa
ambang ukuran. Ini mode kematian paling licin di seluruh katalog: deployment hidup,
framework membalas normal, tapi scraper di dalamnya sudah rusak.

**Kriteria selesai:** daftarkan sementara `https://the-lazy-media-api.vercel.app/api/games?page=1`
sebagai endpoint uji dengan `minUkuranByte: 500`, jalankan `npm run probe`, pastikan
hasilnya `ok: false` **karena ambang ukuran** (bukan karena sebab lain).
Hapus entry ujinya setelah lolos.

---

### T7.6 — Riset tier C, gelombang 1: kategori bernilai tinggi
**Blocked by:** T7.5

39 entry tier C perlu riset manual — **baca README-nya, jangan diotomatiskan lagi**
(alasannya di ringkasan tier di atas). Kerjakan yang dampaknya paling besar dulu —
kategori yang berguna buat orang awam, bukan yang jumlahnya paling banyak:

| Kategori | Jumlah | Kenapa didahulukan |
|---|---|---|
| Pendidikan | 6 | KBBI, data sekolah — kepake orang banyak |
| Agama Islam | 5 | Trafik tinggi di Indonesia |
| Utilitas | 4 | Daftar bank, terjemahan |
| Lokasi | 2 | Stasiun KA, GeoJSON — fondasi buat alat lain |

Untuk tiap entry: buka repo → cari base URL API yang sebenarnya (bukan situs demo) →
probe dengan validasi Content-Type + isi (SPEC §9) → kalau hidup bikin YAML,
kalau mati pindahkan ke tier D dengan catatan.

> PENTING — Kolom kandidat di tier C **jangan dipercaya mentah-mentah** — URL-nya diekstrak otomatis
> dari README, kadang yang kejaring malah link donasi atau spanduk.

**Kriteria selesai:** 17 entry keempat kategori itu tuntas — masing-masing berakhir sebagai
YAML hidup atau entry tier D bercatatan. Ga boleh ada yang menggantung.
`BACKLOG-API.md` diperbarui sesuai temuan.

> Cara yang terbukti manjur waktu riset gelombang pertama, pakai ini daripada menebak URL:
> **scrape halaman repo GitHub (HTML, bukan API — jadi tanpa rate limit)** untuk mengambil
> link homepage, lalu tebak nama deployment dari nama repo (`{repo}.vercel.app`,
> `{repo}-api.vercel.app`, `api-{repo}.vercel.app`), lalu coba path umum di tiap host hidup.
> Cara ini yang menemukan Berita Indo, Doa Harian, dan Anitop.
>
> Hati-hati: scraping halaman GitHub ikut menjaring link footer (`githubstatus.com`
> sempat lolos sebagai "API hidup"). Saring domain GitHub dan media sosial dengan keras.

---

### T7.7 — Riset tier C, gelombang 2: sisanya
**Blocked by:** T7.6

26 entry sisa: Hiburan (10), Berita (3), Sosial Media (3), Cuaca (2), Finansial (2),
Kesehatan (2), Serba Guna (2), Kripto (1), Pemerintahan (1).

**Perhatikan SPEC §13:** API unofficial/scraper (LK21, Filmapik, dan sejenisnya —
banyak yang ada di kategori Hiburan) **tidak boleh dijadikan alat di muka awam**
karena risiko hukumnya. Boleh masuk katalog developer.

**Kriteria selesai:** 26 entry tuntas dengan cara yang sama. Setelah task ini,
**seluruh 151 API sudah punya entry registry** dengan status yang jujur.

---

### T7.8 — Alat gelombang tiga dari hasil riset
**Blocked by:** T7.7

Dari semua API yang terbukti hidup di T7.4–T7.7, pilih yang paling berguna buat orang awam
dan bikin alatnya. Kandidat kuat berdasarkan yang sudah terverifikasi:

- **Kode Pos** (tier A, CORS terbuka — tidak butuh proxy) — dijadwalkan di T2.11, pastikan tuntas
- **Harga Emas** (tier B) — hosting di Cloudflare Workers, kecil kemungkinan mati
- **Data Sekolah Indonesia** (tier B)
- **Lambang Daerah** (tier A) — pelengkap visual buat alat Data Wilayah
- **Kunci Jawaban TTS** (tier A) — ringan tapi ramai peminat

**Libur Nasional** tetap harus di-mirror manual dari SKB 3 Menteri — sumber aslinya
(`dayoffapi`) mati 402 dan **tidak ada penggantinya di seluruh 151 API**. Ini contoh
paling jelas kenapa lapisan mirror ada.

**Kriteria selesai:** minimal 3 alat baru live di produksi, semuanya `ok: true` di probe.

---

### T7.9 — Kontribusi balik ke upstream
**Blocked by:** T7.8

Sekarang kita punya sesuatu yang upstream ga punya: data terverifikasi tentang API mana
yang beneran hidup. Kembalikan.

- Buka issue di `farizdotid/DAFTAR-API-LOKAL-INDONESIA` berisi daftar API yang terbukti mati
  beserta buktinya (status code, tanggal probe), supaya `status` mereka bisa dikoreksi
- Tawarkan `status.json` kita sebagai sumber data buat mereka
- Sopan dan tidak menggurui — repo mereka yang bikin project ini mungkin ada

**Kriteria selesai:** issue terkirim, isinya bisa diverifikasi ulang orang lain secara mandiri.

---

# Setelahnya (belum dijadwalkan)

- i18n ID/EN — upstream punya `en.json` untuk tiap kategori, bisa dipakai
- Paket npm `@pusaka/registry` yang mengekspor registry + tipe TypeScript
- Terima API di luar daftar upstream (`upstreamName: null`), seperti yang sudah kita lakukan
  untuk myQuran, equran.id, dan api.bmkg.go.id
