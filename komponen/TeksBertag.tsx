// Merender teks yang mengandung tag HTML dari API pihak ketiga TANPA
// dangerouslySetInnerHTML. Yang dihormati hanya <i> dan <br>; tag lain dibuang
// tapi isinya dipertahankan sebagai teks.
//
// Kenapa bukan sanitasi HTML lalu dirender: memilih daftar-putih tag di sini berarti
// tidak ada jalur mana pun dari data API ke innerHTML, jadi tidak ada yang bisa bocor
// lewat atribut, entitas, atau tag yang salah tutup. `deskripsi` equran.id memuat
// <a href="s002a001.htm"> — tautan relatif yang mati di situs kita, dan href dari
// data pihak ketiga adalah permukaan serangan (REFERENCE.md).

import type { ReactNode } from 'react'

export function TeksBertag({ teks, className = '' }: { teks: string; className?: string }) {
  return <p className={className}>{urai(teks)}</p>
}

export function urai(teks: string): ReactNode[] {
  const hasil: ReactNode[] = []
  // Cocokkan tag apa pun; yang tidak dikenali dijatuhkan tanpa membuang isinya.
  const pola = /<(\/?)([a-zA-Z][^\s>/]*)[^>]*>/g

  let posisi = 0
  let miring = 0
  let kunci = 0

  const tambah = (isi: string) => {
    if (!isi) return
    hasil.push(miring > 0 ? <em key={kunci++}>{isi}</em> : isi)
  }

  for (const cocok of teks.matchAll(pola)) {
    tambah(teks.slice(posisi, cocok.index))
    posisi = cocok.index + cocok[0].length

    const penutup = cocok[1] === '/'
    const nama = cocok[2].toLowerCase()

    if (nama === 'i' || nama === 'em') {
      miring += penutup ? -1 : 1
      if (miring < 0) miring = 0
    } else if (nama === 'br' && !penutup) {
      hasil.push(<br key={kunci++} />)
    }
    // Tag lain (termasuk <a>) sengaja diabaikan — isinya tetap ikut karena teks di
    // antara tag buka dan tutup diproses seperti biasa.
  }

  tambah(teks.slice(posisi))
  return hasil
}
