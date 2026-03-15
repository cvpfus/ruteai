import { Sidebar } from './Sidebar'
import { Bell, ChevronDown } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function DashboardLayout({
  children,
  title,
  user,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Sidebar user={user} />

      <div className="ml-64">
        {/* Header */}
        <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-page)]">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-gold)] rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-sm">Last 30 Days</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
