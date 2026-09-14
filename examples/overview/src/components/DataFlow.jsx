import SectionLabel from './SectionLabel.jsx'
import styles from './DataFlow.module.css'

// A vertical link between two nodes: the accent rule carries the eye down,
// the chip names the artefact that gets handed on.
function Handoff({ label }) {
  return (
    <div className={styles.handoff}>
      <span className={styles.chip}>{label}</span>
    </div>
  )
}

export default function DataFlow({ d }) {
  return (
    <section className={styles.section}>
      <SectionLabel>{d.heading}</SectionLabel>
      <ol className={styles.stages}>
        {d.stages.map((stage, i) => (
          <li key={stage.num}>
            <article className={stage.once ? `${styles.card} ${styles.agent}` : styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.num}>{stage.num}</span>
                <span className={stage.once ? `${styles.actor} ${styles.actorAgent}` : styles.actor}>
                  {stage.actor}
                </span>
              </div>
              <h3 className={styles.title}>{stage.title}</h3>
              <p className={styles.desc}>{stage.desc}</p>
              {stage.command && (
                <p className={styles.command}>
                  <span className={styles.prompt}>$ </span>
                  {stage.command}
                </p>
              )}
            </article>
            {i < d.stages.length - 1 && <Handoff label={stage.produces} />}
          </li>
        ))}
      </ol>
      <Handoff label={`$ ${d.result.command}`} />
      {/* The rail stops here: same indent, no line, so the path ends in an artefact. */}
      <div className={styles.end}>
        <p className={styles.file}>{d.result.file}</p>
        <p className={styles.desc}>{d.result.note}</p>
      </div>
    </section>
  )
}
