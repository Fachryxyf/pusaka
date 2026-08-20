# REFERENCE — Bentuk Response Asli

> **Dokumen ini ada supaya tidak ada yang mengarang nama field.**
> Semua jalur field di bawah ditangkap dari response **sungguhan** pada **2026-08-06**,
> bukan dari dokumentasi dan bukan dari ingatan.
>
> Kalau kamu butuh nama field dan tidak menemukannya di sini — **jangan ditebak.**
> Panggil endpoint-nya, lihat hasilnya, lalu perbarui dokumen ini.

Dipakai bareng [`SPEC.md`](./SPEC.md), [`TASKS.md`](./TASKS.md), [`BACKLOG-API.md`](./BACKLOG-API.md).

---

## Aturan User-Agent — WAJIB DIBACA

**BMKG memblokir User-Agent tertentu dengan 403.** Ini sudah diuji satu per satu:

| User-Agent | Hasil |
|---|---|
| `Mozilla/5.0` (telanjang, tanpa detail) | **403 Forbidden** |
| default Python `urllib` (tanpa UA di-set) | **403 Forbidden** |
| `Mozilla/5.0 (compatible; namabot)` | 200 OK |
| `Mozilla/5.0 (Macintosh; …) Chrome/120` (UA browser lengkap) | 200 OK |
| `curl/8.4.0` | 200 OK |
| `node-fetch/1.0`, `axios/1.6.0` | 200 OK |
| `PusakaBot/1.0 (+https://github.com/…)` | 200 OK |

**Konsekuensinya untuk `lib/client.ts` dan `scripts/probe.ts`:** selalu kirim
User-Agent yang jujur dan deskriptif, misalnya `PusakaBot/1.0 (+<url repo>)`.

Kalau ini kelewat, `probe.ts` bakal melaporkan **seluruh API BMKG mati** —
padahal itu sumber paling penting dan paling awet di seluruh katalog. Kesalahan ini
sudah benar-benar terjadi waktu riset: 4 endpoint BMKG divonis 403 sampai ketahuan
penyebabnya cuma header.

---

## Jebakan tipe — angka yang dikirim sebagai string

Ini penyebab bug paling sering di data Indonesia. **Jangan berasumsi angka itu `number`.**

| Field | Nilai asli | Kenapa berbahaya |
|---|---|---|
| `Infogempa.gempa.Magnitude` (BMKG) | `"4.1"` string | Diurutkan sebagai teks → `"10.0" < "4.1"`. Wajib `parseFloat` sebelum dibandingkan |
| `[0].id` wilayah emsifa | `"11"`, `"3204010"` string | **Jangan `parseInt`** — kode wilayah bisa berawalan nol dan harus tetap string |
| `data[0].id` kota myQuran | `"1001"` string | Sama, perlakukan sebagai kode, bukan angka |
| `lokasi.adm2` cuaca BMKG | `"32.04"` string | Bertitik. `parseFloat` bakal merusaknya jadi `32.04` lalu hilang konteks |
| `dataSekolah[0].lintang` / `.bujur` | `"-6.1977000"` string | Perlu `parseFloat` sebelum dipakai di peta |
| `dataSekolah[0].npsn` | `"20104653"` string | Nomor induk, bukan bilangan |
| `status` MyInstants | `"200"` string | Bukan `number`. Jangan `=== 200` |

Aturan praktis: **kode wilayah, NPSN, dan nomor induk apa pun tetap `string`.**
Yang di-`parseFloat` cuma besaran yang memang dihitung (magnitudo, koordinat).

---

## Bentuk yang tidak konsisten antar endpoint

| API | Jebakan |
|---|---|
| BMKG gempa | `autogempa` → `Infogempa.gempa` adalah **objek tunggal**. `gempaterkini` & `gempadirasakan` → `Infogempa.gempa` adalah **array**. Kode yang sama tidak bisa dipakai untuk keduanya. |
| equran.id | `/surat` → `data` array. `/surat/{n}` → `data` objek. |
| myQuran | Semua dibungkus `{status, request, data}`. Cek `status === true` dulu, baru baca `data`. |
| kodepos.vercel.app | Dibungkus `{statusCode, code, data}`. `/search` → `data` array, `/detect` → `data` objek. |

---

## Cara baca tabel bentuk

- Jalur field ditulis apa adanya, termasuk **huruf besar-kecilnya** —
  BMKG pakai `Infogempa.gempa.Magnitude`, bukan `data.magnitude`.
- `[0]` artinya elemen pertama sebuah array.
- `array[n]` — `n` adalah jumlah elemen saat ditangkap, bukan jumlah tetap.
- Kolom contoh dipotong pada 52 karakter.

---

## Info Gempa — BMKG

`slug: gempa-bmkg`

### `autogempa`

```
GET https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json
```

Content-Type `application/json` · CORS: * · ukuran ~0.4 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `Infogempa` | objek |  |
| `Infogempa.gempa` | objek |  |
| `Infogempa.gempa.Tanggal` | str | 06 Agu 2026 |
| `Infogempa.gempa.Jam` | str | 09:59:47 WIB |
| `Infogempa.gempa.DateTime` | str | 2026-08-06T02:59:47+00:00 |
| `Infogempa.gempa.Coordinates` | str | -1.17,120.06 |
| `Infogempa.gempa.Lintang` | str | 1.17 LS |
| `Infogempa.gempa.Bujur` | str | 120.06 BT |
| `Infogempa.gempa.Magnitude` | str | 4.1 |
| `Infogempa.gempa.Kedalaman` | str | 10 km |
| `Infogempa.gempa.Wilayah` | str | Pusat gempa berada di darat 32 km Timur Laut Sigi |
| `Infogempa.gempa.Potensi` | str | Gempa ini dirasakan untuk diteruskan pada masyarakat |
| `Infogempa.gempa.Dirasakan` | str | III Sigi |
| `Infogempa.gempa.Shakemap` | str | 20260806095947.mmi.jpg |

### `terkini`

```
GET https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json
```

Content-Type `application/json` · CORS: * · ukuran ~4.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `Infogempa` | objek |  |
| `Infogempa.gempa` | array[15] |  |
| `Infogempa.gempa[0].Tanggal` | str | 06 Agu 2026 |
| `Infogempa.gempa[0].Jam` | str | 04:41:30 WIB |
| `Infogempa.gempa[0].DateTime` | str | 2026-08-05T21:41:30+00:00 |
| `Infogempa.gempa[0].Coordinates` | str | 5.13,125.37 |
| `Infogempa.gempa[0].Lintang` | str | 5.13 LU |
| `Infogempa.gempa[0].Bujur` | str | 125.37 BT |
| `Infogempa.gempa[0].Magnitude` | str | 5.8 |
| `Infogempa.gempa[0].Kedalaman` | str | 10 km |
| `Infogempa.gempa[0].Wilayah` | str | 169 km BaratLaut TAHUNA-KEP.SANGIHE-SULUT |
| `Infogempa.gempa[0].Potensi` | str | Tidak berpotensi tsunami |

### `dirasakan`

```
GET https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json
```

Content-Type `application/json` · CORS: * · ukuran ~4.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `Infogempa` | objek |  |
| `Infogempa.gempa` | array[15] |  |
| `Infogempa.gempa[0].Tanggal` | str | 06 Agu 2026 |
| `Infogempa.gempa[0].Jam` | str | 09:59:47 WIB |
| `Infogempa.gempa[0].DateTime` | str | 2026-08-06T02:59:47+00:00 |
| `Infogempa.gempa[0].Coordinates` | str | -1.17,120.06 |
| `Infogempa.gempa[0].Lintang` | str | 1.17 LS |
| `Infogempa.gempa[0].Bujur` | str | 120.06 BT |
| `Infogempa.gempa[0].Magnitude` | str | 4.1 |
| `Infogempa.gempa[0].Kedalaman` | str | 10 km |
| `Infogempa.gempa[0].Wilayah` | str | Pusat gempa berada di darat 32 km Timur Laut Sigi |
| `Infogempa.gempa[0].Dirasakan` | str | III Sigi |

---

## Wilayah Indonesia — idn-area (KODE COCOK BMKG)

`slug: wilayah-idn-area`

### Batas `limit` — diuji ulang 2026-08-20

| `limit` | Hasil |
|---|---|
| tanpa `limit` | 200, tapi **berhalaman diam-diam**: `/villages?districtCode=32.04.15` mengembalikan 10 dari 13 desa, dengan `meta.pagination.pages.next: 2` |
| `50` | 200 — cukup untuk provinsi & desa, **tidak cukup** untuk kecamatan (Kab. Bogor punya 40, masih lolos, tapi marginnya tipis) |
| `100` | 200 — dipakai registry |
| `200` / `500` | **400** `["limit must not be greater than 100"]` |

