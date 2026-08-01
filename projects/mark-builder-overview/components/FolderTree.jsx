export default function FolderTree({ d }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{d.heading}</h2>
      <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
        <div className="text-slate-800">{d.root}</div>
        <ul className="mt-1">
          {d.entries.map((entry, i) => (
            <li key={entry.name} className="flex items-baseline gap-3">
              <span className="text-slate-400">
                {i === d.entries.length - 1 ? '└─' : '├─'}
              </span>
              <span className="text-slate-800">{entry.name}</span>
              <span className="text-slate-500">{entry.desc}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-sm text-slate-500">{d.outputNote}</p>
    </section>
  )
}
