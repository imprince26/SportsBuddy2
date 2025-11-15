const BgElements = () => {
  // Minimal, non-animated background overlay used as the site's subtle backdrop.
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Single static gradient to keep visuals but remove animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/30 to-indigo-50/40 dark:from-slate-900/30 dark:via-transparent dark:to-slate-900/30" />

      {/* Very subtle grid for texture (static) */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>
    </div>
  )
}

export default BgElements
