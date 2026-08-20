# REGISTRY SEED — YAML siap tempel

> **Salin blok di bawah apa adanya** ke `registry/apis/<slug>.yml`.
> Semua `baseUrl`, `path`, `contohPath`, dan `cors` di sini berasal dari panggilan
> sungguhan pada **2026-08-06** — tidak ada satu pun nilai yang dikarang.
>
> Bentuk response tiap endpoint ada di [`REFERENCE.md`](./REFERENCE.md).
> Dipakai di **T1.4** (5 API pertama) dan **T7.4** (sisanya).

**22 API · 43 endpoint.**

Yang **tanpa CORS** (`cors: none`) hanya bisa dipanggil lewat `/api/proxy` —
jangan bikin alat untuk API ini sebelum T5.1 selesai.

---

## `registry/apis/gempa-bmkg.yml`

```yaml
slug: gempa-bmkg
nama: Info Gempa BMKG
kategori: cuaca
deskripsi: Data gempa bumi terkini, terbaru, dan yang dirasakan, langsung dari BMKG.
developer:
  nama: BMKG
  profil: 'https://bmkg.go.id'
dokumentasi: 'https://data.bmkg.go.id/gempabumi/'
upstreamName: Data BMKG
auth: none
cors: open
baseUrl: 'https://data.bmkg.go.id'
mirror: false
endpoints:
  - id: autogempa
    method: GET
    path: /DataMKG/TEWS/autogempa.json
    deskripsi: Gempa bumi terkini — SATU objek, bukan array.
    params: []
    contohPath: /DataMKG/TEWS/autogempa.json
    minUkuranByte: 204
  - id: terkini
    method: GET
    path: /DataMKG/TEWS/gempaterkini.json
    deskripsi: '15 gempa M>=5.0 terakhir — ARRAY.'
    params: []
    contohPath: /DataMKG/TEWS/gempaterkini.json
    minUkuranByte: 2099
  - id: dirasakan
    method: GET
    path: /DataMKG/TEWS/gempadirasakan.json
    deskripsi: 15 gempa terakhir yang dirasakan masyarakat — ARRAY.
    params: []
    contohPath: /DataMKG/TEWS/gempadirasakan.json
    minUkuranByte: 2406
```

Ukuran response: `autogempa` ~0.4 KB · `terkini` ~4.1 KB · `dirasakan` ~4.7 KB

## `registry/apis/wilayah-idn-area.yml`

```yaml
slug: wilayah-idn-area
nama: Wilayah Indonesia (idn-area)
kategori: lokasi
deskripsi: Provinsi, kabupaten/kota, kecamatan, dan desa/kelurahan dengan kode Kemendagri terkini.
developer:
  nama: Fityan Nugroho
  profil: 'https://github.com/fityannugroho'
dokumentasi: 'https://github.com/fityannugroho/idn-area'
upstreamName: idn-area
auth: none
cors: open
baseUrl: 'https://idn-area.up.railway.app'
mirror: true
endpoints:
  - id: provinsi
    method: GET
    path: /provinces?limit=50
    deskripsi: 38 provinsi. Kode format bertitik, COCOK dengan adm1 BMKG.
    params: []
    contohPath: /provinces?limit=50
    minUkuranByte: 768
  - id: kabupaten
    method: GET
    path: '/regencies?provinceCode={kodeProvinsi}&limit=50'
    deskripsi: Saring dengan provinceCode. Kode cocok dengan adm2 BMKG.
    params:
      - nama: kodeProvinsi
        contoh: '32'
        wajib: true
        keterangan: Kode provinsi, mis. 32 = Jawa Barat
    contohPath: '/regencies?provinceCode=32&limit=50'
    minUkuranByte: 921
  - id: kecamatan
    method: GET
    path: '/districts?regencyCode={kodeKabupaten}&limit=50'
    deskripsi: Saring dengan regencyCode. Kode cocok dengan adm3 BMKG.
    params:
      - nama: kodeKabupaten
        contoh: '32.04'
        wajib: true
        keterangan: Kode kabupaten BERTITIK, mis. 32.04
    contohPath: '/districts?regencyCode=32.04&limit=50'
    minUkuranByte: 1024
  - id: kelurahan
    method: GET
    path: '/villages?districtCode={kodeKecamatan}&limit=50'
    deskripsi: Saring dengan districtCode. Kode cocok dengan adm4 BMKG — INI yang dipakai alat Cuaca.
    params:
      - nama: kodeKecamatan
        contoh: '32.04.15'
        wajib: true
        keterangan: Kode kecamatan BERTITIK, mis. 32.04.15
    contohPath: '/villages?districtCode=32.04.15&limit=50'
    minUkuranByte: 512
```

