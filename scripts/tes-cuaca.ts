// T2.9 kriteria selesai + jebakan yang ditemukan 2026-08-21. Butuh jaringan.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Butir = { local_datetime: string; utc_datetime: string; datetime: string; t: number }
type Balasan = {
  lokasi?: { desa: string; kecamatan: string; kotkab: string; provinsi: string; adm4: string; timezone: string }
  data?: { cuaca?: Butir[][] }[]
}

async function main() {
  const api = muatApi('cuaca-bmkg')!
  const prakiraan = api.endpoints.find((e) => e.id === 'prakiraan')!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const hasil = await ambil<Balasan>(api, prakiraan, { kodeDesa: '32.04.15.2003' })
  const lokasi = hasil.data.lokasi!

  assert.equal(lokasi.adm4, '32.04.15.2003')
  assert.equal(lokasi.desa, 'Warnasari')
  assert.equal(lokasi.kecamatan, 'Pangalengan')
  assert.equal(lokasi.provinsi, 'Jawa Barat')
  tes('Warnasari, Pangalengan terbaca dari kode idn-area apa adanya')

  assert.equal(lokasi.timezone, 'Asia/Jakarta')
  tes(`lokasi.timezone ada: ${lokasi.timezone}`)

  const hari = hasil.data.data?.[0]?.cuaca ?? []
  assert.ok(hari.length >= 2, `cuma ${hari.length} kelompok hari`)
  assert.ok(Array.isArray(hari[0]), 'cuaca bukan array bersarang dua tingkat')
  tes(`cuaca bersarang dua tingkat: ${hari.length} kelompok, ${hari.map((h) => h.length).join('+')} butir`)

  // Tiap sub-array harus satu tanggal lokal — ini yang membuat label hari boleh
  // diambil dari butir pertama (REFERENCE.md).
  for (const [i, butirHari] of hari.entries()) {
    const tanggal = new Set(butirHari.map((b) => b.local_datetime.slice(0, 10)))
    assert.equal(tanggal.size, 1, `kelompok ${i} memuat ${tanggal.size} tanggal berbeda: ${[...tanggal].join(', ')}`)
  }
  tes('tiap kelompok berisi tepat satu tanggal lokal')

  // local_datetime WAJIB dipakai untuk tampilan. Kalau sama dengan utc_datetime,
  // berarti asumsi kita salah dan alatnya menggeser jam 7 jam.
  const b0 = hari[0][0]
  assert.notEqual(
    b0.local_datetime,
    b0.utc_datetime,
    'local_datetime sama dengan utc_datetime — periksa ulang REFERENCE.md',
  )
  const selisihJam =
    (Date.parse(`${b0.local_datetime.replace(' ', 'T')}Z`) -
      Date.parse(`${b0.utc_datetime.replace(' ', 'T')}Z`)) /
    3_600_000
  assert.equal(selisihJam, 7, `selisih WIB seharusnya 7 jam, dapat ${selisihJam}`)
  tes(`local_datetime = utc_datetime + 7 jam (${b0.utc_datetime} -> ${b0.local_datetime})`)

  assert.ok(hasil.ukuranByte >= prakiraan.minUkuranByte, `di bawah minUkuranByte`)
  tes(`ukuran ${hasil.ukuranByte} B >= ambang ${prakiraan.minUkuranByte} B`)

  // Zona lain: local_datetime harus bergeser sesuai zonanya, bukan tetap WIB.
  const jayapura = await ambil<Balasan>(api, prakiraan, { kodeDesa: '91.03.05.2001' })
  assert.equal(jayapura.data.lokasi?.timezone, 'Asia/Jayapura')
  const bj = jayapura.data.data![0].cuaca![0][0]
  const selisihJayapura =
    (Date.parse(`${bj.local_datetime.replace(' ', 'T')}Z`) -
      Date.parse(`${bj.utc_datetime.replace(' ', 'T')}Z`)) /
    3_600_000
  assert.equal(selisihJayapura, 9, `selisih WIT seharusnya 9 jam, dapat ${selisihJayapura}`)
  tes('zona lain bergeser benar: Jayapura +9, bukan tetap +7')

  // Kode emsifa bertitik TETAP ditolak — ini penjaga terhadap godaan menulis
  // fungsi konversi kode wilayah (SPEC §6.5).
  await assert.rejects(
    () => ambil(api, prakiraan, { kodeDesa: '32.04.04.0005' }),
    (e: unknown) => e instanceof GagalAmbil && e.status === 404,
    'kode emsifa bertitik seharusnya 404',
  )
  tes('kode emsifa bertitik tetap 404 — tidak ada konversi kode wilayah')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