Jadi 100 adalah nilai maksimum yang sah, dan itu yang dipakai keempat endpoint.
Jumlah terbesar yang tercatat dari sampel: 40 kecamatan (Kab. Bogor `32.01`), 17 desa
(Suruh `33.22.04`). Tetap **bandingkan `data.length` dengan `meta.pagination.total`** —
kalau suatu saat ada kecamatan berisi >100 desa, itu satu-satunya cara tahu ada yang
terpotong, dan penyelesaiannya menyusuri halaman lewat `meta.pagination.pages.next`.

### `provinsi`

```
GET https://idn-area.up.railway.app/provinces?limit=50
```

Content-Type `application/json` · CORS: * · ukuran ~1.5 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `message` | str | OK |
| `data` | array[38] |  |
| `data[0].code` | str | 11 |
| `data[0].name` | str | Aceh |
| `meta` | objek |  |
| `meta.total` | int | 38 |
| `meta.pagination` | objek |  |
| `meta.pagination.total` | int | 38 |
| `meta.pagination.pages` | objek |  |
| `meta.pagination.pages.first` | int | 1 |
| `meta.pagination.pages.last` | int | 1 |
| `meta.pagination.pages.current` | int | 1 |
| `meta.pagination.pages.previous` | NoneType | None |
| `meta.pagination.pages.next` | NoneType | None |

### `kabupaten`

```
GET https://idn-area.up.railway.app/regencies?provinceCode=32&limit=50
```

Content-Type `application/json` · CORS: * · ukuran ~1.8 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `message` | str | OK |
| `data` | array[27] |  |
| `data[0].code` | str | 32.01 |
| `data[0].name` | str | Kabupaten Bogor |
| `data[0].provinceCode` | str | 32 |
| `meta` | objek |  |
| `meta.total` | int | 27 |
| `meta.pagination` | objek |  |
| `meta.pagination.total` | int | 27 |
| `meta.pagination.pages` | objek |  |
| `meta.pagination.pages.first` | int | 1 |
| `meta.pagination.pages.last` | int | 1 |
| `meta.pagination.pages.current` | int | 1 |
| `meta.pagination.pages.previous` | NoneType | None |
| `meta.pagination.pages.next` | NoneType | None |

### `kecamatan`

```
GET https://idn-area.up.railway.app/districts?regencyCode=32.04&limit=50
```

Content-Type `application/json` · CORS: * · ukuran ~2.0 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `message` | str | OK |
| `data` | array[31] |  |
| `data[0].code` | str | 32.04.05 |
| `data[0].name` | str | Cileunyi |
| `data[0].regencyCode` | str | 32.04 |
| `meta` | objek |  |
| `meta.total` | int | 31 |
| `meta.pagination` | objek |  |
| `meta.pagination.total` | int | 31 |
| `meta.pagination.pages` | objek |  |
| `meta.pagination.pages.first` | int | 1 |
| `meta.pagination.pages.last` | int | 1 |
| `meta.pagination.pages.current` | int | 1 |
| `meta.pagination.pages.previous` | NoneType | None |
| `meta.pagination.pages.next` | NoneType | None |

### `kelurahan`

```
GET https://idn-area.up.railway.app/villages?districtCode=32.04.15&limit=50
```

Content-Type `application/json` · CORS: * · ukuran ~1.0 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `message` | str | OK |
| `data` | array[13] |  |
| `data[0].code` | str | 32.04.15.2001 |
| `data[0].districtCode` | str | 32.04.15 |
| `data[0].name` | str | Pangalengan |
| `meta` | objek |  |
| `meta.total` | int | 13 |
| `meta.pagination` | objek |  |
| `meta.pagination.total` | int | 13 |
| `meta.pagination.pages` | objek |  |
| `meta.pagination.pages.first` | int | 1 |
| `meta.pagination.pages.last` | int | 1 |
| `meta.pagination.pages.current` | int | 1 |
| `meta.pagination.pages.previous` | NoneType | None |
| `meta.pagination.pages.next` | NoneType | None |

---

## Wilayah Indonesia — emsifa (kode LAMA, tidak cocok BMKG)

`slug: wilayah-emsifa`

### `provinsi`

```
GET https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json
```

Content-Type `application/json` · CORS: * · ukuran ~1.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[34] |  |
| `[0].id` | str | 11 |
| `[0].name` | str | ACEH |

### `kabupaten`

```
GET https://www.emsifa.com/api-wilayah-indonesia/api/regencies/32.json
```

Content-Type `application/json` · CORS: * · ukuran ~1.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[27] |  |
| `[0].id` | str | 3201 |
| `[0].province_id` | str | 32 |
| `[0].name` | str | KABUPATEN BOGOR |

### `kecamatan`

```
GET https://www.emsifa.com/api-wilayah-indonesia/api/districts/3204.json
```

Content-Type `application/json` · CORS: * · ukuran ~1.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[31] |  |
| `[0].id` | str | 3204010 |
| `[0].regency_id` | str | 3204 |
| `[0].name` | str | CIWIDEY |

### `kelurahan`

```
GET https://www.emsifa.com/api-wilayah-indonesia/api/villages/3204150.json
```

Content-Type `application/json` · CORS: * · ukuran ~0.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[11] |  |
| `[0].id` | str | 3204150001 |
| `[0].district_id` | str | 3204150 |
| `[0].name` | str | BATUKARUT |

---

## Jadwal Sholat — myQuran v2

`slug: sholat-myquran`

### `daftarKota`

```
GET https://api.myquran.com/v2/sholat/kota/semua
```

Content-Type `application/json` · CORS: * · ukuran ~20.8 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `status` | bool | True |
| `request` | objek |  |
| `request.path` | str | /sholat/kota/semua |
| `data` | array[518] |  |
| `data[0].id` | str | 1001 |
| `data[0].lokasi` | str | KAB. LAMPUNG TENGAH |

### `jadwal`

```
GET https://api.myquran.com/v2/sholat/jadwal/1301/2026/08/06
```

Content-Type `application/json` · CORS: * · ukuran ~0.3 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `status` | bool | True |
| `request` | objek |  |
| `request.path` | str | /sholat/jadwal/1301/2026/08/06 |
| `data` | objek |  |
| `data.id` | int | 1301 |
| `data.lokasi` | str | KOTA JAKARTA |
| `data.daerah` | str | DKI JAKARTA |
| `data.jadwal` | objek |  |
| `data.jadwal.tanggal` | str | Kamis, 06/08/2026 |
| `data.jadwal.imsak` | str | 04:35 |
| `data.jadwal.subuh` | str | 04:45 |
| `data.jadwal.terbit` | str | 05:59 |
| `data.jadwal.dhuha` | str | 06:28 |
| `data.jadwal.dzuhur` | str | 12:02 |
| `data.jadwal.ashar` | str | 15:23 |
| `data.jadwal.maghrib` | str | 17:58 |
| `data.jadwal.isya` | str | 19:09 |
| `data.jadwal.date` | str | 2026-08-06 |

---

### Batas permintaan myQuran — ditemukan 2026-08-21

`api.myquran.com` punya batas yang **jauh lebih ketat** daripada dugaan awal, dan tidak
diumumkan di mana pun:

```
permintaan ke-1  -> 200
permintaan ke-2  -> 429 Too Many Requests
                    retry-after: 1
                    x-retry-in: 139.829206ms
```

Dua permintaan dalam satu detik sudah cukup memicunya. Tiga hal yang perlu diperhatikan:

| Hal | Kenyataan |
|---|---|
| Body 429 **bukan JSON** | Isinya teks biasa `Too Many Requests`. Kalau pemeriksaan `Content-Type` jalan lebih dulu, gejalanya jadi "format tidak dikenali" — menyesatkan |
| Ada `retry-after: 1` | Server memberi tahu berapa lama harus menunggu. Hormati, jangan pakai jeda tebakan |
| Ada `x-retry-in` non-standar | Presisi milidetik (`139.829206ms`). Boleh diabaikan; `retry-after` sudah cukup |

**Konsekuensi untuk kode:** `lib/client.ts` memeriksa 429 **sebelum** memeriksa
`Content-Type`, memberinya `sebab: 'batas'` sendiri, dan mengulang sekali dengan jeda dari
`retry-after`. Ini alasan aturan 9 di SPEC §9 ada, dan sekarang ada bukti angkanya.

Alat yang memuat beberapa bagian sekaligus dari API ini **wajib** memuatnya berurutan,
bukan serentak — permintaan paralel dijamin kena 429.

### Bentuk galat myQuran

```
GET /v2/sholat/jadwal/9999/2026/08/21   -> 400
GET /v2/sholat/jadwal/1301/2026/13/45   -> 400
{"status":false,"request":{"path":"..."},"message":"Data not found"}
```

Kota tidak ada dan tanggal tidak sah menghasilkan **400 dengan bentuk yang sama** — bukan
404, dan `message`-nya identik. Jadi jangan pakai `message` untuk membedakan sebabnya.
Perhatikan `status: false`: bungkusnya tetap normal, jadi **wajib cek `status === true`
sebelum membaca `data`**.

### Tanggal satu digit ternyata diterima

