import Link from 'next/link'
import { Button } from '../components/ui/Button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Top Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-extrabold tracking-tight text-white">▲ AEDRIN</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-base font-medium px-3 py-2 rounded hover:bg-white/10 transition">Products</DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#181A20] border border-[#23242b] min-w-[260px]">
              <DropdownMenuItem>AI Decks</DropdownMenuItem>
              <DropdownMenuItem>Data Library</DropdownMenuItem>
              <DropdownMenuItem>Templates</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-base font-medium px-3 py-2 rounded hover:bg-white/10 transition">Solutions</DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#181A20] border border-[#23242b] min-w-[320px]">
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <div className="font-bold text-white mb-2">Use Cases</div>
                  <DropdownMenuItem>AI Marketing</DropdownMenuItem>
                  <DropdownMenuItem>Boardroom Decks</DropdownMenuItem>
                  <DropdownMenuItem>Sales Enablement</DropdownMenuItem>
                  <DropdownMenuItem>Investor Updates</DropdownMenuItem>
                </div>
                <div>
                  <div className="font-bold text-white mb-2">Users</div>
                  <DropdownMenuItem>CMOs</DropdownMenuItem>
                  <DropdownMenuItem>Marketing Teams</DropdownMenuItem>
                  <DropdownMenuItem>Consultants</DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-base font-medium px-3 py-2 rounded hover:bg-white/10 transition">Resources</DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#181A20] border border-[#23242b] min-w-[220px]">
              <DropdownMenuItem>Docs</DropdownMenuItem>
              <DropdownMenuItem>Blog</DropdownMenuItem>
              <DropdownMenuItem>Changelog</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/enterprise" className="text-white text-base font-medium px-3 py-2 rounded hover:bg-white/10 transition">Enterprise</Link>
          <Link href="/pricing" className="text-white text-base font-medium px-3 py-2 rounded hover:bg-white/10 transition">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><Button variant="ghost" className="px-5 py-2 text-base font-semibold">Dashboard</Button></Link>
          <Link href="/auth/login"><Button variant="ghost" className="px-5 py-2 text-base font-semibold">Log In</Button></Link>
          <Link href="/contact"><Button variant="outline" className="px-5 py-2 text-base font-semibold">Contact</Button></Link>
          <Link href="/auth/signup"><Button variant="default" className="px-5 py-2 text-base font-semibold">Sign Up</Button></Link>
        </div>
      </nav>
      {/* Announcement Bar */}
      <div className="w-full flex justify-center py-2 bg-gradient-to-r from-blue-900 via-black to-purple-900 text-white text-sm font-medium tracking-wide border-b border-white/10">
        <span>🚀 Sign up for AEDRIN 2025 Early Access</span>
        <Button variant="secondary" className="ml-4 px-4 py-1 text-xs font-semibold">Get your ticket</Button>
      </div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 relative z-10" style={{ minHeight: '60vh' }}>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
          Your complete platform for <span className="text-blue-400">AI marketing decks</span>.
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
          AEDRIN provides the AI tools and cloud infrastructure to build, scale, and deliver stunning, executive-ready presentations.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
          <Link href="/dashboard">
            <Button variant="default" className="text-lg px-10 py-4 font-semibold">Start Now</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" className="text-lg px-10 py-4 font-semibold">Try Demo</Button>
          </Link>
        </div>
        {/* Placeholder for hero gradient/triangle */}
        <div className="w-full flex justify-center mt-8">
          <div className="w-64 h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-full opacity-40 blur-2xl" />
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 text-sm border-t border-white/10 bg-black/80 mt-auto">
        &copy; {new Date().getFullYear()} AEDRIN. All rights reserved.
      </footer>
    </main>
  )
}
