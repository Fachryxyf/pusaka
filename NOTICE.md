# NOTICE — batas lisensi

Repo ini memuat empat jenis bahan dengan status hukum yang **berbeda**. `LICENSE` (MIT)
tidak berlaku untuk semuanya. Berkas ini ada supaya tidak ada yang mengira seluruh isi
repo boleh dipakai dengan syarat yang sama.

| Bahan | Berkas | Status |
|---|---|---|
| 1. Kode Pusaka | `app/`, `alat/`, `lib/`, `komponen/`, `scripts/`, `registry/schema.ts`, berkas konfigurasi | **MIT** — lihat [`LICENSE`](./LICENSE) |
| 2. Katalog & dokumen riset turunan | `BACKLOG-API.md`, `REGISTRY-SEED.md`, `registry/apis/*.yml` | Turunan dari karya **CC BY 4.0** — lihat bagian 2 di bawah |
| 3. Catatan bentuk response | `REFERENCE.md`, `UI-SPEC.md`, `SPEC.md`, `TASKS.md` | Tulisan sendiri (MIT), tapi memuat **cuplikan response** milik penerbit — lihat bagian 3 |
| 4. Snapshot data | `public/mirror/*.json` | **Milik penerbit aslinya.** Tidak dilisensikan ulang oleh repo ini — lihat bagian 4 |

## 1. Kode

Semua kode di repo ini berlisensi MIT. Silakan pakai, ubah, dan sebarkan dengan
mencantumkan pemberitahuan lisensinya.

## 2. Katalog API turunan

Daftar API, nama penerbit, dan pengelompokan kategori diturunkan dari
[DAFTAR-API-LOKAL-INDONESIA](https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA)
oleh farizdotid, berlisensi
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Yang **kami tambahkan** di atasnya — base URL, path endpoint, ambang `minUkuranByte`,
hasil probe, dan penilaian tier — adalah karya sendiri, tapi karena tercampur dalam berkas
yang sama, perlakukan `BACKLOG-API.md`, `REGISTRY-SEED.md`, dan `registry/apis/*.yml`
sebagai **CC BY 4.0** dan cantumkan atribusi ke farizdotid saat menyebarkannya.

