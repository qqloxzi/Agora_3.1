// Article/lesson-intro content shown before a course's puzzle set. Only
// 'oyun-yonu' has real hand-written content ported from the old site; every
// other course slug gets a lightweight "content coming soon" template so
// the page + route always work — swap in real text/boards later.

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

export const courseArticles = {
  'oyun-yonu': {
    title: 'Oyun Yönü — Temel Prensipler',
    blocks: [
      {
        type: 'text',
        content:
          "Go oyununda oyun yönü, taşlarınızın tahta üzerinde doğru yönlere ilerlemesini ve birbirleriyle uyum içinde çalışmasını ifade eder. Aşağıdaki beş temel prensip, oyununuzu güçlü tutmanın anahtarlarıdır.",
      },
      {
        type: 'text',
        content:
          'Acil Hamleler Büyük Hamlelerden Önce Gelir\n\nÇok puan getirecek geniş alanlara yönelmeden önce, zayıf gruplarınızın güvenliğini sağlayın veya rakibin zayıf gruplarına baskı yapın.',
      },
      {
        type: 'board',
        sgf: `(;FF[4]CA[UTF-8]GM[1]SZ[19]KM[6.5]RU[Japanese];AB[qe];AB[cn];AW[cp];AW[dq];AW[nq];AW[jp];AW[ba];AW[cb];AW[dc];AW[eb];AW[ed];AW[fd];AW[gd];AB[bb];AB[cc];AB[cd];AB[dd];AB[df];AB[ee];AB[fe];AB[hf];AB[pp];AB[qn]LB[id:A][ck:B];B[ck])`,
        description: 'B noktası acil bir hamledir — siyahın zayıf grubunu güvence altına alır. A noktası büyük ama acil değildir.',
      },
      {
        type: 'text',
        content:
          'En Geniş Alana Yönelin\n\nTaşların sıkıştığı dar bölgelerde mücadele etmek yerine, gelişime en açık ve tahtadaki en geniş boşlukların bulunduğu yöne doğru oynayın.',
      },
      {
        type: 'board',
        sgf: `(;FF[4]CA[UTF-8]GM[1]SZ[19]KM[6.5]RU[Japanese];AB[jd];AB[qd];AB[oc];AB[pj];AB[qo];AB[pq];AW[dq];AW[do];AW[mp];AW[jp];AW[ed];AW[cd]LB[ci:A])`,
        description: 'Siyah A veya benzeri yönde geniş alanlara doğru gelişebilir — dar merkez yerine açık kenarları tercih edin.',
      },
      {
        type: 'text',
        content:
          'Rakibi Kalınlığa (Gücünüze) Doğru İtin\n\nTahtada güçlü bir duvarınız veya sağlam bir grubunuz varsa, o bölgeye yakın oynamak yerine rakibinizi bu güçlü duvarınıza doğru sürükleyecek yönden saldırın.',
      },
      {
        type: 'board',
        sgf: `(;FF[4]CA[UTF-8]GM[1]SZ[19]KM[6.5]RU[Japanese];AB[dc];AB[ce];AB[dp];AB[cn];AB[oq];AB[po];AB[on];AB[pl];AB[pk];AB[pj];AW[qi];AW[qk];AW[ql];AW[qm];AW[qo];AW[qp];AW[pd];AW[nc];AW[lp];AW[fq]LB[ip:A])`,
        description: 'Siyahın sol taraftaki kalın duvarı var. Beyazı A yönüne doğru iterek bu duvardan faydalanabilir.',
      },
      {
        type: 'text',
        content:
          'Rakibin Gelişim Yönünü Kapatın\n\nHamle yönünüzü seçerken, sadece kendi alanınızı büyütmeyi değil, aynı zamanda rakibin en çok yayılarak potansiyel oluşturmak isteyeceği yönü tıkamayı hedefleyin.',
      },
      {
        type: 'board',
        sgf: `(;FF[4]CA[UTF-8]GM[1]SZ[19]KM[6.5]RU[Japanese];AB[pd];AB[nc];AB[qe];AB[kd];AW[pf];AW[qf];AW[qj];AW[dd];AB[pp];AB[cq];AB[dq];AB[eq];AB[dr];AB[dp];AB[do];AW[en];AW[eo];AW[ep];AW[em];AW[fn];AW[fq];AW[er];AW[gp];AW[gr];AW[cf]LB[nq:A])`,
        description: 'Siyah A hamlesini oynayarak beyazın genişleme yönünü kapatır.',
      },
      {
        type: 'text',
        content:
          'Merkeze Doğru Açılın\n\nGruplarınızı sadece köşelere ve kenarlara hapsetmeyin. Taşlarınızın oyunun ilerleyen safhalarında tahtanın geneline etki edebilmesi için merkeze çıkış yollarını her zaman açık tutun.',
      },
      {
        type: 'board',
        sgf: `(;FF[4]CA[UTF-8]GM[1]SZ[19]KM[6.5]RU[Japanese];AB[dp];AB[fq];AB[dk];AB[qo];AB[oo];AW[qp];AW[pq];AW[nq];AW[lp];AW[dc];AW[de];AW[cg];AW[hd];AW[jc];AB[ch];AB[dh];AB[pd];AB[pc];AB[pb];AB[qb];AB[qe];AB[qf];AB[qg];AB[lc];AW[ra];AW[rb];AW[qc];AW[qd];AW[re];AW[rf]LB[rg:A])`,
        description: 'Siyah köşeden merkeze doğru açılırken, beyaz da kendi bölgesinden gelişiyor.',
      },
      {
        type: 'text',
        content: 'Bu beş prensibi oyunlarınızda bilinçli olarak uygulamak, taş gelişiminizi önemli ölçüde güçlendirecektir. Şimdi alıştırmalara geçerek bu kavramları tahta üzerinde deneyimleyin.',
      },
    ],
  },
}

export function getCourseArticle(slug, fallbackTitle) {
  return courseArticles[slug] ?? placeholderArticle(fallbackTitle)
}