Ukuran response: `provinsi` ~1.5 KB · `kabupaten` ~1.8 KB · `kecamatan` ~2.0 KB · `kelurahan` ~1.0 KB

## `registry/apis/wilayah-emsifa.yml`

```yaml
slug: wilayah-emsifa
nama: Wilayah Indonesia
kategori: lokasi
deskripsi: Daftar provinsi, kabupaten/kota, kecamatan, dan kelurahan se-Indonesia.
developer:
  nama: Muhammad Syifa
  profil: 'https://github.com/emsifa'
dokumentasi: 'https://github.com/emsifa/api-wilayah-indonesia'
upstreamName: Nama Provinsi, Kota, Kabupaten Seluruh Indonesia
auth: none
cors: open
baseUrl: 'https://www.emsifa.com'
mirror: true
endpoints:
  - id: provinsi
    method: GET
    path: /api-wilayah-indonesia/api/provinces.json
    deskripsi: Semua provinsi. Data statis. KODE LAMA — tidak cocok dengan BMKG, jangan dipakai untuk alat Cuaca.
    params: []
    contohPath: /api-wilayah-indonesia/api/provinces.json
    minUkuranByte: 563
  - id: kabupaten
    method: GET
    path: '/api-wilayah-indonesia/api/regencies/{idProvinsi}.json'
    deskripsi: Kabupaten/kota dalam satu provinsi.
    params:
      - nama: idProvinsi
        contoh: '32'
        wajib: true
        keterangan: 'Kode provinsi, STRING. Contoh: 32 = Jawa Barat'
    contohPath: /api-wilayah-indonesia/api/regencies/32.json
    minUkuranByte: 819
  - id: kecamatan
    method: GET
    path: '/api-wilayah-indonesia/api/districts/{idKabupaten}.json'
    deskripsi: Kecamatan dalam satu kabupaten.
    params:
      - nama: idKabupaten
        contoh: '3204'
        wajib: true
        keterangan: Kode kabupaten, STRING 4 digit
    contohPath: /api-wilayah-indonesia/api/districts/3204.json
    minUkuranByte: 870
  - id: kelurahan
    method: GET
    path: '/api-wilayah-indonesia/api/villages/{idKecamatan}.json'
    deskripsi: Kelurahan/desa dalam satu kecamatan.
    params:
      - nama: idKecamatan
        contoh: '3204150'
        wajib: true
        keterangan: Kode kecamatan, STRING 7 digit
    contohPath: /api-wilayah-indonesia/api/villages/3204150.json
    minUkuranByte: 358
```

Ukuran response: `provinsi` ~1.1 KB · `kabupaten` ~1.6 KB · `kecamatan` ~1.7 KB · `kelurahan` ~0.7 KB

## `registry/apis/sholat-myquran.yml`

