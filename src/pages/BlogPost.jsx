import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { findBlogPost } from '../data/blogPosts'

export function BlogPost() {
  const { slug } = useParams()
  const post = findBlogPost(slug)

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-3">Bu yazı bulunamadı.</p>
        <Link to="/blog" className="text-accent-blue font-bold hover:underline">Kütüphaneye dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-8">
        <ArrowLeft size={16} /> Kütüphane
      </Link>
      <img src={post.image} alt="" className="w-full h-64 object-cover rounded-3xl mb-8" />
      <span className="text-xs font-bold uppercase tracking-wider text-accent-blue">{post.category}</span>
      <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-2 mb-3">{post.title}</h1>
      <p className="text-sm text-ink/40 dark:text-ice-white/40 mb-10">
        {post.author} · {post.publishDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      {post.content}
    </div>
  )
}
