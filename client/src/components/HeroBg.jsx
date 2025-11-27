export const HeroBg = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none h-screen w-screen">
      <div className="absolute inset-0 bg-background" />

      {/* Grid pattern for subtle texture - adjusted opacity for better visibility */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148, 163, 184) 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main blue orb - Primary brand color for SportsBuddy */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full animate-float-slow"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.2 280) 0%, oklch(0.5 0.15 260) 40%, transparent 70%)",
          filter: "blur(140px)",
          opacity: 0.6,
        }}
      />

      {/* Secondary orange accent - Energy & action */}
      <div
        className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full animate-glow-pulse"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.25 20) 0%, oklch(0.55 0.18 15) 40%, transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.5,
        }}
      />

      {/* Tertiary blue accent - Depth and movement */}
      <div
        className="absolute -left-40 bottom-1/3 h-[500px] w-[500px] rounded-full animate-float-slower"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.18 250) 0%, oklch(0.45 0.12 240) 40%, transparent 70%)",
          filter: "blur(110px)",
          opacity: 0.45,
        }}
      />

      {/* Top ambient glow - SportsBuddy primary accent */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle 900px at 50% -10%, oklch(0.6 0.2 280 / 0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom vignette - Subtle fade with transparency */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 100%, oklch(0.08 0 0 / 0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

export default HeroBg