```yaml
slug: sholat-myquran
nama: Jadwal Sholat myQuran
kategori: agama-islam
deskripsi: Jadwal sholat harian untuk seluruh kota di Indonesia.
developer:
  nama: myQuran
  profil: 'https://api.myquran.com'
dokumentasi: 'https://documenter.getpostman.com/view/841292/2s9YsGittd'
upstreamName: null
auth: none
cors: open
baseUrl: 'https://api.myquran.com'
mirror: false
endpoints:
  - id: daftarKota
    method: GET
    path: /v2/sholat/kota/semua
    deskripsi: Daftar semua kota beserta id-nya. Statis — layak di-mirror.
    params: []
    contohPath: /v2/sholat/kota/semua
    minUkuranByte: 10649
  - id: jadwal
    method: GET
    path: '/v2/sholat/jadwal/{idKota}/{tahun}/{bulan}/{tanggal}'
    deskripsi: 'Jadwal sholat satu kota satu hari. Bulan & tanggal WAJIB dua digit.'
    params:
      - nama: idKota
        contoh: '1301'
        wajib: true
        keterangan: Ambil dari endpoint daftarKota. 1301 = KOTA JAKARTA
      - nama: tahun
        contoh: '2026'
        wajib: true
        keterangan: Empat digit
      - nama: bulan
        contoh: '08'
        wajib: true
        keterangan: DUA DIGIT — 08, bukan 8
      - nama: tanggal
        contoh: '06'
        wajib: true
        keterangan: DUA DIGIT — 06, bukan 6
    contohPath: /v2/sholat/jadwal/1301/2026/08/06
    minUkuranByte: 153
```

Ukuran response: `daftarKota` ~20.8 KB · `jadwal` ~0.3 KB

## `registry/apis/quran-equran.yml`

```yaml
slug: quran-equran
nama: Al-Qur'an equran.id
kategori: agama-islam
deskripsi: Daftar dan detail 114 surat Al-Qur'an beserta terjemahan dan audio.
developer:
  nama: equran.id
  profil: 'https://equran.id'
dokumentasi: 'https://equran.id/apidev'
upstreamName: null
auth: none
cors: open
baseUrl: 'https://equran.id'
mirror: false
endpoints:
  - id: daftarSurat
    method: GET
    path: /api/v2/surat
    deskripsi: 114 surat — data berupa ARRAY.
    params: []
    contohPath: /api/v2/surat
    minUkuranByte: 61644
  - id: detailSurat
    method: GET
    path: '/api/v2/surat/{nomor}'
    deskripsi: Detail satu surat — data berupa OBJEK, bukan array.
    params:
      - nama: nomor
        contoh: '1'
        wajib: true
        keterangan: Nomor surat 1-114
    contohPath: /api/v2/surat/1
    minUkuranByte: 3174
```

Ukuran response: `daftarSurat` ~120.4 KB · `detailSurat` ~6.2 KB

## `registry/apis/cuaca-bmkg.yml`

```yaml
slug: cuaca-bmkg
nama: Prakiraan Cuaca BMKG
kategori: cuaca
deskripsi: Prakiraan cuaca resmi BMKG sampai tingkat desa/kelurahan.
developer:
  nama: BMKG
  profil: 'https://bmkg.go.id'
dokumentasi: 'https://data.bmkg.go.id/prakiraan-cuaca/'
upstreamName: null
auth: none
cors: open
baseUrl: 'https://api.bmkg.go.id'
mirror: false
endpoints:
  - id: prakiraan
    method: GET
    path: '/publik/prakiraan-cuaca?adm4={kodeDesa}'
    deskripsi: Butuh kode adm4 Kemendagri bertitik (32.04.15.2003). Ambil dari wilayah-idn-area, BUKAN dari wilayah-emsifa.
    params:
      - nama: kodeDesa
        contoh: '32.04.15.2003'
        wajib: true
        keterangan: 'Kode adm4 Kemendagri BERTITIK. Ambil apa adanya dari wilayah-idn-area (data[].code). JANGAN pakai kode wilayah-emsifa — angkanya beda dan BMKG membalas 404'
    contohPath: /publik/prakiraan-cuaca?adm4=32.04.15.2003
    minUkuranByte: 3942
```

Ukuran response: `prakiraan` ~7.7 KB

