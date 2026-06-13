import { Lightbulb } from 'lucide-react'

type RecommendationCardProps = {
  text: string
}

function RecommendationCard({ text }: RecommendationCardProps) {
  return (
    <section className="flex gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand-700">
        <Lightbulb size={24} />
      </div>
      <div>
        <h2 className="font-bold text-brand-700">Recommendation</h2>
        <p className="mt-2 leading-7 text-slate-700">{text}</p>
      </div>
    </section>
  )
}

export default RecommendationCard