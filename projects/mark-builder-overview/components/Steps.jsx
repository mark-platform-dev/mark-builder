export default function Steps({ d }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{d.heading}</h2>
      <ol className="mt-4 space-y-3">
        {d.items.map((item, i) => (
          <li key={item} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-medium text-paper">
              {i + 1}
            </span>
            <span className="text-ink">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