Diuji 2026-08-21: `/v2/sholat/jadwal/1301/2026/8/6` membalas **200** dengan isi yang sama
persis seperti `/2026/08/06`. Jadi aturan "wajib dua digit" ternyata **tidak** dipaksakan
server.

Meski begitu, registry tetap memakai dua digit dan alat tetap memformatnya begitu:
perilaku yang tidak didokumentasikan bisa berubah kapan saja, dan `contohPath` harus
mencerminkan bentuk yang dijamin bekerja. Yang berubah hanyalah tingkat risikonya — ini
bukan lagi bug yang menunggu tanggal 1–9.

### Zona waktu tidak ada di response

Sudah diperiksa untuk kota di ketiga zona: `KOTA MAKASSAR` (WITA), `KOTA JAYAPURA` (WIT),
`KOTA DENPASAR` (WITA). Kunci `data` selalu `id, lokasi, daerah, jadwal` — **tidak ada
field zona waktu maupun offset**.

Jamnya sendiri sudah benar untuk zona kota masing-masing (Jayapura dzuhur 11:44, Jakarta
11:59, Makassar 12:09, Denpasar 12:26). Konsekuensinya: jam dari API **tidak boleh
dibandingkan langsung dengan jam perangkat pengguna**, karena keduanya bisa berada di zona
berbeda — pengguna di Jakarta yang melihat jadwal Jayapura akan mendapat hitungan
"berikutnya" yang salah. Perbandingan hanya sah kalau kota yang dipilih memang sezona
dengan pengguna, dan alat wajib mengatakannya, bukan diam-diam menghitung.

---

## Al-Qur'an — equran.id v2

`slug: quran-equran`

### `daftarSurat`

```
GET https://equran.id/api/v2/surat
```

Content-Type `application/json` · CORS: * · ukuran ~120.4 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `message` | str | Data retrieved successfully |
| `data` | array[114] |  |
| `data[0].nomor` | int | 1 |
| `data[0].nama` | str | الفاتحة |
| `data[0].namaLatin` | str | Al-Fatihah |
| `data[0].jumlahAyat` | int | 7 |
| `data[0].tempatTurun` | str | Mekah |
| `data[0].arti` | str | Pembukaan |
| `data[0].deskripsi` | str | Surat <i>Al Faatihah</i> (Pembukaan) yang diturunkan… |
| `data[0].audioFull` | objek |  |
| `data[0].audioFull.01` | str | https://cdn.equran.id/audio-full/Abdullah-Al-Juhany/… |
| `data[0].audioFull.02` | str | https://cdn.equran.id/audio-full/Abdul-Muhsin-Al-Qas… |
| `data[0].audioFull.03` | str | https://cdn.equran.id/audio-full/Abdurrahman-as-Suda… |
| `data[0].audioFull.04` | str | https://cdn.equran.id/audio-full/Ibrahim-Al-Dossari/… |
| `data[0].audioFull.05` | str | https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-A… |
| `data[0].audioFull.06` | str | https://cdn.equran.id/audio-full/Yasser-Al-Dosari/00… |

### `detailSurat`

```
GET https://equran.id/api/v2/surat/1
```

Content-Type `application/json` · CORS: * · ukuran ~6.2 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `message` | str | Data retrieved successfully |
| `data` | objek |  |
| `data.nomor` | int | 1 |
| `data.nama` | str | الفاتحة |
| `data.namaLatin` | str | Al-Fatihah |
| `data.jumlahAyat` | int | 7 |
| `data.tempatTurun` | str | Mekah |
| `data.arti` | str | Pembukaan |
| `data.deskripsi` | str | Surat <i>Al Faatihah</i> (Pembukaan) yang diturunkan… |
| `data.audioFull` | objek |  |
| `data.audioFull.01` | str | https://cdn.equran.id/audio-full/Abdullah-Al-Juhany/… |
| `data.audioFull.02` | str | https://cdn.equran.id/audio-full/Abdul-Muhsin-Al-Qas… |
| `data.audioFull.03` | str | https://cdn.equran.id/audio-full/Abdurrahman-as-Suda… |
| `data.audioFull.04` | str | https://cdn.equran.id/audio-full/Ibrahim-Al-Dossari/… |
| `data.audioFull.05` | str | https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-A… |
| `data.audioFull.06` | str | https://cdn.equran.id/audio-full/Yasser-Al-Dosari/00… |
| `data.ayat` | array[7] |  |
| `data.ayat[0].nomorAyat` | int | 1 |
| `data.ayat[0].teksArab` | str | بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ |
| `data.ayat[0].teksLatin` | str | Bismillāhir-raḥmānir-raḥīm(i).  |
| `data.ayat[0].teksIndonesia` | str | Dengan nama Allah Yang Maha Pengasih lagi Maha Penya… |
| `data.ayat[0].audio` | objek |  |
| `data.ayat[0].audio.01` | str | https://cdn.equran.id/audio-partial/Abdullah-Al-Juha… |
| `data.ayat[0].audio.02` | str | https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-… |
| `data.ayat[0].audio.03` | str | https://cdn.equran.id/audio-partial/Abdurrahman-as-S… |
| `data.ayat[0].audio.04` | str | https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossa… |
| `data.ayat[0].audio.05` | str | https://cdn.equran.id/audio-partial/Misyari-Rasyid-A… |
| `data.ayat[0].audio.06` | str | https://cdn.equran.id/audio-partial/Yasser-Al-Dosari… |
| `data.suratSelanjutnya` | objek |  |
| `data.suratSelanjutnya.nomor` | int | 2 |
| `data.suratSelanjutnya.nama` | str | البقرة |
| `data.suratSelanjutnya.namaLatin` | str | Al-Baqarah |
| `data.suratSelanjutnya.jumlahAyat` | int | 286 |
| `data.suratSebelumnya` | bool | False |

---

### Nama qari di balik kunci audio — dicatat 2026-08-21

Kunci `"01"`–`"06"` tidak menyebut nama qari; namanya hanya ada di dalam URL. Dipetakan
dari `audioFull` surat 1:

| Kunci | Qari |
|---|---|
| `01` | Abdullah Al-Juhany |
| `02` | Abdul Muhsin Al-Qasim |
| `03` | Abdurrahman as-Sudais |
| `04` | Ibrahim Al-Dossari |
| `05` | Misyari Rasyid Al-Afasi |
| `06` | Yasser Al-Dosari |

Kunci yang sama dipakai di `data.ayat[].audio`. Host audionya `cdn.equran.id`.

### `deskripsi` — tag HTML yang sungguh muncul

Diperiksa pada **seluruh 114 surat**, bukan cuma Al-Fatihah:

| Tag | Kemunculan |
|---|---|
| `<i>` | 554 |
| `<br>` | 31 |
| `<a href="s002a001.htm">` | **2** — hanya di surat 38 (Sad) |

Tidak ada entitas HTML (`&amp;`, `&nbsp;`, dan sebagainya) sama sekali.

Tautan di surat 38 berbunyi `<a href="s002a001.htm">[10)</a>` — **tautan relatif ke berkas
yang tidak ada di situs kita**, sisa dari sumber aslinya. Jadi tag `<a>` tidak boleh
diloloskan: hasilnya tautan mati, dan lebih buruk, `href` dari data pihak ketiga adalah
permukaan serangan (`javascript:` dan sejenisnya).

**Yang diterapkan:** `deskripsi` **tidak** dirender sebagai HTML. Ia diurai jadi potongan
teks + penekanan, dan hanya `<i>` serta `<br>` yang dihormati; sisanya dibuang beserta
isinya dipertahankan sebagai teks biasa. Tidak ada `dangerouslySetInnerHTML` di project ini.

### `deskripsi` sama di kedua endpoint

`data[].deskripsi` pada `/surat` **identik** dengan `data.deskripsi` pada `/surat/{n}`
(dibandingkan untuk surat 1). Jadi tidak perlu memanggil detail hanya untuk mendapatkan
deskripsi.

### Ukuran response — jauh lebih besar dari dugaan

| Endpoint | Ukuran |
|---|---|
| `/surat` | **123 KB** |
| `/surat/1` (7 ayat) | 6,4 KB |
| `/surat/2` (286 ayat) | **397 KB** |
| `/surat/3` | 247 KB · `/surat/7` 247 KB · `/surat/26` 176 KB |

397 KB itu **lebih besar dari 341 KB** yang tercatat sebagai response terbesar di katalog.
Ini alasan konkret aturan "baca body sampai habis" (SPEC §9): batas baca 2500 byte akan
membuat Al-Baqarah terlihat seperti JSON rusak.

### Bentuk galat

```
GET /surat/0    -> 404  {"code":404,"message":"Data not found"}
GET /surat/115  -> 404  {"code":404,"message":"Data not found"}
GET /surat/abc  -> 400  {"code":400,"message":"Invalid input"}
```

Ketiganya `Content-Type: application/json`, jadi galatnya bisa dibaca sebagai JSON —
berbeda dari 429 myQuran yang mengirim teks biasa.

