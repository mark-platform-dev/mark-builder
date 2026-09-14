import SectionLabel from './SectionLabel.jsx'
import styles from './FolderTree.module.css'

export default function FolderTree({ d }) {
  return (
    <section className={styles.section}>
      <SectionLabel>{d.heading}</SectionLabel>
      <div className={styles.tree}>
        <div>{d.root}</div>
        <ul className={styles.entries}>
          {d.entries.map((entry, i) => (
            <li key={entry.name} className={styles.entry}>
              <span className={styles.branch}>{i === d.entries.length - 1 ? '└─' : '├─'}</span>
              <span className={styles.name}>{entry.name}</span>
              <span className={styles.desc}>{entry.desc}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.note}>{d.note}</p>
    </section>
  )
}
