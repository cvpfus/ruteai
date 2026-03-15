import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Key,
  BarChart3,
  History,
  Wallet,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { authClient } from '../lib/auth-client'

interface SidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/api-keys', label: 'API Keys', icon: Key },
  { path: '/usage', label: 'Usage', icon: BarChart3 },
  { path: '/transactions', label: 'Transactions', icon: History },
  { path: '/top-up', label: 'Top-up', icon: Wallet },
]

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className="w-64 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--accent-gold)] rotate-45 rounded-sm" />
        <span className="font-display text-xl font-medium text-[var(--text-primary)]">
          RuteAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--border-color)]">
        {user ? (
          <div className="flex items-center gap-3 mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
                <User size={20} className="text-[var(--text-secondary)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <button className="nav-item w-full text-left">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={() => {
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.reload()
                  },
                },
              })
            }}
            className="nav-item w-full text-left text-[var(--error)]"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
