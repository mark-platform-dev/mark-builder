import styles from './SectionLabel.module.css'

// Every section is headed by a small mono label instead of a generic <h2>:
// the page reads like a manifest, which fits a tool explaining itself.
export default function SectionLabel({ children }) {
  return <h2 className={styles.label}>{children}</h2>
}
