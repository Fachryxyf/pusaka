import { DAFTAR_META } from '@/alat/daftar'
import PencarianAlat from '@/komponen/PencarianAlat'

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Alat harian dari data publik Indonesia</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Semuanya menarik data langsung dari sumber resminya. Tidak perlu ngerti API.
        </p>
      </section>

      <PencarianAlat alat={DAFTAR_META} />
    </div>
  )
}
