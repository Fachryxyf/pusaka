# TASKS — Pusaka

> **Baca [`SPEC.md`](./SPEC.md) sampai habis sebelum ngerjain task apa pun** —
> terutama **§12 "Jangan mengarang"**. Tanpa itu kamu bakal ngulang riset yang sudah
> selesai dan kemakan jebakan yang sudah ketemu.

## Peta dokumen

| Dokumen | Isinya | Kapan dibuka |
|---|---|---|
| [`SPEC.md`](./SPEC.md) | Kenapa project ini ada, arsitektur, kontrak data, aturan keras | Sekali di awal, lalu rujuk sesuai kebutuhan |
| **[`REFERENCE.md`](./REFERENCE.md)** | **Bentuk response asli tiap endpoint** — nama field, tipe, contoh nilai | **Tiap kali nulis kode yang menyentuh data API** |
| **[`REGISTRY-SEED.md`](./REGISTRY-SEED.md)** | **19 file YAML siap tempel**, 33 endpoint, sudah divalidasi | T1.4 dan T7.4 — salin, jangan tulis ulang |
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
9. **Tangani 429 (rate limit).** Minimal satu API punya rate limit ketat. Kalau dapat 429,
   tunggu lalu ulang sekali; jangan langsung vonis `ok: false`.
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

> Pemeriksaan yang sama sudah dijalankan terhadap `REGISTRY-SEED.md` — 18 API / 29 endpoint
> lolos semua. Jadi kalau tesmu menolak isi seed, tesnya yang keliru, bukan datanya.

Jalankan sebagai bagian dari `npm run build` (atau pre-build script) supaya YAML rusak
ga bisa lolos ke produksi.

**Kriteria selesai:** tes lewat. Sengaja rusakin satu YAML → build gagal dengan pesan yang menyebut nama file.

---

# TAHAP 2 — Muka awam, 6 alat

Target akhir tahap: situs live di Cloudflare Pages dengan 6 alat jalan.
**Sudah layak dibagikan ke publik sejak T2.8** — tiga alat sisanya menyusul di atasnya.

> Tampilan tiap alat sudah dispesifikasikan lengkap di [`UI-SPEC.md`](./UI-SPEC.md),
> termasuk pengikatan tiap elemen UI ke jalur field yang sungguh ada. Baca bagian
> alat yang bersangkutan **sebelum** menulis komponennya.

---

### T2.1 — `lib/client.ts` lapis 1
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

### T2.2 — `lib/useApi.ts`
**Blocked by:** T2.1

Hook client-side pembungkus `client.ts`:
```ts
const { data, loading, error, sumber, per } = useApi('gempa-bmkg', 'autogempa', params?)
```
`sumber` bernilai `'langsung' | 'proxy' | 'mirror'`. Untuk sekarang selalu `'langsung'`,
tapi **bentuk kembaliannya sudah harus final** supaya T5 ga perlu bongkar semua alat.

**Kriteria selesai:** dipakai di satu komponen percobaan, nampilin data + state loading & error.

---

### T2.3 — Layout + kerangka halaman utama
**Blocked by:** T2.2

- `app/layout.tsx` — header, footer (**wajib memuat atribusi CC-BY-4.0 ke farizdotid**, SPEC §13)
- `app/page.tsx` — grid kartu alat + kotak pencarian
- Daftar alat dibaca dari `alat/*/index.tsx` (metadata `judul`, `ikon`, `deskripsi`, `apiSlug`)
- Responsif, tema terang & gelap

**Kriteria selesai:** halaman utama nampilin kartu alat (boleh kosong dulu), footer ada atribusinya, rapi di layar HP.

---

### T2.4 — Kerangka halaman alat
**Blocked by:** T2.3

`app/alat/[slug]/page.tsx` — merakit alat otomatis dari folder `alat/<slug>/`.
Sertakan `generateStaticParams` dan `generateMetadata` (judul + deskripsi per alat, buat SEO).
Slug tidak dikenal → `notFound()`.

**Kriteria selesai:** `/alat/apapun` yang ga ada → 404. Yang ada → me-render komponennya.

---

### T2.5 — Alat: Info Gempa
**Blocked by:** T2.4

`alat/gempa/index.tsx`. Nampilin gempa terkini (magnitudo, wilayah, waktu, kedalaman),
peta shakemap kalau ada, dan daftar gempa dirasakan.

Ingat SPEC §6.1: `autogempa` itu **objek**, `terkini`/`dirasakan` itu **array**.

