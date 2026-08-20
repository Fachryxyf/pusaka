# UI-SPEC — Spesifikasi Tampilan per Alat

> **Setiap elemen UI di dokumen ini diikat ke jalur field yang sungguh-sungguh ada.**
> Semua jalur sudah diverifikasi terhadap response asli — lihat [`REFERENCE.md`](./REFERENCE.md).
>
> Kalau kamu butuh menampilkan sesuatu yang tidak ada di tabel pengikatan di bawah:
> **field itu kemungkinan besar tidak ada di response.** Cek `REFERENCE.md` dulu.
> Jangan tampilkan field yang tidak kamu lihat dengan mata sendiri di response asli.

Dipakai bareng [`SPEC.md`](./SPEC.md) · [`TASKS.md`](./TASKS.md) ·
[`REFERENCE.md`](./REFERENCE.md) · [`REGISTRY-SEED.md`](./REGISTRY-SEED.md).

Enam alat di dokumen ini semuanya bersumber dari API yang sudah terverifikasi hidup.
Alat lain menyusul setelah risetnya selesai (TASKS Tahap 7).

---

## Bagian 1 — Aturan yang berlaku untuk SEMUA alat

### 1.1 Lima keadaan wajib

Setiap alat **wajib** menangani kelimanya. Alat dianggap belum selesai kalau ada yang bolong.

| Keadaan | Kapan | Yang ditampilkan |
|---|---|---|
| `loading` | Permintaan sedang jalan | Kerangka (skeleton), **bukan** spinner kosong. Bentuknya menyerupai isi akhir |
| `error` | Gagal total, ketiga lapis habis | Pesan bahasa Indonesia yang manusiawi + tombol "Coba lagi". **Jangan** tampilkan pesan error mentah |
| `kosong` | Berhasil tapi hasilnya nol | "Tidak ada hasil untuk …" + saran perbaikan. **Bukan** halaman putih |
| `mirror` | Data dari snapshot (SPEC §8 lapis 3) | Banner: "Data per {tanggal} — sumber aslinya sedang bermasalah." Isinya tetap ditampilkan |
| `normal` | Semua lancar | Isi sesuai spesifikasi masing-masing di bawah |

### 1.2 Sumber data

Semua alat mengambil data lewat `useApi` (SPEC §8). **Tidak ada alat yang memanggil `fetch`
sendiri.** Hook mengembalikan `{ data, loading, error, sumber, per }` — `sumber` menentukan
apakah banner mirror muncul.

### 1.3 Aturan format bersama

| Hal | Aturan | Alasan |
|---|---|---|
| Angka berupa string | `parseFloat` dulu sebelum dibandingkan/diurutkan | `Magnitude` itu `"4.1"`. Diurutkan sebagai teks, `"10.0"` jatuh sebelum `"4.1"` |
| Kode wilayah, NPSN, kode pos | **Tetap string.** Jangan `parseInt` | Bisa berawalan nol dan itu bermakna |
| Waktu | Tampilkan apa adanya dari API kalau sudah diformat | BMKG sudah mengirim `"09:59:47 WIB"` — jangan diolah ulang |
| Teks ber-HTML | Ada field yang isinya mengandung tag (mis. `<i>`) | Perlu sanitasi sebelum di-render. Jangan `dangerouslySetInnerHTML` mentah |
| Koordinat | `parseFloat` sebelum dipakai di peta | Sebagian dikirim sebagai string |

### 1.4 Kontrol yang tidak boleh dipakai

Ditambahkan 2026-08-20. Tampilan bawaan browser dirender oleh sistem operasi, jadi tidak
bisa diseragamkan antar platform. Yang dilarang beserta penggantinya:

| Jangan | Pakai | Alasan |
|---|---|---|
| `<select>` mentah | `komponen/Pilih.tsx` | Dropdown bawaan dirender OS. Penggantinya mengikuti pola ARIA combobox utuh — panah, Home/End, Enter, Escape, Tab, klik-luar, dan pencarian ketik |
| `alert()`, `confirm()`, `prompt()` | pesan di halaman, `role="status"` + `aria-live` | Dialog bawaan memblokir dan tidak bisa ditata |
| emoji sebagai ikon | `komponen/Ikon.tsx` | Emoji dirender beda tiap OS dan tidak bisa diwarnai |
| `<audio controls>` | `komponen/PemutarAudio.tsx` | Bilah pemutar bawaan dirender OS. Elemen `<audio>` tetap dipakai sebagai mesinnya, hanya kontrolnya yang diganti |
| `dangerouslySetInnerHTML` | `komponen/TeksBertag.tsx` | Tidak ada jalur dari data pihak ketiga ke `innerHTML`. Daftar-putih tag dilakukan saat mengurai, bukan setelahnya |
| `outline: none` tanpa pengganti | kelas `.fokus-cincin` | Indikator fokus **wajib ada** — satu-satunya petunjuk posisi bagi pengguna papan tombol. Boleh diganti, tidak boleh dihapus |

