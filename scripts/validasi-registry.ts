// Dijalankan sebagai bagian dari `npm run build` — YAML rusak tidak boleh lolos ke produksi.
import { cekPlaceholder, muatSemuaApi } from '@/lib/registry'

const api = muatSemuaApi()
const salah = api.flatMap(cekPlaceholder)

if (salah.length) {
  console.error('Registry tidak sah:')
  for (const s of salah) console.error(`  ${s}`)
  process.exit(1)
}

const jumlahEndpoint = api.reduce((n, a) => n + a.endpoints.length, 0)
console.log(`Registry sah: ${api.length} API, ${jumlahEndpoint} endpoint.`)
