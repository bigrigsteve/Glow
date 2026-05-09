import { Navigation } from '@/components/Navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />
      <main className="md:pt-16 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
