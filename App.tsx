import React from "react";

const whatsappNumber = "994501112233"; // <- BURANI öz nömrənlə dəyiş (məs: 99450XXXXXXX)
const instagramUrl = "https://instagram.com/ravio.az"; // <- BURANI düzəlt

const products = [
  { name: "Lazer yazılı boyunbağı", price: "29 AZN", tag: "Ən çox satılan" },
  { name: "Hədiyyə qutusu (premium)", price: "35 AZN", tag: "Yeni" },
  { name: "Dəst hədiyyə", price: "49 AZN", tag: "Top seçim" },
  { name: "Məzun lentləri", price: "12 AZN", tag: "Sifarişlə" },
  { name: "Lipa nömrələr", price: "18 AZN", tag: "Populyar" },
  { name: "Fərdi aksessuar paketi", price: "59 AZN", tag: "Hədiyyəlik" },
];

const steps = [
  {
    title: "1) Məhsulu seç",
    text: "İstədiyin məhsulu və yazını seçirsən.",
  },
  {
    title: "2) WhatsApp ilə təsdiq",
    text: "Detalları dəqiqləşdiririk, qiymət və vaxtı təsdiqləyirik.",
  },
  {
    title: "3) Hazırlıq və paketləmə",
    text: "Məhsul hazırlanır və hədiyyə formasında paketlənir.",
  },
  {
    title: "4) Çatdırılma",
    text: "Kuryer və ya əlbəəl təhvil verilir.",
  },
];

const faq = [
  {
    q: "Sifariş neçə günə hazır olur?",
    a: "Adətən 1–2 gün. Təcili sifarişlər üçün əvvəlcədən yazın.",
  },
  {
    q: "Çatdırılma mümkündür?",
    a: "Bəli, şəhər daxili çatdırılma mövcuddur.",
  },
  {
    q: "Fərdi yazı və dizayn olur?",
    a: "Bəli, məhsullara şəxsi yazı və fərdi toxunuş əlavə olunur.",
  },
];

