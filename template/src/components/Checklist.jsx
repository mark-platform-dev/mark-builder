import { useState } from 'react'
import styles from './Checklist.module.css'

// Island: mounted with client:only="react" on the page, so it never renders
// on the server and may use browser APIs freely. UI state stays here; the
// imported data is never modified.
export default function Checklist({ d }) {
  const [done, setDone] = useState(() => new Set())

  const toggle = (id) =>
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section className={styles.box}>
      <div className={styles.head}>
        <h2 className={styles.title}>{d.title}</h2>
        <p className={styles.progress} data-testid="progress">
          {done.size} / {d.items.length}
        </p>
      </div>
      <ul className={styles.list}>
        {d.items.map((item) => (
          <li key={item.id}>
            <label className={done.has(item.id) ? styles.done : undefined}>
              <input type="checkbox" checked={done.has(item.id)} onChange={() => toggle(item.id)} />
              <span>{item.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
