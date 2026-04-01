// Faqja 404 - shfaqet kur perdoruesi shkon ne nje route qe nuk ekziston
export default function PageNotFound() {
  return (
    <section className="flex min-h-screen w-full justify-center items-center"
      style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #d4a017, #f5dcaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          404
        </h1>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Page not found
        </p>
      </div>
    </section>
  );
}