Scrollbar ditata tipis mengikuti tema di `app/globals.css`, dan
`prefers-reduced-motion: reduce` dihormati.

### 1.5 Aksesibilitas & responsif

- Sasaran utama pengguna adalah **orang awam di HP**. Rancang mobile-first.
- Setiap kontrol punya `<label>`. Jangan mengandalkan placeholder sebagai label.
- Kontras teks minimal AA. Jangan pakai warna sebagai satu-satunya penanda status.
- Tabel lebar wajib bisa digulir horizontal di dalam wadahnya sendiri.

---

## Bagian 2 — Spesifikasi per alat

---

## Alat 1 — Info Gempa

`slug alat: gempa` · API: `gempa-bmkg` · CORS terbuka, tidak butuh proxy

**Tujuan:** orang bisa tahu gempa terakhir di Indonesia dalam 3 detik setelah halaman terbuka.

```
┌──────────────────────────────────────────┐
│  GEMPA TERKINI                           │
│  ┌────────┐  Pusat gempa berada di darat │
│  │  4.1   │  32 km Timur Laut Sigi       │
│  │   M    │  06 Agu 2026 · 09:59:47 WIB  │
│  └────────┘  Kedalaman 10 km             │
│                                          │
│  Dirasakan: III Sigi                     │
│  [ peta shakemap ]                       │
├──────────────────────────────────────────┤
│  DIRASAKAN MASYARAKAT        (15 terakhir)│
│  4.1  Sigi                  06 Agu 09:59 │
│  3.2  Bantul                06 Agu 07:14 │
│  …                                       │
├──────────────────────────────────────────┤
│  MAGNITUDO 5.0+              (15 terakhir)│
│  5.8  Melonguane            05 Agu 22:03 │
│  …                                       │
└──────────────────────────────────────────┘
```

### Pengikatan field — bagian "Gempa Terkini" (endpoint `autogempa`)

| Elemen UI | Jalur field |
|---|---|
| Angka magnitudo besar | `Infogempa.gempa.Magnitude` |
| Deskripsi wilayah | `Infogempa.gempa.Wilayah` |
| Tanggal | `Infogempa.gempa.Tanggal` |
| Jam | `Infogempa.gempa.Jam` |
| Kedalaman | `Infogempa.gempa.Kedalaman` |
| Baris "Dirasakan" | `Infogempa.gempa.Dirasakan` |
| Potensi tsunami | `Infogempa.gempa.Potensi` |
| Gambar shakemap | `https://data.bmkg.go.id/DataMKG/TEWS/` + `Infogempa.gempa.Shakemap` |
| Koordinat (opsional) | `Infogempa.gempa.Lintang`, `.Bujur` |

### PENTING — Ketiga endpoint punya set field yang BERBEDA

Ini sudah diverifikasi. Jangan pakai satu komponen kartu untuk ketiganya tanpa penjagaan:

| Field | `autogempa` | `terkini` | `dirasakan` |
|---|---|---|---|
| `Potensi` | ada | ada | **TIDAK ADA** |
| `Dirasakan` | ada | **TIDAK ADA** | ada |
| `Shakemap` | ada | **TIDAK ADA** | **TIDAK ADA** |

Selain itu: `autogempa` → `Infogempa.gempa` adalah **objek tunggal**;
`terkini` dan `dirasakan` → `Infogempa.gempa` adalah **array**.

### Aturan format

- Magnitudo: `parseFloat` untuk pewarnaan ambang (≥5.0 beri penekanan visual), tapi
  **tampilkan string aslinya** supaya presisinya tidak berubah.
- Gambar shakemap kadang gagal dimuat → sediakan `onError` yang menyembunyikan gambar,
  jangan biarkan ikon gambar rusak.

### Kasus tepi

- `Potensi`/`Dirasakan` kosong → sembunyikan barisnya, jangan tampilkan label tanpa isi.
- BMKG kadang lambat → skeleton wajib, jangan halaman kosong.