## `registry/apis/kodepos-sooluh.yml`

```yaml
slug: kodepos-sooluh
nama: Kode Pos Indonesia
kategori: lokasi
deskripsi: Pencarian kode pos berdasarkan nama wilayah atau koordinat.
developer:
  nama: sooluh
  profil: 'https://github.com/sooluh'
dokumentasi: 'https://github.com/sooluh/kodepos'
upstreamName: Kode Pos
auth: none
cors: open
baseUrl: 'https://kodepos.vercel.app'
mirror: false
endpoints:
  - id: cari
    method: GET
    path: '/search/?q={kata}'
    deskripsi: Cari kode pos dari nama kelurahan/kecamatan — data ARRAY.
    params:
      - nama: kata
        contoh: 'danasari'
        wajib: true
        keterangan: Nama kelurahan atau kecamatan
    contohPath: /search/?q=danasari
    minUkuranByte: 358
  - id: deteksi
    method: GET
    path: '/detect/?latitude={lintang}&longitude={bujur}'
    deskripsi: Deteksi kode pos dari koordinat — data OBJEK.
    params:
      - nama: lintang
        contoh: '-6.547052'
        wajib: true
        keterangan: Lintang desimal
      - nama: bujur
        contoh: '107.3980201'
        wajib: true
        keterangan: Bujur desimal
    contohPath: '/detect/?latitude=-6.547052&longitude=107.3980201'
    minUkuranByte: 153
```

Ukuran response: `cari` ~0.7 KB · `deteksi` ~0.3 KB

## `registry/apis/kodepos-vanmason.yml` ⚠️ TANPA CORS

```yaml
slug: kodepos-vanmason
nama: Kode Pos (vanmason)
kategori: lokasi
deskripsi: Lookup kelurahan dan kecamatan dari sebuah kode pos.
developer:
  nama: Cain van Mason
  profil: null
dokumentasi: 'https://nbc.vanmason.web.id/service/kodepos/42173'
upstreamName: Kode Pos
auth: none
cors: none
baseUrl: 'https://nbc.vanmason.web.id'
mirror: false
endpoints:
  - id: cari
    method: GET
    path: '/service/kodepos/{kodepos}'
    deskripsi: CADANGAN saja. Tanpa CORS. Untuk alat, pakai kodepos-sooluh.
    params:
      - nama: kodepos
        contoh: '42173'
        wajib: true
        keterangan: Kode pos 5 digit
    contohPath: /service/kodepos/42173
    minUkuranByte: 307
```

Ukuran response: `cari` ~0.6 KB

## `registry/apis/quran-api-id.yml`

```yaml
slug: quran-api-id
nama: Al-Qur'an API ID
kategori: agama-islam
deskripsi: Al-Qur'an lengkap dengan tafsir dan terjemahan bahasa Indonesia.
developer:
  nama: R.M. Reza
  profil: 'https://github.com/renomureza'
dokumentasi: 'https://github.com/renomureza/quran-api-id'
upstreamName: Quran API ID
auth: none
cors: open
baseUrl: 'https://quran-api-id.vercel.app'
mirror: false
endpoints:
  - id: daftarSurat
    method: GET
    path: /surah
    deskripsi: 114 surat (89 KB).
    params: []
    contohPath: /surah
    minUkuranByte: 45926
  - id: detailSurat
    method: GET
    path: '/surah/{nomor}'
    deskripsi: Satu surat lengkap dengan semua ayat (341 KB — respons terbesar di katalog).
    params:
      - nama: nomor
        contoh: '18'
        wajib: true
        keterangan: Nomor surat 1-114
    contohPath: /surah/18
    minUkuranByte: 174643
  - id: ayat
    method: GET
    path: '/surah/{nomor}/{ayat}'
    deskripsi: Satu ayat spesifik.
    params:
      - nama: nomor
        contoh: '18'
        wajib: true
        keterangan: Nomor surat 1-114
      - nama: ayat
        contoh: '60'
        wajib: true
        keterangan: Nomor ayat dalam surat
    contohPath: /surah/18/60
    minUkuranByte: 4608
```

