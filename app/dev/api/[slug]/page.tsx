import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DAFTAR_META } from '@/alat/daftar'
import { LencanaStatus } from '@/komponen/LencanaStatus'
import { Playground } from '@/komponen/Playground'
import { RiwayatBatang } from '@/komponen/RiwayatBatang'
import { muatApi, muatSemuaApi } from '@/lib/registry'
import { muatStatus, ringkasApi } from '@/lib/status'

export function generateStaticParams() {
  return muatSemuaApi().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<'/dev/api/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const api = muatApi(slug)
  if (!api) return { title: 'API tidak ditemukan' }
  return { title: api.nama, description: api.deskripsi }
}

export default async function HalamanApi({ params }: PageProps<'/dev/api/[slug]'>) {
  const { slug } = await params
  const api = muatApi(slug)
  if (!api) notFound()

  const status = muatStatus()
  const statusApi = status?.api.find((a) => a.slug === slug)
  const ringkas = statusApi ? ringkasApi(statusApi) : undefined
  const alatTerkait = DAFTAR_META.filter(
    (a) => a.apiSlug === slug || a.apiPendukung?.includes(slug),
  )

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Link href="/dev" className="fokus-cincin teks-kecil inline-block rounded text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Katalog API
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-[1.625rem] font-semibold leading-tight tracking-tight">{api.nama}</h1>
            <p className="font-mono text-sm text-zinc-500">{api.slug}</p>
          </div>
          <LencanaStatus ringkas={ringkas} />
        </div>

        <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">{api.deskripsi}</p>
      </div>

      <section className="grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
        <Fakta label="Base URL">
          <code className="break-all font-mono text-sm">{api.baseUrl}</code>
        </Fakta>
        <Fakta label="Kategori">{api.kategori}</Fakta>
        <Fakta label="Autentikasi">
          {api.auth === 'none' ? 'Tanpa kunci' : api.auth === 'apikey' ? 'Perlu API key' : 'OAuth'}
        </Fakta>
        <Fakta label="CORS">
          {api.cors === 'open'
            ? 'Terbuka — bisa dipanggil langsung dari browser'
            : api.cors === 'none'
              ? 'Tidak ada — hanya bisa dari server'
              : api.cors === 'locked'
                ? 'Terbatas ke origin tertentu'
                : 'Belum diketahui'}
        </Fakta>
        <Fakta label="Pengembang">
          {api.developer.profil ? (
            <a
              href={api.developer.profil}
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
            >
              {api.developer.nama}
            </a>
          ) : (
            api.developer.nama
          )}
        </Fakta>
        <Fakta label="Dokumentasi asli">
          <a
            href={api.dokumentasi}
            rel="noopener noreferrer"
            target="_blank"
            className="fokus-cincin break-all rounded text-sm underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            {api.dokumentasi}
          </a>
        </Fakta>
      </section>

      {/* Provenance ditampilkan terbuka, termasuk yang 'unknown'. Menyembunyikan
          ketidaktahuan justru membuat orang mengira haknya sudah jelas. */}
      <section className="space-y-3">
        <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
          Hak pakai data
        </h2>
        <dl className="space-y-2 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <Prov label="Lisensi" nilai={api.provenance.lisensi} url={api.provenance.sumberLisensi} />
          <Prov
            label="Redistribusi"
            nilai={
              api.provenance.redistribusi === 'boleh'
                ? 'Boleh'
                : api.provenance.redistribusi === 'tidak-boleh'
                  ? 'Tidak boleh'
                  : 'unknown'
            }
          />
          {api.provenance.atribusi && (
            <Prov
              label={api.provenance.atribusiWajib ? 'Atribusi (wajib)' : 'Atribusi'}
              nilai={api.provenance.atribusi}
            />
          )}
          {api.provenance.batasAkses && (
            <Prov label="Batas akses" nilai={api.provenance.batasAkses} />
          )}
          <Prov label="Mirror" nilai={api.provenance.kebijakanMirror} />
          {api.provenance.diperiksa && (
            <Prov label="Diperiksa" nilai={api.provenance.diperiksa} />
          )}
        </dl>
        <p className="text-xs text-zinc-500">
          Nilai <code className="font-mono">unknown</code> berarti penerbitnya tidak menyatakan
          apa pun — bukan berarti bebas dipakai. Rinciannya di{' '}
          <a
            href="https://github.com/Fachryxyf/pusaka/blob/xyf/NOTICE.md"
            rel="noopener noreferrer"
            target="_blank"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            NOTICE.md
          </a>
          .
        </p>
      </section>

      {alatTerkait.length > 0 && (
        <section className="space-y-2">
          <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
            Alat yang memakai API ini
          </h2>
          <ul className="flex flex-wrap gap-2">
            {alatTerkait.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/alat/${a.slug}`}
                  className="fokus-cincin inline-block rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {a.judul}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
          {api.endpoints.length} endpoint
        </h2>

        {api.endpoints.map((e) => {
          const riwayat = statusApi?.endpoints.find((x) => x.endpointId === e.id)
          const akhir = riwayat?.catatan.at(-1)

          return (
            <article
              key={e.id}
              className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-xs dark:border-zinc-700">
                    {e.method}
                  </span>
                  <code className="break-all font-mono text-sm font-medium">{e.path}</code>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{e.deskripsi}</p>
              </div>

              {e.params.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                        <th className="py-1.5 pr-4 font-medium">Param</th>
                        <th className="py-1.5 pr-4 font-medium">Contoh</th>
                        <th className="py-1.5 pr-4 font-medium">Wajib</th>
                        <th className="py-1.5 font-medium">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.params.map((p) => (
                        <tr key={p.nama} className="border-b border-zinc-100 dark:border-zinc-800/60">
                          <td className="py-1.5 pr-4 font-mono text-xs">{p.nama}</td>
                          <td className="py-1.5 pr-4 font-mono text-xs">{p.contoh}</td>
                          <td className="py-1.5 pr-4 text-xs">{p.wajib ? 'ya' : 'tidak'}</td>
                          <td className="py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                            {p.keterangan ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <Butir label="Ambang ukuran" nilai={`${e.minUkuranByte.toLocaleString('id-ID')} B`} />
                {akhir && <Butir label="Terakhir" nilai={`${akhir.status} · ${akhir.latencyMs} ms · ${akhir.ukuranByte.toLocaleString('id-ID')} B`} />}
                {akhir && !akhir.ok && <Butir label="Sebab gagal" nilai={akhir.sebab ?? '—'} />}
              </dl>

              {riwayat && <RiwayatBatang catatan={riwayat.catatan} />}

              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Coba langsung</p>
                <Playground api={api} endpoint={e} />
              </div>
            </article>
          )
        })}
      </section>

      <p className="text-xs text-zinc-500">
        Halaman ini digenerate dari <code className="font-mono">registry/apis/{api.slug}.yml</code>{' '}
        — tidak ada dokumentasi yang ditulis manual, jadi tidak ada yang bisa menyimpang dari
        registry.
      </p>
    </div>
  )
}

function Fakta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 dark:bg-zinc-950">
      <p className="teks-mikro uppercase text-zinc-500">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  )
}

function Prov({ label, nilai, url }: { label: string; nilai: string; url?: string | null }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-medium">{label}:</dt>
      <dd className="min-w-0 flex-1 text-zinc-600 dark:text-zinc-400">
        {url ? (
          <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            className="fokus-cincin rounded underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            {nilai}
          </a>
        ) : (
          nilai
        )}
      </dd>
    </div>
  )
}

function Butir({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline font-medium text-zinc-900 dark:text-zinc-100">{nilai}</dd>
    </div>
  )
}
