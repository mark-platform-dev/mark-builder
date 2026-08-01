export default function Intro({ d, team }) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{d.title}</h1>
      <p className="mt-2 text-slate-600">{d.subtitle}</p>
      <p className="mt-4 text-sm text-slate-500">Team: {team.members.join(', ')}</p>
    </header>
  )
}
