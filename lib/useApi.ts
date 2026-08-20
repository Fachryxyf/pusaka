'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Api } from '@/registry/schema'
import { GagalAmbil, ambil, type Sumber } from '@/lib/client'

export type KeadaanApi<T> = {
  data: T | null
  loading: boolean
  error: string | null
  sumber: Sumber | null
  per: string | null
  ulangi: () => void
}

type Hasil<T> = {
  kunci: string
  data: T | null
  error: string | null
  sumber: Sumber | null
  per: string | null
}

// Bentuk kembalian sudah final sejak sekarang supaya T5 (proxy + mirror) tidak
// perlu membongkar semua alat.
export function useApi<T = unknown>(
  api: Api | null,
  endpointId: string,
  params: Record<string, string> = {},
  aktif = true,
): KeadaanApi<T> {
  const [putaran, setPutaran] = useState(0)
  const [hasil, setHasil] = useState<Hasil<T> | null>(null)

  const endpoint = useMemo(
    () => api?.endpoints.find((e) => e.id === endpointId) ?? null,
    [api, endpointId],
  )

  // Params dipadatkan jadi string supaya objek baru tiap render tidak memicu fetch ulang.
  const kunciParams = JSON.stringify(params)
  const kunci = `${api?.slug ?? '-'}|${endpointId}|${kunciParams}|${putaran}`
  const jalan = aktif && api !== null && endpoint !== null

  useEffect(() => {
    if (!jalan || !api || !endpoint) return

    let dibatalkan = false

    ambil<T>(api, endpoint, JSON.parse(kunciParams))
      .then((h) => {
        if (!dibatalkan) setHasil({ kunci, data: h.data, error: null, sumber: h.sumber, per: h.per })
      })
      .catch((e: unknown) => {
        if (!dibatalkan) {
          setHasil({ kunci, data: null, error: pesanManusiawi(e), sumber: null, per: null })
        }
      })

    return () => {
      dibatalkan = true
    }
  }, [jalan, api, endpoint, kunciParams, kunci])

  const ulangi = useCallback(() => setPutaran((n) => n + 1), [])

  // loading diturunkan, bukan disimpan — menghindari setState di dalam efek.
  const segar = hasil?.kunci === kunci
  const galatSetelan =
    aktif && api !== null && endpoint === null
      ? `Endpoint “${endpointId}” tidak terdaftar untuk API ini.`
      : null

  return {
    data: segar ? hasil.data : null,
    loading: jalan && !segar,
    error: galatSetelan ?? (segar ? hasil.error : null),
    sumber: segar ? hasil.sumber : null,
    per: segar ? hasil.per : null,
    ulangi,
  }
}

// UI-SPEC §1.1: pesan manusiawi, jangan error mentah.
function pesanManusiawi(e: unknown): string {
  if (!(e instanceof GagalAmbil)) return 'Ada yang tidak beres saat mengambil data.'

  switch (e.sebab) {
    case 'timeout':
      return 'Sumber datanya lambat merespons. Coba lagi sebentar.'
    case 'jaringan':
      return 'Tidak bisa menghubungi sumber datanya. Cek koneksi internetmu.'
    case 'bukan-json':
      return 'Sumber datanya membalas dengan format yang tidak dikenali.'
    case 'status':
      return e.status ? `Sumber datanya membalas galat (${e.status}).` : e.message
    default:
      return 'Ada yang tidak beres saat mengambil data.'
  }
}
