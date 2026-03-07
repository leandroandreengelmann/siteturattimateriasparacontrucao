import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* Additional sections can be added here */}
      <section className="section-padding" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.9rem' }}>
          © 2026 Turatti Experience. Todos os direitos reservados.
        </p>
      </section>
    </main>
  );
}