**Kriteria selesai:** angka yang tampil **sama persis** dengan isi
`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` saat itu.

---

### T2.6 — Alat: Data Wilayah Indonesia
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

**Kriteria selesai:** Jawa Barat → Kabupaten Bandung → Pangalengan → Warnasari bisa dipilih
sampai tuntas dan menghasilkan `32.04.15.2003`. Jumlah item tiap tingkat sama dengan
`meta.pagination.total` (buktikan tidak ada yang terpotong karena paginasi).

---

### T2.7 — Alat: Jadwal Sholat
**Blocked by:** T2.6

`alat/sholat/index.tsx`. Pilih kota (dari `/sholat/kota/semua`, kasih pencarian — daftarnya panjang),
tampilkan jadwal hari ini, dan tandai waktu sholat berikutnya.

Ingat SPEC §6.3: bulan & tanggal **dua digit**.

**Kriteria selesai:** pilih KOTA JAKARTA (id `1301`) → jadwal cocok dengan
`https://api.myquran.com/v2/sholat/jadwal/1301/{tahun}/{bulan}/{tanggal}`.
Tanggal satu digit (mis. 6 Agustus) tetap benar — ini kasus uji yang gampang bocor.

---

### T2.8 — Deploy ke Cloudflare Pages
**Blocked by:** T2.7

Ikuti SPEC §3 — **Cloudflare, bukan Vercel**, dan alasannya ada di SPEC §2.

- Pasang `@cloudflare/next-on-pages`, sesuaikan build command
- Sambungkan repo GitHub, aktifkan deploy otomatis dari `main`
- Cek situs produksinya di HP

**Kriteria selesai:** situs live di URL publik, ketiga alat jalan di produksi (bukan cuma lokal).

---

### T2.9 — Alat: Prakiraan Cuaca
**Blocked by:** T2.8

`alat/cuaca/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 4.

Pemilih lokasi memakai komponen yang sama dengan alat Wilayah — jangan ditulis dua kali.
Kode `adm4` dipakai **apa adanya** dari `wilayah-idn-area`, tanpa konversi.

Dua hal yang paling gampang salah:
- Butir prakiraan ada di **array bersarang dua tingkat**: `data[0].cuaca[hari][jam]`.
- Pakai `.local_datetime`, **bukan** `.datetime` atau `.utc_datetime` — keduanya UTC
  dan bikin prakiraan bergeser 7 jam.

**Kriteria selesai:** memilih Warnasari, Pangalengan menampilkan prakiraan 3 hari dengan
jam lokal yang benar, cocok dengan `api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.04.15.2003`.

---

### T2.10 — Alat: Al-Qur'an
**Blocked by:** T2.8

`alat/quran/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 5.

Perhatikan: kunci audio berupa string berangka `"01"`–`"06"` (akses `audio["05"]`,
bukan `audio[5]`), dan `data.deskripsi` mengandung tag HTML yang **wajib disanitasi**.

**Kriteria selesai:** 114 surat tampil, Al-Fatihah menampilkan 7 ayat lengkap
(Arab + latin + terjemahan), audio bisa diputar.

---

### T2.11 — Alat: Kode Pos
**Blocked by:** T2.8

