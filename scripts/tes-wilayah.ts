// T2.6 kriteria selesai: rantai Jawa Barat -> Kab. Bandung -> Pangalengan -> Warnasari
// harus menghasilkan 32.04.15.2003, dan tiap tingkat tidak boleh terpotong paginasi.
import assert from 'node:assert/strict'
import { ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Balasan = {
  data?: { code: string; name: string }[]
  meta?: { pagination?: { total?: number } }
}

async function main() {
  const api = muatApi('wilayah-idn-area')!
  let lolos = 0

  const ambilTingkat = async (endpointId: string, params: Record<string, string> = {}) => {
    const ep = api.endpoints.find((e) => e.id === endpointId)!
    const hasil = await ambil<Balasan>(api, ep, params)
    const daftar = hasil.data.data ?? []
    const total = hasil.data.meta?.pagination?.total

    // Inti tesnya: yang datang harus sebanyak yang API klaim ada.
    assert.equal(
      daftar.length,
      total,
      `${endpointId}: ${daftar.length} item tapi meta.pagination.total = ${total} — terpotong paginasi`,
    )
    assert.ok(hasil.ukuranByte >= ep.minUkuranByte, `${endpointId}: di bawah minUkuranByte`)
    lolos++
    console.log(`  ok  ${endpointId}: ${daftar.length} item = meta.pagination.total`)
    return daftar
  }

  const provinsi = await ambilTingkat('provinsi')
  const jabar = provinsi.find((p) => p.name === 'Jawa Barat')
  assert.equal(jabar?.code, '32')

  const kabupaten = await ambilTingkat('kabupaten', { kodeProvinsi: jabar!.code })
  const bandung = kabupaten.find((k) => k.name === 'Kabupaten Bandung')
  assert.equal(bandung?.code, '32.04')

  const kecamatan = await ambilTingkat('kecamatan', { kodeKabupaten: bandung!.code })
  const pangalengan = kecamatan.find((k) => k.name === 'Pangalengan')
  assert.equal(pangalengan?.code, '32.04.15')

  const desa = await ambilTingkat('kelurahan', { kodeKecamatan: pangalengan!.code })
  const warnasari = desa.find((d) => d.name === 'Warnasari')
  assert.equal(warnasari?.code, '32.04.15.2003')
  lolos++
  console.log(`  ok  rantai lengkap menghasilkan ${warnasari!.code}`)

  // Kode idn-area dipakai apa adanya oleh BMKG — inilah alasan alat Wilayah tidak
  // boleh memakai wilayah-emsifa (SPEC §6.5).
  const cuaca = muatApi('cuaca-bmkg')!
  const prakiraan = cuaca.endpoints.find((e) => e.id === 'prakiraan')!
  const hasil = await ambil<{ lokasi?: { desa?: string; adm4?: string } }>(cuaca, prakiraan, {
    kodeDesa: warnasari!.code,
  })
  assert.equal(hasil.data.lokasi?.adm4, warnasari!.code)
  assert.equal(hasil.data.lokasi?.desa, 'Warnasari')
  lolos++
  console.log(`  ok  BMKG menerima ${warnasari!.code} apa adanya — lokasi.desa = Warnasari`)

  // Kebalikannya: kode emsifa untuk desa yang sama TIDAK diterima BMKG.
  const emsifa = muatApi('wilayah-emsifa')!
  const kelurahanEmsifa = emsifa.endpoints.find((e) => e.id === 'kelurahan')!
  // 3204040 = Pangalengan menurut emsifa; idn-area menyebutnya 32.04.15.
  const desaEmsifa = await ambil<{ id: string; name: string }[]>(emsifa, kelurahanEmsifa, {
    idKecamatan: '3204040',
  })
  const warnasariEmsifa = desaEmsifa.data.find((d) => d.name.toUpperCase() === 'WARNASARI')
  assert.ok(warnasariEmsifa, 'Warnasari tidak ada di kecamatan emsifa 3204040')
  assert.notEqual(
    warnasariEmsifa!.id,
    warnasari!.code,
    'kode emsifa dan idn-area ternyata sama — asumsi dokumen perlu ditinjau',
  )
  lolos++
  console.log(`  ok  kode emsifa ${warnasariEmsifa!.id} != idn-area ${warnasari!.code}`)

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
