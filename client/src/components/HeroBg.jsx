const HeroBg = () => {
  // Static, low-cost hero background. No animations to improve performance.
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Background: slightly stronger for hero to stand out */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-900" />

      {/* Static soft orbs for depth (no motion) */}
      <div className="absolute top-16 left-8 w-72 h-72 rounded-full opacity-20 dark:opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 65%)' }} />
      <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full opacity-14 dark:opacity-08" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 65%)' }} />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-3">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)`,
            backgroundSize: '120px 120px',
          }}
        />
      </div>
    </div>
  )
}

export default HeroBg