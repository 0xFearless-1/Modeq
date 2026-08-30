function barHeight(i: number, n: number) {
  const t = (i / n) * Math.PI * 2;
  const h = 60 + 45 * Math.sin(t * 2.3) + 30 * Math.sin(t * 5.1 + 1.2);
  return Math.max(18, Math.round(h));
}

export function HeroWave() {
  const count = 90;
  const bars = Array.from({ length: count }, (_, i) => ({
    h: barHeight(i, count),
    delay: (i % 12) * 0.09,
  }));

  return (
    <div className="hero-wave" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="hero-wave-bar"
          style={{
            height: b.h,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