**Selesai kalau:** angka yang tampil sama persis dengan isi
`https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` saat itu, dan ketiga bagian terisi.

---

## Alat 2 — Data Wilayah Indonesia

`slug alat: wilayah` · API: **`wilayah-idn-area`** · CORS terbuka · `mirror: true`

> **PENTING:** **Ada dua API wilayah di registry dan kodenya TIDAK SALING COCOK.** Pakai
> `wilayah-idn-area`. Penjelasan lengkap di bawah — jangan tertukar, alat Cuaca bergantung
> pada ini.

**Tujuan:** cari kode wilayah resmi sampai tingkat kelurahan, dan salin kodenya.

```
┌──────────────────────────────────────────┐
│  Provinsi     [ Jawa Barat          ▾ ]  │
│  Kabupaten    [ Kabupaten Bandung   ▾ ]  │
│  Kecamatan    [ Pangalengan         ▾ ]  │
│  Desa         [ Warnasari           ▾ ]  │
├──────────────────────────────────────────┤
│  Kode wilayah                            │
│  32.04.15.2003                 [ Salin ] │
└──────────────────────────────────────────┘
```

### Pengikatan field

| Elemen | Endpoint | Jalur field |
|---|---|---|
| Pilihan provinsi | `provinsi` | `data[].code` (nilai), `data[].name` (label) |
| Pilihan kabupaten | `kabupaten` | `data[].code`, `data[].name` |
| Pilihan kecamatan | `kecamatan` | `data[].code`, `data[].name` |
| Pilihan desa | `kelurahan` | `data[].code`, `data[].name` |

Response dibungkus `{statusCode, message, data, meta}` — isinya di `data`, bukan di akar.

### PENTING — Dua API wilayah dengan kode yang TIDAK COCOK

Ini sudah diverifikasi dan **hampir membuat alat Cuaca rusak diam-diam**:

| | `wilayah-idn-area` | `wilayah-emsifa` |
|---|---|---|
| Kode Pangalengan | `32.04.15` | `3204040` |
| Kode Warnasari | `32.04.15.2003` | `3204040005` |
| Cocok dengan BMKG | **YA** | **TIDAK** |
| Format | bertitik, Kemendagri terkini | tanpa titik, skema lama |

Menyisipkan titik ke kode emsifa **tidak** menghasilkan kode BMKG — angkanya memang beda.
`3204040005` → `32.04.04.0005` dijawab BMKG dengan **404 Data not found**, sudah diuji.

**Karena itu tidak ada fungsi konversi antar keduanya.** Alat Wilayah dan alat Cuaca
sama-sama memakai `wilayah-idn-area`, dan kodenya dipakai apa adanya tanpa diolah.

`wilayah-emsifa` tetap ada di registry sebagai catatan sejarah dan cadangan, tapi
**jangan dipakai untuk alat apa pun** kecuali sudah dipastikan kodenya tidak menyeberang.

### Aturan

- **`code` adalah STRING dan wajib tetap string.** Jangan `parseInt` — ada titik di dalamnya,
  dan `parseInt('32.04')` menghasilkan `32`.
- Tiap tingkat disaring lewat query: `?provinceCode=`, `?regencyCode=`, `?districtCode=`.
- **Selalu kirim `limit`** yang cukup besar (mis. `100`). Bawaan API ini berhalaman —
  tanpa `limit`, daftar kabupaten/kecamatan bakal terpotong diam-diam.
  Jumlah sebenarnya ada di `meta.pagination.total`; bandingkan dengan panjang `data`
  untuk memastikan tidak ada yang hilang.
- Tingkat berikutnya baru dimuat setelah tingkat di atasnya dipilih. Mengganti pilihan
  di tingkat atas **mengosongkan** semua tingkat di bawahnya.
- Nama daerah dari idn-area sudah Title Case (`Jawa Barat`) — tidak perlu dirapikan.

**Selesai kalau:** Jawa Barat → Kabupaten Bandung → Pangalengan → Warnasari bisa dipilih
tuntas dan menghasilkan kode `32.04.15.2003`, serta jumlah item tiap tingkat sama dengan
`meta.pagination.total`.

---

## Alat 3 — Jadwal Sholat

`slug alat: sholat` · API: `sholat-myquran` · CORS terbuka

