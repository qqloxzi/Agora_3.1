import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchLibraryGame } from '../lib/libraryGames'
import { GameViewer } from '../components/GameViewer'

export function GameDetail() {
  const { id } = useParams()
  const [game, setGame] = useState(undefined)

  useEffect(() => {
    let active = true
    fetchLibraryGame(id).then((g) => {
      if (active) setGame(g ?? null)
    })
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-8">
        <ArrowLeft size={16} /> Kütüphaneye dön
      </Link>

      {game === undefined ? (
        <p className="text-center text-ink/40 py-12">Yükleniyor...</p>
      ) : game === null ? (
        <p className="text-center text-ink/40 py-12">Bu parti bulunamadı.</p>
      ) : (
        <GameViewer
          key={game.id}
          sgfRaw={game.sgf_raw}
          title={game.title}
          blackName={game.black_name}
          blackRank={game.black_rank}
          whiteName={game.white_name}
          whiteRank={game.white_rank}
        />
      )}
    </div>
  )
}
