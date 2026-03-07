"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={`${styles.navbar} glass`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    TURATTI<span className="premium-gradient">.</span>
                </Link>
                <div className={styles.links}>
                    <Link href="#experiencia">Experiência</Link>
                    <Link href="#colecoes">Coleções</Link>
                    <Link href="#contato">Contato</Link>
                    <button className="premium-button">Começar</button>
                </div>
            </div>
        </nav>
    );
}