### Field yang belum tercatat sebelumnya

`data` pada `/surat/{n}` juga memuat navigasi surat:

| Jalur field | Tipe | Contoh |
|---|---|---|
| `data.suratSelanjutnya` | objek **atau `false`** | `{"nomor":2,"nama":"البقرة","namaLatin":"Al-Baqarah","jumlahAyat":286}` |
| `data.suratSebelumnya` | objek **atau `false`** | `false` pada surat 1 |

**Perhatikan tipenya bisa `false`, bukan `null`.** Jadi `if (data.suratSebelumnya)` aman,
tapi `data.suratSebelumnya?.nomor` akan lolos tanpa peringatan dan menghasilkan `undefined`
pada nilai `false` — periksa dengan benar sebelum dipakai.

## Prakiraan Cuaca — BMKG resmi

`slug: cuaca-bmkg`

### `prakiraan`

```
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.04.15.2003
```

Content-Type `application/json` · CORS: * · ukuran ~7.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `lokasi` | objek |  |
| `lokasi.adm1` | str | 32 |
| `lokasi.adm2` | str | 32.04 |
| `lokasi.adm3` | str | 32.04.15 |
| `lokasi.adm4` | str | 32.04.15.2003 |
| `lokasi.provinsi` | str | Jawa Barat |
| `lokasi.kotkab` | str | Bandung |
| `lokasi.kecamatan` | str | Pangalengan |
| `lokasi.desa` | str | Warnasari |
| `lokasi.lon` | float | 107.516107484 |
| `lokasi.lat` | float | -7.1907847687 |
| `lokasi.timezone` | str | Asia/Jakarta |
| `data` | array[1] |  |
| `data[0].lokasi` | objek |  |
| `data[0].lokasi.adm1` | str | 32 |
| `data[0].lokasi.adm2` | str | 32.04 |
| `data[0].lokasi.adm3` | str | 32.04.15 |
| `data[0].lokasi.adm4` | str | 32.04.15.2003 |
| `data[0].lokasi.provinsi` | str | Jawa Barat |
| `data[0].lokasi.kotkab` | str | Bandung |
| `data[0].lokasi.kecamatan` | str | Pangalengan |
| `data[0].lokasi.desa` | str | Warnasari |
| `data[0].lokasi.lon` | float | 107.516107484 |
| `data[0].lokasi.lat` | float | -7.1907847687 |
| `data[0].lokasi.timezone` | str | +0700 |
| `data[0].lokasi.type` | str | adm4 |
| `data[0].cuaca` | array[3] |  |
| `data[0].cuaca[0]` | array[8] |  |
| `data[0].cuaca[0][0].datetime` | str | 2026-08-06T18:00:00Z |
| `data[0].cuaca[0][0].t` | int | 14 |
| `data[0].cuaca[0][0].tcc` | int | 98 |
| `data[0].cuaca[0][0].tp` | int | 0 |
| `data[0].cuaca[0][0].weather` | int | 45 |
| `data[0].cuaca[0][0].weather_desc` | str | Kabut/Asap |
| `data[0].cuaca[0][0].weather_desc_en` | str | Fog/Smoke |
| `data[0].cuaca[0][0].wd_deg` | int | 327 |
| `data[0].cuaca[0][0].wd` | str | NW |
| `data[0].cuaca[0][0].wd_to` | str | SE |
| `data[0].cuaca[0][0].ws` | float | 0.1 |
| `data[0].cuaca[0][0].hu` | int | 99 |
| `data[0].cuaca[0][0].vs` | int | 104 |
| `data[0].cuaca[0][0].vs_text` | str | < 200.0 m |
| `data[0].cuaca[0][0].time_index` | str | 17-18 |
| `data[0].cuaca[0][0].analysis_date` | str | 2026-08-06T00:00:00 |
| `data[0].cuaca[0][0].image` | str | https://api-apps.bmkg.go.id/storage/icon/cuaca/kabut… |
| `data[0].cuaca[0][0].utc_datetime` | str | 2026-08-20 18:00:00 |
| `data[0].cuaca[0][0].local_datetime` | str | 2026-08-21 01:00:00 |

---

### Struktur `cuaca` — dikoreksi 2026-08-21

`data[0].cuaca` adalah array bersarang dua tingkat, dan **tiap sub-array adalah satu hari
kalender menurut waktu lokal lokasinya** — bukan sekadar "8 butir per hari".

Diukur untuk Warnasari (`32.04.15.2003`) pada 2026-08-21:

```
kelompok 0: 8 butir | 2026-08-21 | 01:00 04:00 07:00 10:00 13:00 16:00 19:00 22:00
kelompok 1: 8 butir | 2026-08-22 | 01:00 04:00 07:00 10:00 13:00 16:00 19:00 22:00
kelompok 2: 2 butir | 2026-08-23 | 01:00 04:00
```

| Dugaan | Kenyataan |
|---|---|
| "3 hari, 8 butir per hari" | Jumlah kelompok dan jumlah butir per kelompok **tidak tetap**. Kelompok terakhir hampir selalu sebagian karena jendela prakiraannya berakhir di tengah hari |
| "kelompok 0 = hari ini" | Biasanya ya, tapi **jangan diandalkan**. Ambil tanggalnya dari `local_datetime` butir pertama, jangan dari indeks |
| Butir per 3 jam | Benar pada pengukuran ini (01, 04, 07, …), tapi jam awalnya bergeser menurut zona: Jakarta mulai 01:00, Makassar 02:00, Jayapura 03:00 — semuanya sama dengan 18:00 UTC |

**Jangan menghitung jumlah hari dari `.length` lalu memberi label "Hari ini / Besok / Lusa"
berdasarkan indeks.** Bandingkan tanggal di `local_datetime` dengan tanggal hari ini di
zona lokasinya.

### `lokasi.timezone` ADA — dan wajib dipakai

Berbeda dari myQuran (yang tidak memuat zona waktu sama sekali), BMKG mengirim zona IANA:

| adm4 | `lokasi.timezone` | butir pertama `local_datetime` | `utc_datetime` |
|---|---|---|---|
| `32.04.15.2003` Warnasari | `Asia/Jakarta` | `2026-08-21 01:00:00` | `2026-08-20 18:00:00` |
| `73.71.01.1001` Bontorannu | `Asia/Makassar` | `2026-08-21 02:00:00` | `2026-08-20 18:00:00` |
| `91.03.05.2001` Sama | `Asia/Jayapura` | `2026-08-21 03:00:00` | `2026-08-20 18:00:00` |

Ketiganya adalah **momen yang sama**. Artinya `local_datetime` adalah waktu dinding di
lokasi prakiraan, bukan waktu pembaca.

**Konsekuensi:** untuk menandai "sekarang" atau memberi label hari, hitung tanggal/jam
**di zona `lokasi.timezone`** memakai `Intl.DateTimeFormat` dengan opsi `timeZone` — jangan
pakai `new Date().getHours()` milik perangkat. Pembaca di Jakarta yang melihat prakiraan
Jayapura akan salah 2 jam kalau ini dilanggar.

Ini juga alasan `local_datetime` **tidak boleh** diberi `new Date(...)` langsung: string
`"2026-08-21 01:00:00"` tanpa penanda zona ditafsirkan sebagai waktu lokal perangkat oleh
sebagian mesin JS, dan sebagai UTC oleh yang lain. Urai komponennya sebagai teks.

### Bentuk galat

```
GET /publik/prakiraan-cuaca?adm4=99.99.99.9999   -> 404
GET /publik/prakiraan-cuaca?adm4=32.04.04.0005   -> 404   (kode emsifa bertitik)
{"message":"Data not found","error":"Not Found","statusCode":404}
```

Yang kedua adalah bukti ulang bahwa kode `wilayah-emsifa` **tidak** bisa dipakai untuk BMKG
walau titiknya disisipkan — diuji lagi 2026-08-21, hasilnya tetap 404.

## Kode Pos — sooluh (DIREKOMENDASIKAN)

`slug: kodepos-sooluh`

### `cari`

```
GET https://kodepos.vercel.app/search/?q=danasari
```

Content-Type `application/json` · CORS: * · ukuran ~0.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `code` | str | OK |
| `data` | array[4] |  |
| `data[0].code` | int | 46386 |
| `data[0].village` | str | Danasari |
| `data[0].district` | str | Cisaga |
| `data[0].regency` | str | Ciamis |
| `data[0].province` | str | Jawa Barat |
| `data[0].latitude` | float | -7.3271342 |
| `data[0].longitude` | float | 108.4577572 |
| `data[0].elevation` | int | 110 |
| `data[0].timezone` | str | WIB |

### `deteksi`

```
GET https://kodepos.vercel.app/detect/?latitude=-6.547052&longitude=107.3980201
```

