import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { ApiSchema, type Api } from '@/registry/schema'

const DIR_APIS = join(process.cwd(), 'registry', 'apis')

// Dipanggil dari Server Component dan dari scripts/*, jadi murni Node — tanpa API browser.
export function muatSemuaApi(): Api[] {
  const berkas = readdirSync(DIR_APIS)
    .filter((n) => n.endsWith('.yml'))
    .sort()

  const hasil: Api[] = []
  const asalSlug = new Map<string, string>()

  for (const nama of berkas) {
    const api = muatBerkas(nama)

    const kembar = asalSlug.get(api.slug)
    if (kembar) {
      throw new Error(`slug kembar '${api.slug}': registry/apis/${kembar} dan registry/apis/${nama}`)
    }
    asalSlug.set(api.slug, nama)
    hasil.push(api)
  }

  return hasil
}

export function muatApi(slug: string): Api | null {
  return muatSemuaApi().find((a) => a.slug === slug) ?? null
}

export function muatBerkas(nama: string): Api {
  const mentah = readFileSync(join(DIR_APIS, nama), 'utf8')

  let terurai: unknown
  try {
    terurai = parse(mentah)
  } catch (e) {
    throw new Error(`registry/apis/${nama}: YAML tidak sah — ${(e as Error).message}`)
  }

  const cek = ApiSchema.safeParse(terurai)
  if (!cek.success) {
    const rincian = cek.error.issues
      .map((i) => `  ${i.path.join('.') || '(akar)'}: ${i.message}`)
      .join('\n')
    throw new Error(`registry/apis/${nama}: gagal validasi skema\n${rincian}`)
  }

  if (`${cek.data.slug}.yml` !== nama) {
    throw new Error(`registry/apis/${nama}: slug '${cek.data.slug}' beda dengan nama file`)
  }

  return cek.data
}

export function daftarBerkasApi(): string[] {
  return readdirSync(DIR_APIS).filter((n) => n.endsWith('.yml')).sort()
}

// Zod tidak bisa memeriksa ini: tiap {placeholder} di path wajib punya params bernama sama,
// dan sebaliknya. Kalau tidak cocok, playground merender form yang tidak sesuai URL-nya.
export function cekPlaceholder(api: Api): string[] {
  const salah: string[] = []

  for (const ep of api.endpoints) {
    const placeholder = [...ep.path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
    const namaParam = ep.params.map((p) => p.nama)

    for (const p of placeholder) {
      if (!namaParam.includes(p)) salah.push(`${api.slug}/${ep.id}: {${p}} di path tanpa entry params`)
    }
    for (const n of namaParam) {
      if (!placeholder.includes(n) && !ep.path.includes(`{${n}}`) && !ep.contohPath.includes('?')) {
        salah.push(`${api.slug}/${ep.id}: params '${n}' tidak dipakai di path`)
      }
    }
    if (/\{[^}]+\}/.test(ep.contohPath)) {
      salah.push(`${api.slug}/${ep.id}: contohPath masih menyisakan {placeholder}`)
    }
  }

  const id = api.endpoints.map((e) => e.id)
  const kembar = id.filter((v, i) => id.indexOf(v) !== i)
  if (kembar.length) salah.push(`${api.slug}: endpoint id kembar — ${[...new Set(kembar)].join(', ')}`)

  return salah
}
