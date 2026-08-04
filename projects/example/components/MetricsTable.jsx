export default function MetricsTable({ metrics, roadmap, summaryPrefix, summarySuffix }) {
  return (
    <section className="mt-12 border-t border-line pt-6">
      <h2 className="font-mono text-sm text-muted">
        {summaryPrefix} {roadmap.length} {summarySuffix}
      </h2>
      <dl className="mt-4 flex gap-10">
        {metrics.map((m) => (
          <div key={m.label}>
            <dd className="font-mono text-3xl font-semibold text-accent">{m.value}</dd>
            <dt className="mt-1 text-sm text-muted">{m.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
