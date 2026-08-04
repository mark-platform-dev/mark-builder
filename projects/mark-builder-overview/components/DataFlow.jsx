export default function DataFlow({ d }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{d.heading}</h2>
      <div className="mt-4">
        {d.steps.map((step, i) => (
          <div key={step.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 rounded border border-line bg-paper px-4 py-3">
              <span className="font-mono text-sm text-ink">{step.label}</span>
              <span className="text-xs text-muted">{step.note}</span>
            </div>
            {i < d.steps.length - 1 && (
              <div className="py-1 pl-4 font-mono text-accent">↓</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
