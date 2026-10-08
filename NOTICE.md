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

**Pengecualian — dua ratus dua puluh delapan entri dari public-apis.** Dua ratus dua puluh delapan berkas registry
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
`iss-wheretheiss.yml`, `geolokasi-ipwhois.yml`, `github-pengguna.yml`, `alamat-nominatim.yml`, `peluncuran-roket-launchlibrary.yml`, `covid-disease.yml`, `film-ghibli.yml`, `gambar-kucing-thecatapi.yml`, `cuaca-historis-open-meteo.yml`, `nobel-prize.yml`, `kartu-remi-deckofcards.yml`, `lelucon-bapak-dadjoke.yml`, `negara-countriesnow.yml`, `game-gratis-freetogame.yml`, `ya-tidak-yesno.yml`, `data-dummyjson.yml`, `toko-palsu-fakestore.yml`, `fakta-iseng-uselessfacts.yml`, `genshin-jmp.yml`, `kutipan-kanye.yml`, `lelucon-official-joke.yml`, `data-jsonplaceholder.yml`, `http-httpbin.yml`, `ip-saya-ipify.yml`, `kartu-mtg.yml`, `digimon-digiapi.yml`, `kopi-sampleapis.yml`, `star-wars-swapi.yml`, `harry-potter-hpapi.yml`, `dnd-5e.yml`, `yugioh-ygoprodeck.yml`, `got-ice-and-fire.yml`, `dragon-ball-api.yml`, `terjemahan-mymemory.yml`, `warna-colorapi.yml`, `catur-chesscom.yml`, `olahraga-thesportsdb.yml`, `valorant-api.yml`, `formula1-ergast.yml`, `dota-opendota.yml`, `trivia-the-trivia-api.yml`, `puisi-poetrydb.yml`, `anime-kitsu.yml`, `final-space-api.yml`, `fakta-anjing-dogapi.yml`, `biodiversitas-gbif.yml`, `takson-inaturalist.yml`, `meme-templat-imgflip.yml`, `meme-reddit-memeapi.yml`, `catur-lichess.yml`, `disney-api.yml`, `nasa-gambar.yml`, `game-diskon-cheapshark.yml`, `kartu-pokemon-tcg.yml`, `demon-slayer-api.yml`, `switch-games-sampleapis.yml`, `kartu-scryfall.yml`, `air-usgs.yml`, `alamat-addressmock.yml`, `alamat-adresse.yml`, `alamat-moradas.yml`, `anime-nekosbest.yml`, `arsip-internet.yml`, `balap-racinghub.yml`, `bank-ifsc.yml`, `berita-tensorfeed.yml`, `bir-openbrew.yml`, `bitcoin-halving.yml`, `cari-onefind.yml`, `cdn-jsdelivr.yml`, `cep-brasilapi.yml`, `cep-pontofato.yml`, `cep-viacep.yml`, `crates-statistik.yml`, `cuaca-ensembel.yml`, `cuaca-hko.yml`, `cuaca-ipma.yml`, `cuaca-nasapower.yml`, `cuaca-nws.yml`, `cuaca-rainviewer.yml`, `cve-nvd.yml`, `data-sampuli.yml`, `digimon-vercel.yml`, `dnd-open5e.yml`, `doa-harian-fly.yml`, `doi-datacite.yml`, `ekstensi-openvsx.yml`, `f1-openf1.yml`, `f1-openliga.yml`, `fakta-fox.yml`, `fbi-wanted.yml`, `forum-4chan.yml`, `gambar-dog.yml`, `gambar-duck.yml`, `game-ffxiv.yml`, `game-gamerpower.yml`, `game-gw2.yml`, `game-gzw.yml`, `game-l2cal.yml`, `game-mcsrv.yml`, `game-mmobomb.yml`, `game-playerdb.yml`, `gen-mygene.yml`, `genre-musik.yml`, `geo-ibge.yml`, `geo-ipjs.yml`, `got-thronesapi.yml`, `hoki-nhl.yml`, `http-postmanecho.yml`, `hukum-georgia.yml`, `ikon-iconify.yml`, `isro-wahana.yml`, `jadwal-sholat-lakuapik.yml`, `kamus-sunda-hibersunda.yml`, `karbon-inggris.yml`, `kartu-tcgdex.yml`, `karya-openalex.yml`, `kbbi-raf555.yml`, `kemanusiaan-hdx.yml`, `kerja-aidevboard.yml`, `kerja-aijobs.yml`, `kerja-freehire.yml`, `kerja-kurator.yml`, `kodepos-postali.yml`, `kodepos-postcodes.yml`, `kodepos-searchpin.yml`, `kripto-coinlore.yml`, `kripto-llama-harga.yml`, `kripto-llama-tvl.yml`, `kurs-awesome.yml`, `kurs-fawaz.yml`, `kurs-fulus.yml`, `kurs-nbp.yml`, `kurs-vat.yml`, `kutipan-katanime.yml`, `kutipan-lucifer.yml`, `kutipan-stranger.yml`, `kutipan-stromberg.yml`, `lelucon-geek.yml`, `libur-caldays.yml`, `libur-inggris.yml`, `literatur-europepmc.yml`, `literatur-inspire.yml`, `llm-modelfax.yml`, `mail-guerrilla.yml`, `mailtm-domain.yml`, `makan-racion.yml`, `makanan-bacon.yml`, `matematika-newton.yml`, `meme-memesio.yml`, `mempool-blok.yml`, `meta-apisguru.yml`, `mobil-wheelwise.yml`, `monster-mhw.yml`, `nfl-nopunt.yml`, `paket-hexpm.yml`, `paket-homebrew.yml`, `paket-npm.yml`, `paket-nuget.yml`, `pasar-sellerscalc.yml`, `pasar-universalis.yml`, `pemain-tetrio.yml`, `pesan-swarm.yml`, `pesawat-aviation.yml`, `polisi-inggris.yml`, `protein-rcsb.yml`, `puasa-sunnah-granite.yml`, `quran-qurancloud.yml`, `radio-browser.yml`, `recall-makanan.yml`, `reksadana-mfapi.yml`, `reqres-pengguna.yml`, `riset-osf.yml`, `robot-botlero.yml`, `ruby-gems.yml`, `saham-sec.yml`, `sapa-hellosalut.yml`, `sihir-potterdb.yml`, `solo-sololuck.yml`, `sosial-bluesky.yml`, `sosial-hackernews.yml`, `status-digitalocean.yml`, `takson-itis.yml`, `tas-birkin.yml`, `uuid-generator.yml`, `vin-nhtsa.yml`, `wiki-runescape.yml`, `wilayah-bdapis.yml`, dan `wilayah-nusantara.yml`))
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
WhereTheISS.at, ipwho.is, GitHub, Launch Library 2, disease.sh, Studio Ghibli, TheCatAPI, Nobel Prize, Deck of Cards, icanhazdadjoke, CountriesNow, FreeToGame, yesno.wtf, DummyJSON, Fake Store, Useless Facts, Genshin (jmp.blue), kanye.rest, Official Joke, JSONPlaceholder, httpbin, ipify, Magic The Gathering, Digimon, SampleAPIs, Star Wars, Harry Potter, Yu-Gi-Oh, Game of Thrones, Dragon Ball, MyMemory, The Color API, Chess.com, TheSportsDB, Valorant, Formula 1 (Ergast), OpenDota, The Trivia API, PoetryDB, Kitsu, Final Space, dogapi.dog, GBIF, iNaturalist, Imgflip, Meme API, Lichess, Disney, NASA Images, CheapShark, Pokémon TCG, Demon Slayer, SampleAPIs, Scryfall, Katanime, Doa Fly, Hibersunda, Nusantara, Lakuapik, KBBI raf555, Puasa Granite, OpenAlex, Europe PMC, DataCite, MyGene, RCSB PDB, ITIS, INSPIRE-HEP, OSF, USGS Water, Newton, Botlero, NWS, RainViewer, NASA POWER, IPMA, NOAA Aviation, HKO, Open-Meteo Ensemble, Radio Browser, Bacon Ipsum, Genrenator, ISRO, UUID, PlayerDB, mcsrvstat, GamerPower, FFXIV Collect, MMOBomb, L2Calendar, MHW-DB, RuneScape Wiki, TETR.IO, TCGdex, GW2, Geek jokes, Lucifer, Stranger Things, ThronesAPI, Open5e, RacingHub, OpenF1, OpenLigaDB, NoPunt, NHL, Universalis, GZW, Digimon Vercel, CalDays, GOV.UK, NHTSA, Wheelwise, GeoJS, Postcodes.io, ViaCep, SearchPinCode, IBGE, PontoFato, adresse Etalab, BdAPIs, BrasilAPI, Moradas, HelloSalut, Postali, ipgeolocationapi, Fawaz currency, AwesomeAPI, Fulusly, VATComply, NBP, DefiLlama, CoinLore, Mempool, IFSC, SEC EDGAR, mfapi.in, why21million, SoloLuck, npm, Homebrew, RubyGems, NuGet, Open VSX, Hex, jsDelivr, DO Status, ReqRes, APIs.guru, crates.io, Guerrilla Mail, Mail.TM, SellersCalc, BirkinBagStock, AIDevBoard, FreeHire, CuratorSearch, AIJobs, Sampuli, AddressMock, Modelfax, OneFindMe, Postman Echo, FBI Wanted, Internet Archive, Quran Cloud, TensorFeed, HDX, Legal Georgia, NVD, UK Police, 4chan, Hacker News, Bluesky, food recalls, Racion, Open Brewery DB, Carbon Intensity, Iconify, Neko, Quran Cloud).

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
