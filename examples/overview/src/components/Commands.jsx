import SectionLabel from './SectionLabel.jsx'
import styles from './Commands.module.css'

export default function Commands({ d }) {
  return (
    <section className={styles.section}>
      <SectionLabel>{d.heading}</SectionLabel>
      <table className={styles.table}>
        <tbody>
          {d.items.map((item) => (
            <tr key={item.cmd}>
              <td className={styles.cmd}>{item.cmd}</td>
              <td className={styles.desc}>{item.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
