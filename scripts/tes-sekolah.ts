// T7.8 (alat Data Sekolah). Butuh jaringan.
//
// Tiga asumsi yang dijaga di sini: galat dibalas dengan HTTP 200, filter selain
// npsn/sekolah diabaikan, dan field tertentu berupa string dengan spasi ekor.
import assert from 'node:assert/strict'
import { ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Sekolah = {
  npsn: string
  sekolah: string
  bentuk: string
  status: string
  kode_prop: string
  lintang: string
  bujur: string
  propinsi: string
}
type Balasan = {
  status?: string
  message?: string
  dataSekolah?: Sekolah[]
  total_data?: number
}

const jeda = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const api = muatApi('sekolah-indonesia')!
  const ep = (id: string) => api.endpoints.find((e) => e.id === id)!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const daftar = await ambil<Balasan>(api, ep('daftar'), { halaman: '1', perHalaman: '5' })
  assert.equal(daftar.data.status, 'success')
  const baris = daftar.data.dataSekolah ?? []
  assert.equal(baris.length, 5)
  assert.ok((daftar.data.total_data ?? 0) > 200_000, `total_data ${daftar.data.total_data}`)
  tes(`daftar: 5 baris dari ${daftar.data.total_data?.toLocaleString('id-ID')} data`)

  // Jebakan tipe: semua string, dan kode wilayah punya spasi ekor.
  for (const s of baris) {
    assert.equal(typeof s.npsn, 'string', 'npsn bukan string')
    assert.equal(typeof s.lintang, 'string', 'lintang bukan string — asumsi parseFloat berubah')
    assert.equal(typeof s.bujur, 'string')
    assert.ok(['N', 'S'].includes(s.status), `status dalam data '${s.status}' bukan N/S`)
  }
  assert.notEqual(
    baris[0].kode_prop,
    baris[0].kode_prop.trim(),
    'kode_prop ternyata sudah tanpa spasi ekor — trim di alat bisa disederhanakan',
  )
  tes(`lintang/bujur/npsn string, status N|S, kode_prop punya spasi ekor: ${JSON.stringify(baris[0].kode_prop)}`)

  // Nama wilayah sudah berawalan Prov./Kota/Kec. — jangan ditambahi di UI.
  assert.match(baris[0].propinsi, /^Prov\. /, `propinsi '${baris[0].propinsi}' tanpa awalan Prov.`)
  tes('nama wilayah sudah berawalan Prov./Kota/Kec.')

  await jeda(400)

  // /sekolah/s BENAR-BENAR menyaring, dan total_data-nya jumlah yang cocok.
  const cari = await ambil<Balasan>(api, ep('cariNama'), { nama: 'pegangsaan' })
  const cocok = cari.data.dataSekolah ?? []
  assert.equal(cari.data.status, 'success')
  assert.ok(cocok.length > 0, 'pencarian pegangsaan kosong')
  assert.ok(
    (cari.data.total_data ?? 0) < 100,
    `total_data ${cari.data.total_data} — pencarian ternyata tidak menyaring lagi`,
  )
  for (const s of cocok) {
    assert.match(s.sekolah.toLowerCase(), /pegangsaan/, `'${s.sekolah}' tidak memuat kata pencarian`)
  }
  tes(`cariNama menyaring: ${cocok.length} hasil, semuanya memuat "pegangsaan"`)

  await jeda(400)

  // /sekolah?npsn= jalan, sementara /sekolah/npsn?npsn= kosong meski NPSN-nya ada.
  const satu = await ambil<Balasan>(api, ep('cariNpsn'), { npsn: '20104653' })
  assert.equal(satu.data.total_data, 1, `total_data ${satu.data.total_data}`)
  assert.equal(satu.data.dataSekolah?.[0]?.npsn, '20104653')
  tes(`cariNpsn: ${satu.data.dataSekolah?.[0]?.sekolah}`)

  await jeda(400)

  // Inti alasan alat TIDAK menawarkan filter jenjang: server mengabaikannya.
  const polos = await ambil<Balasan>(api, ep('daftar'), { halaman: '1', perHalaman: '10' })
  const berfilter = await ambil<{ dataSekolah?: Sekolah[]; total_data?: number }>(
    api,
    { ...ep('daftar'), path: '/sekolah?bentuk=SMA&page=1&perPage=10', contohPath: '/sekolah?bentuk=SMA&page=1&perPage=10', params: [] },
  )
  assert.deepEqual(
    berfilter.data.dataSekolah?.map((s) => s.npsn),
    polos.data.dataSekolah?.map((s) => s.npsn),
    'filter bentuk ternyata menyaring sekarang — alat bisa menawarkannya, perbarui REFERENCE.md',
  )
  tes('filter bentuk=SMA diabaikan server: hasilnya identik dengan tanpa filter')

  await jeda(400)

  // Galat dibalas HTTP 200 dengan status: "failed" — inilah kenapa cek status wajib.
  const takAda = await ambil<Balasan>(api, {
    ...ep('daftar'),
    path: '/provinsi',
    contohPath: '/provinsi',
    params: [],
  })
  assert.equal(takAda.status, 200, 'endpoint tak ada ternyata membalas non-200 sekarang')
  assert.equal(takAda.data.status, 'failed', `status akar '${takAda.data.status}'`)
  assert.ok(takAda.data.message?.includes('404'), `message '${takAda.data.message}'`)
  tes('endpoint tak ada -> HTTP 200 dengan status:failed, bukan 404')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