```
┌──────────────────────────────────────────┐
│  Kota  [ cari kota…        KOTA JAKARTA ]│
│  DKI JAKARTA · Kamis, 06/08/2026         │
├──────────────────────────────────────────┤
│  Berikutnya: ASHAR dalam 2 jam 14 menit  │
├──────────────────────────────────────────┤
│  Imsak    04:35      Dzuhur   12:02      │
│  Subuh    04:45      Ashar    15:23  ←   │
│  Terbit   05:59      Maghrib  17:58      │
│  Dhuha    06:28      Isya     19:09      │
└──────────────────────────────────────────┘
```

### Pengikatan field (endpoint `jadwal`)

| Elemen | Jalur field |
|---|---|
| Nama kota | `data.lokasi` |
| Provinsi | `data.daerah` |
| Tanggal tampil | `data.jadwal.tanggal` |
| Tanggal ISO (untuk hitungan) | `data.jadwal.date` |
| Imsak / Subuh / Terbit / Dhuha | `data.jadwal.imsak` · `.subuh` · `.terbit` · `.dhuha` |
| Dzuhur / Ashar / Maghrib / Isya | `data.jadwal.dzuhur` · `.ashar` · `.maghrib` · `.isya` |

Pilihan kota dari endpoint `daftarKota`: `data[].id` (nilai), `data[].lokasi` (label).

### Aturan

- **Cek `status === true` dulu** sebelum membaca `data`. Semua response myQuran dibungkus
  `{status, request, data}`.
- **Bulan dan tanggal tetap ditulis dua digit** saat menyusun URL. `8` → `08`, `6` → `06`.
  Catatan 2026-08-21: server ternyata **menerima** satu digit juga, jadi ini bukan lagi bug
  yang menunggu tanggal 1–9. Formatnya tetap dipertahankan karena perilaku yang tidak
  didokumentasikan bisa berubah kapan saja.
- Daftar kota panjang (518 kota, ~21 KB) → wajib ada kotak pencarian, jangan dropdown polos.
  Dipenuhi oleh `komponen/Pilih.tsx`, yang menampilkan kotak pencarian otomatis untuk
  daftar berisi 8 item atau lebih.
- Waktu berikutnya dihitung dari jam lokal pengguna vs kedelapan waktu. Lewat Isya →
  tampilkan Imsak besok, jangan hitungan negatif.
- **PENTING — hitungan itu hanya sah kalau kota sezona dengan pengguna.** Response
  **tidak memuat zona waktu sama sekali** (diperiksa 2026-08-21 untuk kota di WIB, WITA,
  dan WIT; kunci `data` selalu `id, lokasi, daerah, jadwal`). Jam dari API sudah benar untuk
  zona kotanya, tapi membandingkannya dengan jam perangkat pengguna menghasilkan hitungan
  salah bagi siapa pun yang melihat jadwal kota di zona lain.
  Yang diterapkan: bandingkan `data.jadwal.date` dengan tanggal perangkat; kalau berbeda,
  **sembunyikan** baris "berikutnya" dan katakan alasannya di UI. Jangan diam-diam
  menghitung.
- **Muat daftar kota dan jadwal berurutan, jangan serentak.** myQuran membalas 429 pada
  permintaan kedua dalam satu detik. Alat memakai argumen `aktif` pada `useApi` untuk
  menahan permintaan jadwal sampai daftar kota selesai.
- `terbit` dan `dhuha` bukan waktu sholat wajib — boleh ditandai berbeda.

**Selesai kalau:** KOTA JAKARTA (`1301`) cocok dengan
`https://api.myquran.com/v2/sholat/jadwal/1301/{th}/{bl}/{tg}`, **dan tanggal satu digit
(mis. 6 Agustus) tetap benar** — ini kasus uji wajib.

---

## Alat 4 — Prakiraan Cuaca

`slug alat: cuaca` · API: `cuaca-bmkg` + `wilayah-idn-area` · CORS terbuka

```
┌──────────────────────────────────────────┐
│  Lokasi [ Warnasari, Pangalengan      ▾ ]│
│  Bandung, Jawa Barat                     │
├──────────────────────────────────────────┤
│  HARI INI                                │
│  01:00  17°  Berawan                     │
│  04:00  17°  Berawan                     │
│  …                                       │
│  BESOK / LUSA  …                         │
└──────────────────────────────────────────┘
```

### Pengikatan field (endpoint `prakiraan`)

| Elemen | Jalur field |
|---|---|
| Nama desa | `lokasi.desa` |
| Kecamatan | `lokasi.kecamatan` |
| Kabupaten/kota | `lokasi.kotkab` |
| Provinsi | `lokasi.provinsi` |
| Koordinat | `lokasi.lat`, `lokasi.lon` (sudah `float`) |

