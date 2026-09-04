import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  User,
  ShieldCheck,
  Home as HomeIcon,
  GraduationCap,
  Trophy,
  CalendarDays,
  Puzzle,
  Award,
  Users,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { HeartsBar } from './ui/HeartsBar'
import { TokenBadge } from './ui/TokenBadge'
import { StreakFlame } from './ui/StreakFlame'

const NAV_LINKS = [
  { to: '/', label: 'Ana Sayfa', icon: HomeIcon },
  { to: '/atolyeler', label: 'Atölyeler', icon: GraduationCap },
  { to: '/ligler', label: 'Ligler', icon: Trophy },
  { to: '/fikstur', label: 'Fikstür', icon: CalendarDays },
  { to: '/bulmacalar', label: 'Bulmacalar', icon: Puzzle },
  { to: '/liderlik-tablosu', label: 'Liderlik', icon: Award },
  { to: '/hakkimizda', label: 'Hakkımızda', icon: Users },
  { to: '/blog', label: 'Kütüphane', icon: BookOpen },
]

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
    isActive ? 'text-accent-blue bg-accent-blue/10' : 'text-ink/70 dark:text-ice-white/70 hover:text-primary-blue dark:hover:text-white hover:bg-primary-blue/5'
  }`
}

function AuthActions({ compact = false }) {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:bg-primary-blue/5 transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {!compact && (theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod')}
      </button>

      {user && profile ? (
        <>
          <div className="flex flex-col gap-2 px-1">
            <HeartsBar hearts={profile.hearts} profile={profile} size={15} />
            <div className="flex items-center gap-2">
              <TokenBadge tokens={profile.tokens} size="sm" />
              <StreakFlame count={profile.streak_count} size="sm" />
            </div>
          </div>
          <Link to="/profil" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-primary-blue/5 dark:bg-white/5 hover:bg-primary-blue/10 transition-colors">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent-blue/30 flex items-center justify-center text-primary-blue shrink-0">
                <User size={14} />
              </div>
            )}
            <span className="text-sm font-bold text-ink dark:text-white truncate">{profile.username || 'Profilim'}</span>
          </Link>
          {profile.is_admin && (
            <Link to="/admin" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-success hover:bg-success/10 transition-colors">
              <ShieldCheck size={18} /> Yönetim
            </Link>
          )}
          <button
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-ink/50 dark:text-ice-white/50 hover:text-heart transition-colors"
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
        </>
      ) : (
        <>
          <Link to="/giris" className="px-3.5 py-2.5 rounded-xl text-sm font-bold text-ink dark:text-white hover:bg-primary-blue/5 transition-colors">
            Giriş Yap
          </Link>
          <Link to="/kayit" className="magnetic-btn px-3.5 py-2.5 rounded-xl text-sm font-bold text-center text-white agora-gradient-surface shadow-card">
            Ücretsiz Başla
          </Link>
        </>
      )}
    </div>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop left sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col justify-between border-r border-primary-blue/10 dark:border-white/10 bg-silver/90 dark:bg-silver-dark/95 backdrop-blur-xl px-3 py-6 z-50">
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
              <link.icon size={19} /> {link.label}
            </NavLink>
          ))}
        </nav>
        <AuthActions />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-ice-white/80 dark:bg-ink/80 border-b border-primary-blue/10 dark:border-white/10">
        <div className="px-4 h-16 flex items-center justify-end">
          <button className="p-2 text-ink dark:text-white" onClick={() => setOpen((v) => !v)} aria-label="Menü">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-primary-blue/10 dark:border-white/10 bg-ice-white dark:bg-ink px-4 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)} className={navLinkClass}>
                <link.icon size={19} /> {link.label}
              </NavLink>
            ))}
            <div className="h-px bg-primary-blue/10 dark:bg-white/10 my-2" />
            <AuthActions compact />
          </div>
        )}
      </header>
    </>
  )
}
