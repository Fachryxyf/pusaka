// T2.11 kriteria selesai + jebakan yang ditemukan 2026-08-21. Butuh jaringan.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Tempat = {
  code: number
  village: string
  district: string
  regency: string
  province: string
  timezone: string
  distance?: number
}
type BalasanCari = { statusCode?: number; code?: string; data?: Tempat[] }
type BalasanDeteksi = { code?: string; data?: Tempat }

async function main() {
  const api = muatApi('kodepos-sooluh')!
  const cari = api.endpoints.find((e) => e.id === 'cari')!
  const deteksi = api.endpoints.find((e) => e.id === 'deteksi')!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const danasari = await ambil<BalasanCari>(api, cari, { kata: 'danasari' })
  const hasil = danasari.data.data ?? []
  assert.ok(hasil.length > 1, `cuma ${hasil.length} hasil untuk danasari`)
  for (const t of hasil) {
    assert.equal(typeof t.code, 'number', `code bukan number: ${typeof t.code}`)
    assert.match(String(t.code), /^\d{5}$/, `kode pos bukan 5 digit: ${t.code}`)
    assert.ok(t.village && t.district && t.regency && t.province, 'field wilayah tidak lengkap')
  }
  const ciamis = hasil.find((t) => t.regency === 'Ciamis')
  assert.equal(ciamis?.code, 46386, `Danasari Ciamis seharusnya 46386, dapat ${ciamis?.code}`)
  tes(`cari "danasari": ${hasil.length} hasil, Ciamis = 46386`)

  // Jebakan penamaan: code di akar adalah STATUS, code di data adalah kode pos.
  assert.equal(danasari.data.code, 'OK', `code akar seharusnya "OK", dapat ${danasari.data.code}`)
  assert.equal(typeof danasari.data.code, 'string')
  assert.notEqual(typeof hasil[0].code, 'string')
  tes('code akar = "OK" (string), code dalam data = kode pos (number)')

  // Kosong itu 200 + data:[], bukan 404 — keadaan "kosong", bukan galat.
  const nihil = await ambil<BalasanCari>(api, cari, { kata: 'zzzzzzqqq' })
  assert.equal(nihil.data.code, 'OK')
  assert.deepEqual(nihil.data.data, [])
  tes('pencarian tanpa hasil -> 200 dengan data kosong, bukan 404')

  // Batas 20 keras: page & limit diabaikan diam-diam, dan tidak ada total.
  const banyak = await ambil<BalasanCari>(api, cari, { kata: 'jakarta' })
  assert.equal(banyak.data.data?.length, 20, `data.length ${banyak.data.data?.length}, bukan 20`)
  assert.ok(
    !('total' in banyak.data) && !('meta' in banyak.data),
    'ternyata ada total/meta — alat bisa berhenti menebak, perbarui REFERENCE.md',
  )
  tes('hasil dibatasi 20 dan tidak ada total di response')

  const jkt = await ambil<BalasanDeteksi>(api, deteksi, { lintang: '-6.2', bujur: '106.816' })
  const t = jkt.data.data!
  assert.equal(typeof t.code, 'number')
  assert.equal(t.province, 'DKI Jakarta', `provinsi ${t.province}`)
  assert.equal(typeof t.distance, 'number', 'distance tidak ada di endpoint deteksi')
  assert.ok(t.distance! < 5, `distance ${t.distance} terlalu besar untuk titik yang sama`)
  tes(`deteksi -6.2,106.816 -> ${t.code} ${t.village}, distance ${t.distance?.toFixed(2)}`)

  // 0,0 DITERIMA dan mengembalikan hasil yang terlihat sah. Ini alasan alat
  // memvalidasi koordinat sebelum mengirim.
  const nol = await ambil<BalasanDeteksi>(api, deteksi, { lintang: '0', bujur: '0' })
  assert.ok(
    nol.data.data?.code,
    'ternyata 0,0 ditolak — validasi di alat bisa disederhanakan, perbarui REFERENCE.md',
  )
  tes(`koordinat 0,0 tetap dijawab (${nol.data.data?.village}) — validasi di sisi kita perlu`)

  // Param wajib kosong ditolak client sebelum permintaan dikirim.
  await assert.rejects(
    () => ambil(api, cari, { kata: '' }),
    /belum diisi/,
    'kata kosong seharusnya ditolak sebelum dikirim',
  )
  tes('kata pencarian kosong ditolak client, tidak jadi permintaan 400')

  // Koordinat tidak sah membalas 404 dengan pesan menyesatkan.
  await assert.rejects(
    () => ambil(api, deteksi, { lintang: 'abc', bujur: 'xyz' }),
    (e: unknown) => e instanceof GagalAmbil && e.status === 404,
    'koordinat tidak sah seharusnya 404',
  )
  tes('koordinat tidak sah -> 404, ditangani sebagai galat')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
