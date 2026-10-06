import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { AuthCallback } from './pages/AuthCallback'
import { Profile } from './pages/Profile'
import { MyMessages } from './pages/MyMessages'
import { Admin } from './pages/Admin'
import { LibraryAdmin } from './pages/LibraryAdmin'
import { GameDetail } from './pages/GameDetail'
import { Workshops } from './pages/Workshops'
import { WorkshopIntro } from './pages/WorkshopIntro'
import { WorkshopLesson } from './pages/WorkshopLesson'
import { Leagues } from './pages/Leagues'
import { LeagueDetail } from './pages/LeagueDetail'
import { Fikstur } from './pages/Fikstur'
import { AgoraOnlineLeague } from './pages/AgoraOnlineLeague'
import { Leaderboard } from './pages/Leaderboard'
import { Puzzles } from './pages/Puzzles'
import { Bots } from './pages/Bots'
import { Store } from './pages/Store'
import { About } from './pages/About'
import { InstructorProfile } from './pages/InstructorProfile'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'
import { Contact } from './pages/Contact'

// Joseki Sonrası carries ~1.8 MB of diagram JSON — load it only when visited.
const JosekiAfter = lazy(() => import('./pages/JosekiAfter').then((m) => ({ default: m.JosekiAfter })))
const JosekiAfterDetail = lazy(() => import('./pages/JosekiAfterDetail').then((m) => ({ default: m.JosekiAfterDetail })))
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/kayit" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/mesajlarim" element={<MyMessages />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/kutuphane" element={<LibraryAdmin />} />
        <Route path="/kutuphane/parti/:id" element={<GameDetail />} />

        <Route path="/atolyeler" element={<Workshops />} />
        <Route path="/atolyeler/kurs/:courseSlug" element={<WorkshopLesson />} />
        <Route path="/atolyeler/:courseSlug" element={<WorkshopIntro />} />

        <Route path="/ligler" element={<Leagues />} />
        <Route path="/lig/:slug" element={<LeagueDetail />} />

        <Route path="/fikstur" element={<Fikstur />} />
        <Route path="/agora-online-ligi" element={<AgoraOnlineLeague />} />
        <Route path="/liderlik-tablosu" element={<Leaderboard />} />

        <Route path="/bulmacalar" element={<Puzzles />} />
        <Route path="/joseki-sonrasi" element={<Suspense fallback={null}><JosekiAfter /></Suspense>} />
        <Route path="/joseki-sonrasi/:slug" element={<Suspense fallback={null}><JosekiAfterDetail /></Suspense>} />
        <Route path="/botlarla-oyna" element={<Bots />} />
        <Route path="/magaza" element={<Store />} />

        <Route path="/hakkimizda" element={<About />} />
        <Route path="/egitmen/:id" element={<InstructorProfile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/iletisim" element={<Contact />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