Content-Type `application/json` · CORS: * · ukuran ~0.3 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `code` | str | OK |
| `data` | objek |  |
| `data.code` | int | 41152 |
| `data.village` | str | Kembangkuning |
| `data.district` | str | Jatiluhur |
| `data.regency` | str | Purwakarta |
| `data.province` | str | Jawa Barat |
| `data.latitude` | float | -6.5495591 |
| `data.longitude` | float | 107.4121855 |
| `data.elevation` | int | 112 |
| `data.timezone` | str | WIB |
| `data.distance` | float | 1.5894826841413479 |

---

## Kode Pos — vanmason (cadangan, tanpa CORS)

`slug: kodepos-vanmason`

### `cari`

```
GET https://nbc.vanmason.web.id/service/kodepos/42173
```

Content-Type `application/json` · CORS: **TIDAK ADA — wajib lewat proxy** · ukuran ~0.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `kodepos` | array[14] |  |
| `kodepos[0].kelurahan` | str | Baros |
| `kodepos[0].kecamatan` | str | Baros |

---

## Al-Qur'an — quran-api-id

`slug: quran-api-id`

### `daftarSurat`

```
GET https://quran-api-id.vercel.app/surah
```

Content-Type `application/json` · CORS: * · ukuran ~89.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK. |
| `message` | str | Success fetching all surah. |
| `data` | array[114] |  |
| `data[0].number` | int | 1 |
| `data[0].sequence` | int | 5 |
| `data[0].numberOfVerses` | int | 7 |
| `data[0].name` | objek |  |
| `data[0].name.short` | str | الفاتحة |
| `data[0].name.long` | str | سُورَةُ ٱلْفَاتِحَةِ |
| `data[0].name.transliteration` | objek |  |
| `data[0].name.transliteration.en` | str | Al-Faatiha |
| `data[0].name.transliteration.id` | str | Al-Fatihah |
| `data[0].name.translation` | objek |  |
| `data[0].name.translation.en` | str | The Opening |
| `data[0].name.translation.id` | str | Pembukaan |
| `data[0].revelation` | objek |  |
| `data[0].revelation.arab` | str | مكة |
| `data[0].revelation.en` | str | Meccan |
| `data[0].revelation.id` | str | Makkiyyah |
| `data[0].tafsir` | objek |  |
| `data[0].tafsir.id` | str | Surat Al Faatihah (Pembukaan) yang diturunkan di Mek… |

### `detailSurat`

```
GET https://quran-api-id.vercel.app/surah/18
```

Content-Type `application/json` · CORS: * · ukuran ~341.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK. |
| `message` | str | Success fetching surah. |
| `data` | objek |  |
| `data.number` | int | 18 |
| `data.sequence` | int | 69 |
| `data.numberOfVerses` | int | 110 |
| `data.name` | objek |  |
| `data.name.short` | str | الكهف |
| `data.name.long` | str | سورة الكهف |
| `data.name.transliteration` | objek |  |
| `data.name.transliteration.en` | str | Al-Kahf |
| `data.name.transliteration.id` | str | Al-Kahf |
| `data.name.translation` | objek |  |
| `data.name.translation.en` | str | The Cave |
| `data.name.translation.id` | str | Goa |
| `data.revelation` | objek |  |
| `data.revelation.arab` | str | مكة |
| `data.revelation.en` | str | Meccan |
| `data.revelation.id` | str | Makkiyyah |
| `data.tafsir` | objek |  |
| `data.tafsir.id` | str | Surat  ini terdiri atas 110 ayat, termasuk  golongan… |
| `data.preBismillah` | objek |  |
| `data.preBismillah.text` | objek |  |
| `data.preBismillah.text.arab` | str | بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| `data.preBismillah.text.transliteration` | objek |  |
| `data.preBismillah.text.transliteration.en` | str | Bismillaahir Rahmaanir Raheem |
| `data.preBismillah.translation` | objek |  |
| `data.preBismillah.translation.en` | str | In the name of Allah, the Entirely Merciful, the Esp… |
| `data.preBismillah.translation.id` | str | Dengan nama Allah Yang Maha Pengasih, Maha Penyayang… |
| `data.preBismillah.audio` | objek |  |
| `data.preBismillah.audio.primary` | str | https://cdn.alquran.cloud/media/audio/ayah/ar.alafas… |
| `data.preBismillah.audio.secondary` | array[2] |  |
| `data.preBismillah.audio.secondary[0]` | str | https://cdn.islamic.network/quran/audio/128/ar.alafa… |
| `data.verses` | array[110] |  |
| `data.verses[0].number` | objek |  |
| `data.verses[0].number.inQuran` | int | 2141 |
| `data.verses[0].number.inSurah` | int | 1 |
| `data.verses[0].meta` | objek |  |
| `data.verses[0].meta.juz` | int | 15 |
| `data.verses[0].meta.page` | int | 293 |
| `data.verses[0].meta.manzil` | int | 4 |
| `data.verses[0].meta.ruku` | int | 252 |
| `data.verses[0].meta.hizbQuarter` | int | 117 |
| `data.verses[0].meta.sajda` | objek |  |
| … | | *(17 field lagi dipotong)* |

### `ayat`

```
GET https://quran-api-id.vercel.app/surah/18/60
```

Content-Type `application/json` · CORS: * · ukuran ~9.0 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK. |
| `message` | str | Success fetching ayah |
| `data` | objek |  |
| `data.number` | objek |  |
| `data.number.inQuran` | int | 2200 |
| `data.number.inSurah` | int | 60 |
| `data.meta` | objek |  |
| `data.meta.juz` | int | 15 |
| `data.meta.page` | int | 300 |
| `data.meta.manzil` | int | 4 |
| `data.meta.ruku` | int | 260 |
| `data.meta.hizbQuarter` | int | 120 |
| `data.meta.sajda` | objek |  |
| `data.meta.sajda.recommended` | bool | False |
| `data.meta.sajda.obligatory` | bool | False |
| `data.text` | objek |  |
| `data.text.arab` | str | وَإِذْ قَالَ مُوسَىٰ لِفَتَاهُ لَا أَبْرَحُ حَتَّىٰ … |
| `data.text.transliteration` | objek |  |
| `data.text.transliteration.en` | str | Wa iz qaalaa Moosaa lifataahu laaa abrahu hattaaa ab… |
| `data.translation` | objek |  |
| `data.translation.en` | str | And [mention] when Moses said to his servant, "I wil… |
| `data.translation.id` | str | Dan (ingatlah) ketika Musa berkata kepada pembantuny… |
| `data.audio` | objek |  |
| `data.audio.primary` | str | https://cdn.alquran.cloud/media/audio/ayah/ar.alafas… |
| `data.audio.secondary` | array[2] |  |
| `data.audio.secondary[0]` | str | https://cdn.islamic.network/quran/audio/128/ar.alafa… |
| `data.tafsir` | objek |  |
| `data.tafsir.id` | objek |  |
| `data.tafsir.id.short` | str | Dan ingatlah wahai Nabi Muhammad, ketika Nabi Musa b… |
| `data.tafsir.id.long` | str | Dalam ayat ini, Allah menceritakan betapa gigihnya t… |
| `data.surah` | objek |  |
| `data.surah.number` | int | 18 |
| `data.surah.sequence` | int | 69 |
| `data.surah.numberOfVerses` | int | 110 |
| `data.surah.name` | objek |  |
| `data.surah.name.short` | str | الكهف |
| `data.surah.name.long` | str | سورة الكهف |
| `data.surah.name.transliteration` | objek |  |
| `data.surah.name.transliteration.en` | str | Al-Kahf |
| `data.surah.name.transliteration.id` | str | Al-Kahf |
| `data.surah.name.translation` | objek |  |
| `data.surah.name.translation.en` | str | The Cave |
| `data.surah.name.translation.id` | str | Goa |
| `data.surah.revelation` | objek |  |
| … | | *(15 field lagi dipotong)* |

---

## Hiragana & Katakana — Kotonogi

`slug: kotonogi`

### `hiraganaSatu`

```
GET https://kotonogi-api.vercel.app/hiragana/a
```

Content-Type `application/json` · CORS: * · ukuran ~0.4 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `romaji` | str | a |
| `kana` | str | あ |
| `kakikata_gambar` | str | https://kotonogi-api.vercel.app/images/hiragana/a.sv… |
| `kakikata_animasi` | str | https://kotonogi-api.vercel.app/animation/hiragana/a… |
| `kosakata` | array[5] |  |
| `kosakata[0].romaji` | str | ai |
| `kosakata[0].kana` | str | あい |
| `kosakata[0].arti` | str | cinta |

### `hirakata`

```
GET https://kotonogi-api.vercel.app/hirakata
```

