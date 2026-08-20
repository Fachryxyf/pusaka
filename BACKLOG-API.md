# BACKLOG API — Pusaka

> Inventaris **seluruh 151 API** dari `farizdotid/DAFTAR-API-LOKAL-INDONESIA`,
> sudah diprobe otomatis dan dikelompokkan berdasarkan kesiapan.
> Dipakai bareng [`SPEC.md`](./SPEC.md) dan [`TASKS.md`](./TASKS.md) — lihat **TAHAP 7** di TASKS.

**Tanggal probe: 2026-08-06.** Status API berubah terus — kalau sudah lewat beberapa bulan,
jalankan ulang `npm run probe` sebelum percaya tabel ini.

## Cara baca tingkatan

| Tier | Arti | Jumlah | Tindakan |
|---|---|---|---|
| **A** | Endpoint terverifikasi, data asli sudah keluar | 20 | Langsung bikin YAML |
| **B** | Host hidup & balas JSON, tapi path data belum dipastikan | 0 | Baca README, konfirmasi path, lalu bikin YAML |
| **C** | Host hidup tapi balas HTML (situs demo) | 39 | Riset manual: baca README, cari base URL API |
| **D** | Mati / tidak bisa dijangkau | 42 | **Jangan dikerjakan.** Cukup masuk katalog dengan status mati |
| **E** | Butuh API key / OAuth | 50 | Katalog + dokumentasi saja, tidak bisa diprobe |

**Total: 151 API dari upstream.**

Aturan yang berlaku di semua tier: **jangan pernah bikin alat di muka awam untuk API yang
belum terbukti mengeluarkan data JSON asli.** Tier C dan D boleh masuk katalog developer
dengan status apa adanya — itu justru gunanya katalog ini.

## Tiga sumber di SPEC yang BUKAN dari upstream

Penting biar ga bingung waktu nyocokin: dari 5 sumber di SPEC §6, cuma 2 yang berasal
dari daftar farizdotid (Data BMKG dan wilayah emsifa). Tiga sisanya sumber tambahan
hasil riset sendiri, jadi **tidak akan ketemu di tabel mana pun di bawah**:

| Sumber | Dipakai untuk | Kenapa bukan dari upstream |
|---|---|---|
| `api.myquran.com/v2` | Jadwal Sholat (SPEC §6.3) | Upstream cuma punya `lakuapik/jadwalsholatorg` dan `maftuh23/waktu-sholat` — keduanya beda dan belum diverifikasi |
| `equran.id/api/v2` | Al-Qur'an (SPEC §6.4) | Upstream punya 6 API Quran lain, tidak satu pun equran.id |
| `api.bmkg.go.id/publik` | Prakiraan Cuaca (SPEC §6.5) | API resmi BMKG. Entry cuaca di upstream (`pace11`, `ibnux`) beda dan yang ibnux sudah kosong |

Artinya field `upstreamName` untuk ketiganya di-set `null` di YAML registry.

---

## Tier A — Terverifikasi, siap dibikin YAML (20)

Data asli sudah keluar. Base URL dan path di bawah ini sudah dites.

