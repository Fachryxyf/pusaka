// T7.8 (alat Harga Emas). Butuh jaringan.
//
// Fokusnya menjaga tiga asumsi yang dipakai alat: CORS terbuka, buybackPrice boleh
// kosong, dan /api/prices berbentuk lain dari endpoint harga.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil, bangunUrl } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Sumber = { name: string; displayName: string }
type Harga = {
  source: string
  weight: number
  weightUnit: string
  sellPrice: number
  buybackPrice: number | null
  recordedDate: string
}
type BalasanHarga = { success?: boolean; data?: Harga[]; count?: number; timestamp?: string }

const jeda = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const api = muatApi('harga-emas')!
  const daftarEp = api.endpoints.find((e) => e.id === 'daftarSumber')!
  const hargaEp = api.endpoints.find((e) => e.id === 'hargaSumber')!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  // Registry menulis cors: open. Kalau ternyata tidak, alat ini akan gagal di
  // browser padahal tesnya lolos di Node — jadi header aslinya diperiksa langsung.
  const res = await fetch(bangunUrl(api, daftarEp), {
    headers: { 'User-Agent': 'PusakaBot/1.0 (+https://github.com/Fachryxyf/pusaka)' },
  })
  await res.text()
  assert.equal(
    res.headers.get('access-control-allow-origin'),
    '*',
    'CORS ternyata tidak terbuka — alat ini tidak akan jalan di browser, dan registry perlu dikoreksi',
  )
  assert.equal(api.cors, 'open', 'registry menulis cors selain open')
  tes('CORS terbuka, cocok dengan yang ditulis registry')

  await jeda(300)

  // /api/prices adalah daftar SUMBER, bentuknya beda: tanpa success/count/timestamp.
  const daftar = await ambil<{ data?: Sumber[] }>(api, daftarEp)
  const sumber = daftar.data.data ?? []
  assert.ok(sumber.length >= 15, `cuma ${sumber.length} sumber`)
  assert.ok(
    !('count' in daftar.data) && !('success' in daftar.data),
    'daftarSumber ternyata memakai bungkus yang sama seperti endpoint harga — perbarui REFERENCE.md',
  )
  for (const s of sumber) {
    assert.ok(s.name, 'sumber tanpa name')
    assert.ok(!('sellPrice' in s), 'daftar sumber ternyata memuat harga')
  }
  assert.ok(sumber.some((s) => s.name === 'anekalogam'))
  tes(`daftarSumber: ${sumber.length} sumber, tanpa harga di dalamnya`)

  await jeda(300)

  const anekalogam = await ambil<BalasanHarga>(api, hargaEp, { sumber: 'anekalogam' })
  const baris = anekalogam.data.data ?? []
  assert.equal(anekalogam.data.success, true)
  assert.ok(baris.length > 0)
  assert.equal(anekalogam.data.count, baris.length, 'count tidak cocok dengan panjang data')
  for (const b of baris) {
    assert.equal(typeof b.weight, 'number', `weight bukan number: ${typeof b.weight}`)
    assert.ok(b.weight > 0, `weight ${b.weight} — pembagian per gram akan pecah`)
    assert.ok(b.sellPrice > 0, 'sellPrice nol')
    assert.match(b.recordedDate, /^\d{4}-\d{2}-\d{2}$/, `recordedDate ${b.recordedDate}`)
  }
  tes(`anekalogam: ${baris.length} baris, weight number positif, recordedDate YYYY-MM-DD`)

  await jeda(300)

  // Inti alasan alat menyembunyikan buyback yang kosong: sumber ini memang tidak
  // pernah mengirimkannya.
  const logammulia = await ambil<BalasanHarga>(api, hargaEp, { sumber: 'logammulia' })
  const kosong = (logammulia.data.data ?? []).filter((b) => !b.buybackPrice).length
  assert.ok(
    kosong > 0,
    'logammulia ternyata mengirim buybackPrice sekarang — penanganan kosong tetap perlu, tapi perbarui REFERENCE.md',
  )
  tes(`buybackPrice memang bisa kosong: logammulia ${kosong}/${logammulia.data.data?.length}`)

  await jeda(300)

  // weightUnit tidak seragam — dipakai untuk tampilan saja, bukan logika.
  const pegadaian = await ambil<BalasanHarga>(api, hargaEp, { sumber: 'pegadaian' })
  const unit = new Set([
    ...baris.map((b) => b.weightUnit),
    ...(pegadaian.data.data ?? []).map((b) => b.weightUnit),
  ])
  assert.ok(unit.size > 1, `weightUnit ternyata seragam (${[...unit].join(',')}) — asumsi bisa disederhanakan`)
  tes(`weightUnit tidak seragam antar sumber: ${[...unit].join(' vs ')}`)

  await jeda(300)

  // Sumber tak dikenal: 404 dengan body TEKS BIASA, bukan JSON. Ini yang bikin
  // pemeriksaan Content-Type di client penting.
  await assert.rejects(
    () => ambil(api, hargaEp, { sumber: 'ngawur-sekali' }),
    (e: unknown) => e instanceof GagalAmbil && (e.status === 404 || e.sebab === 'bukan-json'),
    'sumber tak dikenal seharusnya gagal',
  )
  tes('sumber tak dikenal -> gagal, bukan sukses')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
