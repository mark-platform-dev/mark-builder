import styles from './Steps.module.css'

// Static ordered list. The number is derived from position, not stored in
// data: order is the one thing the list already encodes.
export default function Steps({ d }) {
  return (
    <ol className={styles.list}>
      {d.map((step, i) => (
        <li key={step.id} className={styles.step}>
          <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h2 className={styles.title}>{step.title}</h2>
            <p className={styles.text}>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