Butir prakiraan ada di **array bersarang dua tingkat**:
`data[0].cuaca` = array **per hari** → tiap elemen array **per jam**.

**PENTING — jumlahnya tidak tetap.** Pengukuran 2026-08-21 memberi `8+8+2` butir, bukan
`8+8+8`: jendela prakiraan berakhir di tengah hari, jadi kelompok terakhir hampir selalu
sebagian. Yang dijamin hanyalah **tiap sub-array berisi satu tanggal kalender lokal**.
Jangan memberi label hari berdasarkan indeks array.

Jadi satu butir prakiraan = `data[0].cuaca[indeksHari][indeksJam]`:

| Elemen | Jalur field | Catatan |
|---|---|---|
| Waktu lokal | `.local_datetime` | `"2026-08-07 00:00:00"` — sudah waktu lokal, jangan digeser lagi |
| Suhu | `.t` | `int`, satuan °C |
| Keterangan cuaca | `.weather_desc` | Bahasa Indonesia, mis. `"Kabut/Asap"` |
| Ikon cuaca | `.image` | URL penuh ke ikon BMKG |
| Kelembapan | `.hu` | `int`, persen |
| Kecepatan angin | `.ws` | `float` |
| Arah angin | `.wd` | mis. `"NW"` |
| Jarak pandang | `.vs_text` | mis. `"< 200.0 m"` |

### Aturan

- **Jangan pakai `.datetime` atau `.utc_datetime` untuk tampilan** — keduanya UTC.
  Pakai `.local_datetime`. Salah pilih di sini menggeser prakiraan 7 jam.
- **`local_datetime` adalah waktu di LOKASI PRAKIRAAN, bukan waktu pembaca.** Response
  memuat `lokasi.timezone` (mis. `Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`) dan itu
  wajib dipakai untuk apa pun yang membandingkan dengan "sekarang". Momen UTC yang sama
  menghasilkan `01:00` di Jakarta, `02:00` di Makassar, `03:00` di Jayapura.
  Pakai `Intl.DateTimeFormat` dengan opsi `timeZone`; **jangan** `new Date().getHours()`.
- **Jangan berikan `local_datetime` ke `new Date()`.** String `"2026-08-21 01:00:00"` tanpa
  penanda zona ditafsirkan sebagai waktu lokal perangkat oleh sebagian mesin JS dan sebagai
  UTC oleh yang lain. Ambil potongannya sebagai teks (`.slice(11, 16)` untuk jam).
- Kode `adm4` diambil **apa adanya** dari `wilayah-idn-area` (`data[].code`, sudah
  bertitik seperti `32.04.15.2003`). **Tidak ada konversi format apa pun.**
  Jangan sekali-kali memakai kode dari `wilayah-emsifa` — angkanya beda dan BMKG
  akan menjawab 404 (lihat peringatan di Alat 2).
- Pemilih lokasi memakai komponen yang sama dengan alat Wilayah — jangan ditulis dua kali.
  Sudah diangkat jadi `komponen/PemilihWilayah.tsx` pada 2026-08-21, dipakai kedua alat.
  Alat yang butuh API selain `apiSlug` utamanya mendeklarasikannya di `apiPendukung`
  pada metadatanya; halaman alat memuatnya di server dan meneruskannya lewat prop
  `pendukung`.
- Ikon dari domain BMKG (`api-apps.bmkg.go.id`) — beri `onError` kalau gagal dimuat.

**Selesai kalau:** memilih Warnasari, Pangalengan menampilkan prakiraan 3 hari dengan jam
lokal yang benar, dan cocok dengan
`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.04.15.2003`.

---

## Alat 5 — Al-Qur'an

`slug alat: quran` · API: `quran-equran` · CORS terbuka

```
┌──────────────────────────────────────────┐
│  [ cari surat… ]                         │
│  1  Al-Fatihah    Pembukaan      7 ayat  │
│  2  Al-Baqarah    Sapi Betina  286 ayat  │
├──────────────────────────────────────────┤
│  AL-FATIHAH · Pembukaan                  │
│  Mekah · 7 ayat        [ Putar murottal ]│
│                                          │
│  ١  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ            │
│     Bismillāhir-raḥmānir-raḥīm(i).       │
│     Dengan nama Allah Yang Maha…         │
└──────────────────────────────────────────┘
```

### Pengikatan field

**Daftar surat** (endpoint `daftarSurat`, `data` = array 114):

