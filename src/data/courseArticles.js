// Article/lesson-intro content shown before a course's puzzle set. Every
// course slug gets a lightweight "content coming soon" template so the page
// + route always work — swap in real text/boards per course when ready.

function placeholderArticle(title) {
  return {
    title,
    blocks: [
      {
        type: 'text',
        content:
          'Bu atölyenin ders metni yakında eklenecek. Konuyu tahta üzerinde deneyimlemek için doğrudan alıştırmalara geçebilirsin.',
      },
    ],
  }
}

export const courseArticles = {}

export function getCourseArticle(slug, fallbackTitle) {
  return courseArticles[slug] ?? placeholderArticle(fallbackTitle)
}
