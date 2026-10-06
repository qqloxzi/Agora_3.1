/**
 * Bulmaca/ders etiketi + kyu-dan seviyesi — go_problems.tag / go_problems.rank.
 * Etiket metni olduğu gibi gösterilir (küçük/büyük harf dönüşümü yapılmaz) —
 * ileride birçok farklı tag gelecek ve kullanıcı bu tag'e göre filtreleyebilecek,
 * bu yüzden veritabanındaki değer tek doğru kaynak: her zaman aynı yazımla
 * (ör. "Tesuji") saklanmalı.
 */
export function TagRankBadge({ tag, rank, size = 'sm' }) {
  if (!tag && !rank) return null
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-blue/8 dark:bg-white/10 font-bold text-primary-blue dark:text-accent-blue ${textSize}`}
    >
      {tag && <span className="tracking-wide">{tag}</span>}
      {tag && rank && <span className="opacity-40">·</span>}
      {rank && <span className="font-data">{rank}</span>}
    </span>
  )
}
