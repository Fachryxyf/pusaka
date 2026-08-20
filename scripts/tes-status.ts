// T3.3 & T3.4 kriteria selesai. Tanpa jaringan — yang diuji lib/status.ts terhadap
// berkas status.json yang sungguh ada, plus perilaku saat satu endpoint dipaksa gagal.
import assert from 'node:assert/strict'
import { muatStatus, petaKesehatan, ringkasApi, type StatusApi } from '@/lib/status'
import { muatSemuaApi } from '@/lib/registry'
import type { Catatan } from '@/lib/probe'

let lolos = 0
function tes(nama: string, f: () => void) {
  f()
  lolos++
  console.log(`  ok  ${nama}`)
}

const status = muatStatus()

tes('public/status.json ada dan berbentuk sah', () => {
  assert.ok(status, 'jalankan `npm run probe` dulu')
  assert.equal(status.versi, 1)
  assert.ok(status.api.length > 0)
  assert.ok(!Number.isNaN(Date.parse(status.diperbarui)), `diperbarui tidak sah: ${status.diperbarui}`)
})

// API yang baru ditambahkan ke registry belum punya entri sampai probe berikutnya
// jalan. Itu keadaan normal — jadi ini dilaporkan, BUKAN digagalkan; kalau tidak,
// setiap pull request yang menambah API akan membuat CI merah tanpa sebab nyata.
tes('entri status vs registry dilaporkan (tidak digagalkan)', () => {
  const diStatus = new Set(status!.api.map((a) => a.slug))
  const belum = muatSemuaApi()
    .filter((a) => !diStatus.has(a.slug))
    .map((a) => a.slug)
  if (belum.length > 0) {
    console.log(`      catatan: belum diprobe — ${belum.join(', ')} (jalankan \`npm run probe\`)`)
  }
  // Sebaliknya: entri untuk API yang sudah dihapus dari registry harus ikut hilang
  // setelah probe berikutnya. Juga dilaporkan saja.
  const diRegistry = new Set(muatSemuaApi().map((a) => a.slug))
  const yatim = status!.api.filter((a) => !diRegistry.has(a.slug)).map((a) => a.slug)
  if (yatim.length > 0) {
    console.log(`      catatan: entri yatim — ${yatim.join(', ')} (hilang setelah probe berikutnya)`)
  }
  assert.ok(true)
})

tes('endpoint yang sudah diprobe punya riwayat lengkap', () => {
  for (const s of status!.api) {
    for (const e of s.endpoints) {
      assert.ok(e.catatan.length > 0, `${s.slug}/${e.endpointId} entri kosong`)
      for (const c of e.catatan) {
        assert.ok(!Number.isNaN(Date.parse(c.waktu)), `${s.slug}/${e.endpointId} waktu tidak sah`)
        assert.equal(typeof c.ok, 'boolean')
        if (!c.ok) assert.ok(c.sebab, `${s.slug}/${e.endpointId} gagal tanpa sebab`)
      }
    }
  }
})

tes('ringkasan cocok dengan isi riwayat', () => {
  const endpoint = status!.api.reduce((n, a) => n + a.endpoints.length, 0)
  assert.equal(status!.ringkasan.endpoint, endpoint)
  assert.equal(status!.ringkasan.api, status!.api.length)
  assert.equal(status!.ringkasan.ok + status!.ringkasan.gagal, endpoint)
})

// Inti T3.4: satu endpoint dipaksa gagal, penandanya HARUS muncul.
function palsuGagal(asli: StatusApi): StatusApi {
  const gagal: Catatan = {
    waktu: new Date().toISOString(),
    endpointId: asli.endpoints[0].endpointId,
    status: 500,
    latencyMs: 120,
    contentType: 'application/json',
    cors: 'open',
    ukuranByte: 12,
    ok: false,
    sebab: 'dipaksa gagal oleh tes',
  }
  return {
    ...asli,
    endpoints: asli.endpoints.map((e, i) =>
      i === 0 ? { ...e, catatan: [...e.catatan, gagal] } : e,
    ),
  }
}

tes('API sehat diringkas sebagai sehat', () => {
  const sehat = status!.api.find((a) => a.endpoints.every((e) => e.catatan.at(-1)?.ok))
  assert.ok(sehat, 'tidak ada API sehat untuk diuji')
  const r = ringkasApi(sehat)
  assert.equal(r.sehat, true)
  assert.deepEqual(r.endpointGagal, [])
  assert.ok(r.uptime30 !== null && r.uptime30 > 0)
  assert.ok(r.latencyRataRata !== null && r.latencyRataRata >= 0)
})

tes('satu endpoint gagal -> API ditandai bermasalah, endpointnya disebut', () => {
  const asli = status!.api.find((a) => a.endpoints.every((e) => e.catatan.at(-1)?.ok))!
  const r = ringkasApi(palsuGagal(asli))
  assert.equal(r.sehat, false, 'endpoint gagal tidak terdeteksi')
  assert.deepEqual(r.endpointGagal, [asli.endpoints[0].endpointId])
  assert.ok(r.uptime30 !== null && r.uptime30 < 100, `uptime ${r.uptime30} seharusnya turun`)
})

tes('petaKesehatan berkunci slug dan memuat semua API', () => {
  const peta = petaKesehatan()
  assert.equal(peta.size, status!.api.length)
  for (const a of status!.api) {
    assert.equal(peta.get(a.slug)?.slug, a.slug)
  }
})

tes('umur data ikut terbaca — VOA tercatat tua tapi tetap ok', () => {
  const berita = status!.api.find((a) => a.slug === 'berita-indo')
  assert.ok(berita, 'berita-indo tidak ada di status.json')
  const voa = berita.endpoints.find((e) => e.endpointId === 'voaSemua')
  const akhir = voa?.catatan.at(-1)
  assert.equal(akhir?.ok, true, 'VOA seharusnya ok — endpointnya bekerja')
  assert.ok(
    typeof akhir?.umurDataHari === 'number' && akhir.umurDataHari > 30,
    `umurDataHari ${akhir?.umurDataHari}`,
  )
  const r = ringkasApi(berita)
  assert.ok(r.umurDataMaks !== null && r.umurDataMaks > 30, 'umurDataMaks tidak terangkat')
  assert.equal(r.sehat, true, 'data tua tidak boleh membuat API dinyatakan bermasalah')
})

console.log(`\n${lolos} tes lolos.`)
