// Health check semua endpoint di registry, lalu tulis public/status.json.
//
// PENYIMPANAN RIWAYAT — kenapa tidak di data/health/ seperti SPEC §4:
// Riwayat perlu bertahan antar-jalan, dan cara yang lazim adalah commit balik ke repo.
// Itu menuntut workflow ber-`contents: write` plus hak melewati ruleset branch —
// dua hal yang sengaja dihapus pada 2026-08-21 (SPEC §3.1).
//
// Gantinya: **situs yang sudah terbit adalah penyimpanannya.** Sebelum memprobe,
// skrip ini mengunduh `status.json` versi live, menambahkan hasil baru, lalu menulis
// ulang berkasnya ke `public/`. Riwayat ikut terbawa tiap deploy tanpa satu pun
// izin tulis ke repo.
//
// Konsekuensi yang harus diketahui: kalau situs belum pernah terbit, atau berkas
// lamanya tidak terjangkau, riwayat mulai dari nol dan itu dicatat di keluaran.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { probeEndpoint, type Catatan, type Cors } from '@/lib/probe'
import { muatSemuaApi } from '@/lib/registry'
import { USER_AGENT } from '@/lib/client'

const DIR = join(process.cwd(), 'public')
const BERKAS = join(DIR, 'status.json')
const URL_LIVE = process.env.PUSAKA_STATUS_URL ?? 'https://pusaka.fachryxyf.com/status.json'

const SIMPAN_HARI = 90
const HARI_MS = 86_400_000

export type RiwayatEndpoint = {
  endpointId: string
  catatan: Catatan[]
}

export type StatusApi = {
  slug: string
  nama: string
  kategori: string
  cors: Cors
  endpoints: RiwayatEndpoint[]
}

export type BerkasStatus = {
  versi: 1
  diperbarui: string
  ringkasan: { api: number; endpoint: number; ok: number; gagal: number }
  api: StatusApi[]
}

async function main() {
  const daftarApi = muatSemuaApi()
  const lama = await ambilLama()

  const api: StatusApi[] = []
  let ok = 0
  let gagal = 0

  for (const a of daftarApi) {
    const endpoints: RiwayatEndpoint[] = []
    // Field cors di registry diisi ulang dari header asli (SPEC §9).
    let corsTerukur: Cors = 'unknown'

    for (const e of a.endpoints) {
      const catatan = await probeEndpoint(a, e)
      if (catatan.ok) ok++
      else gagal++

      if (corsTerukur === 'unknown' && catatan.status > 0) corsTerukur = catatan.cors

      const sebelumnya = lama
        ?.api.find((x) => x.slug === a.slug)
        ?.endpoints.find((x) => x.endpointId === e.id)?.catatan ?? []

      endpoints.push({
        endpointId: e.id,
        catatan: potong([...sebelumnya, catatan]),
      })

      const tanda = catatan.ok ? 'ok  ' : 'GAGAL'
      const umur =
        catatan.umurDataHari === null || catatan.umurDataHari === undefined
          ? ''
          : ` · data ${catatan.umurDataHari} hari`
      console.log(
        `  ${tanda} ${a.slug}/${e.id} — ${catatan.status} ${catatan.latencyMs}ms ` +
          `${catatan.ukuranByte} B${umur}${catatan.sebab ? ` — ${catatan.sebab}` : ''}`,
      )

      // Jangan hajar server orang beruntun. Beberapa API di katalog ini dibiayai
      // developernya sendiri, dan myQuran membalas 429 pada permintaan kedua dalam
      // satu detik (SPEC §9).
      await new Promise((r) => setTimeout(r, 400))
    }

    api.push({
      slug: a.slug,
      nama: a.nama,
      kategori: a.kategori,
      cors: corsTerukur === 'unknown' ? a.cors : corsTerukur,
      endpoints,
    })

    const beda = corsTerukur !== 'unknown' && corsTerukur !== a.cors
    if (beda) {
      console.log(`  catatan: cors ${a.slug} terukur '${corsTerukur}', registry menulis '${a.cors}'`)
    }
  }

  const berkas: BerkasStatus = {
    versi: 1,
    diperbarui: new Date().toISOString(),
    ringkasan: { api: api.length, endpoint: ok + gagal, ok, gagal },
    api,
  }

  mkdirSync(DIR, { recursive: true })
  writeFileSync(BERKAS, `${JSON.stringify(berkas)}\n`)

  const titik = api.reduce((n, a) => n + a.endpoints.reduce((m, e) => m + e.catatan.length, 0), 0)
  console.log(`\n${ok} ok, ${gagal} gagal dari ${ok + gagal} endpoint.`)
  console.log(`public/status.json ditulis — ${titik} titik riwayat tersimpan.`)

  // Keluar tidak-nol HANYA kalau semuanya gagal. Satu API mati adalah keadaan
  // normal di katalog ini — justru itu yang mau dipantau, bukan dijadikan alasan
  // menggagalkan deploy.
  if (ok === 0) {
    console.error('Tidak ada satu pun endpoint yang lolos. Kemungkinan jaringan runner bermasalah.')
    process.exit(1)
  }
}

async function ambilLama(): Promise<BerkasStatus | null> {
  try {
    const res = await fetch(URL_LIVE, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      console.log(`Riwayat lama tidak terjangkau (${res.status}) — mulai dari nol.`)
      return null
    }
    const isi = (await res.json()) as BerkasStatus
    if (isi.versi !== 1 || !Array.isArray(isi.api)) {
      console.log('Riwayat lama berbentuk tak dikenali — mulai dari nol.')
      return null
    }
    console.log(`Riwayat lama dimuat (diperbarui ${isi.diperbarui}).`)
    return isi
  } catch (e) {
    console.log(`Riwayat lama tidak bisa diambil (${(e as Error).message}) — mulai dari nol.`)
    return null
  }
}

// Rolling 90 hari. Batas jumlah ikut dipasang supaya berkasnya tidak membengkak
// kalau suatu saat probe dijalankan lebih sering dari 6 jam.
function potong(catatan: Catatan[]): Catatan[] {
  const batas = Date.now() - SIMPAN_HARI * HARI_MS
  return catatan
    .filter((c) => {
      const waktu = Date.parse(c.waktu)
      return Number.isNaN(waktu) ? false : waktu >= batas
    })
    .slice(-400)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
