export default function FolderTree({ d }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{d.heading}</h2>
      <div className="mt-4 rounded border border-line bg-ink/3 p-4 font-mono text-sm">
        <div className="text-ink">{d.root}</div>
        <ul className="mt-1">
          {d.entries.map((entry, i) => (
            <li key={entry.name} className="flex items-baseline gap-3">
              <span className="text-muted">
                {i === d.entries.length - 1 ? '└─' : '├─'}
              </span>
              <span className="text-ink">{entry.name}</span>
              <span className="text-muted">{entry.desc}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-sm text-muted">{d.outputNote}</p>
    </section>
  )
}
