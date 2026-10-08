# Prompt untuk agent coding

Dua prompt di bawah: satu untuk **sesi pertama**, satu untuk **melanjutkan**.
Salin apa adanya.

---

## A. Sesi pertama (mulai dari nol)

```
Kamu mengerjakan project open-source bernama Pusaka di direktori ini.
Direktori masih kosong kecuali dokumen perencanaan.

LANGKAH PERTAMA, sebelum menulis kode apa pun:
Baca SPEC.md dari awal sampai habis. Jangan dilewat, jangan diskim.
Bagian §12 "Jangan mengarang" wajib kamu pahami sebelum lanjut.
Lalu baca TASKS.md bagian "Peta dokumen" dan "Aturan yang berlaku untuk SEMUA task".

Setelah itu kerjakan T1.1 di TASKS.md. Satu task pada satu waktu.
Jangan lanjut ke task berikutnya sebelum "Kriteria selesai" task sekarang
benar-benar terpenuhi dan sudah kamu buktikan dengan menjalankannya.

Ada enam dokumen dan masing-masing punya peran:
- SPEC.md          arsitektur, kontrak data, aturan keras, alasan tiap keputusan
- TASKS.md         urutan pekerjaan + kriteria selesai tiap task
- REFERENCE.md     bentuk response asli 43 endpoint (nama field, tipe, contoh)
- REGISTRY-SEED.md 22 file YAML siap tempel, sudah divalidasi
- UI-SPEC.md       tampilan tiap alat + pengikatan elemen UI ke jalur field
- BACKLOG-API.md   inventaris 151 API, bertingkat menurut kesiapan

ATURAN YANG TIDAK BOLEH DILANGGAR:

1. Jangan pernah menebak nama field. Ambil dari REFERENCE.md.
   Kalau endpoint yang kamu butuhkan belum ada di sana: panggil dengan curl,
   lihat responsnya, catat ke REFERENCE.md, BARU tulis kodenya. Urutan ini
   tidak boleh dibalik.

2. Jangan pernah menebak base URL atau path endpoint. Ambil dari
   REGISTRY-SEED.md atau BACKLOG-API.md tier A.

3. Jangan menulis YAML registry dari nol. Salin dari REGISTRY-SEED.md.

4. Jangan bikin alat di muka awam untuk API yang belum terbukti mengeluarkan
   data JSON asli.

5. Kalau kenyataan berbeda dengan yang tertulis di dokumen, dokumennya yang
   benar sampai kamu buktikan sebaliknya — lalu PERBARUI dokumennya.
   Jangan diamkan selisihnya. Semua data bertanggal 2026-08-06/07; API berubah,
   dan itu justru premis project ini.

6. Kalau kamu merasa perlu menebak sesuatu, berhenti dan tanya saya.
   Menebak di project ini menghasilkan bug yang diam-diam, bukan error yang
   kelihatan.

Laporkan hasilnya apa adanya. Kalau ada yang gagal, bilang gagal beserta
outputnya. Jangan bilang selesai kalau belum diverifikasi.
```

---

## B. Melanjutkan (sesi berikutnya)

```
Lanjutkan project Pusaka di direktori ini.

Baca dulu:
- TASKS.md bagian "Aturan yang berlaku untuk SEMUA task"
- SPEC.md §12 "Jangan mengarang"

Lalu cek sampai mana progresnya, dan kerjakan task berikutnya di TASKS.md.
Satu task pada satu waktu, dan buktikan "Kriteria selesai" sebelum lanjut.

Aturan yang sama masih berlaku: nama field selalu dari REFERENCE.md, base URL
dan path dari REGISTRY-SEED.md, YAML disalin bukan ditulis ulang. Jangan menebak
apa pun — kalau perlu menebak, berhenti dan tanya saya.
```

---

## C. Kalau agent kamu bukan Claude Code

Sebagian agent tidak otomatis membaca file. Tambahkan di awal:

```
Buka dan baca file-file ini dulu sebelum menjawab apa pun:
SPEC.md, TASKS.md. Konfirmasi ke saya isi ringkasnya, baru mulai kerja.
```

---

## Tujuh jebakan yang sudah menelan korban

Semua ini sudah benar-benar terjadi waktu riset dan sudah tertulis di dokumen.
Kalau agent kamu melanggar salah satunya, tunjukkan bagian ini.

| Jebakan | Akibat kalau kelewat |
|---|---|
| User-Agent `Mozilla/5.0` telanjang atau default Python | BMKG membalas 403 → seluruh API BMKG divonis mati |
| Membaca body response dengan batas (`read(n)`) | Response 341 KB kepotong → API sehat dilaporkan rusak |
| Cuma cek status code | Halaman HTML 200 dianggap API hidup (jebakan Bukuacak) |
| Cuma cek "JSON tidak kosong" | Scraper mati yang membalas bungkus normal isi kosong lolos — 3 API di katalog mati begini |
| `headers` dari registry tidak dikirim | `dua-dhikr` membalas 400, terlihat seperti endpoint rusak |
| Kode wilayah emsifa dipakai untuk BMKG | 404 Data not found. Dua dataset ini kodenya memang beda, bukan beda format |
| `params[].contoh` tidak dikutip di YAML | `1301` jadi integer, `08` jadi ambigu → validasi zod gagal |

---

## Kalau agent kamu bilang "sudah selesai"

Minta bukti, jangan percaya begitu saja:

- `npm run build` lolos tanpa error tipe?
- Kriteria selesai task itu sudah dijalankan, bukan cuma dibaca?
- Untuk alat: angkanya sudah dicocokkan dengan response asli API-nya?
- Ada field yang ditampilkan tapi tidak ada di REFERENCE.md?
