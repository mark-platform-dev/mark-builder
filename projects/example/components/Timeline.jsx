export default function Timeline({ d, heading }) {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{heading}</h2>
      <ul className="mt-4 space-y-6">
        {d.map((item) => (
          <li key={item.name}>
            <div className="flex items-baseline justify-between">
              <span className="font-medium text-ink">{item.name}</span>
              <span className="font-mono text-xs text-muted">
                {item.quarter} · {item.status}
              </span>
            </div>
            <div className="relative mt-3 h-2">
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line" />
              <div
                className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-accent"
                style={{ width: `${item.done}%` }}
              />
              <div
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                style={{ left: `${item.done}%` }}
              />
            </div>
            <div className="mt-1 text-right font-mono text-xs text-muted">{item.done}%</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
