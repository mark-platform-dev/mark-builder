export default function Steps({ d }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{d.heading}</h2>
      <ol className="mt-4 space-y-3">
        {d.items.map((item, i) => (
          <li key={item} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-white">
              {i + 1}
            </span>
            <span className="text-slate-700">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
