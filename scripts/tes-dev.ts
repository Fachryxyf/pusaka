// T4.1–T4.3 kriteria selesai. Tanpa jaringan: yang diuji halaman hasil ekspor statis
// di out/, jadi ini juga membuktikan halamannya benar-benar terbit.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { muatSemuaApi } from '@/lib/registry'

const OUT = join(process.cwd(), 'out')

let lolos = 0
function tes(nama: string, f: () => void) {
  f()
  lolos++
  console.log(`  ok  ${nama}`)
}

function baca(jalur: string): string {
  const berkas = join(OUT, jalur, 'index.html')
  assert.ok(existsSync(berkas), `${jalur} tidak terekspor — jalankan \`npm run build\``)
  return readFileSync(berkas, 'utf8')
}

assert.ok(existsSync(OUT), 'folder out/ belum ada — jalankan `npm run build` dulu')

const api = muatSemuaApi()

tes('katalog /dev terbit dan memuat semua API', () => {
  const html = baca('dev')
  for (const a of api) {
    assert.ok(html.includes(a.slug), `${a.slug} tidak ada di katalog`)
    assert.ok(html.includes(`/dev/api/${a.slug}`), `${a.slug} tidak ditautkan`)
  }
})

tes('katalog memuat kontrol pencarian dan ketiga filter', () => {
  const html = baca('dev')
  for (const id of ['cari-api', 'filter-kategori', 'filter-auth', 'filter-status']) {
    assert.ok(html.includes(id), `kontrol ${id} tidak ada`)
  }
})

tes('tiap API punya halaman detail sendiri', () => {
  for (const a of api) {
    assert.ok(existsSync(join(OUT, 'dev', 'api', a.slug, 'index.html')), `${a.slug} tanpa halaman`)
  }
})

// T4.2 kriteria: /dev/api/gempa-bmkg menampilkan ketiga endpoint beserta paramsnya.
tes('gempa-bmkg menampilkan ketiga endpoint', () => {
  const html = baca('dev/api/gempa-bmkg')
  for (const id of ['autogempa', 'terkini', 'dirasakan']) {
    assert.ok(html.includes(id), `endpoint ${id} tidak ada`)
  }
  assert.ok(html.includes('data.bmkg.go.id'), 'base URL tidak ada')
  assert.ok(html.includes('/DataMKG/TEWS/autogempa.json'), 'path endpoint tidak ada')
})

tes('halaman detail menampilkan params beserta contoh dan keterangannya', () => {
  const html = baca('dev/api/sholat-myquran')
  const jadwal = api
    .find((a) => a.slug === 'sholat-myquran')!
    .endpoints.find((e) => e.id === 'jadwal')!
  for (const p of jadwal.params) {
    assert.ok(html.includes(p.nama), `param ${p.nama} tidak ada`)
    assert.ok(html.includes(p.contoh), `contoh ${p.nama} tidak ada`)
  }
})

tes('dokumentasi tergenerate dari registry, bukan ditulis manual', () => {
  // Nilai yang hanya ada di YAML: kalau muncul di HTML, berarti memang dibaca
  // dari registry.
  const html = baca('dev/api/cuaca-bmkg')
  const prakiraan = api
    .find((a) => a.slug === 'cuaca-bmkg')!
    .endpoints.find((e) => e.id === 'prakiraan')!
  assert.ok(
    html.includes(prakiraan.minUkuranByte.toLocaleString('id-ID')),
    'minUkuranByte tidak dirender',
  )
  assert.ok(html.includes('32.04.15.2003'), 'contoh param tidak dirender')
})

tes('provenance ditampilkan, termasuk yang unknown', () => {
  // myQuran lisensinya unknown. Menyembunyikannya justru membuat orang mengira
  // haknya sudah jelas (NOTICE.md).
  const html = baca('dev/api/sholat-myquran')
  assert.ok(html.includes('Hak pakai data'), 'bagian provenance tidak ada')
  assert.ok(html.includes('unknown'), 'lisensi unknown tidak ditampilkan')
  assert.ok(html.includes('permintaan per detik'), 'batasAkses tidak ditampilkan')
})

tes('atribusi wajib ditandai wajib', () => {
  const html = baca('dev/api/gempa-bmkg')
  assert.ok(html.includes('Atribusi (wajib)'), 'atribusi BMKG tidak ditandai wajib')
  assert.ok(html.includes('BMKG'), 'teks atribusi tidak ada')
})

// T4.3: tombol Kirim dinonaktifkan untuk API tanpa CORS, dengan alasan disebutkan.
tes('API tanpa CORS: alasan tombol Kirim mati dijelaskan', () => {
  const html = baca('dev/api/jpl-ssd')
  assert.ok(html.includes('Access-Control-Allow-Origin'), 'alasan CORS tidak dijelaskan')
  assert.ok(html.includes('lapisan proxy'), 'tidak menyebut proxy sebagai penyebab')
  assert.ok(html.includes('disabled'), 'tombol tidak dinonaktifkan')
})

tes('API dengan CORS terbuka: tombol Kirim tidak diberi peringatan CORS', () => {
  const html = baca('dev/api/gempa-bmkg')
  assert.ok(!html.includes('lapisan proxy'), 'peringatan CORS muncul padahal tidak perlu')
})

tes('playground menyediakan salinan curl dan fetch', () => {
  const html = baca('dev/api/gempa-bmkg')
  assert.ok(html.includes('Salin sebagai curl'), 'tombol curl tidak ada')
  assert.ok(html.includes('Salin sebagai fetch'), 'tombol fetch tidak ada')
})

tes('halaman detail menautkan alat yang memakai API-nya', () => {
  const html = baca('dev/api/wilayah-idn-area')
  // idn-area dipakai alat Wilayah (utama) dan alat Cuaca (pendukung).
  assert.ok(html.includes('/alat/wilayah'), 'alat Wilayah tidak ditautkan')
  assert.ok(html.includes('/alat/cuaca'), 'alat Cuaca (apiPendukung) tidak ditautkan')
})

tes('slug tak dikenal tidak ikut terekspor', () => {
  assert.ok(!existsSync(join(OUT, 'dev', 'api', 'ngawur')), 'halaman untuk slug palsu ikut terbit')
})

console.log(`\n${lolos} tes lolos.`)
