export default function Hero({ d }) {
  return (
    <header className="border-b border-slate-200 pb-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">{d.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{d.tagline}</p>
      <p className="mt-3 text-sm text-slate-500">{d.note}</p>
    </header>
  )
}
