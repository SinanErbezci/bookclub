import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.content}`}>

        <div className={styles.left}>
          <p className={styles.brand}>
            © 2026 BookClub
          </p>

          <p className={styles.creator}>
            Built by Sinan Erbezci
          </p>
        </div>

        <div className={styles.right}>
          <a
            href="https://github.com/SinanErbezci"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/sinan-erbezci-8a6184103/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;