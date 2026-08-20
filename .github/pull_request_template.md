## Apa yang berubah

## Bagaimana kamu memverifikasinya

- [ ] `npm run build` lolos
- [ ] `npm run lint` lolos
- [ ] `npm run tes` lolos
- [ ] `npm run tes:jaringan` lolos (kalau menyentuh pengambilan data)

## Kalau menyentuh data API

- [ ] Endpoint yang dipakai sudah tercatat di `REFERENCE.md` **sebelum** kodenya ditulis
- [ ] Nama field diambil dari response asli, bukan ditebak
- [ ] `provenance` terisi; `unknown` dipakai kalau lisensinya memang tidak dinyatakan
- [ ] Kalau `mirror: true`, `provenance.kebijakanMirror` punya dasar yang nyata

## Kalau menyentuh UI

- [ ] Kelima keadaan ditangani: loading, error, kosong, mirror, normal
- [ ] Tanpa emoji, tanpa `alert()`/`confirm()`, tanpa `<select>` mentah
- [ ] Indikator fokus masih ada