Content-Type `application/json` · CORS: * · ukuran ~48.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `hiragana` | objek |  |
| `hiragana.total` | int | 23 |
| `hiragana.tentang` | str | Hiragana adalah salah satu sistem penulisan dalam ba… |
| `hiragana.info` | str | Hiragana biasanya digunakan untuk menulis kata-kata … |
| `hiragana.penjelasan` | str | Hiragana juga memiliki variasi suara yang diubah den… |
| `hiragana.hiragana_huruf` | array[46] |  |
| `hiragana.hiragana_huruf[0].romaji` | str | a |
| `hiragana.hiragana_huruf[0].kana` | str | あ |
| `hiragana.hiragana_huruf[0].kakikata_gambar` | str | https://kotonogi-api.vercel.app/images/hiragana/a.sv… |
| `hiragana.hiragana_huruf[0].kakikata_animasi` | str | https://kotonogi-api.vercel.app/animation/hiragana/a… |
| `hiragana.hiragana_huruf[0].kosakata` | array[5] |  |
| `hiragana.hiragana_huruf[0].kosakata[0].romaji` | str | ai |
| `hiragana.hiragana_huruf[0].kosakata[0].kana` | str | あい |
| `hiragana.hiragana_huruf[0].kosakata[0].arti` | str | cinta |
| `katakana` | objek |  |
| `katakana.total` | int | 23 |
| `katakana.tentang` | str | Katakana adalah salah satu sistem penulisan dalam ba… |
| `katakana.info` | str | Katakana lebih sering digunakan untuk menuliskan kat… |
| `katakana.penjelasan` | str | Tanda ― (sering disebut 'chōon' atau 'long vowel mar… |
| `katakana.katakana_huruf` | array[46] |  |
| `katakana.katakana_huruf[0].romaji` | str | a |
| `katakana.katakana_huruf[0].kana` | str | ア |
| `katakana.katakana_huruf[0].kakikata_gambar` | str | https://kotonogi-api.vercel.app/images/katakana/a.sv… |
| `katakana.katakana_huruf[0].kakikata_animasi` | str | https://kotonogi-api.vercel.app/animation/katakana/a… |
| `katakana.katakana_huruf[0].kosakata` | array[4] |  |
| `katakana.katakana_huruf[0].kosakata[0].romaji` | str | amerika |
| `katakana.katakana_huruf[0].kosakata[0].kana` | str | アメリカ |
| `katakana.katakana_huruf[0].kosakata[0].arti` | str | America |

---

## Berita Indo — 14 sumber berita nasional

`slug: berita-indo`

### `cnnSemua`

```
GET https://berita-indo-api.vercel.app/v1/cnn-news/
```

Content-Type `application/json` · CORS: * · ukuran ~64.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK |
| `messages` | str | Result of all news in CNN News |
| `total` | int | 100 |
| `data` | array[100] |  |
| `data[0].title` | str | Eks Ketua DPRD Ponorogo Jadi Tersangka Korupsi Tunja… |
| `data[0].link` | str | https://www.cnnindonesia.com/nasional/20260806234043… |
| `data[0].contentSnippet` | str | Kejari Ponorogo menetapkan mantan Ketua DPRD SN seba… |
| `data[0].isoDate` | str | 2026-08-06T17:17:55.000Z |
| `data[0].image` | objek |  |
| `data[0].image.small` | str | https://akcdn.detik.net.id/visual/2015/07/24/0676200… |
| `data[0].image.large` | str | https://akcdn.detik.net.id/visual/2015/07/24/0676200… |

### `cnnTipe`

```
GET https://berita-indo-api.vercel.app/v1/cnn-news/teknologi
```

Content-Type `application/json` · CORS: * · ukuran ~63.2 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK |
| `messages` | str | Result of type teknologi news in CNN News |
| `total` | int | 100 |
| `data` | array[100] |  |
| `data[0].title` | str | Cara Update Versi Android Tanpa Kehilangan Data |
| `data[0].link` | str | https://www.cnnindonesia.com/teknologi/2026080617085… |
| `data[0].contentSnippet` | str | Pembaruan sistem Android penting untuk keamanan dan … |
| `data[0].isoDate` | str | 2026-08-06T11:40:05.000Z |
| `data[0].image` | objek |  |
| `data[0].image.small` | str | https://akcdn.detik.net.id/visual/2022/12/20/ilustra… |
| `data[0].image.large` | str | https://akcdn.detik.net.id/visual/2022/12/20/ilustra… |

### `cnbcSemua`

```
GET https://berita-indo-api.vercel.app/v1/cnbc-news/
```

Content-Type `application/json` · CORS: * · ukuran ~72.5 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `status` | str | OK |
| `messages` | str | Result of all news in CNBC News |
| `total` | int | 100 |
| `data` | array[100] |  |
| `data[0].title` | str | Negara di Ambang Perang, Presiden Dievakuasi Kendara… |
| `data[0].link` | str | https://www.cnbcindonesia.com/news/20260806151620-4-… |
| `data[0].contentSnippet` | str | Presiden Taiwan, Lai Ching-te, memimpin latihan pera… |
| `data[0].isoDate` | str | 2026-08-06T15:10:00.000Z |
| `data[0].image` | objek |  |
| `data[0].image.small` | str | https://awsimages.detik.net.id/visual/2026/08/06/par… |
| `data[0].image.large` | str | https://awsimages.detik.net.id/visual/2026/08/06/par… |

---

## Berita — Jakarta Post

`slug: jakpost`

### `kategori`

```
GET https://jakpost.vercel.app/api/category
```

Content-Type `application/json` · CORS: * · ukuran ~5.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `status` | int | 200 |
| `category` | array[9] |  |
| `category[0].name` | str |  |
| `category[0].link` | str | https://jakpost.vercel.app/api/categoryundefined |
| `category[0].subCategory` | NoneType | None |

---

## Doa Harian

`slug: doa-doa`

### `semua`

```
GET https://doa-doa-api-ahmadramadhan.fly.dev/api
```

Content-Type `application/json` · CORS: **TIDAK ADA — wajib lewat proxy** · ukuran ~18.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[37] |  |
| `[0].id` | str | 1 |
| `[0].doa` | str | Doa sebelum tidur |
| `[0].ayat` | str | بِسْمِكَ االلّٰهُمَّ اَحْيَا وَبِاسْمِكَ اَمُوْتُ |
| `[0].latin` | str | Bismikallaahumma ahyaa wa ammuut |
| `[0].artinya` | str | Dengan menyebut nama Allah, aku hidup dan aku mati |

---

## Anitop — chart musik anime

`slug: anitop`

### `musicChart`

```
GET https://anitop.vercel.app/api/v1/music-chart
```

Content-Type `application/json` · CORS: * · ukuran ~41.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `code` | int | 200 |
| `message` | str | List of anime music chart data |
| `totalItems` | int | 100 |
| `data` | array[100] |  |
| `data[0].title` | str | Koi no Uta |
| `data[0].artists` | array[2] |  |
| `data[0].artists[0]` | str | Yunomi |
| `data[0].imageUrl` | str | https://i1.wp.com/anitrendz.net/news/wp-content/uplo… |
| `data[0].rank` | int | 1 |
| `data[0].mediaUrl` | objek |  |
| `data[0].mediaUrl.youtube` | str | https://www.youtube.com/watch?v=9ndwtd6yNRM |
| `data[0].mediaUrl.spotify` | str | https://open.spotify.com/track/15St0qWPnH4xKflV39vk2… |
| `data[0].mediaUrl.itunes` | str | https://music.apple.com/jp/album/%E6%81%8B%E3%81%AE%… |
| `data[0].stats` | objek |  |
| `data[0].stats.peak` | int | 1 |
| `data[0].stats.previously` | int | 1 |
| `data[0].stats.weeks` | int | 6 |

---

## Kunci Jawaban TTS

`slug: kunci-tts`

### `jawaban`

```
GET https://kunci-tts-api.vercel.app/api/answers?question=tidak
```

Content-Type `application/json` · CORS: **TIDAK ADA — wajib lewat proxy** · ukuran ~0.3 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `title` | str | Kunci jawaban TTS Tidak |
| `total` | int | 7 |
| `answers` | array[7] |  |
| `answers[0].stars` | int | 5 |
| `answers[0].word` | str | TAK |
| `answers[0].clue` | str | Tidak |

---

## Lambang Daerah Indonesia

`slug: lambang-daerah`

### `provinsi`

```
GET https://symbolsofindonesia.vercel.app/provinces/200
```

Content-Type `application/json` · CORS: **TIDAK ADA — wajib lewat proxy** · ukuran ~1.9 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[38] |  |
| `[0].title` | str | Aceh |
| `[0].url` | str | /provinces/1/200 |

---

## Harga Emas — Logam Mulia

`slug: harga-emas`

### `anekalogam`

```
GET https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam
```

Content-Type `application/json` · CORS: **TIDAK ADA — wajib lewat proxy** · ukuran ~3.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `success` | bool | True |
| `data` | array[9] |  |
| `data[0].source` | str | anekalogam |
| `data[0].material` | str | gold |
| `data[0].materialType` | str | Logam Mulia ANTAM Certicard gramasi 100 gram produks… |
| `data[0].weight` | int | 1 |
| `data[0].weightUnit` | str | gr |
| `data[0].sellPrice` | int | 2603000 |
| `data[0].buybackPrice` | int | 2550000 |
| `data[0].currency` | str | IDR |
| `data[0].recordedDate` | str | 2026-08-07 |
| `data[0].lineKey` | str |  |
| `data[0].url` | str | /api/prices/anekalogam |
| `data[0].displayName` | str | Aneka Logam |
| `data[0].logo` | str |  |
| `data[0].favicon` | str | https://www.logammulia.com/apple-touch-icon.png |
| `data[0].cover` | NoneType | None |
| `data[0].urlHomepage` | str | https://www.anekalogam.co.id |
| `count` | int | 9 |
| `timestamp` | str | 2026-08-06T17:00:33.100Z |
| `cached` | bool | True |

---

## Doa & Dzikir

`slug: dua-dhikr`

### `bahasa`

```
GET https://dua-dhikr.vercel.app/languages
```

Content-Type `application/json` · CORS: * · ukuran ~0.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `code` | str | OK |
| `data` | array[2] |  |
| `data[0].label` | str | Bahasa Indonesia |
| `data[0].code` | str | id |

### `kategori`

```
GET https://dua-dhikr.vercel.app/categories
```

Content-Type `application/json` · CORS: * · ukuran ~0.3 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `code` | str | OK |
| `data` | array[5] |  |
| `data[0].name` | str | Dzikir Pagi |
| `data[0].slug` | str | morning-dhikr |
| `data[0].total` | int | 19 |

### `isiKategori`

```
GET https://dua-dhikr.vercel.app/categories/daily-dua
```

Content-Type `application/json` · CORS: * · ukuran ~3.7 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `statusCode` | int | 200 |
| `code` | str | OK |
| `data` | array[38] |  |
| `data[0].id` | int | 1 |
| `data[0].title` | str | Doa Sebelum Tidur |
| `data[0].category` | str | daily-dua |
| `data[0].categoryName` | str | Doa Harian |

---

## Al-Qur'an — staticquran

`slug: staticquran`

### `qari`

```
GET https://staticquran.vercel.app/api/v1/reciters
```

Content-Type `application/json` · CORS: * · ukuran ~1.3 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `success` | bool | True |
| `message` | str | Reciters retrieved successfully |
| `data` | array[32] |  |
| `data[0].id` | int | 1 |
| `data[0].name` | str | Abdul Basit 'Abd us-Samad |

### `daftarSurat`

```
GET https://staticquran.vercel.app/api/v1/surah
```

Content-Type `application/json` · CORS: * · ukuran ~63.9 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `success` | bool | True |
| `message` | str | Data Retrieved Successfully |
| `data` | array[114] |  |
| `data[0].sequence` | int | 1 |
| `data[0].ayahCount` | int | 7 |
| `data[0].type` | objek |  |
| `data[0].type.arabic` | str | مكة |
| `data[0].type.latin` | str | Meccan |
| `data[0].name` | objek |  |
| `data[0].name.arabic` | objek |  |
| `data[0].name.arabic.long` | str | سُورَةُ ٱلْفَاتِحَةِ |
| `data[0].name.arabic.short` | str | الفاتحة |
| `data[0].name.latin` | objek |  |
| `data[0].name.latin.long` | str | Sura Al-Faatiha |
| `data[0].name.latin.short` | str | Al-Faatiha |
| `data[0].translation` | str | The Opening |
| `data[0].tafsir` | NoneType | None |
| `data[0].preBismillah` | objek |  |
| `data[0].preBismillah.text` | str | ﻿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| `data[0].preBismillah.translation` | str | In the name of Allah, the Entirely Merciful, the Esp… |
| `data[0].preBismillah.transliteration` | str | Bismillaahir Rahmaanir Raheem |
| `data[0].recitation` | objek |  |
| `data[0].recitation.audio` | str | https://download.quranicaudio.com/quran/yasser_ad-du… |

### `detailSurat`

```
GET https://staticquran.vercel.app/api/v1/surah/1
```

Content-Type `application/json` · CORS: * · ukuran ~3.5 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `success` | bool | True |
| `message` | str | Data Retrieved Successfully |
| `data` | objek |  |
| `data.sequence` | int | 1 |
| `data.ayahCount` | int | 7 |
| `data.type` | objek |  |
| `data.type.arabic` | str | مكة |
| `data.type.latin` | str | Meccan |
| `data.name` | objek |  |
| `data.name.arabic` | objek |  |
| `data.name.arabic.long` | str | سُورَةُ ٱلْفَاتِحَةِ |
| `data.name.arabic.short` | str | الفاتحة |
| `data.name.latin` | objek |  |
| `data.name.latin.long` | str | Sura Al-Faatiha |
| `data.name.latin.short` | str | Al-Faatiha |
| `data.translation` | str | The Opening |
| `data.tafsir` | NoneType | None |
| `data.preBismillah` | objek |  |
| `data.preBismillah.text` | str | ﻿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| `data.preBismillah.translation` | str | In the name of Allah, the Entirely Merciful, the Esp… |
| `data.preBismillah.transliteration` | str | Bismillaahir Rahmaanir Raheem |
| `data.recitation` | objek |  |
| `data.recitation.audio` | str | https://download.quranicaudio.com/quran/yasser_ad-du… |
| `data.ayah` | array[7] |  |
| `data.ayah[0].sequence` | objek |  |
| `data.ayah[0].sequence.quran` | int | 1 |
| `data.ayah[0].sequence.surah` | int | 1 |
| `data.ayah[0].juz` | int | 1 |
| `data.ayah[0].manzil` | int | 1 |
| `data.ayah[0].page` | int | 1 |
| `data.ayah[0].ruku` | int | 1 |
| `data.ayah[0].hizb` | int | 1 |
| `data.ayah[0].sajda` | bool | False |
| `data.ayah[0].text` | str | ﻿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| `data.ayah[0].transliteration` | str | Bismillaahir Rahmaanir Raheem |
| `data.ayah[0].translation` | str | In the name of Allah, the Entirely Merciful, the Esp… |
| `data.ayah[0].tafsir` | NoneType | None |
| `data.ayah[0].recitation` | objek |  |
| `data.ayah[0].recitation.audio` | str | https://everyayah.com/data/Yasser_Ad-Dussary_128kbps… |

---

## Pesantren se-Indonesia

`slug: pesantren`

### `provinsi`

```
GET https://api-pesantren-indonesia.vercel.app/provinsi.json
```

Content-Type `application/json` · CORS: * · ukuran ~1.1 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[34] |  |
| `[0].id` | str | 11 |
| `[0].nama` | str | Aceh |

### `kabupaten`

```
GET https://api-pesantren-indonesia.vercel.app/kabupaten/32.json
```

Content-Type `application/json` · CORS: * · ukuran ~0.9 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `(akar)` | array[27] |  |
| `[0].id` | str | 3210 |
| `[0].nama` | str | Majalengka |

---

## MyInstants (unofficial)

`slug: myinstants`

### `detail`

```
GET https://myinstants-api.vercel.app/detail?id=akh-26815
```

Content-Type `application/json` · CORS: * · ukuran ~0.6 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `status` | str | 200 |
| `author` | str | abdipr |
| `data` | objek |  |
| `data.id` | str | akh-26815 |
| `data.url` | str | https://www.myinstants.com/en/instant/akh-26815 |
| `data.title` | str | AKH |
| `data.mp3` | str | https://www.myinstants.com/media/sounds/akh.mp3 |
| `data.description` | str | Subscribe HELLMOUZ on Youtube |
| `data.tags` | array[4] |  |
| `data.tags[0]` | str | #akh |
| `data.favorites` | str | 30,720 |
| `data.views` | str | 504,844 |
| `data.uploader` | objek |  |
| `data.uploader.username` | str | hellmouz |
| `data.uploader.url` | str | https://www.myinstants.com/en/profile/hellmouz/uploa… |

---

## Data Sekolah Indonesia

`slug: sekolah-indonesia`

### `daftar`

```
GET https://api-sekolah-indonesia.vercel.app/sekolah?page=1&perPage=2
```

Content-Type `application/json` · CORS: * · ukuran ~0.9 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `creator` | str | Alwan (wanrabbae) |
| `status` | str | success |
| `Donate` | objek |  |
| `Donate.Gopay` | str | 082316512192 |
| `Donate.Dana` | str | 08995247131 |
| `Donate.Ovo` | str | 08995247131 |
| `dataSekolah` | array[2] |  |
| `dataSekolah[0].kode_prop` | str | 010000   |
| `dataSekolah[0].propinsi` | str | Prov. D.K.I. Jakarta |
| `dataSekolah[0].kode_kab_kota` | str | 016000   |
| `dataSekolah[0].kabupaten_kota` | str | Kota Jakarta Pusat |
| `dataSekolah[0].kode_kec` | str | 016002   |
| `dataSekolah[0].kecamatan` | str | Kec. Menteng |
| `dataSekolah[0].id` | str | 201C9F94-2BF5-E011-A7DC-591953DFFC15 |
| `dataSekolah[0].npsn` | str | 20104653 |
| `dataSekolah[0].sekolah` | str | SD NEGERI PEGANGSAAN 01 PG |
| `dataSekolah[0].bentuk` | str | SD |
| `dataSekolah[0].status` | str | N |
| `dataSekolah[0].alamat_jalan` | str | Jl. Ampiun No. 1-A |
| `dataSekolah[0].lintang` | str | -6.1977000 |
| `dataSekolah[0].bujur` | str | 106.8422000 |
| `total_data` | int | 215373 |
| `page` | int | 1 |
| `per_page` | int | 2 |

---

## Objek Dekat Bumi — NASA/JPL SSD-CNEOS

`slug: jpl-ssd`

> Ditangkap **2026-08-20**, bukan 2026-08-06 seperti sisa dokumen ini.
>
> **PENTING:** **Tidak ada header `Access-Control-Allow-Origin`.** Sudah diuji dua kali, termasuk
> dengan header `Origin` disertakan — balasannya tetap tanpa ACAO dan tanpa `Vary`.
> Jadi `cors: none`: browser tidak bisa memanggilnya langsung, dan alatnya bergantung
> pada lapisan mirror (SPEC §8 lapis 3).
>
> Semua endpoint di bawah membalas `Content-Type: application/json` dan tidak butuh kunci API.

### Bentuk bersama

Semua endpoint SSD punya `signature: {source, version}` di akar. Jangan dipakai untuk
logika — versinya berbeda per endpoint (`cad` 1.5, `fireball` 1.2, `sentry` 2.0, `sbdb` 1.3).

### PENTING — Jebakan bentuk yang khas JPL

| Jebakan | Kenyataan |
|---|---|
| `cad` & `fireball` **bukan array objek** | Balasannya tabel: `fields` (nama kolom) + `data` (array of array). Baris diindeks angka, bukan nama. Wajib dipetakan lewat `fields.indexOf(nama)` — jangan hardcode indeks, urutan kolom berubah kalau param `fullname` dipakai |
| `count` tipenya tidak konsisten | `cad` mengirim `29` (**number**), `fireball` & `sentry` mengirim `"20"` (**string**). Jangan `=== 20` |
| Nilai di dalam `data` bisa `null` | Dari 20 baris `fireball`, 8 di antaranya `vel` bernilai `null`. Sembunyikan barisnya, jangan render `null` |
| `sentry` & `scout` **array objek**, beda dari `cad`/`fireball` | Dua bentuk berbeda di satu API yang sama |
| `sbdb` sama sekali bukan daftar | Akarnya `{signature, object, orbit, phys_par}` — objek tunggal, tanpa `data` |
| `fullname` berawalan spasi | `"       (2025 FY11)"` — wajib `.trim()` |
| Semua besaran berupa **string** | `dist`, `v_rel`, `h`, `ip`, `ps_max` semuanya string. `parseFloat` sebelum dibandingkan atau diurutkan |
| `cad` tidak menerima `class=PHA` | Membalas **400** `invalid orbit class specified`. Nilai yang sah adalah kode kelas orbit (mis. `APO`), bukan `PHA` |
| `fireball` tidak punya param kotak lintang/bujur | `lat-min`/`lon-min` membalas **400** `one or more query parameter was not recognized`. Penyaringan wilayah harus dilakukan di sisi kita |

### `cad` — pendekatan terdekat ke Bumi

```
GET https://ssd-api.jpl.nasa.gov/cad.api?body=Earth&date-min=now&date-max=%2B60&dist-max=0.05&sort=date&fullname=true
```

Content-Type `application/json` · CORS: **tidak ada** · ukuran ~5.9 KB (29 baris)

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `signature.source` | str | NASA/JPL SBDB Close Approach Data API |
| `count` | **int** | 29 |
| `fields` | array[12] | ["des","orbit_id","jd","cd","dist","dist_min","dist_max","v_rel","v_inf","t_sigma_f","h","fullname"] |
| `data` | array[29] of array[12] |  |
| `data[0][des]` | str | 2025 FY11 |
| `data[0][cd]` | str | 2026-Aug-20 00:02 |
| `data[0][dist]` | str | 0.0492253668833929 |
| `data[0][dist_min]` | str | 0.0491881046916992 |
| `data[0][v_rel]` | str | 3.4660623848599 |
| `data[0][h]` | str | 28.78 |
| `data[0][fullname]` | str | `"       (2025 FY11)"` — berawalan spasi |

Satuan: `dist` dalam **au** (1 au ≈ 149,6 juta km), `v_rel` dalam **km/s**, `h` magnitudo
absolut (makin kecil makin besar objeknya). `cd` sudah diformat dan **zonanya UTC**.

### `fireball` — bola api di atmosfer

```
GET https://ssd-api.jpl.nasa.gov/fireball.api?limit=20&sort=-date
```

Content-Type `application/json` · CORS: **tidak ada** · ukuran ~1.6 KB (20 baris)

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `count` | **str** | 20 |
| `fields` | array[9] | ["date","energy","impact-e","lat","lat-dir","lon","lon-dir","alt","vel"] |
| `data[0][date]` | str | 2026-08-15 07:32:40 |
| `data[0][energy]` | str | 3.9 |
| `data[0][impact-e]` | str | 0.13 |
| `data[0][lat]` | str | 4.0 |
| `data[0][lat-dir]` | str | N |
| `data[0][lon]` | str | 115.4 |
| `data[0][lon-dir]` | str | W |
| `data[0][alt]` | str | 37.0 |
| `data[0][vel]` | str / **null** | 12.2 · `null` pada 8 dari 20 baris |

Lintang & bujur dikirim **tanpa tanda**, arahnya terpisah di `lat-dir`/`lon-dir`
(`S` dan `W` berarti negatif). `energy` dalam joule radiasi (×10¹⁰), `impact-e` dalam kiloton TNT.

### `sentry` — objek dengan peluang tumbukan

```
GET https://ssd-api.jpl.nasa.gov/sentry.api?ps-min=-3
```

Content-Type `application/json` · CORS: **tidak ada** · ukuran ~1.7 KB (6 objek)

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `count` | **str** | 6 |
| `data` | array[6] of **objek** |  |
| `data[0].des` | str | 1979 XB |
| `data[0].fullname` | str | (1979 XB) |
| `data[0].ip` | str | 8.515158e-07 |
| `data[0].ps_max` | str | -2.99 |
| `data[0].ps_cum` | str | -2.69 |
| `data[0].ts_max` | str | 0 |
| `data[0].n_imp` | **int** | 4 |
| `data[0].range` | str | 2056-2113 |
| `data[0].diameter` | str | 0.66 |
| `data[0].v_inf` | str | 23.7606234552547 |
| `data[0].h` | str | 18.54 |
| `data[0].last_obs` | str | 1979-12-15 |

`ip` itu peluang tumbukan dalam notasi eksponen — `parseFloat` dulu.
`ps_max` skala Palermo; di bawah −2 dianggap tidak perlu dikhawatirkan.
`diameter` dalam km. Tanpa param `ps-min`, response membengkak jadi ~164 KB.

### `sbdb` — data satu objek

```
GET https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=433&phys-par=true
```

Content-Type `application/json` · CORS: **tidak ada** · ukuran ~6.4 KB

| Jalur field | Tipe | Contoh nilai |
|---|---|---|
| `object.fullname` | str | 433 Eros (A898 PA) |
| `object.shortname` | str | 433 Eros |
| `object.des` | str | 433 |
| `object.neo` | bool | true |
| `object.pha` | bool | false |
| `object.orbit_class.code` | str | AMO |
| `object.orbit_class.name` | str | Amor |
| `object.spkid` | str | 20000433 |
| `orbit.moid` | str | 0.148623 |
| `orbit.first_obs` / `.last_obs` | str | 1893-10-29 · 2021-05-13 |
| `orbit.elements` | array of objek |  |
| `orbit.elements[0].name` | str | e |
| `orbit.elements[0].title` | str | eccentricity |
| `orbit.elements[0].value` | str | 0.223 |
| `orbit.elements[0].units` | str / null | null |
| `phys_par[0].name` | str | H |
| `phys_par[0].title` | str | absolute magnitude |
| `phys_par[0].value` | str | 10.40 |

Elemen orbit dan parameter fisik datang sebagai **daftar** `{name, title, value, units}`,
bukan sebagai kunci objek — jadi jangan cari `orbit.e`, cari elemen bernama `e`.

### `scout` — objek yang belum terkonfirmasi

```
GET https://ssd-api.jpl.nasa.gov/scout.api
```

~18.6 KB · `count` **str** `"50"` · `data` array objek (`objectName`, `Vmag`, `moid`,
`neoScore`, `phaScore`, `caDist`, `lastRun`). Isinya berubah cepat dan sering kosong
di luar musim pengamatan, jadi **belum** dipakai alat mana pun.