### Agama Islam

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Dua & Dhikr | Fitrahive | bebas | `https://dua-dhikr.vercel.app` | [dok](https://github.com/fitrahive/dua-dhikr) | `/languages` · `/categories` · `/categories/{slug}`. CORS `*`. **WAJIB header `Accept-Language: id`** — tanpa itu balas 400, bukan 404. Ada rate limit (429) |
| Quran API | rzkytmgr | bebas | `https://staticquran.vercel.app` | [dok](https://github.com/rzkytmgr/quran-api) | `/api/v1/surah` (64KB) · `/api/v1/surah/{n}` · `/api/v1/reciters`. CORS `*`. **`/api/v1/juz` tidak ada** |
| Quran API ID | R.M. Reza | bebas | `https://quran-api-id.vercel.app` | [dok](https://github.com/renomureza/quran-api-id) | `/surah` (89KB) · `/surah/{n}` (341KB) · `/surah/{n}/{ayat}`. CORS `*`. **`/juz/{n}` rusak — bukan JSON** |

### Berita

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Berita Indo API | Satya Wikananda | bebas | `https://berita-indo-api.vercel.app` | [dok](https://github.com/satyawikananda/berita-indo-api) | `/v1/cnn-news/` · `/v1/cnn-news/{tipe}` · `/v1/cnbc-news/` + 11 sumber lain. CORS `*`. **14 media nasional — ini yang membuka alat Berita.** Catatan: `antara-news` disebut di root tapi 404 |
| Jakarta Post API | Faruq Maulana | bebas | `https://jakpost.vercel.app/api` | [dok](https://github.com/faruqmaulana/JAKARTA-POST-API) | `/category` · `/detailpost/{kat}/{thn}/{bln}/{tgl}/{slug}` · `/detailpodcast/...`. CORS `*` |

### Buku

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Masak Apa | Reski | bebas | `https://masak-apa.tomorisakura.vercel.app` | [dok](https://github.com/tomorisakura/unofficial-masakapahariini-api) | **scraper mati** — `/api/search/?q=` balas 200 dengan `results: []` |

### Finansial

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Harga Emas/Logam Mulia | cacing69 | bebas | `https://logam-mulia-api.iamutaki.workers.dev` | [dok](https://github.com/cacing69/logam-mulia-api/blob/main/README.md) | `/api/prices/anekalogam`. **Tanpa CORS.** Hosting di Cloudflare Workers → kecil kemungkinan mati kena tagihan |

### Hiburan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Anitop API / Anitrendz API (Un-official) | Satya Wikananda | bebas | `https://anitop.vercel.app` | [dok](https://github.com/satyawikananda/anitop) | `/api/v1/music-chart` (41KB). CORS `*`. API tidak resmi — katalog developer saja |
| Kunci Jawaban TTS API | nasrul21 | bebas | `https://kunci-tts-api.vercel.app` | [dok](https://github.com/nasrul21/kunci-tts-api) | `/api/answers?question={kata}`. **Tanpa CORS, wajib lewat proxy** |
| Manga/Komik Bahasa Indonesia (Un-official) | Febry Ardiansyah | bebas | `https://manga-api.fly.dev` | [dok](https://github.com/febryardiansyah/manga-api) | Root hidup, CORS `*`. Scraper tidak resmi — katalog developer saja (SPEC §13) |
| MyInstants Unofficial REST API | abdipr | bebas | `https://myinstants-api.vercel.app` | [dok](https://github.com/abdipr/myinstants-api) | `/detail?id={id}`. CORS `*` |

### Lokasi

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Kode Pos | Cain van Mason | bebas | `https://nbc.vanmason.web.id` | [dok](https://nbc.vanmason.web.id/service/kodepos/42173) | `/service/kodepos/{kodepos}`. Tanpa CORS. **Lebih baik pakai `kodepos.vercel.app` di bawah** |
| Kode Pos | sooluh | bebas | `https://kodepos.vercel.app` | [dok](https://github.com/sooluh/kodepos) | `/search/?q={nama}` · `/detect/?latitude={lat}&longitude={lon}`. CORS `*`. **Ini yang terbaik untuk kode pos — CORS terbuka, ada pencarian by koordinat** |
| Lambang Daerah Seluruh Indonesia | Feri Irawan | bebas | `https://symbolsofindonesia.vercel.app` | [dok](https://github.com/feri-irawan/lambang-daerah-seluruh-indonesia) | `/provinces/{ukuranPx}`. **Tanpa CORS, wajib lewat proxy** |
| Nama Provinsi, Kota, Kabupaten Seluruh Wilayah Indonesia | Muhammad Syifa | bebas | — lihat SPEC §6 — | [dok](https://github.com/emsifa/api-wilayah-indonesia) | **Sudah di SPEC, endpoint lengkap ada di sana** |
| Pesantren se Indonesia | nasrul21 | bebas | `https://api-pesantren-indonesia.vercel.app` | [dok](https://github.com/nasrul21/data-pesantren-indonesia) | `/provinsi.json` terkonfirmasi. CORS `*` |
| idn-area | fityannugroho | bebas | `https://idn-area.up.railway.app` | [dok](https://github.com/fityannugroho/idn-area) | `/provinces` · `/regencies?provinceCode=` · `/districts?regencyCode=` · `/villages?districtCode=`. CORS `*`. **Kode Kemendagri bertitik, COCOK dengan adm1-adm4 BMKG** — ini sumber wilayah yang dipakai alat Cuaca. Selalu kirim `limit`, response berhalaman |

### Pemerintahan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Data BMKG | Badan Meteorologi dan Geofisika | bebas | — lihat SPEC §6 — | [dok](http://data.bmkg.go.id/tentang) | **Sudah di SPEC, endpoint lengkap ada di sana** |

### Pendidikan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Data Sekolah Indonesia | Alwan | bebas | `https://api-sekolah-indonesia.vercel.app` | [dok](https://github.com/wanrabbae/api-sekolah-indonesia) | `/sekolah?page={n}&perPage={n}`. CORS `*` |
| Kotonogi API | Naufal AY | bebas | `https://kotonogi-api.vercel.app` | [dok](https://github.com/soudayonee/kotonogi-api) | `/full` (98KB) · `/hirakata` (48KB) · `/dakuten` (19KB) · `/hiragana/{romaji}`. CORS `*` |

---

## Tier C — Perlu riset manual (39)

Host hidup tapi balas HTML — biasanya situs demo/dokumentasi, API-nya ada di subdomain atau path lain. Ini bucket terbesar dan paling makan waktu.

> **PENTING:** **Kolom kandidat di tier ini jangan dipercaya mentah-mentah.** URL-nya diekstrak otomatis dari README, jadi kadang yang kejaring malah link donasi, spanduk, atau blog penulisnya (contoh nyata: `Kode Pos` by sooluh kandidatnya `s.id/standwithpalestine`). Anggap kolom itu sebagai titik awal, bukan jawaban.

### Agama Islam

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Doa Doa API | Ahmad Ramadhan | bebas | `https://doa-doa-api-ahmadramadhan.fly.dev` | [dok](https://doa-doa-api-ahmadramadhan.fly.dev) | 200 · text/html |
| Holy Quran API | Kang Cahya | bebas | `https://demo.kang-cahya.web.id/quran-api/` | [dok](https://github.com/dyazincahya/quran-api-with-php-codeigniter) | 200 · text/html |
| Jadwal Sholat | lakuapik | bebas | `https://jadwalsholat.org` | [dok](https://github.com/lakuapik/jadwalsholatorg) | 200 · text/html |
| Puasa Sunnah API | Granite Bagas | bebas | `https://api.puasa-sunnah.granitebps.com/swagger/index.html` | [dok](https://api.puasa-sunnah.granitebps.com/swagger/index.html) | 200 · text/html |
| Waktu Sholat API | Maftuh Ichsan | bebas | `http://loscos4w40ko04sss0cg0wo4.70.153.72.107.sslip.io/province` | [dok](https://github.com/maftuh23/waktu-sholat) | 200 · application/json |

### Berita

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| CNN Indonesia | developeridn.com | bebas | `https://www.cnnindonesia.com/gaya-hidup/20200506182707-284-500842/cara-membayar-fidiah-tebusan-bagi-yang-tak-bisa-berpuasa` | [dok](https://github.com/rizki4106/cnnindonesia-news-api) | 200 · text/html |
| Detik News API | Ucok Isa Lubis | bebas | `https://pypi.org/project/dn-scraper/` | [dok](https://github.com/Ucok23/detiknews_api) | 200 · text/html |

### Cuaca

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API & Graphql Cuaca BMKG | pace11 | bebas | `https://data.bmkg.go.id/prakiraan-cuaca/` | [dok](https://github.com/pace11/weather-api) | 200 · text/html |
| Info Gempa & Cuaca API | R.M. Reza | bebas | `https://cuaca-gempa-rest-api.vercel.app/` | [dok](https://github.com/renomureza/cuaca-gempa-rest-api) | 404 · tanpa content-type |

### Finansial

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Harga Emas | bramaudi | bebas | `https://codeberg.org/bramaudi/gold-price` | [dok](https://codeberg.org/bramaudi/gold-price) | 200 · text/html |
| OJK Investasi API | Cristopher | bebas | `https://www.ojk.go.id/Default.aspx` | [dok](https://github.com/Namchee/ojk-invest-api) | 200 · text/html |

### Hiburan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| AnimeAPI | nattadasu | bebas | `https://animeapi.my.id` | [dok](https://animeapi.my.id) | 200 · text/html |
| JagoKata Unofficial REST API | abdipr | bebas | `https://jagokata.com/images/logo-kata2.png` | [dok](https://github.com/abdipr/jagokata-api) | 200 · image/png |
| Katanime | ricko-v | bebas | `https://katanime.vercel.app/` | [dok](https://github.com/ricko-v/katanime) | 200 · text/html |
| LK21 & NontonDrama (Unofficial) | Febriadji | bebas | `https://tv.lk21official.live` | [dok](https://github.com/febriadj/lk21-api) | 200 · text/html |
| Strygwyr Dota 2 API | sinkaroid | bebas | `https://www.codefactor.io/repository/github/sinkaroid/strygwyr` | [dok](https://github.com/sinkaroid/strygwyr) | 200 · text/html |
| Student Blue Archive | arufars | bebas | `https://api-blue-archive.vercel.app` | [dok](https://github.com/arufars/api-blue-archive) | 404 · tanpa content-type |
| Unofficial Liga Indonesia | Agis R Herdiana | bebas | `https://ligaindonesia-api.vercel.app/docs` | [dok](https://ligaindonesia-api.vercel.app/docs) | 200 · text/html |

### Kesehatan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Data ketersediaan tempat tidur rumah sakit di Indonesia | Satya Wikananda | bebas | `https://rs-bed-covid-api.vercel.app/` | [dok](https://github.com/satyawikananda/rs-bed-covid-indo-api) | 200 · text/html |
| Data rumah sakit rujukan covid-19 di Indonesia | Ariya Hidayat | bebas | `https://dekontaminasi.com/api/id/covid19/hospitals` | [dok](https://dekontaminasi.com/api/id/covid19/hospitals) | 200 · text/plain |

### Kripto

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Rekeningku | rekeningku | bebas | `https://api.rekeningku.com/#introduction` | [dok](https://api.rekeningku.com/#introduction) | 200 · text/html |

### Lokasi

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Data GeoJSON Provinsi, Kota atau Kabupaten Seluruh Wilayah Indonesia | Zulham Nur | bebas | `https://z4nr.github.io/WhatGeo/` | [dok](https://z4nr.github.io/WhatGeo/) | 200 · text/html |
| Nusantara API | I Gede Widiantara | bebas | `https://nusantara.clowdlab.com/docs` | [dok](https://nusantara.clowdlab.com/docs) | 200 · text/html |

### Pemerintahan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Batik Indonesia | BatiKita | bebas | `https://batikita.docs.apiary.io/#reference/0/all-batik-collections` | [dok](https://batikita.docs.apiary.io/#reference/0/all-batik-collections) | 200 · text/html |

### Pendidikan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API KBBI Daring | Kang Cahya | bebas | `https://getcomposer.org/` | [dok](https://github.com/dyazincahya/API-KBBI-PHP-Codeigniter-4) | 200 · text/html |
| Hibersunda Undak Usuk Basa Sunda | Hiberin Digital | bebas | `https://hibersunda.hiberinlabs.com` | [dok](https://github.com/hiberin/hibersunda) | 200 · text/html |
| KBBI Complete REST API | raf555 | bebas | `https://kbbi.raf555.dev/swagger/index.html` | [dok](https://kbbi.raf555.dev/swagger/index.html) | 200 · text/html |
| Maganghub API | Ndav | bebas | `https://maganghub.ndav.my.id` | [dok](https://maganghub.ndav.my.id) | 200 · text/html |
| Python 3 API wrapper PDDIKTI | IlhamRisky | bebas | `https://www.python.org/downloads/release/python-3121/` | [dok](https://github.com/IlhamriSKY/PDDIKTI-kemdikbud-API) | 200 · text/html |
| Wikipedia API | Mediawiki | bebas | `https://www.mediawiki.org/wiki/API:Tutorial` | [dok](https://www.mediawiki.org/wiki/API:Tutorial) | 200 · text/html |

### Serba Guna

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Akuari Api | akuari | bebas | `https://api.akuari.my.id/` | [dok](https://api.akuari.my.id/) | 200 · text/html |
| Ryzumi API | ShirokamiRyzen | bebas | `https://api.ryzumi.net` | [dok](https://api.ryzumi.net) | 200 · text/html |

### Sosial Media

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Facebook Video Downloader | bramaudi | bebas | `https://codeberg.org/bramaudi/fbdown` | [dok](https://codeberg.org/bramaudi/fbdown) | 200 · text/html |
| Whatsapp Cloud API Wrapper | fdciabdul | bebas | `https://imtaqin.id` | [dok](https://github.com/fdciabdul/WhatsApp-Cloud-API-Wrapper) | 200 · text/html |
| Whatsapp Official API  | Facebook | bebas | `https://developers.facebook.com/docs/whatsapp` | [dok](https://developers.facebook.com/docs/whatsapp) | 200 · text/html |

### Utilitas

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Daftar nama Bank di Indonesia | cenahcoid | bebas | `https://bank.thecloudalert.com` | [dok](https://bank.thecloudalert.com) | 200 · text/html |
| Distrowatch API (unofficial) | Zulfahmi | bebas | `https://distrowatch.com/` | [dok](https://github.com/Zzzul/diwa) | 200 · text/html |
| Indiwtf API | Frans Allen | bebas | `https://indiwtf.com/api/` | [dok](https://indiwtf.com/api/) | 200 · text/html |
| Screenshot API | statically.io | bebas | `https://statically.io` | [dok](https://statically.io) | 200 · text/html |

---

## Tier E — Butuh autentikasi (50)

Tidak bisa diprobe tanpa kredensial. Masukkan ke katalog developer dengan `auth: apikey`/`oauth`, jangan dibikin alat.

Sudah diriset terpisah pada 2026-08-07: **48 dari 50 dokumentasinya masih hidup** — wajar, ini layanan komersial. Kolom catatan memuat status dokumentasi, metode autentikasi yang terdeteksi di halaman dokumentasinya, dan ada-tidaknya sandbox / free tier.

> **Base URL sengaja dikosongkan untuk tier ini.** Ekstraksi otomatis menghasilkan mayoritas nilai salah (`api.w.org` yang sebenarnya WordPress REST API, `rapidapi.com`, atau host dokumentasinya sendiri) — cuma 2 dari 7 yang lolos saringan ketat ternyata benar. Lebih baik kosong daripada menyesatkan. Base URL tier E harus diambil manual dari dokumentasinya.

Metode auth hanya terdeteksi di 23 dari 46 halaman, karena banyak dokumentasi berupa SPA yang isinya dirender JavaScript sehingga tidak terbaca dari HTML mentah. Kosong di sini berarti **belum diketahui**, bukan berarti tidak ada.

### Agama Islam

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Qalbun API | Polyvor Labs | API KEY | — *baca dokumentasi* | [dok](https://api.qalbun.my.id) | dokumentasi hidup |

### Berita

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Indonesia news API | News API | API KEY | — *baca dokumentasi* | [dok](https://newsapi.org/s/indonesia-news-api) | dokumentasi hidup · auth: Parameter api_key |

### Buku

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Unofficial Gramedia Ebooks | Yusuf T. | API KEY | — *baca dokumentasi* | [dok](https://github.com/yusuftaufiq/laravel-books-api) | dokumentasi hidup · auth: Signature/HMAC · ada gratis/free tier |

### Cuaca

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Cuaca Realtime | weatherapi | API KEY | — *baca dokumentasi* | [dok](https://www.weatherapi.com) | dokumentasi hidup |

### E-Commerce

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Blibli | Blibli.com Dev | API KEY | — *baca dokumentasi* | [dok](https://seller-api.blibli.com/home) | dokumentasi hidup |
| Lazada | Lazada Dev | API KEY | — *baca dokumentasi* | [dok](https://open.lazada.com/doc/doc.htm) | dokumentasi hidup |
| Matahari Mall API for Seller | Matahari Mall Dev | API KEY | — *baca dokumentasi* | [dok](http://docs.apiforseller.apiary.io) | dokumentasi hidup |
| Shopee | Shopee Dev | API KEY | — *baca dokumentasi* | [dok](https://open.shopee.com/documents) | dokumentasi hidup |
| Tokopedia.com API | Tokopedia.com Dev | API KEY | — *baca dokumentasi* | [dok](https://developer.tokopedia.com/openapi/guide) | dokumentasi hidup · auth: Parameter api_key |

### Finansial

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Data Saham Indonesia | goapi-id | API KEY | — *baca dokumentasi* | [dok](https://goapi.io/api-data-saham-indonesia) | dokumentasi hidup · ada gratis/free tier |
| API Harga Emas/Logam Mulia (Antam, UBS, Emasku, Emaskita, Pegadaian, dll) | MR Labs | API KEY | — *baca dokumentasi* | [dok](https://emas.maulanar.my.id/docs) | dokumentasi hidup · auth: Bearer token / Header X-API-Key / Parameter api_key · ada gratis/free tier |
| BCA | BCA | API KEY | — *baca dokumentasi* | [dok](https://developer.bca.co.id) | dokumentasi hidup · ada sandbox |
| Bisatopup | Bisatopup | API KEY | — *baca dokumentasi* | [dok](https://documenter.getpostman.com/view/367648/RzfZQZAL?version=latest) | dokumentasi hidup |
| CoinMarketCap | CoinMarketCap | API KEY | — *baca dokumentasi* | [dok](https://coinmarketcap.com/api) | dokumentasi hidup · auth: Basic Auth · ada trial |
| DOKU | DOKU | API KEY | — *baca dokumentasi* | [dok](https://www.doku.com/API/index.html) | dokumentasi hidup · auth: Signature/HMAC |
| Dana Enterprise  | DANA | OAUTH | — *baca dokumentasi* | [dok](https://dashboard.dana.id/api-docs/) | **host tidak bisa dijangkau** |
| Duitku | Duitku | API KEY | — *baca dokumentasi* | [dok](https://docs.duitku.com) | dokumentasi hidup |
| ESPAY | ESPAY | API KEY | — *baca dokumentasi* | [dok](https://sandbox-kit.espay.id/docs/v2/docespay/en/index.php) | dokumentasi hidup · auth: Basic Auth / Signature/HMAC · ada sandbox |
| Jurnal API | jurnal.id | OAUTH / API KEY | — *baca dokumentasi* | [dok](https://api-jurnal.api-docs.io/v1/getting-started/introduction) | dokumentasi hidup |
| Midtrans | Midtrans | API KEY | — *baca dokumentasi* | [dok](https://docs.midtrans.com) | dokumentasi hidup · auth: Bearer token / Parameter api_key / OAuth2 client credentials / Basic Auth / Server key / Signature/HMAC |
| MobilePulsa API | MobilePulsa Official | API KEY | — *baca dokumentasi* | [dok](https://developer.mobilepulsa.net) | dokumentasi hidup · ada sandbox |
| Neropass API | Neropass | API KEY | — *baca dokumentasi* | [dok](https://docs.neropass.com) | dokumentasi hidup |
| OVO Unofficial | fdciabdul | OTP | — *baca dokumentasi* | [dok](https://github.com/fdciabdul/new-ovoid-nodejs) | dokumentasi hidup · auth: Signature/HMAC |
| OY! Indonesia | OY! Indonesia | API KEY | — *baca dokumentasi* | [dok](https://api-docs.oyindonesia.com/#introduction) | dokumentasi hidup · auth: Header X-API-Key / Parameter api_key |
| Paypal | Paypal | API KEY | — *baca dokumentasi* | [dok](https://developer.paypal.com/api/rest/) | dokumentasi hidup · auth: Bearer token / OAuth2 client credentials / Basic Auth · ada sandbox |
| Tradingview | Tradingview | API KEY | — *baca dokumentasi* | [dok](https://www.tradingview.com/rest-api-spec) | dokumentasi hidup · auth: Parameter api_key |
| Tripay | Tripay | API KEY | — *baca dokumentasi* | [dok](https://tripay.co.id/developer?tab=prolog) | dokumentasi hidup · auth: Bearer token / Parameter api_key / Signature/HMAC · ada sandbox |
| Xendit API | Xendit Official | API KEY | — *baca dokumentasi* | [dok](https://developers.xendit.co) | dokumentasi hidup · auth: Parameter api_key |
| tradingeconomics | tradingeconomics | API KEY | — *baca dokumentasi* | [dok](https://tradingeconomics.com/api/) | dokumentasi hidup · auth: Parameter api_key |

### Hiburan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| ID Game Checker | Nevertary I Forster | API KEY | — *baca dokumentasi* | [dok](https://rapidapi.com/nazi436123/api/id-game-checker) | dokumentasi hidup · auth: Parameter api_key / Signature/HMAC |

### Jasa Pengiriman

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Cek Resi | binderbyte | API KEY | — *baca dokumentasi* | [dok](https://docs.binderbyte.com/api/cek-resi) | **dokumentasi balas 500 — kemungkinan rusak** |
| J&T | J&T Official | API KEY | — *baca dokumentasi* | [dok](https://developer.jet.co.id/documentation) | dokumentasi hidup |
| JNE | JNE Official | API KEY | — *baca dokumentasi* | [dok](https://apidash.jne.co.id) | dokumentasi hidup |
| KiriminAja | KiriminAja Official | API KEY | — *baca dokumentasi* | [dok](https://developer.kiriminaja.com) | dokumentasi hidup · auth: Parameter api_key |
| Shipper | Shipper | API KEY | — *baca dokumentasi* | [dok](https://shipper.id/api-integration) | dokumentasi hidup · ada gratis/free tier |
| Tracking API | Klik Resi | API KEY | — *baca dokumentasi* | [dok](https://documenter.getpostman.com/view/29221489/2s9YC7SBgH) | dokumentasi hidup |

### Kesehatan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Satu Sehat | Ministry of Health Indonesia | perlu key | — *baca dokumentasi* | [dok](https://satusehat.kemkes.go.id/platform/docs/id/playbook/) | dokumentasi hidup · auth: Signature/HMAC · ada sandbox |

### Kripto

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Binance | binance | API KEY | — *baca dokumentasi* | [dok](https://github.com/binance/binance-spot-api-docs) | dokumentasi hidup · auth: Signature/HMAC |
| Indodax | btcid | API KEY | — *baca dokumentasi* | [dok](https://github.com/btcid/indodax-official-api-docs) | dokumentasi hidup · auth: Signature/HMAC |
| TokoCrypto | Toko Crypto | API KEY | — *baca dokumentasi* | [dok](https://www.tokocrypto.com/apidocs/#api-document-description) | dokumentasi hidup |

### Lokasi

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Wilayah Indonesia | goapi-id | API KEY | — *baca dokumentasi* | [dok](https://goapi.io/api-wilayah-indonesia) | dokumentasi hidup · auth: Parameter api_key · ada gratis/free tier |
| Places API Indonesia | goapi-id | API KEY | — *baca dokumentasi* | [dok](https://goapi.io/places-api) | dokumentasi hidup · auth: Parameter api_key |

### Musik

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Deezer | Deezer Dev | OAUTH | — *baca dokumentasi* | [dok](https://developers.deezer.com/api) | dokumentasi hidup |
| SoundCloud | SoundCloud Dev | API KEY | — *baca dokumentasi* | [dok](https://developers.soundcloud.com) | dokumentasi hidup |
| Spotify | Spotify Dev | OAUTH | — *baca dokumentasi* | [dok](https://developer.spotify.com/documentation/web-api) | dokumentasi hidup |

### Pemerintahan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Data BPS | Badan Pusat Statistik | API KEY | — *baca dokumentasi* | [dok](https://webapi.bps.go.id/developer) | dokumentasi hidup |
| E-samsat Jateng | lintangtimur | API KEY | — *baca dokumentasi* | [dok](https://github.com/lintangtimur/cek-pajak-esamsat) | dokumentasi hidup · auth: Signature/HMAC |
| PLN (Unofficial) | decryptable | `x-api-key` | — *baca dokumentasi* | [dok](https://pln.decryptable.dev) | dokumentasi hidup |

### Umum

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| ResitaApi | FeriPratama | perlu key | — *baca dokumentasi* | [dok](https://api.ferdev.my.id) | dokumentasi hidup |

### Utilitas

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| SMSNotif | PT Solusi Inovasi Bisnis | API KEY | — *baca dokumentasi* | [dok](https://www.smsnotif.id) | dokumentasi hidup |

---

## Tier D — Mati / tidak terjangkau (32)

**Jangan buang waktu.** Masukkan ke katalog dengan status mati supaya orang lain juga tahu.

### Agama Islam

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Al-Qur'an Indonesia | Alwan | bebas | `https://api-alquranid.herokuapp.com` | [dok](https://github.com/wanrabbae/al-quran-indonesia-api) | 404 · tanpa content-type |
| Alquran ID | bachors | bebas | `https://al-quran-8d642.firebaseio.com/data.json?print=pretty` | [dok](https://github.com/bachors/Al-Quran-ID-API) | 200 · application/json |
| Quran JSON | penggguna | bebas | `https://apps.apple.com/us/app/quran-daily-unlock-your-heart/id1494995253` | [dok](https://github.com/penggguna/QuranJSON) | 403 · tanpa content-type |

### Berita

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API Berita Indonesia | R.M. Reza | bebas | `https://api-berita-indonesia.vercel.app/` | [dok](https://github.com/renomureza/api-berita-indonesia) | 402 · tanpa content-type |
| The Lazy Media API | Nicola Deastra | bebas | `https://the-lazy-media-api.vercel.app/` | [dok](https://github.com/NicolaDonoastro/The-Lazy-Media-api) | **scraper mati** — `/api/games` balas `[]`, `/api/detail/...` balas objek dengan semua field kosong. Status 200 dan JSON sah, jadi lolos pengecekan naif |

### Buku

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Bukuacak | Shabri A. | bebas | `https://bukuacak.vercel.app/api` | [dok](https://bukuacak.vercel.app/api) | balas HTML (SPA shell) di semua path `/api` — API mati |

### Cuaca

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| BMKG Json API | ibnux | bebas | `https://ibnux.github.io/BMKG-importer/#pakai-langsung` | [dok](https://ibnux.github.io/BMKG-importer/#pakai-langsung) | endpoint cuaca balas `[]` (kosong) |

### Finansial

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Currency Exchange | azharimm | bebas | `https://api-exchange-rates.herokuapp.com/list-currency` | [dok](https://github.com/azharimm/currency-exchange-api) | 404 · tanpa content-type |

### Hiburan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| 1Cak API | dickymuliafiqri | bebas | `https://onecak.azurewebsites.net/?lol` | [dok](https://github.com/dickymuliafiqri/onecak) | URLError · tanpa content-type |
| Epic Free Games API | woicip | bebas | `https://store.epicgames.com/en-US/p/cursed-to-golf-a6bc22` | [dok](https://github.com/woicip/epic-free-games) | semua host kandidat balas 403/404 — tidak ada deployment hidup |
| FILMAPIK API (Un-official) | devnazir | bebas | `https://api-filmapik.herokuapp.com/pathname?parameter` | [dok](https://github.com/devnazir/api-filmapik) | 404 · tanpa content-type |
| Klasemen Sepak Bola | azharimm | bebas | `https://api-football-standings.azharimm.site/leagues` | [dok](https://github.com/azharimm/football-standings-api) | URLError · tanpa content-type |
| LK21 API (Un-official) | devnazir | bebas | `https://149.56.198.206/` | [dok](https://github.com/devnazir/api-lk21) | URLError · tanpa content-type |
| Otakudesu API (Un-official) | KaedeNoKi Team | bebas | `https://otakudesu.org/` | [dok](https://github.com/Kaede-No-Ki/otakudesu-rest-api) | URLError · tanpa content-type |
| Spesifikasi HP | azharimm | bebas | `https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png` | [dok](https://github.com/azharimm/phone-specs-api) | 404 · tanpa content-type |
| Yet Another API for Anime and Stuff | Aerysh | bebas | `http://IP:PORT/documentation` | [dok](https://github.com/Aerysh/yaaas) | InvalidURL · tanpa content-type |

### Kesehatan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Data COVID-19 di Indonesia | Reynadi | bebas | `https://apicovid19indonesia-v2.vercel.app/api` | [dok](https://apicovid19indonesia-v2.vercel.app/api) | **semua endpoint data balas 504 FUNCTION_INVOCATION_TIMEOUT**. Cuma root `/api` yang hidup karena respons statis |

### Lokasi

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API alamat Desa Kelurahan, kecamatan, kabkota, dan kodepos | cenahcoid | bebas | `https://alamat.thecloudalert.com` | [dok](https://alamat.thecloudalert.com) | host tidak bisa dijangkau |
| Daftar Stasiun Kereta Api di Indonesia | PT Kereta Api Indonesia (Persero) | bebas | `https://booking.kai.id/api/stations2` | [dok](https://booking.kai.id/api/stations2) | 403 · tanpa content-type |

### Musik

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Lirik lagu | azharimm | bebas | `https://api-song-lyrics.herokuapp.com/hot` | [dok](https://github.com/azharimm/song-lyrics-api) | 404 · tanpa content-type |

### Pemerintahan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Bahasa Daerah | Mahes2 | bebas | `https://api.codespade.com/bahasa-daerah/swagger-ui/index.html` | [dok](https://github.com/Mahes2/bahasa-daerah-indonesia) | URLError · tanpa content-type |

### Pendidikan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API KBBI Luring | Kang Cahya | bebas | `https://kbbi.kemdikbud.go.id/` | [dok](https://github.com/dyazincahya/KBBI-SQL-database) | URLError · tanpa content-type |
| Data Sekolah API | Ahmad Ramadhan | bebas | `https://i.cloudup.com/zfY6lL7eFa-3000x3000.png` | [dok](https://github.com/semogaBermanfaat-AhmadRamadhan/dataSekolahNegeriIndonesia) | 200 · image/png |
| KBBI API | azharimm | bebas | `https://kbbi-api-amm.herokuapp.com/search?q=apel` | [dok](https://github.com/azharimm/kbbi-api) | 404 · tanpa content-type |
| New KBBI API | btrianurdin | bebas | `https://new-kbbi-api.herokuapp.com` | [dok](https://github.com/btrianurdin/new-kbbi-api) | 404 · tanpa content-type |

### Serba Guna

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| KyioAPI | Har | bebas | `https://api.kyio.web.id/docs` | [dok](https://api.kyio.web.id/docs) | 403 · tanpa content-type |

### Sosial Media

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Unofficial Youtube Api | FatihArridho | bebas | `https://hits.seeyoufarm.com` | [dok](https://github.com/FatihArridho/Unofficial-YoutubeApi) | URLError · tanpa content-type |

### Umum

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Dayoff API | Gerinsp | bebas | `https://dayoffapi.vercel.app` | [dok](https://dayoffapi.vercel.app) | **402 Payment Required** — mati karena tagihan Vercel |

### Utilitas

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| APIMock | Lazycatlabs | bebas | `https://apimock.lazycatlabs.com` | [dok](https://apimock.lazycatlabs.com) | URLError · tanpa content-type |
| Google Playstore | azharimm | bebas | `https://api-gplay.azharimm.site/apps?lang=id&category=GAME&collection=topselling_paid&page=1&limit=10` | [dok](https://github.com/azharimm/google-play-api) | URLError · tanpa content-type |
| Google Trends | azharimm | bebas | `https://api-trends.azharimm.tk/trend/timeline` | [dok](https://github.com/azharimm/google-trends-api) | URLError · tanpa content-type |
| Translasi | azharimm | bebas | `https://amm-api-translate.herokuapp.com/translate?engine={engine` | [dok](https://github.com/azharimm/api-translate) | host tujuan `api-translate.azharimm.site` tidak bisa dijangkau |

---

## Tier D2 — Tanpa kandidat URL (10)

README tidak ketemu atau tidak memuat URL yang bisa dipakai. Perlu dibuka manual repo-nya, kalau repo-nya masih ada.

### Agama Islam

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Hadith API | Khairil Rahman | bebas | — | [dok](https://github.com/kyyril/hadith-api) | tidak ada kandidat URL di README |

### Christian

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Alkitab API | raselldev | bebas | — | [dok](https://github.com/raselldev/alkitab-api) | tidak ada kandidat URL di README |

### Hiburan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Quotes Generator API | Irfan Akbari Habibi | bebas | — | [dok](https://github.com/Irfanakbari/quote-generator-api) | tidak ada kandidat URL di README |
| Tanggal Lahiran Pasaran Zodiak | iBachor | bebas | — | [dok](https://github.com/bachors/apiapi#tanggal-lahiran-pasaran-zodiak) | tidak ada kandidat URL di README |

### Kesehatan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| API ketersediaan kamar rumah sakit COVID / Non COVID di Indonesia | Bayu | bebas | — | [dok](https://github.com/bayungrh/rs-bed-availability-api) | tidak ada kandidat URL di README |

### Kripto

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Indodax | btcid | bebas | — | [dok](https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md) | tidak ada kandidat URL di README |

### Lokasi

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Gunung Berapi di Indonesia | Yogi Saputro | bebas | — | [dok](https://github.com/yogski/indonesia-public-static-api#api-gunung-berapi-indonesia-apivolcanoes) | tidak ada kandidat URL di README |
| Kode Pos | iBachor | bebas | — | [dok](https://github.com/bachors/apiapi#kode-pos-api) | tidak ada kandidat URL di README |

### Pemerintahan

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Pahlawan Nasional Indonesia | Yogi Saputro | bebas | — | [dok](https://github.com/yogski/indonesia-public-static-api#api-pahlawan-nasional-indonesia-apiheroes) | tidak ada kandidat URL di README |

### Sosial Media

| API | Developer | Auth | Base URL / kandidat | Dokumentasi | Catatan probe |
|---|---|---|---|---|---|
| Twitter Trends | azharimm | bebas | — | [dok](https://github.com/azharimm/twitter-trends-api) | tidak ada kandidat URL di README |
