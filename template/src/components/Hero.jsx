import styles from './Hero.module.css'

// Static: no client directive on the page, so this renders to HTML at build
// time and ships no JavaScript.
export default function Hero({ d }) {
  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>{d.eyebrow}</p>
      <h1 className={styles.title}>{d.title}</h1>
      <p className={styles.subtitle}>{d.subtitle}</p>
    </header>
  )
}
