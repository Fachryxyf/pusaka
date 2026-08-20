// T2.12 kriteria selesai + probe ulang 14 sumber (2026-08-21). Butuh jaringan.
//
// Tes ini punya satu tugas tambahan: menjaga daftar sumber di alat tetap cocok
// dengan kenyataan. Kalau sumber yang mati hidup lagi, atau yang hidup ikut mati,
// tes ini yang memberi tahu — bukan pengguna.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil } from '@/lib/client'
import { muatApi } from '@/lib/registry'
import type { Endpoint } from '@/registry/schema'

type Mentah = {
  title?: string
  link?: string
  isoDate?: string
  contentSnippet?: string
  description?: string
  content?: string
  image?: Record<string, string> | string
}
type Balasan = { code?: number; status?: string; total?: number; data?: Mentah[] }

const jeda = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const api = muatApi('berita-indo')!
  let lolos = 0
  const tes = (nama: string) => {
    lolos++
    console.log(`  ok  ${nama}`)
  }

  const ep = (id: string): Endpoint => api.endpoints.find((e) => e.id === id)!

  // Kesembilan endpoint di registry harus hidup dan berisi. Yang mati sengaja
  // TIDAK didaftarkan, jadi registry sendiri adalah daftar putihnya.
  const isi = new Map<string, Mentah[]>()
  for (const e of api.endpoints) {
    const params: Record<string, string> = {}
    for (const p of e.params) params[p.nama] = p.contoh

    const hasil = await ambil<Balasan>(api, e, params)
    const data = hasil.data.data ?? []
    assert.ok(data.length > 0, `${e.id}: data kosong`)
    assert.ok(
      hasil.ukuranByte >= e.minUkuranByte,
      `${e.id}: ${hasil.ukuranByte} B di bawah ambang ${e.minUkuranByte} B`,
    )
    assert.equal(hasil.data.code, 200, `${e.id}: code ${hasil.data.code}`)
    isi.set(e.id, data)
    await jeda(200)
  }
  tes(`kesembilan endpoint di registry hidup dan berisi (${api.endpoints.length} diuji)`)

  // Lima sumber yang mati harus TETAP mati. Kalau salah satunya hidup lagi, itu
  // kabar baik yang layak ditindaklanjuti — dan tes ini yang memberitahukannya.
  const mati = ['liputan6-news', 'tribun-news', 'jawa-pos', 'vice', 'suara']
  const hidupLagi: string[] = []
  for (const nama of mati) {
    const palsu: Endpoint = { ...ep('cnnSemua'), id: nama, path: `/v1/${nama}`, contohPath: `/v1/${nama}` }
    try {
      const hasil = await ambil<Balasan>(api, palsu)
      if ((hasil.data.data ?? []).length > 0) hidupLagi.push(nama)
    } catch (e) {
      assert.ok(e instanceof GagalAmbil, `${nama}: galat tak terduga`)
    }
    await jeda(200)
  }
  assert.deepEqual(
    hidupLagi,
    [],
    `sumber ini hidup lagi dan bisa ditambahkan ke alat: ${hidupLagi.join(', ')}`,
  )
  tes('lima sumber yang tercatat mati memang masih mati')

  // Antara tidak punya endpoint "semua" — ini yang mengoreksi catatan lama
  // "antara-news membalas 404, jangan dimasukkan".
  const antaraSemua: Endpoint = {
    ...ep('antaraTipe'),
    path: '/v1/antara-news/',
    contohPath: '/v1/antara-news/',
    params: [],
  }
  await assert.rejects(
    () => ambil(api, antaraSemua),
    (e: unknown) => e instanceof GagalAmbil && e.status === 404,
    '/v1/antara-news/ seharusnya 404',
  )
  assert.ok((isi.get('antaraTipe') ?? []).length > 0, 'antara dengan rubrik seharusnya berisi')
  tes('Antara: /v1/antara-news/ 404, tapi /terkini berisi')

  // Bentuk data yang berbeda-beda. Ini yang membuat normalkan() di alat perlu ada.
  const bentuk: Record<string, { teks: string; gambar: string }> = {}
  for (const [id, data] of isi) {
    const b = data[0]
    const teks = b.contentSnippet ? 'contentSnippet' : b.description ? 'description' : b.content ? 'content' : 'TIDAK ADA'
    const gambar = !b.image ? 'tidak ada' : typeof b.image === 'string' ? 'string' : 'objek'
    bentuk[id] = { teks, gambar }
  }
  assert.equal(bentuk.cnnSemua.teks, 'contentSnippet')
  assert.equal(bentuk.tempoSemua.teks, 'content')
  assert.equal(bentuk.bbcSemua.teks, 'description')
  assert.equal(bentuk.tempoSemua.gambar, 'tidak ada', 'Tempo ternyata punya gambar sekarang')
  assert.equal(bentuk.bbcSemua.gambar, 'tidak ada', 'BBC ternyata punya gambar sekarang')
  assert.equal(bentuk.antaraTipe.gambar, 'string', 'Antara ternyata bukan string lagi')
  tes('bentuk berbeda per sumber masih sesuai catatan: ' + Object.entries(bentuk).map(([k, v]) => `${k}=${v.teks}/${v.gambar}`).join(' '))

  // Setiap berita wajib punya judul, tautan, dan isoDate UTC yang bisa diurai.
  for (const [id, data] of isi) {
    for (const b of data) {
      assert.ok(b.title?.trim(), `${id}: ada berita tanpa judul`)
      assert.ok(b.link?.startsWith('http'), `${id}: tautan tidak sah`)
      assert.ok(b.isoDate?.endsWith('Z'), `${id}: isoDate bukan UTC: ${b.isoDate}`)
      assert.ok(!Number.isNaN(Date.parse(b.isoDate!)), `${id}: isoDate tidak bisa diurai`)
    }
  }
  tes('semua berita punya judul, tautan http, dan isoDate UTC yang sah')

  // CNN menyaring rubrik dengan benar; itu sebabnya rubrik ditawarkan untuk CNN.
  const teknologi = await ambil<Balasan>(api, ep('cnnTipe'), { tipe: 'teknologi' })
  const dataTek = teknologi.data.data ?? []
  const cocok = dataTek.filter((b) => b.link?.includes('/teknologi/')).length
  assert.ok(cocok / dataTek.length > 0.9, `rubrik CNN tidak menyaring: ${cocok}/${dataTek.length}`)
  tes(`rubrik CNN menyaring: ${cocok}/${dataTek.length} tautan memuat /teknologi/`)

  // BBC punya listType di root tapi TIDAK menyaring — karena itu rubriknya tidak
  // ditawarkan di alat.
  const bbcRubrik: Endpoint = { ...ep('bbcSemua'), path: '/v1/bbc-news/dunia', contohPath: '/v1/bbc-news/dunia' }
  const bbcD = await ambil<Balasan>(api, bbcRubrik)
  assert.equal(
    bbcD.data.data?.[0]?.link,
    isi.get('bbcSemua')?.[0]?.link,
    'BBC ternyata menyaring sekarang — rubriknya bisa ditawarkan, perbarui alat',
  )
  tes('BBC: rubrik tidak menyaring, jadi memang tidak ditawarkan')

  // VOA hidup tapi datanya beku. Kalau suatu saat segar lagi, peringatan di alat
  // otomatis hilang — tapi tes ini mencatat keadaannya sekarang.
  const voa = isi.get('voaSemua') ?? []
  const terbaru = Math.max(...voa.map((b) => Date.parse(b.isoDate ?? '0')))
  const umurHari = Math.floor((Date.now() - terbaru) / 86_400_000)
  assert.ok(umurHari > 30, `VOA ternyata segar lagi (umur ${umurHari} hari) — perbarui REFERENCE.md`)
  tes(`VOA lolos semua syarat probe tapi berita terbarunya berumur ${umurHari} hari`)

  // Rubrik tak dikenal membalas 500, bukan 400/404.
  await assert.rejects(
    () => ambil(api, ep('cnnTipe'), { tipe: 'ngawur' }),
    (e: unknown) => e instanceof GagalAmbil && e.status === 500,
    'rubrik tak dikenal seharusnya 500',
  )
  tes('rubrik tak dikenal -> 500, ditangani sebagai galat')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