| Elemen | Jalur field |
|---|---|
| Nomor | `data[].nomor` |
| Nama Latin | `data[].namaLatin` |
| Nama Arab | `data[].nama` |
| Arti | `data[].arti` |
| Jumlah ayat | `data[].jumlahAyat` |
| Tempat turun | `data[].tempatTurun` |

**Detail surat** (endpoint `detailSurat`, `data` = **objek**, bukan array):

| Elemen | Jalur field |
|---|---|
| Judul | `data.namaLatin`, `data.nama`, `data.arti` |
| Info | `data.tempatTurun`, `data.jumlahAyat` |
| Deskripsi | `data.deskripsi` — **mengandung tag HTML seperti `<i>`, wajib disanitasi** |
| Audio surat penuh | `data.audioFull["05"]` (Misyari Rasyid) |
| Nomor ayat | `data.ayat[].nomorAyat` |
| Teks Arab | `data.ayat[].teksArab` |
| Transliterasi | `data.ayat[].teksLatin` |
| Terjemahan | `data.ayat[].teksIndonesia` |
| Audio per ayat | `data.ayat[].audio["05"]` |

### Aturan

- **Kunci audio adalah string berangka `"01"`–`"06"`**, satu per qari, bukan array.
  Akses dengan `audio["05"]`, bukan `audio[5]` (`audio[5]` sudah dipastikan `undefined`).
  Pemilih qari **sudah** disediakan; bawaannya `"05"` (Misyari Rasyid Al-Afasi).
  Nama qari tidak ada di response — pemetaannya ada di `REFERENCE.md` dan dijaga tes.
- Teks Arab wajib `dir="rtl"` dan ukuran font lebih besar dari teks latin.
- **`data.deskripsi` sama sekali TIDAK dirender sebagai HTML.** Bukan "disanitasi lalu
  dirender": ia diurai jadi potongan React oleh `komponen/TeksBertag.tsx`, dan hanya `<i>`
  serta `<br>` yang dihormati. `<a>` dibuang beserta atributnya — di surat 38 ada
  `<a href="s002a001.htm">`, tautan relatif yang mati di situs kita, dan `href` dari data
  pihak ketiga adalah permukaan serangan. **Tidak ada `dangerouslySetInnerHTML` di project
  ini, dan jangan menambahkannya.**
- `/surat` → `data` array, `/surat/{n}` → `data` objek. Beda bentuk.
- `data.suratSebelumnya` dan `.suratSelanjutnya` bertipe objek **atau `false`** — bukan
  `null`. Periksa dengan `if (x)`, jangan `x?.nomor`.
- **Audio memakai `komponen/PemutarAudio.tsx`, bukan `<audio controls>`** — kontrol bawaan
  dirender OS dan tidak bisa ditata (§1.4). Elemen `<audio>` tetap jadi mesinnya.
- `/surat/2` berukuran **397 KB**. Jangan memuat semua surat sekaligus, dan jangan pasang
  batas baca di client (SPEC §9).

**Selesai kalau:** daftar 114 surat tampil, Al-Fatihah menampilkan 7 ayat lengkap dengan
Arab + latin + terjemahan, dan audio bisa diputar.

---

## Alat 6 — Kode Pos

`slug alat: kodepos` · API: `kodepos-sooluh` · **CORS terbuka** — tidak butuh proxy

> Ada dua API kode pos di registry. **Pakai `kodepos-sooluh`.** Yang `kodepos-vanmason`
> tanpa CORS dan hanya cadangan.

```
┌──────────────────────────────────────────┐
│  [ cari kelurahan/kecamatan…  ] [ Cari ] │
│  [ Pakai lokasi saya ]                   │
├──────────────────────────────────────────┤
│  46386   Danasari                        │
│          Cisaga, Ciamis, Jawa Barat  WIB │
│  41152   Danasari                        │
│          Jatiluhur, Purwakarta, Jabar    │
└──────────────────────────────────────────┘
```

### Pengikatan field

**Pencarian** (endpoint `cari`, `data` = **array**):

| Elemen | Jalur field |
|---|---|
| Kode pos | `data[].code` |
| Kelurahan | `data[].village` |
| Kecamatan | `data[].district` |
| Kabupaten | `data[].regency` |
| Provinsi | `data[].province` |
| Koordinat | `data[].latitude`, `data[].longitude` |
| Ketinggian | `data[].elevation` |
| Zona waktu | `data[].timezone` |

**Deteksi lokasi** (endpoint `deteksi`, `data` = **objek tunggal**) — field sama persis.

