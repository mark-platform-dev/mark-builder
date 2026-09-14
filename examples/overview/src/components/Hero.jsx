import styles from './Hero.module.css'

export default function Hero({ d }) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{d.title}</h1>
      <p className={styles.tagline}>{d.tagline}</p>
      <p className={styles.note}>{d.note}</p>
    </header>
  )
}
