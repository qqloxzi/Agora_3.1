import { Bot } from 'lucide-react'
import { ComingSoon } from '../components/ui/ComingSoon'

export function Bots() {
  return (
    <ComingSoon
      icon={Bot}
      title="Botlarla Oyna"
      description="Farklı seviyelerde yapay zeka rakiplerine karşı pratik yapabileceğin oyun modu hazırlanıyor. Çıktığında burada karşına çıkacak."
      cta={{ to: '/fikstur', label: 'Şimdilik liglere göz at' }}
    />
  )
}