### Aturan

- Bungkusnya `{statusCode, code, data}`. `code` di **akar** adalah status berupa string
  (`"OK"`, `"BAD_REQUEST"`, `"NOT_FOUND"`), sedangkan `code` di dalam `data` adalah
  **kode pos**. Jangan tertukar — ini penamaan yang menjebak.
- Tombol "Pakai lokasi saya" memakai `navigator.geolocation`. Wajib menangani penolakan izin
  dengan pesan yang jelas, bukan diam saja. Ketiga jenis galat dibedakan:
  `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT` — masing-masing punya jalan keluar
  yang berbeda, dan semuanya mengarahkan pengguna kembali ke pencarian nama.
- `data[].code` di sini bertipe `int` (kode pos Indonesia tidak berawalan nol).
- **Hasil dibatasi 20 dan tidak ada `total`.** `page` dan `limit` diabaikan tanpa galat, jadi
  tidak ada cara mengetahui jumlah sebenarnya. Ketika hasilnya tepat 20, **katakan** bahwa
  daftarnya mungkin terpotong — jangan menampilkannya seolah itu seluruh hasil.
- **Validasi koordinat sebelum mengirim.** API menerima `0,0` dan mengembalikan titik di
  Aceh, jadi koordinat kosong menghasilkan jawaban yang terlihat sah tapi salah.
- Pencarian tanpa hasil membalas **200 dengan `data: []`** — itu keadaan `kosong` (§1.1),
  bukan `error`. Koordinat tidak sah membalas 404, dan itu memang `error`.

**Selesai kalau:** mencari "danasari" mengembalikan beberapa hasil dengan kode pos benar,
dan deteksi lokasi mengembalikan satu hasil.

---

## Alat 7 — Berita

`slug alat: berita` · API: `berita-indo` · CORS terbuka — tidak butuh proxy

> Alat ini sempat ditandai **buntu** karena sumber yang diketahui mati 402.
> Riset tier C menemukan `berita-indo-api.vercel.app` masih hidup dengan **14 media
> nasional** dan CORS terbuka.

```
┌──────────────────────────────────────────┐
│  Sumber [ CNN Indonesia ▾ ] [ Semua ▾ ]  │
├──────────────────────────────────────────┤
│  ┌────┐ Eks Ketua DPRD Ponorogo Jadi     │
│  │gbr │ Tersangka Korupsi Tunjangan      │
│  └────┘ Kejari Ponorogo menetapkan…      │
│         6 Agu 2026, 17.17                │
├──────────────────────────────────────────┤
│  … 100 berita                            │
└──────────────────────────────────────────┘
```

### Pengikatan field (endpoint `cnnSemua` / `cnnTipe` / `cnbcSemua`)

| Elemen | Jalur field |
|---|---|
| Jumlah berita | `total` |
| Judul | `data[].title` |
| Tautan artikel | `data[].link` |
| Ringkasan | `data[].contentSnippet` |
| Waktu terbit | `data[].isoDate` — ISO 8601 UTC, **wajib dikonversi ke waktu lokal** |
| Gambar kecil | `data[].image.small` |
| Gambar besar | `data[].image.large` |

### Sumber — diprobe ulang 2026-08-21, 9 hidup dari 14

**Hidup:** `cnn-news` · `cnbc-news` · `antara-news/{tipe}` · `tempo-news` · `okezone-news` ·
`kumparan-news` · `republika-news` · `bbc-news` · `voa`

**MATI (500 dengan body JSON):** `liputan6-news` · `tribun-news` · `jawa-pos` · `vice` ·
`suara`. Semuanya kematian scraper — API hidup, RSS di baliknya berubah atau memblokir.
**Jangan menyalin daftar sumber dari root API**; pakai kesembilan yang ada di registry.

Rubrik hanya ditawarkan untuk sumber yang penyaringannya **sudah dibuktikan**:
CNN (`nasional`, `internasional`, `ekonomi`, `olahraga`, `teknologi`, `hiburan`,
`gaya-hidup`) dan Antara (`terkini` dan sembilan lainnya). BBC punya `listType` di root tapi
hasilnya **identik** dengan tanpa rubrik — jangan ditawarkan.

### PENTING — bentuk `data[]` berbeda di tiap sumber

Tabel pengikatan di atas hanya berlaku untuk CNN dan CNBC. Yang lain berbeda:

