export default function DataFlow({ d }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{d.heading}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {d.steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className="rounded border border-slate-300 bg-white px-4 py-3 text-center shadow-sm">
              <div className="font-mono text-sm text-slate-800">{step.label}</div>
              <div className="mt-1 text-xs text-slate-500">{step.note}</div>
            </div>
            {i < d.steps.length - 1 && <span className="text-slate-400">→</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
