import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'

export function Blog() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center mb-12">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Kütüphane</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3">Go Üzerine Yazılar</h1>
      </div>

      <div className="flex flex-col gap-6">
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="magnetic-btn flex flex-col sm:flex-row gap-5 rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card overflow-hidden">
            <img src={post.image} alt="" className="sm:w-64 h-48 sm:h-auto object-cover shrink-0" />
            <div className="p-6 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-blue mb-2">{post.category}</span>
              <h2 className="text-2xl font-extrabold text-ink dark:text-white mb-2">{post.title}</h2>
              <p className="text-sm text-ink/60 dark:text-ice-white/60 mb-4 flex-1">{post.snippet}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-blue dark:text-white">
                Oku <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
