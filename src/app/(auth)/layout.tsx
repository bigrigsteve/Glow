import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-white to-pink-50">
      {/* Header */}
      <div className="flex justify-center pt-10 pb-6">
        <Logo size="lg" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        {children}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        Free & open source · Your data stays yours
      </div>
    </div>
  )
}