export default function App() {
  const waMessage = encodeURIComponent(
    "Salam, Ravio AZ. Saytdan sifariş vermək istəyirəm."
  );
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.logo}>Ravio AZ</div>
          <nav style={styles.nav}>
            <a href="#mehsullar" style={styles.navLink}>Məhsullar</a>
            <a href="#nece-isleyir" style={styles.navLink}>Necə işləyir?</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
            <a href={instagramUrl} target="_blank" rel="noreferrer" style={styles.navLink}>Instagram</a>
          </nav>
          <a href={waLink} target="_blank" rel="noreferrer" style={styles.ctaBtn}>
            WhatsApp sifariş
          </a>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <p style={styles.badge}>Fərdiləşdirilmiş hədiyyələr • Lazer yazı</p>
          <h1 style={styles.h1}>
            Xüsusi insanlara, xüsusi hədiyyə.
          </h1>
          <p style={styles.subtitle}>
            Bijuteriya, hədiyyə qutuları, dəstlər və məzun lentləri.
            Sadə sifariş, sürətli hazırlıq, zövqlü təqdimat.
          </p>
          <div style={styles.heroActions}>
            <a href="#mehsullar" style={styles.primaryBtn}>Məhsullara bax</a>
            <a href={waLink} target="_blank" rel="noreferrer" style={styles.secondaryBtn}>
              Dərhal yaz
            </a>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="mehsullar" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Populyar məhsullar</h2>
          <p style={styles.sectionText}>
            Həm xanımlar, həm bəylər üçün uyğun, hədiyyəlik seçimlər.
          </p>

          <div style={styles.grid}>
            {products.map((p) => (
              <article key={p.name} style={styles.card}>
                <span style={styles.tag}>{p.tag}</span>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.price}>{p.price}</p>
                <a href={waLink} target="_blank" rel="noreferrer" style={styles.cardBtn}>
                  Sifariş et
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="nece-isleyir" style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Necə işləyir?</h2>
          <div style={styles.stepGrid}>
            {steps.map((s) => (
              <div key={s.title} style={styles.stepCard}>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Niyə Ravio AZ?</h2>
          <div style={styles.trustRow}>
            <div style={styles.trustItem}>✅ Keyfiyyətli hazırlanma</div>
            <div style={styles.trustItem}>🚚 Sürətli çatdırılma</div>
            <div style={styles.trustItem}>🎁 Zövqlü paketləmə</div>
            <div style={styles.trustItem}>💬 Sürətli cavab dəstəyi</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Tez-tez verilən suallar</h2>
          <div style={styles.faqWrap}>
            {faq.map((item) => (
              <details key={item.q} style={styles.faqItem}>
                <summary style={styles.faqQ}>{item.q}</summary>
                <p style={styles.faqA}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.containerFooter}>
          <div>
            <strong>Ravio AZ</strong>
            <p style={styles.footerText}>Fərdiləşdirilmiş hədiyyəlik aksessuarlar</p>
          </div>
          <div style={styles.footerLinks}>
            <a href={instagramUrl} target="_blank" rel="noreferrer" style={styles.footerLink}>Instagram</a>
            <a href={waLink} target="_blank" rel="noreferrer" style={styles.footerLink}>WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const colors = {
  bg: "#FAF8F5",
  card: "#FFFFFF",
  text: "#1F1F1F",
  muted: "#6B7280",
  primary: "#2F4F4F",
  primarySoft: "#3F6A6A",
  accent: "#C9A227",
  border: "#E9E5DF",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: colors.bg,
    color: colors.text,
    minHeight: "100vh",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  container: {
    width: "min(1120px, 92%)",
    margin: "0 auto",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    background: "rgba(250,248,245,0.95)",
    backdropFilter: "blur(8px)",
    borderBottom: `1px solid ${colors.border}`,
  },
  logo: {
    fontWeight: 800,
    letterSpacing: 0.3,
    fontSize: 22,
    color: colors.primary,
  },
  nav: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },
  navLink: {
    textDecoration: "none",
    color: colors.text,
    fontSize: 14,
    fontWeight: 600,
  },
  ctaBtn: {
    textDecoration: "none",
    background: colors.primary,
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
  },
  hero: {
    padding: "72px 0 48px",
  },
  badge: {
    display: "inline-block",
    background: "#ECE6DA",
    color: colors.primary,
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 18,
  },
  h1: {
    fontSize: "clamp(30px, 6vw, 52px)",
    lineHeight: 1.08,
    margin: "0 0 14px",
    maxWidth: 760,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 1.6,
    color: colors.muted,
    maxWidth: 760,
    marginBottom: 24,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryBtn: {
    textDecoration: "none",
    background: colors.primary,
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 700,
  },
  secondaryBtn: {
    textDecoration: "none",
    border: `1px solid ${colors.primary}`,
    color: colors.primary,
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 700,
  },
  section: { padding: "52px 0" },
  sectionAlt: {
    padding: "52px 0",
    background: "#F3F1ED",
    borderTop: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  },
  h2: {
    fontSize: "clamp(24px, 4vw, 34px)",
    margin: "0 0 10px",
    color: colors.primary,
  },
  sectionText: { color: colors.muted, marginBottom: 22 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 14,
  },
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  tag: {
    display: "inline-block",
    background: "#EEE8DB",
    color: "#6A5A2F",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  cardTitle: { margin: "0 0 8px", fontSize: 18 },
  price: { margin: "0 0 12px", fontWeight: 700, color: colors.primarySoft },
  cardBtn: {
    textDecoration: "none",
    display: "inline-block",
    background: colors.accent,
    color: "#1F1F1F",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  stepCard: {
    background: "#fff",
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 16,
  },
  stepTitle: { margin: "0 0 8px", color: colors.primary },
  stepText: { margin: 0, color: colors.muted, lineHeight: 1.6 },
  trustRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  trustItem: {
    background: "#fff",
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 600,
  },
  faqWrap: { display: "grid", gap: 10 },
  faqItem: {
    background: "#fff",
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: "10px 14px",
  },
  faqQ: { cursor: "pointer", fontWeight: 700 },
  faqA: { color: colors.muted, marginTop: 8, lineHeight: 1.6 },
  footer: {
    marginTop: 24,
    padding: "24px 0",
    borderTop: `1px solid ${colors.border}`,
    background: "#F6F3EE",
  },
  containerFooter: {
    width: "min(1120px, 92%)",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  footerText: { margin: "4px 0 0", color: colors.muted, fontSize: 14 },
  footerLinks: { display: "flex", gap: 14 },
  footerLink: { textDecoration: "none", color: colors.primary, fontWeight: 700 },
};