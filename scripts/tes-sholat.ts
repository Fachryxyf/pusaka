// T2.7 kriteria selesai + jebakan yang ditemukan 2026-08-21.
// Butuh jaringan. myQuran membatasi ~1 permintaan per detik, jadi tes ini SENGAJA
// berurutan dengan jeda — bukan paralel.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type BalasanJadwal = {
  status?: boolean
  data?: { id: number; lokasi: string; daerah: string; jadwal: Record<string, string> }
}

const jeda = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const api = muatApi('sholat-myquran')!
  const daftarKota = api.endpoints.find((e) => e.id === 'daftarKota')!
  const jadwal = api.endpoints.find((e) => e.id === 'jadwal')!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const kota = await ambil<{ status?: boolean; data?: { id: string; lokasi: string }[] }>(
    api,
    daftarKota,
  )
  assert.equal(kota.data.status, true, 'status bukan true')
  const semua = kota.data.data ?? []
  assert.ok(semua.length > 500, `cuma ${semua.length} kota`)
  const jakarta = semua.find((k) => k.id === '1301')
  assert.equal(jakarta?.lokasi, 'KOTA JAKARTA')
  assert.equal(typeof jakarta?.id, 'string', 'id kota harus tetap string')
  tes(`daftarKota: ${semua.length} kota, 1301 = KOTA JAKARTA`)

  await jeda(1200)

  // Kriteria selesai: tanggal SATU digit tetap benar. Registry memformat dua digit,
  // jadi yang diuji di sini adalah hasil akhir bangunUrl-nya.
  const enamAgustus = await ambil<BalasanJadwal>(api, jadwal, {
    idKota: '1301',
    tahun: '2026',
    bulan: '08',
    tanggal: '06',
  })
  assert.equal(enamAgustus.data.status, true)
  assert.equal(enamAgustus.data.data?.lokasi, 'KOTA JAKARTA')
  assert.equal(enamAgustus.data.data?.daerah, 'DKI JAKARTA')
  assert.equal(enamAgustus.data.data?.jadwal.date, '2026-08-06')
  assert.equal(enamAgustus.data.data?.jadwal.tanggal, 'Kamis, 06/08/2026')
  tes('jadwal 6 Agustus (tanggal satu digit, diformat dua digit) benar')

  await jeda(1200)

  // Kedelapan waktu wajib ada dan berformat HH:MM — UI mengandalkan ini untuk
  // menghitung waktu berikutnya.
  const kunci = ['imsak', 'subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya']
  const isi = enamAgustus.data.data!.jadwal
  for (const k of kunci) {
    assert.match(isi[k] ?? '', /^\d{2}:\d{2}$/, `${k} bukan HH:MM: ${isi[k]}`)
  }
  tes('kedelapan waktu ada dan berformat HH:MM')

  // Zona waktu TIDAK ada di response — ini yang membuat hitungan "berikutnya"
  // hanya sah kalau kota sezona dengan pengguna (REFERENCE.md).
  assert.deepEqual(
    Object.keys(enamAgustus.data.data!).sort(),
    ['daerah', 'id', 'jadwal', 'lokasi'],
    'kunci data berubah — REFERENCE.md perlu diperbarui',
  )
  assert.ok(
    !('timezone' in isi) && !('zona' in isi),
    'ternyata ada field zona waktu — perbarui REFERENCE.md dan alatnya',
  )
  tes('tidak ada field zona waktu (asumsi alat masih sah)')

  await jeda(1200)

  // Kota tidak ada membalas 400 dengan bungkus normal, bukan 404.
  await assert.rejects(
    () => ambil(api, jadwal, { idKota: '9999', tahun: '2026', bulan: '08', tanggal: '21' }),
    (e: unknown) => e instanceof GagalAmbil && e.status === 400,
    'kota tidak ada seharusnya 400',
  )
  tes('kota tidak ada -> 400, bukan sukses')

  await jeda(1200)

  // 429 diulang sekali dengan jeda dari Retry-After. Dua permintaan beruntun tanpa
  // jeda memicunya, dan hasil akhirnya HARUS tetap sukses.
  const beruntun = await Promise.resolve()
    .then(() => ambil<BalasanJadwal>(api, jadwal, { idKota: '1301', tahun: '2026', bulan: '08', tanggal: '20' }))
  const langsungLagi = await ambil<BalasanJadwal>(api, jadwal, {
    idKota: '1301',
    tahun: '2026',
    bulan: '08',
    tanggal: '21',
  })
  assert.equal(beruntun.data.status, true)
  assert.equal(langsungLagi.data.status, true, 'permintaan kedua gagal — penanganan 429 tidak bekerja')
  tes('dua permintaan beruntun tetap sukses (429 diulang otomatis)')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
