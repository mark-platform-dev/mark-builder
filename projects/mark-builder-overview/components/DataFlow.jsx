// Indent shared by the handoff rules and the artefact they terminate in, so
// the vertical line lands on the filename instead of beside it.
const RAIL = 'ml-5 border-l-2 pl-5 sm:ml-6'

// A vertical link between two nodes: the accent rule carries the eye down,
// the chip names the artefact that gets handed on.
function Handoff({ label }) {
  return (
    <div className={`${RAIL} border-accent/40 py-3`}>
      <span className="font-mono text-xs break-all text-accent">{label}</span>
    </div>
  )
}

export default function DataFlow({ d }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{d.heading}</h2>
      <ol className="mt-4">
        {d.stages.map((stage, i) => (
          <li key={stage.num}>
            <article
              className={
                'rounded border p-4 sm:p-5 ' +
                (stage.once ? 'border-accent bg-accent/5' : 'border-line bg-paper')
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-2xl leading-none text-accent">{stage.num}</span>
                <span
                  className={
                    'rounded-full px-2.5 py-1 font-mono text-[0.625rem] tracking-widest uppercase ' +
                    (stage.once
                      ? 'bg-accent text-paper'
                      : 'border border-line text-muted')
                  }
                >
                  {stage.actor}
                </span>
              </div>
              <h3 className="mt-3 font-medium text-ink">{stage.title}</h3>
              <p className="mt-1 text-sm text-muted">{stage.desc}</p>
              {stage.command && (
                <p className="mt-3 font-mono text-sm break-all text-ink">
                  <span className="text-accent">$ </span>
                  {stage.command}
                </p>
              )}
            </article>
            {i < d.stages.length - 1 && <Handoff label={stage.produces} />}
          </li>
        ))}
      </ol>
      <Handoff label={`$ ${d.result.command}`} />
      {/* The rail stops here: transparent border keeps the indent, drops the line. */}
      <div className={`${RAIL} border-transparent`}>
        <p className="font-mono text-sm break-all text-ink">{d.result.file}</p>
        <p className="mt-1 text-sm text-muted">{d.result.note}</p>
      </div>
    </section>
  )
}
