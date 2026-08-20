'use client'

import type { PropAlat } from '@/alat/tipe'
import type { Api } from '@/registry/schema'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// cad & fireball membalas TABEL: fields = nama kolom, data = array of array.
// Kolom dibaca lewat fields.indexOf — urutan bisa berubah kalau paramnya berubah
// (lihat REFERENCE.md bagian "Jebakan bentuk yang khas JPL").
type Tabel = { fields?: string[]; data?: (string | null)[][] }

type Risiko = {
  des: string
  fullname: string
  ip: string
  ps_max: string
  range: string
  diameter: string
  v_inf: string
  last_obs: string
}
type BalasanRisiko = { data?: Risiko[] }

const AU_KE_KM = 149_597_870.7

export default function AlatObjekDekatBumi({ api }: PropAlat) {
  return (
    <div className="space-y-8">
      <Pendekatan api={api} />
      <BolaApi api={api} />
      <Risikonya api={api} />
    </div>
  )
}

function Pendekatan({ api }: { api: Api }) {
  const { data, loading, error, sumber, per, ulangi } = useApi<Tabel>(api, 'pendekatan')
  const baris = bacaTabel(data)

  return (
    <section className="space-y-3">
      <Judul teks="Lewat dekat Bumi" catatan="60 hari ke depan, dalam 0,05 au" jumlah={baris.length} />
      {sumber === 'mirror' && <BannerMirror per={per} />}
      {loading && <Kerangka baris={5} />}
      {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
      {!loading && !error && baris.length === 0 && (
        <Kosong
          pesan="Tidak ada objek yang melintas sedekat itu dalam 60 hari ke depan."
          saran="Itu kabar baik — daftarnya memang sering kosong."
        />
      )}

      {baris.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {baris.map((b, i) => {
            const jarakAu = parseFloat(b.dist ?? '')
            return (
              <li key={`${b.des}-${b.cd}-${i}`} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{(b.fullname ?? b.des ?? '—').trim()}</span>
                  <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {Number.isFinite(jarakAu) ? `${bulat(jarakAu * AU_KE_KM, 0)} km` : '—'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {b.cd ? `${b.cd} UTC` : 'waktu tidak tercatat'}
                  {b.v_rel ? ` · ${bulat(parseFloat(b.v_rel), 1)} km/detik` : ''}
                  {b.h ? ` · magnitudo ${b.h}` : ''}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function BolaApi({ api }: { api: Api }) {
  const { data, loading, error, sumber, per, ulangi } = useApi<Tabel>(api, 'bolaApi')
  const baris = bacaTabel(data)

  return (
    <section className="space-y-3">
      <Judul teks="Bola api di atmosfer" catatan="terdeteksi paling akhir" jumlah={baris.length} />
      {sumber === 'mirror' && <BannerMirror per={per} />}
      {loading && <Kerangka baris={5} />}
      {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
      {!loading && !error && baris.length === 0 && (
        <Kosong pesan="Belum ada bola api yang tercatat." />
      )}

      {baris.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {baris.map((b, i) => (
            <li key={`${b.date}-${i}`} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{koordinat(b)}</span>
                {/* impact-e dalam kiloton TNT */}
                <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {b['impact-e'] ? `${b['impact-e']} kt` : '—'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {b.date ?? '—'}
                {b.alt ? ` · ketinggian ${b.alt} km` : ''}
                {/* vel null pada sebagian besar baris — barisnya tetap berguna, jadi hanya dilewati */}
                {b.vel ? ` · ${b.vel} km/detik` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Risikonya({ api }: { api: Api }) {
  const { data, loading, error, sumber, per, ulangi } = useApi<BalasanRisiko>(api, 'risiko')
  // Beda dari dua bagian di atas: sentry membalas array objek, bukan tabel.
  const daftar = data?.data ?? []

  return (
    <section className="space-y-3">
      <Judul teks="Dipantau NASA" catatan="skala Palermo ≥ −3" jumlah={daftar.length} />
      {sumber === 'mirror' && <BannerMirror per={per} />}
      {loading && <Kerangka baris={4} />}
      {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
      {!loading && !error && daftar.length === 0 && (
        <Kosong pesan="Tidak ada objek di ambang perhatian ini." />
      )}

      {daftar.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {daftar.map((o) => (
            <li key={o.des} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{(o.fullname || o.des).trim()}</span>
                <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  1 : {peluang(o.ip)}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                rentang tahun {o.range}
                {o.diameter ? ` · Ø ${o.diameter} km` : ''}
                {o.ps_max ? ` · Palermo ${o.ps_max}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
      {daftar.length > 0 && (
        <p className="text-xs text-zinc-500">
          Skala Palermo di bawah −2 berarti peluangnya jauh lebih kecil daripada risiko latar
          alami. Angka di daftar ini bukan peringatan.
        </p>
      )}
    </section>
  )
}

function Judul({ teks, catatan, jumlah }: { teks: string; catatan: string; jumlah: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="teks-mikro font-semibold uppercase text-zinc-500">{teks}</h2>
      <span className="shrink-0 text-xs text-zinc-500">
        {jumlah > 0 ? `${jumlah} · ` : ''}
        {catatan}
      </span>
    </div>
  )
}

// Baris tabel dipetakan ke objek pakai `fields` — indeks kolom tidak pernah di-hardcode.
function bacaTabel(t: Tabel | null): Record<string, string | null>[] {
  if (!t?.fields || !Array.isArray(t.data)) return []
  const kolom = t.fields
  return t.data.map((baris) => {
    const objek: Record<string, string | null> = {}
    kolom.forEach((nama, i) => {
      objek[nama] = baris[i] ?? null
    })
    return objek
  })
}

// lat/lon dikirim tanpa tanda; arahnya di kolom terpisah (REFERENCE.md).
function koordinat(b: Record<string, string | null>): string {
  if (!b.lat || !b.lon) return 'Lokasi tidak tercatat'
  return `${b.lat}° ${b['lat-dir'] ?? ''}, ${b.lon}° ${b['lon-dir'] ?? ''}`.trim()
}

function peluang(ip: string): string {
  const n = parseFloat(ip)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return Math.round(1 / n).toLocaleString('id-ID')
}

function bulat(n: number, desimal: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('id-ID', { maximumFractionDigits: desimal })
}
