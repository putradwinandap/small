export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">SMALL</p>
        <h1 id="page-title">Change one thing. Let consistency do the rest.</h1>
        <p className="lede">
          Small helps you focus on one repeatable action until you are ready for the next.
        </p>
        <button className="button" type="button">
          Choose my first small change
        </button>
      </section>
      <section className="principle" aria-label="Product principle">
        <span>01</span>
        <p>You only need to work on one habit today.</p>
      </section>
    </main>
  );
}
