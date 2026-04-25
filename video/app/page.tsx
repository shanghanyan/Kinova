import Link from 'next/link'

export default function Home() {
  return (
    <main className="main-content">
      <div className="card text-center max-w-xl">
        <h1 className="font-display text-4xl text-forge-gradient mb-4">THE ARENA</h1>
        <p className="text-text-2 mb-6">Your world. Your coach. Your first rep.</p>
        <Link href="/hub" className="inline-block bg-xp text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px] hover:brightness-110 active:scale-95 transition-all duration-150 glow-xp">ENTER</Link>
      </div>
    </main>
  )
}
