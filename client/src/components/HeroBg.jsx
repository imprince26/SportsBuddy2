const HeroBg = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute right-0 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
    </div>
  )
}

export default HeroBg