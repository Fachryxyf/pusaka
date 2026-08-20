// T2.10 kriteria selesai + jebakan yang ditemukan 2026-08-21. Butuh jaringan.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'

type Ringkas = { nomor: number; namaLatin: string; jumlahAyat: number; deskripsi: string }
type Ayat = { nomorAyat: number; teksArab: string; teksLatin: string; teksIndonesia: string; audio?: Record<string, string> }
type Detail = Ringkas & { audioFull?: Record<string, string>; ayat?: Ayat[]; suratSebelumnya?: unknown; suratSelanjutnya?: unknown }

const QARI = ['01', '02', '03', '04', '05', '06']

async function main() {
  const api = muatApi('quran-equran')!
  const daftar = api.endpoints.find((e) => e.id === 'daftarSurat')!
  const detail = api.endpoints.find((e) => e.id === 'detailSurat')!

  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const list = await ambil<{ data?: Ringkas[] }>(api, daftar)
  const surat = list.data.data ?? []
  assert.equal(surat.length, 114, `dapat ${surat.length} surat, bukan 114`)
  assert.ok(list.ukuranByte >= daftar.minUkuranByte)
  tes(`daftarSurat: 114 surat, ${Math.round(list.ukuranByte / 1024)} KB`)

  const fatihah = await ambil<{ data?: Detail }>(api, detail, { nomor: '1' })
  const d = fatihah.data.data!
  assert.equal(d.namaLatin, 'Al-Fatihah')
  assert.equal(d.jumlahAyat, 7)
  assert.equal(d.ayat?.length, 7, `ayat.length ${d.ayat?.length} != jumlahAyat 7`)
  for (const a of d.ayat!) {
    assert.ok(a.teksArab?.length > 0, `ayat ${a.nomorAyat} tanpa teksArab`)
    assert.ok(a.teksLatin?.trim().length > 0, `ayat ${a.nomorAyat} tanpa teksLatin`)
    assert.ok(a.teksIndonesia?.length > 0, `ayat ${a.nomorAyat} tanpa teksIndonesia`)
  }
  tes('Al-Fatihah: 7 ayat lengkap dengan Arab + latin + terjemahan')

  // Kunci audio adalah STRING berangka. audioFull[5] harus undefined; yang sah "05".
  assert.deepEqual(Object.keys(d.audioFull ?? {}).sort(), QARI, 'kunci audioFull berubah')
  assert.ok(d.audioFull!['05']?.startsWith('https://'), 'audioFull["05"] bukan URL')
  assert.equal(
    (d.audioFull as unknown as Record<number, string>)[5],
    undefined,
    'audioFull[5] ternyata ada — asumsi kunci string perlu ditinjau',
  )
  assert.deepEqual(Object.keys(d.ayat![0].audio ?? {}).sort(), QARI, 'kunci audio ayat berubah')
  tes('kunci audio string "01"-"06"; audioFull[5] memang undefined')

  // Nama qari hanya ada di dalam URL — dipetakan di alat, jadi kalau URL-nya berubah
  // pemetaan itu ikut salah.
  assert.match(d.audioFull!['05'], /Misyari-Rasyid/, 'qari 05 bukan lagi Misyari Rasyid')
  assert.match(d.audioFull!['01'], /Abdullah-Al-Juhany/, 'qari 01 bukan lagi Abdullah Al-Juhany')
  tes('pemetaan nama qari masih cocok dengan URL')

  // suratSebelumnya bertipe false pada surat 1, bukan null.
  assert.equal(d.suratSebelumnya, false, `suratSebelumnya = ${JSON.stringify(d.suratSebelumnya)}`)
  assert.equal(typeof d.suratSelanjutnya, 'object')
  tes('suratSebelumnya bernilai false (bukan null) pada surat 1')

  // Tag HTML di deskripsi: yang boleh muncul hanya i, br, a. Kalau ada tag baru,
  // TeksBertag perlu ditinjau.
  const tag = new Set<string>()
  for (const s of surat) {
    for (const m of (s.deskripsi ?? '').matchAll(/<\/?([a-zA-Z][^\s>/]*)[^>]*>/g)) {
      tag.add(m[1].toLowerCase())
    }
  }
  assert.deepEqual(
    [...tag].sort(),
    ['a', 'br', 'i'],
    `tag di deskripsi berubah: ${[...tag].join(', ')} — tinjau komponen/TeksBertag.tsx`,
  )
  tes(`tag deskripsi di 114 surat tetap {a, br, i}`)

  // Al-Baqarah 397 KB — lebih besar dari 341 KB yang tercatat sebagai terbesar di
  // katalog. Ini yang membuktikan body harus dibaca sampai habis (SPEC §9).
  const baqarah = await ambil<{ data?: Detail }>(api, detail, { nomor: '2' })
  assert.equal(baqarah.data.data?.ayat?.length, 286, 'Al-Baqarah tidak lengkap 286 ayat')
  assert.ok(baqarah.ukuranByte > 341_000, `cuma ${baqarah.ukuranByte} B`)
  tes(`Al-Baqarah utuh: 286 ayat, ${Math.round(baqarah.ukuranByte / 1024)} KB dibaca penuh`)

  for (const [nomor, status] of [['0', 404], ['115', 404]] as const) {
    await assert.rejects(
      () => ambil(api, detail, { nomor }),
      (e: unknown) => e instanceof GagalAmbil && e.status === status,
      `/surat/${nomor} seharusnya ${status}`,
    )
  }
  tes('nomor 0 dan 115 -> 404, bukan sukses')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
