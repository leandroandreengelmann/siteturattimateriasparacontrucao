import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={`${styles.hero} section-padding`}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Redefinindo o <span className="premium-gradient">Estilo</span>
                    <br />
                    com Sofisticação.
                </h1>
                <p className={styles.description}>
                    Uma jornada exclusiva pelo design contemporâneo, onde cada detalhe é
                    pensado para proporcionar uma experiência inigualável.
                </p>
                <div className={styles.actions}>
                    <button className="premium-button">Explorar Agora</button>
                    <button className={styles.outlineButton}>Saiba Mais</button>
                </div>
            </div>
            <div className={styles.visual}>
                <div className={styles.blob}></div>
            </div>
        </section>
    );
}
