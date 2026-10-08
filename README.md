<div align="center">

# Pusaka

**Alat harian dari data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca —
plus katalog API publik — berawal dari daftar lokal Indonesia — yang statusnya dipantau otomatis.**

[![Deploy](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/pages.yml)
[![CI](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml/badge.svg)](https://github.com/Fachryxyf/pusaka/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Katalog: CC BY 4.0](https://img.shields.io/badge/katalog-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%2B%20TypeScript%20%2B%20Tailwind%204-black.svg)](#struktur)
[![API terdaftar](https://img.shields.io/badge/API%20terdaftar-251-informational.svg)](./registry/apis)
[![Alat](https://img.shields.io/badge/alat-16-informational.svg)](./alat)
[![Tahap](https://img.shields.io/badge/tahap-6%20dari%207-yellow.svg)](./TASKS.md)
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
| 251 API terdaftar | ada 251 berkas di `registry/apis/`, semuanya pernah dipanggil sungguhan dan lolos validasi skema |
| 388 endpoint | diprobe tiap 6 jam; angka live ada di [dashboard status](https://pusaka.fachryxyf.com/dev/status/). Kegagalan berulang yang diketahui: kodepos vanmason (hulu membalas HTML) dan tiga API tebak-nama (agify/genderize/nationalize, batas 100/hari — di produksi tiap pengunjung punya kuota IP sendiri) |
| 16 alat | jumlah yang benar-benar bisa dipakai orang awam, bukan jumlah API |
| 151 API di backlog | inventaris upstream, bertingkat menurut kesiapan di [`BACKLOG-API.md`](./BACKLOG-API.md) |
| Gelombang riset | tanggal dan isi tiap gelombang ada di tabel bawah |

### Gelombang riset

| Tanggal | Isi |
|---|---|
| 6 Agu 2026 | Katalog awal |
| 20 Agu 2026 | NASA/JPL, batas paginasi idn-area, seluruh data lisensi |
| 21 Agu 2026 | Batas permintaan myQuran, zona waktu BMKG, tag equran.id, batas kodepos, probe ulang berita–emas–sekolah |
| 7 Okt 2026 | 9 batch API global dari public-apis (rincian per batch di REFERENCE.md) |
| 8 Okt 2026 | Sapu total: 7 Tier C Indonesia + 125 public-apis (sains, cuaca, game, geo, finansial, dev); Tier D/E dan ratusan gugur tercatat di REFERENCE.md |

**Status hidup/mati sekarang punya stempel waktu.** Sejak Tahap 3, seluruh 388 endpoint
diprobe tiap 6 jam langsung ke alamat aslinya, dan hasilnya terbuka:

- Dashboard: [pusaka.fachryxyf.com/dev/status](https://pusaka.fachryxyf.com/dev/status/)
- Machine-readable: [`status.json`](https://pusaka.fachryxyf.com/status.json) — riwayat
  rolling 45 hari, CORS terbuka

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
| [Data Sekolah](https://pusaka.fachryxyf.com/alat/sekolah/) | api-sekolah-indonesia | 215 ribu sekolah, dicari lewat nama atau NPSN |
| [Konversi Kurs](https://pusaka.fachryxyf.com/alat/kurs/) | Frankfurter / ECB | konversi antar mata uang, kurs referensi harian Bank Sentral Eropa |
| [Hari Libur Nasional](https://pusaka.fachryxyf.com/alat/hari-libur/) | Nager.Date | hari libur Indonesia per tahun, dengan nama lokal |
| [Harga Kripto](https://pusaka.fachryxyf.com/alat/kripto/) | CoinGecko | 20 kripto teratas dalam Rupiah, perubahan 24 jam |
| [Cari Alamat](https://pusaka.fachryxyf.com/alat/alamat/) | Nominatim / OpenStreetMap | ubah nama tempat jadi koordinat lintang-bujur, ambil hanya saat tombol ditekan |
| [Tarik Kartu Remi](https://pusaka.fachryxyf.com/alat/kartu/) | Deck of Cards API | kocok dek lalu tarik 1–10 kartu acak lengkap dengan gambarnya |
| [Terjemahan](https://pusaka.fachryxyf.com/alat/terjemahan/) | MyMemory | terjemahkan teks antar bahasa (Inggris, Arab, Jepang, Mandarin ↔ Indonesia) |

**Tahap 1 sampai 5 tuntas; tahap 6 berjalan** (badge di atas). Yang tersisa di [`TASKS.md`](./TASKS.md): sinkronisasi otomatis
dengan katalog upstream (Tahap 6) dan riset 39 API tier C yang path-nya belum ketemu (Tahap 7).

## Yang sengaja tidak dikerjakan

Dua hal ditutup dengan sadar, bukan tertunda:

**Lapisan proxy.** Situs ini diekspor statis ke GitHub Pages, dan hostingnya tidak dipindah.
Tanpa sisi server, proxy tidak mungkin. Akibatnya: lima API `cors: none` di registry tetap
terdaftar dan tetap diprobe, tapi endpoint **berparameter** pada API itu tidak bisa jadi alat
awam — Kunci TTS, Lambang Daerah, dan Kode Pos vanmason tinggal di katalog developer dengan
salinan `curl`. Yang **tanpa** parameter tetap bisa jadi alat lewat mirror; itu yang membuat
alat Objek Dekat Bumi berdiri sepenuhnya di atas snapshot.

**Alat dari API yang lisensinya `unknown`.** Doa Harian sudah terverifikasi hidup dan CORS-nya
terbuka, tapi repo sumbernya sudah 404 di GitHub sehingga lisensinya tidak bisa diperiksa.
Ketersediaan bukan izin — lihat [`NOTICE.md`](./NOTICE.md).

## Untuk developer

Katalog aslinya tidak punya field base URL maupun endpoint sama sekali, jadi datanya tidak
bisa dipanggil program. Lapisan itu yang ditambahkan di sini:

| Halaman | Isinya |
|---|---|
| [`/dev`](https://pusaka.fachryxyf.com/dev/) | katalog dengan pencarian + filter kategori, autentikasi, dan status |
| [`/dev/api/<slug>`](https://pusaka.fachryxyf.com/dev/api/gempa-bmkg/) | dokumentasi tergenerate dari registry, hak pakai data, dan playground per endpoint |
| [`/dev/status`](https://pusaka.fachryxyf.com/dev/status/) | uptime 30 hari beserta jumlah cek, latency, riwayat per endpoint |
| [`/status.json`](https://pusaka.fachryxyf.com/status.json) | riwayat probe 45 hari, CORS terbuka |

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
| `public/status.json` | riwayat probe 45 hari; ini juga **penyimpanannya**, lihat `SPEC.md` §9 |
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

Yang terakhir itu bernilai lebih dari yang terlihat: **219 dari 251 API masih `unknown`**, dan
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

Sejak 7 Oktober 2026, katalog juga memuat API global hasil pemetaan dari direktori
[public-apis/public-apis](https://github.com/public-apis/public-apis) (MIT). Entri yang
diambil hanya yang bebas-auth dan terbukti bisa dipanggil, lalu tiap endpoint diprobe
sendiri sebelum masuk registry — nama API dan deskripsinya ditulis ulang, bukan disalin.

Data tiap alat milik penerbit aslinya masing-masing:

- BMKG — gempa & prakiraan cuaca
- NASA/JPL Solar System Dynamics (SSD-CNEOS) — objek dekat Bumi
- myQuran, equran.id — jadwal sholat & Al-Qur'an
- emsifa — data wilayah Indonesia
- Nager.Date — hari libur nasional (MIT)
- Frankfurter / Bank Sentral Eropa — kurs mata uang (MIT)
- Open-Meteo — cuaca global & geocoding (data CC BY 4.0)
- The World Bank — indikator pembangunan (CC BY 4.0)
- Open Library / Internet Archive — katalog buku (lisensi data belum dinyatakan tegas)
- CoinGecko — harga kripto (gratis dengan atribusi, tanpa lisensi data terbuka)
- Wikipedia bahasa Indonesia — ringkasan artikel (CC BY-SA 4.0)
- Sunrise-Sunset.org — waktu matahari (gratis, lisensi data tidak dinyatakan)
- TheMealDB — resep masakan (test key pengembangan, lisensi data tidak dinyatakan)
- PokeAPI — data Pokemon (kode BSD-3; data milik The Pokemon Company)
- Open Food Facts — produk makanan dari barcode (ODbL)
- ipapi.co — geolokasi IP (tier gratis, lisensi data tidak dinyatakan)
- TimeAPI.io — waktu & zona waktu (gratis, lisensi data tidak dinyatakan)
- Dog CEO — gambar anjing (data Stanford Dogs Dataset)
- Advice Slip & Nationalize.io — nasihat acak & tebak negara (gratis, lisensi tidak dinyatakan)
- Open-Meteo — elevasi/ketinggian tanah (CC BY 4.0, berbasis Copernicus DEM)
- Agify & Genderize — tebak umur & gender dari nama (gratis, lisensi tidak dinyatakan)
- Random User Generator — data orang fiktif (bebas dipakai)
- Rick and Morty API — data serial (kekayaan intelektual pembuatnya)
- TVmaze — data acara TV (CC BY-SA 4.0)
- Free Dictionary API — kamus Inggris (definisi dari Wiktionary, CC BY-SA)
- Datamuse — pencari kata (gratis, lisensi tidak dinyatakan)
- Spaceflight News API (The Space Devs) — berita antariksa (isi milik media penerbit)
- TheCocktailDB — resep minuman (test key pengembangan)
- Chuck Norris IO & JokeAPI (Sv443) — lelucon acak (gratis, lisensi tidak dinyatakan)
- Art Institute of Chicago & The Met — data koleksi seni (CC0)
- CoinPaprika — pasar kripto (tier gratis, lisensi data tidak dinyatakan)
- Cat Facts — fakta kucing (gratis, lisensi tidak dinyatakan)
- Wikipedia (On This Day) — peristiwa sejarah (CC BY-SA 4.0)
- MusicBrainz (MetaBrainz) — basis data musik (data inti CC0)
- Open-Meteo — gelombang laut & debit sungai/potensi banjir (CC BY 4.0)
- USGS — katalog gempa global (domain publik)
- WhereTheISS.at — posisi ISS (gratis, lisensi tidak dinyatakan)
- ipwho.is — geolokasi IP (tier gratis, lisensi tidak dinyatakan)
- GitHub — profil & repositori publik (tunduk Ketentuan Layanan GitHub)
- Nominatim / OpenStreetMap — geocoding alamat ke koordinat (data ODbL 1.0)
- Launch Library 2 (The Space Devs) — jadwal peluncuran roket (lisensi tidak dinyatakan)
- disease.sh — statistik COVID-19 global & per negara (gratis, lisensi tidak dinyatakan)
- Studio Ghibli API — data film Ghibli (gratis, lisensi tidak dinyatakan)
- TheCatAPI — gambar kucing acak (gratis, lisensi tidak dinyatakan)
- Open-Meteo — cuaca historis harian (CC BY 4.0, reanalisis ERA5)
- Nobel Prize Outreach — data hadiah & peraih Nobel (atribusi diminta, lisensi data tidak dinyatakan)
- Deck of Cards API — kartu remi acak (gratis, lisensi tidak dinyatakan)
- icanhazdadjoke (C653 Labs) — lelucon bapak (gratis, lisensi tidak dinyatakan)
- CountriesNow — daftar kota, bendera & ibu kota negara (gratis, lisensi tidak dinyatakan)
- FreeToGame — katalog game gratis (gratis, lisensi tidak dinyatakan)
- yesno.wtf — jawaban ya/tidak acak (gratis, lisensi tidak dinyatakan)
- DummyJSON — data palsu untuk pengujian (gratis, lisensi tidak dinyatakan)
- Fake Store API — produk e-commerce palsu untuk pengujian (gratis, lisensi tidak dinyatakan)
- Useless Facts — fakta iseng acak (gratis, lisensi tidak dinyatakan)
- genshin.jmp.blue — data karakter Genshin Impact (API komunitas; data milik HoYoverse)
- kanye.rest — kutipan Kanye West (gratis, lisensi tidak dinyatakan)
- Official Joke API (15Dkatz) — lelucon setup-punchline (gratis, lisensi tidak dinyatakan)
- JSONPlaceholder (Typicode) — data REST palsu untuk latihan (gratis, lisensi tidak dinyatakan)
- httpbin (Kenneth Reitz / Postman) — uji & pantul permintaan HTTP (gratis, lisensi tidak dinyatakan)
- ipify — alamat IP publik pemanggil (gratis, lisensi tidak dinyatakan)
- magicthegathering.io — kartu Magic The Gathering (data milik Wizards of the Coast)
- digi-api.com — data Digimon (data milik Bandai)
- SampleAPIs — menu kopi (gratis, lisensi tidak dinyatakan)
- swapi.tech — data Star Wars (data milik Lucasfilm/Disney)
- hp-api — data Harry Potter (data milik Warner Bros./J.K. Rowling)
- dnd5eapi.co — aturan dasar D&D 5e (konten SRD di bawah OGL 1.0a)
- YGOPRODeck — kartu Yu-Gi-Oh (data milik Konami)
- An API of Ice and Fire — data Game of Thrones (data milik George R. R. Martin/HBO)
- dragonball-api.com — data Dragon Ball (data milik Bird Studio/Shueisha/Toei)
- MyMemory (Translated) — terjemahan teks (memori terjemahan komunitas + mesin)
- The Color API — info & skema warna (gratis, lisensi tidak dinyatakan)
- Chess.com Published-Data API — profil & statistik catur (data milik Chess.com)
- TheSportsDB — klub & pemain olahraga (test key publik, lisensi tidak dinyatakan)
- valorant-api.com — aset game Valorant (data milik Riot Games)
- Jolpica-F1 (penerus Ergast) — data Formula 1 (lisensi tidak dinyatakan)
- OpenDota — data hero Dota 2 (data milik Valve)
- The Trivia API — soal kuis trivia (gratis, lisensi tidak dinyatakan)
- PoetryDB — puisi klasik berbahasa Inggris (isi umumnya domain publik)
- Kitsu — data anime (gratis, lisensi tidak dinyatakan)
- finalspaceapi.com — data serial Final Space (data milik pemiliknya)
- dogapi.dog — fakta anjing acak (gratis, lisensi tidak dinyatakan)
- GBIF — data biodiversitas global (atribusi diminta; lisensi beragam per dataset)
- iNaturalist — data takson/spesies (lisensi beragam per penyumbang)
- Imgflip — templat meme populer (gratis, lisensi tidak dinyatakan)
- Meme API (D3vd) — meme acak dari Reddit (konten milik pengunggah)
- Lichess — profil catur publik (perangkat lunak AGPL-3.0; data profil milik Lichess)
- disneyapi.dev — tokoh Disney (data milik The Walt Disney Company)
- NASA Image and Video Library — galeri gambar antariksa (mayoritas bebas hak cipta)
- CheapShark — diskon & harga game PC (gratis, lisensi tidak dinyatakan)
- pokemontcg.io — kartu Pokémon TCG (data milik The Pokémon Company/Nintendo)
- demonslayer-api.com — tokoh Demon Slayer (data milik Koyoharu Gotouge/Ufotable)
- SampleAPIs — katalog game Nintendo Switch (gratis, lisensi tidak dinyatakan)
- Scryfall — kartu Magic The Gathering (data kartu milik Wizards of the Coast)
- Katanime (Ricko V), Doa Fly (Ahmad Ramadhan), Hibersunda (Hiberin), Nusantara (Clowdlab), Lakuapik, KBBI (raf555), Puasa Granite — riset Tier C Indonesia
- OpenAlex, Europe PMC, DataCite, MyGene, RCSB PDB, ITIS, INSPIRE-HEP, OSF, USGS Water, Newton, Botlero — sains & riset
- NWS, RainViewer, NASA POWER, IPMA, NOAA Aviation, HKO, Open-Meteo Ensemble — cuaca dunia
- Radio Browser, Bacon Ipsum, Genrenator, ISRO, UUID, Open5e, RacingHub, OpenF1, OpenLigaDB, NHL — direktori & olahraga
- PlayerDB, mcsrvstat, GamerPower, FFXIV Collect, MMOBomb, L2Calendar, MHW-DB, RuneScape Wiki, TETR.IO, TCGdex, GW2, Universalis, GZW, Digimon Vercel — data game
- Geek jokes, Lucifer, Stranger Things, ThronesAPI, Stromberg, Memesio, PotterDB, SwarmMemo, Nekos.best — hiburan
- NoPunt, CalDays (CC BY 4.0), GOV.UK, NHTSA, Wheelwise — olahraga, kalender, kendaraan
- GeoJS, Postcodes.io, ViaCep, SearchPinCode, IBGE, PontoFato, adresse Etalab, BdAPIs, BrasilAPI, Moradas, HelloSalut, Postali, ipgeolocationapi — geo & kode pos dunia
- Fawaz currency, AwesomeAPI, Fulusly, VATComply, NBP Polandia, DefiLlama, CoinLore, Mempool, IFSC Razorpay, SEC EDGAR, mfapi.in, why21million, SoloLuck — finansial & kripto
- npm, Homebrew, RubyGems, NuGet, Open VSX, Hex, jsDelivr, DO Status, ReqRes, APIs.guru, crates.io — perkakas developer
- Guerrilla Mail, Mail.TM, SellersCalc, BirkinBagStock, AIDevBoard, FreeHire, CuratorSearch, AIJobs, Sampuli, AddressMock, Modelfax, OneFindMe, Postman Echo — utilitas & data
- FBI Wanted, Internet Archive, Quran Cloud, TensorFeed AI, HDX, Legal Georgia, SEC, Llama — arsip & referensi
- NVD, UK Police, 4chan, Hacker News, Bluesky, food recalls FDA/USDA, Racion, Open Brewery DB, Carbon Intensity — keamanan, sosial, pangan