**Pengecualian — sembilan puluh enam entri dari public-apis.** Sembilan puluh enam berkas registry
(`hari-libur-nager.yml`, `kurs-frankfurter.yml`, `cuaca-open-meteo.yml`,
`geocoding-open-meteo.yml`, `worldbank-indikator.yml`, `buku-openlibrary.yml`,
`kripto-coingecko.yml`, `kualitas-udara-open-meteo.yml`, `wikipedia-id.yml`,
`matahari-sunrise-sunset.yml`, `resep-themealdb.yml`, `pokemon-pokeapi.yml`,
`produk-openfoodfacts.yml`, `geolokasi-ipapi.yml`, `waktu-timeapi.yml`,
`anjing-dogceo.yml`, `nasihat-adviceslip.yml`, `prediksi-nama-nationalize.yml`,
`ketinggian-open-meteo.yml`, `umur-agify.yml`, `gender-genderize.yml`,
`orang-acak-randomuser.yml`, `rick-morty.yml`, `tv-tvmaze.yml`,
`kamus-dictionary.yml`, `kata-datamuse.yml`, `berita-antariksa-spaceflight.yml`,
`minuman-cocktaildb.yml`, `jokes-chucknorris.yml`, `jokes-jokeapi.yml`,
`seni-artic.yml`, `seni-metmuseum.yml`, `kripto-coinpaprika.yml`,
`fakta-kucing-catfact.yml`, `sejarah-wikipedia.yml`, `musik-musicbrainz.yml`,
`gelombang-laut-open-meteo.yml`, `banjir-open-meteo.yml`, `gempa-global-usgs.yml`,
`iss-wheretheiss.yml`, `geolokasi-ipwhois.yml`, `github-pengguna.yml`, `alamat-nominatim.yml`, `peluncuran-roket-launchlibrary.yml`, `covid-disease.yml`, `film-ghibli.yml`, `gambar-kucing-thecatapi.yml`, `cuaca-historis-open-meteo.yml`, `nobel-prize.yml`, `kartu-remi-deckofcards.yml`, `lelucon-bapak-dadjoke.yml`, `negara-countriesnow.yml`, `game-gratis-freetogame.yml`, `ya-tidak-yesno.yml`, `data-dummyjson.yml`, `toko-palsu-fakestore.yml`, `fakta-iseng-uselessfacts.yml`, `genshin-jmp.yml`, `kutipan-kanye.yml`, `lelucon-official-joke.yml`, `data-jsonplaceholder.yml`, `http-httpbin.yml`, `ip-saya-ipify.yml`, `kartu-mtg.yml`, `digimon-digiapi.yml`, `kopi-sampleapis.yml`, `star-wars-swapi.yml`, `harry-potter-hpapi.yml`, `dnd-5e.yml`, `yugioh-ygoprodeck.yml`, `got-ice-and-fire.yml`, `dragon-ball-api.yml`, `terjemahan-mymemory.yml`, `warna-colorapi.yml`, `catur-chesscom.yml`, `olahraga-thesportsdb.yml`, `valorant-api.yml`, `formula1-ergast.yml`, `dota-opendota.yml`, `trivia-the-trivia-api.yml`, `puisi-poetrydb.yml`, `anime-kitsu.yml`, `final-space-api.yml`, `fakta-anjing-dogapi.yml`, `biodiversitas-gbif.yml`, `takson-inaturalist.yml`, `meme-templat-imgflip.yml`, `meme-reddit-memeapi.yml`, `catur-lichess.yml`, `disney-api.yml`, `nasa-gambar.yml`, `game-diskon-cheapshark.yml`, `kartu-pokemon-tcg.yml`, `demon-slayer-api.yml`, `switch-games-sampleapis.yml`, dan `kartu-scryfall.yml`)
**tidak** diturunkan dari daftar farizdotid, melainkan dipetakan dari direktori
[public-apis/public-apis](https://github.com/public-apis/public-apis) yang berlisensi
**MIT**. Untuk berkas-berkas itu, atribusi ke farizdotid tidak berlaku; yang
berlaku adalah ketentuan MIT public-apis (pertahankan pemberitahuan lisensinya). Hak atas
**data** yang dikembalikan tiap API tetap milik penerbit masing-masing dan dicatat
per-berkas di field `provenance` — mulai dari MIT (Nager.Date, Frankfurter), CC BY 4.0
(Open-Meteo, World Bank), CC BY-SA 4.0 (Wikipedia, TVmaze), ODbL (Open Food Facts, Nominatim/OpenStreetMap), CC0 (Art Institute of Chicago,
The Met, MusicBrainz), domain publik (USGS), OGL 1.0a (D&D 5e SRD), sampai
`unknown` untuk yang belum menyatakan lisensi data API-nya secara tegas (Open Library,
CoinGecko, Sunrise-Sunset, TheMealDB, PokeAPI, ipapi.co, TimeAPI, Dog CEO, Advice Slip,
Nationalize, Agify, Genderize, Random User, Rick and Morty, Free Dictionary, Datamuse,
Spaceflight News, TheCocktailDB, Chuck Norris IO, JokeAPI, CoinPaprika, Cat Facts,
WhereTheISS.at, ipwho.is, GitHub, Launch Library 2, disease.sh, Studio Ghibli, TheCatAPI, Nobel Prize, Deck of Cards, icanhazdadjoke, CountriesNow, FreeToGame, yesno.wtf, DummyJSON, Fake Store, Useless Facts, Genshin (jmp.blue), kanye.rest, Official Joke, JSONPlaceholder, httpbin, ipify, Magic The Gathering, Digimon, SampleAPIs, Star Wars, Harry Potter, Yu-Gi-Oh, Game of Thrones, Dragon Ball, MyMemory, The Color API, Chess.com, TheSportsDB, Valorant, Formula 1 (Ergast), OpenDota, The Trivia API, PoetryDB, Kitsu, Final Space, dogapi.dog, GBIF, iNaturalist, Imgflip, Meme API, Lichess, Disney, NASA Images, CheapShark, Pokémon TCG, Demon Slayer, SampleAPIs, Scryfall).

## 3. Cuplikan response di dokumen

`REFERENCE.md` memuat potongan response asli dari API pihak ketiga, dipakai sebatas yang
perlu untuk mendokumentasikan nama dan tipe field. Nilai-nilai di dalamnya tetap milik
penerbit masing-masing; keberadaannya di sini tidak memberikan hak pakai apa pun atas
data itu.

## 4. Snapshot mirror

`public/mirror/*.json` adalah salinan response API pihak ketiga, dibuat supaya alatnya
tetap berfungsi saat sumber aslinya mati (alasannya di [`SPEC.md`](./SPEC.md) §8).

**Snapshot ini tidak dilisensikan MIT.** Tiap salinan hanya dibuat kalau dasar hak
salinnya tercatat di registry, pada field `provenance.kebijakanMirror`. Aturan ini
dipaksakan oleh skema (`registry/schema.ts`) dan diuji oleh `scripts/tes-mirror.ts`:
API dengan `mirror: true` **tidak lolos validasi** kalau `kebijakanMirror` masih
`unknown`, dan snapshot yang tidak punya dasar di registry akan ditolak sebagai yatim.

Yang sedang di-mirror saat ini:

| API | Dasar |
|---|---|
| `jpl-ssd` | JPL meminta **sitasi**, bukan melarang penyalinan. Mirror wajib karena API-nya tanpa CORS |
| `wilayah-idn-area` | Repo sumbernya **MIT**, yang mengizinkan penyalinan dengan pencantuman lisensi |

Yang **tidak** di-mirror, beserta alasannya:

| API | Alasan |
|---|---|
| `wilayah-emsifa` | Repo sumbernya tidak memuat berkas lisensi sama sekali. Tanpa lisensi berarti hak salin tidak diberikan, jadi `mirror` diubah ke `false` pada 2026-08-20 dan snapshotnya dihapus |
| `quran-equran` | [Syarat layanan](https://equran.id/terms) pasal 7: teks Al-Qur'an bebas dipakai, **tapi** terjemahan, tafsir, dan audio yang mereka kembangkan dilindungi hak cipta |
| `sholat-myquran` | Tidak ada pernyataan lisensi yang bisa ditemukan. `unknown` bukan izin — meski daftar 518 kotanya statis dan secara teknis ideal untuk di-mirror |
| `kodepos-sooluh` | **Boleh** secara lisensi (Apache-2.0), tapi kedua endpoint berparameter sehingga kombinasinya tak terbatas dan tidak bisa di-snapshot |
| `berita-indo` | Repo sumbernya tanpa berkas lisensi, dan isinya berupa berita milik medianya masing-masing. Berita juga kedaluwarsa cepat |
| `gempa-bmkg`, `cuaca-bmkg` | BMKG tidak menyatakan lisensi. Mewajibkan pencantuman sumber, dan itu kami lakukan, tapi hak salin tidak dinyatakan |

## 5. Atribusi yang diwajibkan penerbit

Beberapa penerbit **mensyaratkan** pencantuman sumber. Ini kewajiban, bukan sopan santun,
dan sudah tercatat per API di `provenance.atribusi`:

- **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** — dinyatakan di
  [halaman prakiraan cuaca](https://data.bmkg.go.id/prakiraan-cuaca/): *"Wajib untuk
  mencantumkan BMKG sebagai sumber data dan menampilkannya pada aplikasi/sistem Anda."*
  Batas akses 60 permintaan per menit per IP.
- **Solar System Dynamics, Jet Propulsion Laboratory** — [meminta
  sitasi](https://ssd.jpl.nasa.gov/about/) dalam bentuk
  *"Solar System Dynamics. (Downloaded Year, Month, Date). (Title of the Page).
  https://ssd.jpl.nasa.gov"*.
  Lambang dan logo NASA/JPL **tidak** dipakai di situs ini; keduanya tidak berada di
  domain publik.
- **idn-area** oleh Fityan Nugroho (MIT), **kodepos** oleh sooluh (Apache-2.0),
  **api-wilayah-indonesia** oleh Muhammad Syifa, **EQuran.id**, **api.myquran.com**.
- **berita-indo-api** oleh Satya Wikananda. Isi beritanya milik medianya masing-masing
  (CNN, CNBC, Antara, Tempo, Okezone, Kumparan, Republika, BBC, VOA); alat hanya menampilkan
  judul, ringkasan, dan tautan ke situs aslinya.

Batas akses yang dinyatakan atau terukur, tercatat di `provenance.batasAkses`:

| API | Batas |
|---|---|
| `gempa-bmkg`, `cuaca-bmkg` | 60 permintaan per menit per IP (dinyatakan BMKG) |
| `sholat-myquran` | ~1 permintaan per detik (terukur: permintaan kedua dalam satu detik dibalas 429) |

Batas ini bukan sekadar catatan teknis — menghajar server orang yang membiayainya sendiri
adalah masalah etika, bukan cuma masalah performa.

## 6. Batas yang kami jaga

- **Ketersediaan bukan izin.** API yang hidup tidak otomatis boleh dijadikan alat di muka
  awam. API unofficial dan scraper (LK21, Filmapik, dan sejenisnya) tetap hanya berada di
  katalog developer, tidak pernah jadi alat — lihat [`SPEC.md`](./SPEC.md) §13.
- **`unknown` ditulis apa adanya.** Kalau penerbit tidak menyatakan lisensi, field
  `provenance.lisensi` berisi `unknown`, bukan tebakan yang terdengar aman. Prinsip yang
  sama dipakai untuk nama field dan status API (`SPEC.md` §12).
- Semua tanggal pemeriksaan ada di `provenance.diperiksa`. Status ini bisa berubah;
  kalau kamu menemukan pernyataan lisensi yang lebih baru, perbarui registry-nya.
