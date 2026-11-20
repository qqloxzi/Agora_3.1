const OPTIONS = [
  {
    id: 'free',
    title: 'Sadece Lig',
    description: 'Ücretsiz lig katılımı, haftalık maçlar ve puan durumu.',
    label: 'Katıl',
  },
  {
    id: 'review3',
    title: '3 Maç Analizi + Özel Ders',
    description: 'Lige katılımın yanında 3 maç analizi ve özel ders.',
    label: 'Ödeme',
  },
  {
    id: 'review6',
    title: '6 Maç Analizi + Simultane',
    description: '6 maç analizi, özel ders ve Tuğkan Eren (4D) ile 1 simultane maç.',
    label: 'Ödeme',
  },
]

function OptionCard({ option, index, paymentLink, onFreeJoin }) {
  const isPaid = option.id !== 'free'
  const disabled = isPaid && !paymentLink

  function handleClick() {
    if (isPaid) {
      if (paymentLink) window.open(paymentLink, '_blank', 'noopener,noreferrer')
      return
    }
    onFreeJoin?.()
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-primary-blue/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-2.5 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold leading-tight text-ink dark:text-white">
          <span className="text-accent-blue font-data mr-1">{index + 1}.</span>
          {option.title}
        </p>
        <p className="text-[10px] text-ink/50 dark:text-ice-white/50 leading-snug mt-0.5">{option.description}</p>
      </div>
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-label={isPaid ? 'Kaydol' : 'Ücretsiz Katıl'}
        className={`press-btn magnetic-btn shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold disabled:opacity-40 ${
          isPaid ? 'bg-primary-blue text-white' : 'border border-primary-blue/25 dark:border-white/25 text-ink dark:text-white'
        }`}
      >
        {disabled ? 'Yakında' : option.label}
      </button>
    </div>
  )
}

export function LeagueOptions({ paymentLinks = {}, onFreeJoin }) {
  return (
    <div className="flex flex-col gap-1.5">
      {OPTIONS.map((option, index) => (
        <OptionCard
          key={option.id}
          option={option}
          index={index}
          paymentLink={paymentLinks[option.id]}
          onFreeJoin={onFreeJoin}
        />
      ))}
    </div>
  )
}
