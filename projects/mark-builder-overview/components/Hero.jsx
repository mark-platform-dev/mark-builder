export default function Hero({ d }) {
  return (
    <header className="border-b border-line pb-8">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">{d.title}</h1>
      <p className="mt-4 text-lg text-muted">{d.tagline}</p>
      <p className="mt-4 font-mono text-xs text-muted">{d.note}</p>
    </header>
  )
}
