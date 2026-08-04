export default function Intro({ d, team }) {
  return (
    <header className="border-b border-line pb-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{d.title}</h1>
      <p className="mt-2 text-muted">{d.subtitle}</p>
      <p className="mt-4 font-mono text-xs text-muted">
        {d.teamLabel}: {team.members.join(', ')}
      </p>
    </header>
  )
}
