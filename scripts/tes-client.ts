// Tes lib/client.ts lapis 1 terhadap API sungguhan (T2.1). Butuh jaringan.
import assert from 'node:assert/strict'
import { GagalAmbil, ambil, bangunUrl } from '@/lib/client'
import { muatApi } from '@/lib/registry'
import { ApiSchema } from '@/registry/schema'

let lolos = 0
async function tes(nama: string, f: () => Promise<void> | void) {
  await f()
  lolos++
  console.log(`  ok  ${nama}`)
}

async function main() {
const gempa = muatApi('gempa-bmkg')!
const autogempa = gempa.endpoints.find((e) => e.id === 'autogempa')!

  await tes('gempa-bmkg/autogempa mengembalikan objek Infogempa', async () => {
  const hasil = await ambil<{ Infogempa?: { gempa?: Record<string, string> } }>(gempa, autogempa)
  assert.equal(hasil.sumber, 'langsung')
  assert.ok(hasil.data.Infogempa?.gempa?.Magnitude, 'Infogempa.gempa.Magnitude tidak ada')
  assert.ok(
    hasil.ukuranByte >= autogempa.minUkuranByte,
    `ukuran ${hasil.ukuranByte} B di bawah ambang ${autogempa.minUkuranByte} B`,
  )
  console.log(`      M${hasil.data.Infogempa.gempa.Magnitude} — ${hasil.data.Infogempa.gempa.Wilayah}`)
})

  await tes('URL yang membalas HTML dianggap gagal, bukan sukses', async () => {
  // Jebakan Bukuacak: 200 + CORS * tapi Content-Type text/html (SPEC §7).
  const palsu = ApiSchema.parse({
    ...gempa,
    slug: 'bukuacak-uji',
    baseUrl: 'https://bukuacak.vercel.app',
    endpoints: [{ ...autogempa, path: '/api/v1/book', contohPath: '/api/v1/book' }],
  })
  const ep = palsu.endpoints[0]
  await assert.rejects(
    () => ambil(palsu, ep),
    (e: unknown) => e instanceof GagalAmbil && (e.sebab === 'bukan-json' || e.sebab === 'status'),
    'HTML/SPA mati malah dilaporkan sukses',
  )
})

  await tes('placeholder terisi saat membangun URL, param wajib kosong ditolak', () => {
  const sholat = muatApi('sholat-myquran')!
  const jadwal = sholat.endpoints.find((e) => e.id === 'jadwal')!
  assert.equal(
    bangunUrl(sholat, jadwal, { idKota: '1301', tahun: '2026', bulan: '08', tanggal: '06' }),
    'https://api.myquran.com/v2/sholat/jadwal/1301/2026/08/06',
  )
  assert.throws(() => bangunUrl(sholat, jadwal, { idKota: '1301' }), /belum diisi/)
})

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