`alat/kodepos/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 6.

**Pakai `kodepos-sooluh`** (`kodepos.vercel.app`) — CORS terbuka, jadi alat ini
**tidak perlu menunggu proxy**. Jangan pakai `kodepos-vanmason` yang tanpa CORS.

Jebakan penamaan: `code` di akar response adalah status (`"OK"`), `code` di dalam `data`
adalah kode posnya. Jangan tertukar.

**Kriteria selesai:** mencari "danasari" mengembalikan beberapa hasil dengan kode pos benar,
dan tombol deteksi lokasi mengembalikan satu hasil (termasuk penanganan izin ditolak).

---

### T2.12 — Alat: Berita
**Blocked by:** T2.8

`alat/berita/index.tsx`. Spesifikasi lengkap: [`UI-SPEC.md`](./UI-SPEC.md) Alat 7.

Pakai `berita-indo` (`berita-indo-api.vercel.app`) — CORS terbuka, **tidak perlu proxy**.
14 media nasional, 100 berita per sumber.

Dua hal yang gampang salah:
- **`antara-news` disebut di root API tapi membalas 404.** Jangan masukkan ke pilihan sumber.
- `data[].isoDate` berakhiran `Z` (UTC) — wajib dikonversi ke waktu lokal pembaca.

Response ~64 KB per sumber → cache agresif, jangan panggil ulang tiap render.

**Kriteria selesai:** memilih CNN Indonesia menampilkan 100 berita dengan gambar dan waktu
lokal yang benar, dan pemilih rubrik bekerja.

---

# TAHAP 3 — Probe & status

Target akhir tahap: status hidup/mati semua API terpantau otomatis dan terbuka untuk publik.

---

### T3.1 — `scripts/probe.ts`
**Blocked by:** T2.8

Ikuti **SPEC §9 dengan teliti**, terutama syarat `ok`.

> Syarat `ok` ada **lima**: status < 400 **dan** Content-Type JSON **dan** body ter-parse
> **dan** body tidak kosong **dan** ukuran >= `minUkuranByte`. Probe versi awal kemakan
> jebakan Bukuacak (200 + CORS `*` tapi isinya HTML) — jangan diulang. Syarat kelima
> ditambahkan belakangan karena empat syarat pertama terbukti bocor: tiga API di katalog
> membalas bungkus JSON normal dengan isi kosong dan lolos semuanya.

Baca registry → panggil `baseUrl + contohPath` tiap endpoint → tulis `data/health/<slug>.json`
(append, rolling 90 hari). Isi ulang juga field `cors` berdasarkan header asli.

**Kriteria selesai:** `npm run probe` menulis `data/health/*.json` untuk kelima API,
kelimanya `ok: true`. Tambahkan YAML palsu yang nunjuk ke `bukuacak.vercel.app/api/v1/book`
→ hasilnya **harus** `ok: false`. Hapus lagi YAML palsunya setelah lolos.

---

### T3.2 — Workflow probe
**Blocked by:** T3.1

`.github/workflows/probe.yml` — cron tiap 6 jam + `workflow_dispatch`.
Jalankan probe, commit `data/health/` balik ke repo. **Jangan lebih sering dari 6 jam** (SPEC §9).

**Kriteria selesai:** picu manual lewat `workflow_dispatch` → muncul commit berisi perubahan `data/health/`.

---

### T3.3 — Dashboard status + `status.json`
**Blocked by:** T3.2

- `app/dev/status/page.tsx` — tabel semua API: status sekarang, uptime 30 hari, latency rata-rata, riwayat batang
- `app/api/status/route.ts` — `status.json` publik, machine-readable, `Access-Control-Allow-Origin: *`
  (kita ga boleh bikin dosa yang sama seperti API yang kita pantau)

**Kriteria selesai:** `/dev/status` nampilin kelima API dengan riwayat asli.
`curl <situs>/api/status` balas JSON yang sah.

---

### T3.4 — Penanda status di muka awam
**Blocked by:** T3.3

Kartu alat yang API-nya lagi bermasalah dikasih penanda halus ("lagi bermasalah"),
dan halaman alatnya nampilin banner. **Jangan sembunyikan alatnya** — jujur lebih berguna daripada rapi.

**Kriteria selesai:** paksa satu API jadi `ok: false` di data health → penanda muncul di kartu dan halaman alat.

---

# TAHAP 4 — Muka developer

Target akhir tahap: lubang no. 3 (SPEC §2) tertutup — dataset jadi bisa dipanggil mesin, lengkap dengan playground.

---

### T4.1 — Katalog API
**Blocked by:** T3.4

`app/dev/page.tsx` — daftar semua API dari registry, dengan pencarian dan filter
(kategori, auth, status hidup/mati). Tampilkan badge status dari data health.

**Kriteria selesai:** cari "gempa" → ketemu. Filter `auth: none` → jalan. Tiap baris nge-link ke halaman detail.

---

### T4.2 — Halaman detail API
**Blocked by:** T4.1

`app/dev/api/[slug]/page.tsx` — dokumentasi **tergenerate dari registry**, jangan ditulis manual:
base URL, tiap endpoint + params + deskripsi, contoh response, link dokumentasi asli,
kredit developer, riwayat status.

**Kriteria selesai:** `/dev/api/gempa-bmkg` nampilin ketiga endpoint beserta paramsnya.

---

### T4.3 — Playground
**Blocked by:** T4.2

Di halaman detail: form params → tombol Kirim → tampilkan status, latency, dan response
ber-syntax-highlight. Plus tombol **Salin sebagai `curl`** dan **Salin sebagai `fetch`**.

Lewat `lib/client.ts` yang sama (jangan bikin jalur fetch kedua). Untuk API `cors: locked`/`none`,
tombol Kirim dinonaktifkan dulu sampai proxy jadi (T5.1) — kasih keterangan kenapa.

**Kriteria selesai:** kirim request ke `gempa-bmkg`/`autogempa` di browser → response asli tampil.
`curl` hasil salinan bisa ditempel ke terminal dan jalan.

---

# TAHAP 5 — Proxy & mirror

Target akhir tahap: alat tetap hidup walau API sumbernya mati. Ini fitur pembeda utama platform.

---

### T5.1 — Proxy
**Blocked by:** T4.3

`app/api/proxy/route.ts`, ikuti **SPEC §10**.

> **Allowlist itu wajib, bukan opsional.** Host yang boleh = kumpulan host `baseUrl` di registry.
> Selain itu → 403. Open proxy bakal dipakai orang buat abuse dan bikin Worker kita diblokir.

Cuma GET · rate limit per IP · cache minimal 5 menit · jangan teruskan `Cookie`/`Authorization`.

**Kriteria selesai:** proxy ke host yang terdaftar → berhasil.
Proxy ke `https://example.com` → **403**. Ini tes keamanan, wajib lolos.

---

### T5.2 — `client.ts` lapis 2
**Blocked by:** T5.1

Rutekan API `cors: locked`/`none` lewat proxy secara otomatis berdasarkan field `cors` di registry.
`sumber` jadi `'proxy'`. Aktifkan lagi tombol Kirim di playground untuk API tersebut.

**Kriteria selesai:** daftarkan satu API tanpa CORS → jalan dari browser lewat proxy tanpa error CORS di console.

---

### T5.3 — `scripts/mirror.ts` + workflow
**Blocked by:** T5.2

Untuk tiap API ber-`mirror: true`, ambil semua endpoint dan simpan ke `data/mirror/<slug>.json`
beserta stempel waktu. `.github/workflows/mirror.yml` — mingguan, commit balik.

Mulai dari `wilayah-emsifa` (SPEC §6.2) — datanya statis dan jadi fondasi alat lain.

**Kriteria selesai:** `npm run mirror` menghasilkan `data/mirror/wilayah-emsifa.json` yang isinya benar.

---

### T5.4 — `client.ts` lapis 3
**Blocked by:** T5.3

Kalau lapis 1 & 2 gagal, jatuh ke `data/mirror/<slug>.json`.
Kembalikan `sumber: 'mirror'` + `per: '<tanggal>'`. UI **wajib** nampilin banner
"Data per <tanggal> — sumber aslinya sedang bermasalah".

**Kriteria selesai:** putus jaringan (atau paksa `baseUrl` ke host mati) → alat Wilayah
**tetap jalan** pakai data mirror dan nampilin banner. Ini demo inti platform — pastikan mulus.

---

### T5.5 — Alat gelombang dua yang butuh proxy
**Blocked by:** T5.4

Riset endpoint aslinya dulu (SPEC §7 — jangan pakai path yang sudah tercatat gugur), verifikasi
hidup + JSON, baru bikin YAML dan alatnya. Kandidat: Kode Pos, RS Rujukan.

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

### T7.4 — Impor tier A: 16 API terverifikasi
**Blocked by:** T7.1

**13 sisanya sudah tersedia siap tempel di [`REGISTRY-SEED.md`](./REGISTRY-SEED.md)** —
salin, jangan tulis ulang. Yang lima sudah dipasang di T1.4.

Seed berisi 18 API / 29 endpoint, semuanya sudah lolos validasi skema termasuk
pemeriksaan kecocokan `{placeholder}` dengan `params`.

Yang **tanpa CORS** → set `cors: none`, wajib lewat proxy (sudah jadi di T5.1):
Kunci Jawaban TTS · Lambang Daerah · Harga Emas · Kode Pos (nbc.vanmason).

Dua catatan yang jangan dilewat:
- **Kode Pos ada dua versi.** Pakai `kodepos.vercel.app` (sooluh) — CORS `*` dan punya
  pencarian by koordinat. Yang `nbc.vanmason.web.id` tetap didaftarkan tapi jangan
  dipakai buat alat.
- **Quran API ID**: `/surah` dan `/surah/{n}` jalan, tapi `/juz/{n}` balas bukan-JSON.
  Daftarkan endpoint yang jalan saja.

**Kriteria selesai:** 16 entry, semua `ok: true` di `npm run probe`, semua bisa dipanggil dari playground.

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

- **Kode Pos** (tier A, lewat proxy) — sudah dijadwalkan di T5.5, pastikan tuntas
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