Ukuran response: `daftarSurat` ~89.7 KB · `detailSurat` ~341.1 KB · `ayat` ~9.0 KB

## `registry/apis/kotonogi.yml`

```yaml
slug: kotonogi
nama: 'Kotonogi — Hiragana & Katakana'
kategori: pendidikan
deskripsi: Huruf Jepang beserta cara baca, gambar SVG, dan animasi urutan tulis.
developer:
  nama: soudayonee
  profil: 'https://github.com/soudayonee'
dokumentasi: 'https://github.com/soudayonee/kotonogi-api'
upstreamName: Kotonogi API
auth: none
cors: open
baseUrl: 'https://kotonogi-api.vercel.app'
mirror: false
endpoints:
  - id: hiraganaSatu
    method: GET
    path: '/hiragana/{romaji}'
    deskripsi: Detail satu huruf hiragana.
    params:
      - nama: romaji
        contoh: 'a'
        wajib: true
        keterangan: Romaji huruf yang dicari
    contohPath: /hiragana/a
    minUkuranByte: 204
  - id: hirakata
    method: GET
    path: /hirakata
    deskripsi: Semua hiragana + katakana (48 KB).
    params: []
    contohPath: /hirakata
    minUkuranByte: 24883
```

Ukuran response: `hiraganaSatu` ~0.4 KB · `hirakata` ~48.6 KB

## `registry/apis/berita-indo.yml`

```yaml
slug: berita-indo
nama: Berita Indo
kategori: berita
deskripsi: 'Berita terkini dari 14 media nasional: CNN, CNBC, Republika, Tempo, Okezone, BBC, Kumparan, Liputan6, Tribun, Jawa Pos, Vice, Suara, VOA.'
developer:
  nama: Satya Wikananda
  profil: 'https://github.com/satyawikananda'
dokumentasi: 'https://github.com/satyawikananda/berita-indo-api'
upstreamName: Berita Indo API
auth: none
cors: open
baseUrl: 'https://berita-indo-api.vercel.app'
mirror: false
endpoints:
  - id: cnnSemua
    method: GET
    path: /v1/cnn-news/
    deskripsi: 100 berita terbaru CNN Indonesia.
    params: []
    contohPath: /v1/cnn-news/
    minUkuranByte: 32819
  - id: cnnTipe
    method: GET
    path: '/v1/cnn-news/{tipe}'
    deskripsi: 'Saring per rubrik. Tipe CNN: nasional, internasional, ekonomi, olahraga, teknologi, hiburan, gaya-hidup.'
    params:
      - nama: tipe
        contoh: 'teknologi'
        wajib: true
        keterangan: 'nasional | internasional | ekonomi | olahraga | teknologi | hiburan | gaya-hidup'
    contohPath: /v1/cnn-news/teknologi
    minUkuranByte: 32358
  - id: cnbcSemua
    method: GET
    path: /v1/cnbc-news/
    deskripsi: 100 berita terbaru CNBC Indonesia.
    params: []
    contohPath: /v1/cnbc-news/
    minUkuranByte: 37120
```

Ukuran response: `cnnSemua` ~64.1 KB · `cnnTipe` ~63.2 KB · `cnbcSemua` ~72.5 KB

## `registry/apis/doa-doa.yml` ⚠️ TANPA CORS

```yaml
slug: doa-doa
nama: Doa Harian
kategori: agama-islam
deskripsi: Kumpulan doa harian beserta teks Arab, latin, dan artinya.
developer:
  nama: Ahmad Ramadhan
  profil: 'https://github.com/semogaBermanfaat-AhmadRamadhan'
dokumentasi: 'https://github.com/semogaBermanfaat-AhmadRamadhan/doa-doa-api'
upstreamName: Doa Doa API
auth: none
cors: none
baseUrl: 'https://doa-doa-api-ahmadramadhan.fly.dev'
mirror: true
endpoints:
  - id: semua
    method: GET
    path: /api
    deskripsi: Semua doa sekaligus (18 KB). Data statis — layak di-mirror. TANPA CORS, wajib lewat proxy.
    params: []
    contohPath: /api
    minUkuranByte: 9267
```

