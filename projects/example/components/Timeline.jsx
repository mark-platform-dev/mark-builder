export default function Timeline({ d }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
      <ul className="mt-4 space-y-3">
        {d.map((item) => (
          <li key={item.name}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-800">{item.name}</span>
              <span className="text-slate-500">
                {item.quarter} · {item.status}
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded bg-slate-100">
              <div
                className="h-2 rounded bg-slate-800"
                style={{ width: `${item.done}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