| Sumber | Teks ringkas | Gambar |
|---|---|---|
| CNN, CNBC | `contentSnippet` | objek `{small, large}` |
| Republika, VOA | `description` | objek `{small}` |
| Kumparan | `description` | objek `{small, medium, large, extraLarge}` |
| Okezone | `content` | objek `{small, medium, large}` |
| Antara | `description` | **string URL**, bukan objek |
| Tempo | `content` | **tidak ada** |
| BBC | `description` | **tidak ada** |

Normalkan ketujuh bentuk ini jadi satu bentuk internal sebelum merender. Dua jebakan:
`image.small` pada nilai **string** menghasilkan `undefined` tanpa galat, dan tata letak wajib
tetap rapi untuk sumber **tanpa gambar** — bukan menyisakan kotak kosong.

### Aturan

- **Koreksi 2026-08-21 soal `antara-news`:** ia **tidak** mati. Yang 404 hanya
  `/v1/antara-news/` tanpa rubrik, karena root API tidak mencantumkan `all` untuk Antara.
  `/v1/antara-news/terkini` berisi 50 item. Jadi Antara **masuk** ke pilihan, dengan
  `terkini` sebagai bawaan.
- Sumber yang benar-benar mati **disembunyikan dari pilihan**, tidak ditampilkan sebagai
  pilihan yang error. Yang tampil hanya yang terbukti berisi.
- **Sumber bisa hidup tapi datanya beku.** VOA membalas 200 dengan 20 item, tapi berita
  terbarunya berumur 523 hari saat diperiksa. Tampilkan tanggal tiap berita apa adanya, dan
  **beri peringatan kalau yang terbaru lebih tua dari 7 hari.** Menyembunyikan sumbernya
  menutupi masalah; menampilkan umurnya membiarkan pembaca menilai.
- Response besar (~64 KB per sumber) — cache agresif, jangan panggil ulang tiap render.
- `isoDate` berakhiran `Z` (UTC). Tampilkan dalam waktu lokal pembaca.
- Judul dan ringkasan berasal dari RSS media. Kekhawatiran entitas HTML (`&amp;`)
  **tidak terbukti** — diperiksa pada kesembilan sumber, tidak ada satu pun entitas. Teks
  tetap dirender sebagai teks, bukan HTML.
- Semua tautan keluar pakai `rel="noopener noreferrer"` dan `target="_blank"`.

**Selesai kalau:** memilih CNN Indonesia menampilkan 100 berita dengan gambar dan waktu
lokal yang benar, dan pemilih rubrik bekerja.

---

## Bagian 3 — Yang BELUM boleh dibuat

Alat berikut sering diminta orang, tapi sumbernya belum terverifikasi. **Jangan dibuat
sebelum endpoint-nya lolos verifikasi** (TASKS Tahap 7):

| Alat | Kendala |
|---|---|
| Libur Nasional | Sumber aslinya mati 402. Tidak ada pengganti di seluruh 151 API. Harus di-mirror manual dari SKB 3 Menteri |
| KBBI | Endpoint belum ketemu, kandidat masih 404 |
| Daftar Bank | Endpoint belum ketemu |
| Cek Resi | Butuh API key |
| ~~Harga Emas~~ | **SUDAH DIBUAT 2026-08-21.** Dokumen lama menandainya tanpa CORS; diuji ulang dua kali termasuk dengan header `Origin`, `logam-mulia-api.iamutaki.workers.dev` membalas `Access-Control-Allow-Origin: *`. Alatnya live di `/alat/harga-emas` — lihat TASKS T7.8 |
| Doa Harian | Hidup, tapi **repo sumbernya sudah 404 di GitHub** per 2026-08-21, jadi lisensinya tidak bisa diperiksa sama sekali. `provenance.lisensi: unknown`. Sudah di registry sebagai `doa-doa`, tapi **jangan** dijadikan alat sampai hak pakainya jelas |
| Kunci TTS, Lambang Daerah, Kode Pos vanmason | Terverifikasi hidup tapi **tanpa CORS** — ini yang sungguh menunggu proxy (T5.1) |

Semuanya sudah ada di registry dan bisa dicoba lewat playground di `/dev/api/<slug>` memakai
salinan `curl`. Yang menahan pembuatan alat tinggal dua hal: **CORS** untuk tiga yang terakhir,
dan **hak pakai** untuk Doa Harian.

Kalau ada yang minta salah satu alat ini, jawabannya bukan "dikarang dulu" —
melainkan kerjakan risetnya di Tahap 7, lalu tambahkan spesifikasinya ke dokumen ini.