Ukuran response: `semua` ~18.1 KB

## `registry/apis/anitop.yml`

```yaml
slug: anitop
nama: Anitop
kategori: hiburan
deskripsi: Chart musik anime dari Anitrendz. API tidak resmi.
developer:
  nama: Satya Wikananda
  profil: 'https://github.com/satyawikananda'
dokumentasi: 'https://github.com/satyawikananda/anitop'
upstreamName: Anitop API / Anitrendz API (Un-official)
auth: none
cors: open
baseUrl: 'https://anitop.vercel.app'
mirror: false
endpoints:
  - id: musicChart
    method: GET
    path: /api/v1/music-chart
    deskripsi: API tidak resmi — katalog developer saja, jangan dijadikan alat di muka awam.
    params: []
    contohPath: /api/v1/music-chart
    minUkuranByte: 21299
```

Ukuran response: `musicChart` ~41.6 KB

## `registry/apis/jakpost.yml`

```yaml
slug: jakpost
nama: Jakarta Post API
kategori: berita
deskripsi: Berita dari The Jakarta Post. Isi artikel dikembalikan dalam format markdown.
developer:
  nama: Faruq Maulana
  profil: 'https://github.com/faruqmaulana'
dokumentasi: 'https://github.com/faruqmaulana/JAKARTA-POST-API'
upstreamName: Jakarta Post API
auth: none
cors: open
baseUrl: 'https://jakpost.vercel.app'
mirror: false
endpoints:
  - id: kategori
    method: GET
    path: /api/category
    deskripsi: Daftar kategori berita yang tersedia.
    params: []
    contohPath: /api/category
    minUkuranByte: 2867
```

Ukuran response: `kategori` ~5.6 KB

## `registry/apis/kunci-tts.yml` ⚠️ TANPA CORS

```yaml
slug: kunci-tts
nama: Kunci Jawaban TTS
kategori: hiburan
deskripsi: Cari kunci jawaban teka-teki silang dari sebuah pertanyaan.
developer:
  nama: nasrul21
  profil: 'https://github.com/nasrul21'
dokumentasi: 'https://github.com/nasrul21/kunci-tts-api'
upstreamName: Kunci Jawaban TTS API
auth: none
cors: none
baseUrl: 'https://kunci-tts-api.vercel.app'
mirror: false
endpoints:
  - id: jawaban
    method: GET
    path: '/api/answers?question={pertanyaan}'
    deskripsi: Tanpa CORS — wajib lewat proxy.
    params:
      - nama: pertanyaan
        contoh: 'tidak'
        wajib: true
        keterangan: Kata petunjuk TTS
    contohPath: /api/answers?question=tidak
    minUkuranByte: 153
```

Ukuran response: `jawaban` ~0.3 KB

## `registry/apis/lambang-daerah.yml` ⚠️ TANPA CORS

```yaml
slug: lambang-daerah
nama: Lambang Daerah Indonesia
kategori: lokasi
deskripsi: Lambang resmi seluruh provinsi dan kabupaten/kota di Indonesia.
developer:
  nama: Feri Irawan
  profil: 'https://github.com/feri-irawan'
dokumentasi: 'https://github.com/feri-irawan/lambang-daerah-seluruh-indonesia'
upstreamName: Lambang Daerah Seluruh Indonesia
auth: none
cors: none
baseUrl: 'https://symbolsofindonesia.vercel.app'
mirror: false
endpoints:
  - id: provinsi
    method: GET
    path: '/provinces/{ukuranPx}'
    deskripsi: Angka pada path adalah ukuran gambar dalam piksel. Tanpa CORS — wajib lewat proxy.
    params:
      - nama: ukuranPx
        contoh: '200'
        wajib: true
        keterangan: Ukuran gambar dalam piksel
    contohPath: /provinces/200
    minUkuranByte: 972
```

