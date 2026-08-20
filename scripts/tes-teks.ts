// Tes urai() tanpa React DOM: yang diperiksa adalah bentuk elemen yang dihasilkan.
// Ini penjaga keamanan — kalau suatu saat ada yang mengganti komponen ini dengan
// dangerouslySetInnerHTML, tes ini harus tetap memaksa perilaku yang sama.
import assert from 'node:assert/strict'
import { isValidElement, type ReactNode } from 'react'
import { urai } from '@/komponen/TeksBertag'

let lolos = 0
function tes(nama: string, f: () => void) {
  f()
  lolos++
  console.log(`  ok  ${nama}`)
}

// Ratakan hasil urai jadi teks biasa, mengabaikan pembungkus.
function keTeks(bagian: ReactNode[]): string {
  return bagian
    .map((b) => {
      if (typeof b === 'string') return b
      if (isValidElement<{ children?: ReactNode }>(b)) {
        if (b.type === 'br') return '\n'
        const anak = b.props.children
        return typeof anak === 'string' ? anak : ''
      }
      return ''
    })
    .join('')
}

function jenis(bagian: ReactNode[]): string[] {
  return bagian.map((b) => (typeof b === 'string' ? 'teks' : isValidElement(b) ? String(b.type) : '?'))
}

tes('teks biasa dilewatkan apa adanya', () => {
  assert.equal(keTeks(urai('Surat Al-Fatihah')), 'Surat Al-Fatihah')
})

tes('<i> jadi <em>, bukan teks bertag', () => {
  const hasil = urai('Surat <i>Al Faatihah</i> (Pembukaan)')
  assert.deepEqual(jenis(hasil), ['teks', 'em', 'teks'])
  assert.equal(keTeks(hasil), 'Surat Al Faatihah (Pembukaan)')
})

tes('<br> jadi elemen br', () => {
  const hasil = urai('baris satu<br>baris dua')
  assert.deepEqual(jenis(hasil), ['teks', 'br', 'teks'])
})

tes('<a href> DIBUANG tapi isinya tetap ada', () => {
  // Bentuk asli dari surat 38 (REFERENCE.md).
  const hasil = urai('lihat <a href="s002a001.htm">[10)</a> di sana')
  assert.deepEqual(jenis(hasil), ['teks', 'teks', 'teks'])
  assert.equal(keTeks(hasil), 'lihat [10) di sana')
  assert.ok(!jenis(hasil).includes('a'), 'tag a tidak boleh diloloskan')
})

tes('tag berbahaya tidak pernah jadi elemen', () => {
  for (const jahat of [
    '<script>alert(1)</script>teks',
    '<img src=x onerror="alert(1)">teks',
    '<iframe src="javascript:alert(1)"></iframe>teks',
    '<a href="javascript:alert(1)">klik</a>',
    '<i onclick="alert(1)">miring</i>',
  ]) {
    const hasil = urai(jahat)
    for (const j of jenis(hasil)) {
      assert.ok(
        j === 'teks' || j === 'em' || j === 'br',
        `elemen tak terduga '${j}' dari input: ${jahat}`,
      )
    }
    // Isi di antara tag boleh muncul sebagai teks; yang penting tidak jadi elemen
    // dan atributnya tidak pernah sampai ke DOM.
    const teks = keTeks(hasil)
    assert.ok(!teks.includes('onerror'), `atribut ikut terbawa: ${teks}`)
    assert.ok(!teks.includes('onclick'), `atribut ikut terbawa: ${teks}`)
    assert.ok(!teks.includes('<'), `masih ada tag mentah: ${teks}`)
  }
})

tes('tag tutup tanpa buka tidak bikin kacau', () => {
  assert.equal(keTeks(urai('</i>teks</i>')), 'teks')
})

tes('<i> bersarang tetap satu penekanan', () => {
  const hasil = urai('<i>a<i>b</i>c</i>')
  assert.equal(keTeks(hasil), 'abc')
  assert.ok(jenis(hasil).every((j) => j === 'em'))
})

console.log(`\n${lolos} tes lolos.`)