Ukuran response: `provinsi` ~1.9 KB

## `registry/apis/harga-emas.yml` ⚠️ TANPA CORS

```yaml
slug: harga-emas
nama: Harga Emas Logam Mulia
kategori: finansial
deskripsi: Harga emas dan logam mulia dari beberapa sumber dalam negeri.
developer:
  nama: cacing69
  profil: 'https://github.com/cacing69'
dokumentasi: 'https://github.com/cacing69/logam-mulia-api'
upstreamName: API Harga Emas/Logam Mulia
auth: none
cors: none
baseUrl: 'https://logam-mulia-api.iamutaki.workers.dev'
mirror: false
endpoints:
  - id: anekalogam
    method: GET
    path: /api/prices/anekalogam
    deskripsi: Hosting di Cloudflare Workers — kecil kemungkinan mati kena tagihan. Tanpa CORS.
    params: []
    contohPath: /api/prices/anekalogam
    minUkuranByte: 1894
```

Ukuran response: `anekalogam` ~3.7 KB

## `registry/apis/dua-dhikr.yml`

```yaml
slug: dua-dhikr
nama: 'Doa & Dzikir'
kategori: agama-islam
deskripsi: Kumpulan doa dan dzikir harian dalam beberapa bahasa.
developer:
  nama: fitrahive
  profil: 'https://github.com/fitrahive'
dokumentasi: 'https://github.com/fitrahive/dua-dhikr'
upstreamName: 'Dua & Dhikr'
auth: none
cors: open
baseUrl: 'https://dua-dhikr.vercel.app'
mirror: false
endpoints:
  - id: bahasa
    method: GET
    path: /languages
    deskripsi: Daftar bahasa. Satu-satunya endpoint yang TIDAK butuh header Accept-Language.
    params: []
    contohPath: /languages
    minUkuranByte: 120
  - id: kategori
    method: GET
    path: /categories
    deskripsi: Daftar kategori. WAJIB header Accept-Language, tanpa itu balas 400.
    headers:
      Accept-Language: 'id'
    params: []
    contohPath: /categories
    minUkuranByte: 153
  - id: isiKategori
    method: GET
    path: '/categories/{slug}'
    deskripsi: 'Isi satu kategori. Slug: morning-dhikr, evening-dhikr, daily-dua. WAJIB header Accept-Language.'
    headers:
      Accept-Language: 'id'
    params:
      - nama: slug
        contoh: 'daily-dua'
        wajib: true
        keterangan: 'morning-dhikr | evening-dhikr | daily-dua'
    contohPath: /categories/daily-dua
    minUkuranByte: 1894
```

Ukuran response: `bahasa` ~0.1 KB · `kategori` ~0.3 KB · `isiKategori` ~3.7 KB

## `registry/apis/staticquran.yml`

```yaml
slug: staticquran
nama: Al-Qur'an staticquran
kategori: agama-islam
deskripsi: Al-Qur'an dengan pilihan qari untuk audio murottal.
developer:
  nama: rzkytmgr
  profil: 'https://github.com/rzkytmgr'
dokumentasi: 'https://github.com/rzkytmgr/quran-api'
upstreamName: Quran API
auth: none
cors: open
baseUrl: 'https://staticquran.vercel.app'
mirror: false
endpoints:
  - id: qari
    method: GET
    path: /api/v1/reciters
    deskripsi: Daftar qari untuk audio murottal.
    params: []
    contohPath: /api/v1/reciters
    minUkuranByte: 665
  - id: daftarSurat
    method: GET
    path: /api/v1/surah
    deskripsi: 114 surat (64 KB).
    params: []
    contohPath: /api/v1/surah
    minUkuranByte: 32716
  - id: detailSurat
    method: GET
    path: '/api/v1/surah/{nomor}'
    deskripsi: Detail satu surat.
    params:
      - nama: nomor
        contoh: '1'
        wajib: true
        keterangan: Nomor surat 1-114
    contohPath: /api/v1/surah/1
    minUkuranByte: 1792
```

Ukuran response: `qari` ~1.3 KB · `daftarSurat` ~63.9 KB · `detailSurat` ~3.5 KB

## `registry/apis/pesantren.yml`

```yaml
slug: pesantren
nama: Pesantren se-Indonesia
kategori: pendidikan
deskripsi: Data pondok pesantren di seluruh Indonesia.
developer:
  nama: nasrul21
  profil: 'https://github.com/nasrul21'
dokumentasi: 'https://github.com/nasrul21/data-pesantren-indonesia'
upstreamName: Pesantren se Indonesia
auth: none
cors: open
baseUrl: 'https://api-pesantren-indonesia.vercel.app'
mirror: true
endpoints:
  - id: provinsi
    method: GET
    path: /provinsi.json
    deskripsi: Daftar provinsi. Data statis — layak di-mirror.
    params: []
    contohPath: /provinsi.json
    minUkuranByte: 563
  - id: kabupaten
    method: GET
    path: '/kabupaten/{kodeProvinsi}.json'
    deskripsi: Kabupaten dalam satu provinsi. Pakai kode provinsi 2 digit.
    params:
      - nama: kodeProvinsi
        contoh: '32'
        wajib: true
        keterangan: Kode provinsi 2 digit
    contohPath: /kabupaten/32.json
    minUkuranByte: 460
```

Ukuran response: `provinsi` ~1.1 KB · `kabupaten` ~0.9 KB

## `registry/apis/myinstants.yml`

```yaml
slug: myinstants
nama: MyInstants (unofficial)
kategori: hiburan
deskripsi: Papan tombol suara dari MyInstants. API tidak resmi.
developer:
  nama: abdipr
  profil: 'https://github.com/abdipr'
dokumentasi: 'https://github.com/abdipr/myinstants-api'
upstreamName: MyInstants Unofficial REST API
auth: none
cors: open
baseUrl: 'https://myinstants-api.vercel.app'
mirror: false
endpoints:
  - id: detail
    method: GET
    path: '/detail?id={id}'
    deskripsi: API tidak resmi — JANGAN dijadikan alat di muka awam (SPEC §13). Katalog developer saja.
    params:
      - nama: id
        contoh: 'akh-26815'
        wajib: true
        keterangan: ID suara di MyInstants
    contohPath: /detail?id=akh-26815
    minUkuranByte: 307
```

Ukuran response: `detail` ~0.6 KB

## `registry/apis/sekolah-indonesia.yml`

```yaml
slug: sekolah-indonesia
nama: Data Sekolah Indonesia
kategori: pendidikan
deskripsi: Daftar sekolah se-Indonesia beserta NPSN, alamat, dan koordinat.
developer:
  nama: Alwan (wanrabbae)
  profil: 'https://github.com/wanrabbae'
dokumentasi: 'https://github.com/wanrabbae/api-sekolah-indonesia'
upstreamName: API Data Sekolah Indonesia
auth: none
cors: open
baseUrl: 'https://api-sekolah-indonesia.vercel.app'
mirror: false
endpoints:
  - id: daftar
    method: GET
    path: '/sekolah?page={halaman}&perPage={perHalaman}'
    deskripsi: 'Berhalaman. lintang & bujur berupa STRING — parseFloat sebelum dipakai di peta.'
    params:
      - nama: halaman
        contoh: '1'
        wajib: true
        keterangan: Nomor halaman
      - nama: perHalaman
        contoh: '2'
        wajib: true
        keterangan: Jumlah data per halaman
    contohPath: '/sekolah?page=1&perPage=2'
    minUkuranByte: 460
```

Ukuran response: `daftar` ~0.9 KB
