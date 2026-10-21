// Membaca data yang dikirim halaman publik YouTube ke browser (ytInitialData /
// ytInitialPlayerResponse). Tanpa API key. Tidak resmi: kalau struktur halaman
// YouTube berubah, berkas ini yang perlu disesuaikan.

// Bentuk JSON YouTube tidak terdokumentasi dan berubah-ubah, jadi node-nya
// sengaja dibaca longgar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YtNode = any

export type VideosPeriod = 'hour' | 'today' | 'week' | 'month' | 'year' | 'all'
export type VideosSort = 'date' | 'relevance' | 'views'
export type VideosKind = 'all' | 'video' | 'short'

export interface VideosSearchEntity {
  id: string
  url: string
  isShort: boolean
  embedUrl: string
  title: string
  channel: string
  channelId: string
  channelUrl: string
  verifiedChannel: boolean
  published: string
  // Batas atas umur dalam jam; null kalau YouTube tidak menampilkan waktu (mis. sedang live)
  publishedHoursAgo: number | null
  duration: string
  views: number
  isLive: boolean
  snippet: string
  thumbnail: string
}

export interface VideosDetailEntity {
  id: string
  url: string
  embedUrl: string
  embedHtml: string
  embeddable: boolean
  title: string
  description: string
  publishDate: string
  uploadDate: string
  lengthSeconds: number
  category: string
  keywords: string[]
  views: number
  likes: number
  comments: number
  isLive: boolean
  isLiveNow: boolean
  watchingNow: number
  thumbnail: string
  channel: {
    id: string
    name: string
    url: string
    avatar: string
    verified: boolean
    subscribers: number
    subscribersLabel: string
    subscribeUrl: string
  }
}

// Penyebab kegagalan dibedakan supaya service bisa memetakannya ke status HTTP
export class VideosSourceError extends Error {
  constructor(
    readonly reason: 'NOT_FOUND' | 'BLOCKED' | 'UNAVAILABLE',
    message: string
  ) {
    super(message)
    this.name = 'VideosSourceError'
  }
}

// Filter "sp" pencarian YouTube berupa protobuf base64; nilainya sama dengan
// yang dihasilkan menu filter YouTube sendiri.
const SHORTS_FILTERS: Partial<Record<VideosPeriod, string>> = {
  hour: 'CAISBAgBEAk=',
  today: 'CAISBAgCEAk=',
  week: 'CAISBAgDEAk=',
  month: 'CAISBAgEEAk=',
  year: 'CAISBAgFEAk=',
}

const FILTERS: Record<VideosSort, Record<VideosPeriod, string>> = {
  date: { hour: 'CAISAggB', today: 'CAISAggC', week: 'CAISAggD', month: 'CAISAggE', year: 'CAISAggF', all: 'CAISAhAB' },
  relevance: { hour: 'EgQIARAB', today: 'EgQIAhAB', week: 'EgQIAxAB', month: 'EgQIBBAB', year: 'EgQIBRAB', all: 'EgIQAQ==' },
  views: { hour: 'CAMSBAgBEAE=', today: 'CAMSBAgCEAE=', week: 'CAMSBAgDEAE=', month: 'CAMSBAgEEAE=', year: 'CAMSBAgFEAE=', all: 'CAMSAhAB' },
}

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
  // Melewati halaman persetujuan cookie EU yang kalau tidak akan menggantikan isinya
  cookie: 'CONSENT=YES+1; SOCS=CAI',
}

const MIN_GAP_MS = 900
const MAX_PAGES = 25
// Dipakai kalau halaman tonton tidak memuat versinya (mis. diganti halaman cek bot)
const FALLBACK_CLIENT_VERSION = '2.20261020.01.00'

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7,
  agu: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12,
}

const HOURS_PER_UNIT: Record<string, number> = {
  detik: 1 / 3600, second: 1 / 3600,
  menit: 1 / 60, minute: 1 / 60,
  jam: 1, hour: 1,
  hari: 24, day: 24,
  minggu: 168, week: 168,
  bulan: 720, month: 720,
  tahun: 8760, year: 8760,
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Seluruh permintaan ke YouTube lewat satu antrean berjarak minimum, supaya
// panggilan paralel (mis. beberapa kategori beranda sekaligus) tidak memicu
// 429 / captcha.
let queue: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

const youtubeFetch = (url: string, init?: RequestInit) => {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_GAP_MS - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()

    try {
      return await fetch(url, init)
    } catch {
      throw new VideosSourceError('UNAVAILABLE', 'YouTube tidak bisa dihubungi dari server.')
    }
  })
  queue = run.catch(() => undefined)

  return run
}

// Mengambil objek JSON yang di-assign di script sebaris, mis. `var ytInitialData = {...};`
const getEmbeddedJson = (html: string, marker: string): YtNode | null => {
  const start = html.indexOf(marker)
  if (start === -1) return null

  const open = html.indexOf('{', start)
  let depth = 0
  let inString = false

  for (let i = open; i < html.length; i++) {
    const char = html[i]
    if (inString) {
      if (char === '\\') i++
      else if (char === '"') inString = false
    } else if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return JSON.parse(html.slice(open, i + 1))
  }

  return null
}

const getText = (node: YtNode): string =>
  node?.simpleText ?? node?.runs?.map((run: YtNode) => run.text).join('') ?? ''

// "1,17 juta subscriber" -> 1170000, "12,5 rb" -> 12500, "37" -> 37
export const getCount = (label: unknown) => {
  const match = /([\d.,]+)\s*(rb|ribu|jt|juta|m|k)?/i.exec(String(label ?? ''))
  if (!match) return 0

  const unit = (match[2] ?? '').toLowerCase()
  const number = unit
    ? Number(match[1].replace(/\./g, '').replace(',', '.'))
    : Number(match[1].replace(/[.,]/g, ''))

  if (['rb', 'ribu', 'k'].includes(unit)) return Math.round(number * 1_000)
  if (['jt', 'juta', 'm'].includes(unit)) return Math.round(number * 1_000_000)

  return Math.round(number) || 0
}

// "16 jam lalu" -> { min: 16, max: 17 }; YouTube membulatkan ke bawah, jadi
// umur sebenarnya ada di bawah satuan bulat berikutnya.
export const getAgeRange = (publishedText: unknown) => {
  const match =
    /(\d+)\s*(detik|menit|jam|hari|minggu|bulan|tahun|second|minute|hour|day|week|month|year)/i.exec(
      String(publishedText ?? '')
    )
  if (!match) return null

  const amount = Number(match[1])
  const unitHours = HOURS_PER_UNIT[match[2].toLowerCase()]

  return { min: amount * unitHours, max: (amount + 1) * unitHours }
}

// "20 Okt 2026" / "Streaming dimulai 20 Okt 2026" -> "2026-10-20"; kosong kalau tidak terbaca
export const getDateIso = (label: string) => {
  const match = /(\d{1,2})\s+([a-z]{3})[a-z]*\.?\s+(\d{4})/i.exec(label)
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined
  if (!match || !month) return ''

  return `${match[3]}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}`
}

// Menelusuri bentuk respons apa pun dan mengambil objek pertama di bawah `key`
const findFirst = (node: YtNode, key: string): YtNode | null => {
  if (!node || typeof node !== 'object') return null
  if (key in node) return node[key]

  for (const value of Object.values(node)) {
    const found = findFirst(value, key)
    if (found) return found
  }

  return null
}

// Mengumpulkan videoRenderer beserta token continuation berikutnya
const collect = (node: YtNode, found: { videos: YtNode[]; token: string }) => {
  if (!node || typeof node !== 'object') return found

  if (Array.isArray(node)) {
    for (const item of node) collect(item, found)
    return found
  }

  if (node.videoRenderer) {
    found.videos.push(node.videoRenderer)
    return found
  }

  if (node.continuationCommand?.token) found.token = node.continuationCommand.token
  for (const value of Object.values(node)) collect(value, found)

  return found
}

const getSearchRow = (video: YtNode): VideosSearchEntity => {
  const badges = (video.ownerBadges ?? [])
    .map((badge: YtNode) => badge.metadataBadgeRenderer?.tooltip)
    .filter(Boolean)
  const owner = video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint
  const channelPath = owner?.canonicalBaseUrl ?? ''
  const age = getAgeRange(getText(video.publishedTimeText))
  // Shorts mengarah ke /shorts/<id>; selain itu video biasa
  const isShort = String(
    video.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ?? ''
  ).startsWith('/shorts/')

  return {
    id: video.videoId,
    url: isShort
      ? `https://www.youtube.com/shorts/${video.videoId}`
      : `https://www.youtube.com/watch?v=${video.videoId}`,
    isShort,
    embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
    title: getText(video.title),
    channel: getText(video.ownerText),
    channelId: owner?.browseId ?? '',
    channelUrl: channelPath ? `https://www.youtube.com${channelPath}` : '',
    verifiedChannel: badges.length > 0,
    published: getText(video.publishedTimeText),
    publishedHoursAgo: age ? Math.round(age.max * 10) / 10 : null,
    duration: getText(video.lengthText),
    views: getCount(getText(video.viewCountText)),
    isLive:
      !video.lengthText &&
      !!video.badges?.some((badge: YtNode) =>
        badge.metadataBadgeRenderer?.style?.includes('LIVE')
      ),
    snippet: (video.detailedMetadataSnippets ?? [])
      .map((item: YtNode) => getText(item.snippetText))
      .join(' '),
    thumbnail: video.thumbnail?.thumbnails?.at(-1)?.url ?? '',
  }
}

const isWantedKind = (row: VideosSearchEntity, kind: VideosKind) => {
  if (kind === 'short') return row.isShort
  if (kind === 'video') return !row.isShort
  return true
}

// Video masuk jendela waktu hanya kalau umur tertuanya pun muat; live dihitung sekarang
const isWithinHours = (row: VideosSearchEntity, maxAgeHours: number) => {
  if (!maxAgeHours) return true
  if (row.publishedHoursAgo === null) return row.isLive
  return row.publishedHoursAgo <= maxAgeHours
}

const byNewest = (a: VideosSearchEntity, b: VideosSearchEntity) =>
  (a.publishedHoursAgo ?? -1) - (b.publishedHoursAgo ?? -1)

export interface VideosSearchQuery {
  query: string
  period: VideosPeriod
  sort: VideosSort
  kind?: VideosKind
  max: number
  maxAgeHours?: number
}

export interface VideosMixQuery {
  queries: string[]
  sort: VideosSort
  max: number
  shortsMax: number
  maxAgeHours: number
}

export class VideosRepository {
  async getVideosSearch({
    query,
    period,
    sort,
    kind = 'all',
    max,
    maxAgeHours = 0,
  }: VideosSearchQuery) {
    const sp = kind === 'short' ? SHORTS_FILTERS[period] : FILTERS[sort][period]
    if (!sp) return []

    const url = `https://www.youtube.com/results?${new URLSearchParams({ search_query: query, sp, hl: 'id', gl: 'ID' })}`
    const res = await youtubeFetch(url, { headers: HEADERS })
    if (res.status === 429) throw new VideosSourceError('BLOCKED', 'YouTube membatasi permintaan.')
    if (!res.ok) throw new VideosSourceError('UNAVAILABLE', `Halaman pencarian YouTube membalas ${res.status}.`)
    const html = await res.text()

    const data =
      getEmbeddedJson(html, 'var ytInitialData =') ??
      getEmbeddedJson(html, 'window["ytInitialData"] =')
    if (!data) {
      throw new VideosSourceError(
        'BLOCKED',
        'Data hasil pencarian tidak ditemukan; mungkin diminta captcha atau struktur halaman berubah.'
      )
    }

    const apiKey = /"INNERTUBE_API_KEY":"([^"]+)"/.exec(html)?.[1]
    const context = getEmbeddedJson(html, '"INNERTUBE_CONTEXT":')
    const seen = new Set<string>()
    const kept: VideosSearchEntity[] = []

    // Mengembalikan jumlah video baru di halaman ini yang lolos filter
    const addPage = (videos: YtNode[]) => {
      let matched = 0
      for (const video of videos) {
        if (seen.has(video.videoId)) continue
        seen.add(video.videoId)

        const row = getSearchRow(video)
        if (isWantedKind(row, kind) && isWithinHours(row, maxAgeHours)) {
          kept.push(row)
          matched++
        }
      }
      return matched
    }

    const first = collect(data, { videos: [], token: '' })
    addPage(first.videos)
    let token = first.token
    let pages = 1
    let pagesWithoutMatch = 0

    // Mengikuti continuation yang sama dengan infinite scroll halaman. Dengan
    // jendela waktu dan urutan terbaru, beberapa halaman berturut-turut tanpa
    // hasil berarti jendelanya sudah terlewati.
    while (kept.length < max && token && apiKey && context && pages < MAX_PAGES && pagesWithoutMatch < 3) {
      const next = await youtubeFetch(
        `https://www.youtube.com/youtubei/v1/search?key=${apiKey}&prettyPrint=false`,
        {
          method: 'POST',
          headers: { ...HEADERS, 'content-type': 'application/json' },
          body: JSON.stringify({ context, continuation: token }),
        }
      )
      if (!next.ok) break

      const page = collect(await next.json(), { videos: [], token: '' })
      if (!page.videos.length) break

      const matched = addPage(page.videos)
      pagesWithoutMatch = matched ? 0 : pagesWithoutMatch + 1
      pages++
      token = page.token
    }

    return kept.slice(0, max)
  }

  // Beberapa kata kunci digabung jadi satu daftar tanpa duplikat. Untuk tiap
  // kata kunci, 24 jam terakhir dibaca dulu lalu "week" mengisi sisanya.
  async getVideosMany({
    queries,
    sort,
    kind,
    max,
    maxAgeHours,
  }: Omit<VideosMixQuery, 'shortsMax'> & { kind: VideosKind }) {
    const periods: VideosPeriod[] =
      maxAgeHours > 0 && maxAgeHours <= 168 ? ['today', 'week'] : ['week']
    const byId = new Map<string, VideosSearchEntity>()

    for (const query of queries) {
      for (const period of periods) {
        if (byId.size >= max) break

        const rows = await this.getVideosSearch({
          query,
          period,
          sort,
          kind,
          maxAgeHours,
          max: max - byId.size + 20,
        })
        for (const row of rows) if (!byId.has(row.id)) byId.set(row.id, row)
      }
    }

    // Terbaru lebih dulu lintas kata kunci; live (tanpa umur) di depan
    return [...byId.values()].sort(byNewest).slice(0, max)
  }

  // Porsi Shorts tetap: max 100 dengan 15 Shorts -> 85 video biasa + 15 Shorts.
  // Kalau Shorts di jendela waktunya kurang, video biasa mengisi sisanya.
  async getVideosMix({ queries, sort, max, shortsMax, maxAgeHours }: VideosMixQuery) {
    const shorts =
      shortsMax > 0
        ? await this.getVideosMany({ queries, sort, kind: 'short', max: shortsMax, maxAgeHours })
        : []
    const videos = await this.getVideosMany({
      queries,
      sort,
      kind: 'video',
      max: max - shorts.length,
      maxAgeHours,
    })

    return [...videos, ...shorts].sort(byNewest).slice(0, max)
  }

  // Semua yang diketahui halaman tonton tentang satu video
  async getVideosDetail(id: string): Promise<VideosDetailEntity> {
    const res = await youtubeFetch(`https://www.youtube.com/watch?v=${id}&hl=id&gl=ID`, { headers: HEADERS })
    if (res.status === 429) throw new VideosSourceError('BLOCKED', 'YouTube membatasi permintaan.')
    if (!res.ok) throw new VideosSourceError('UNAVAILABLE', `Halaman video YouTube membalas ${res.status}.`)
    const html = await res.text()

    const player = getEmbeddedJson(html, 'var ytInitialPlayerResponse =')
    const initial = getEmbeddedJson(html, 'var ytInitialData =')
    const details = player?.videoDetails
    if (!details) {
      // ERROR berarti videonya memang tidak ada atau privat. Selain itu —
      // terutama "Sign in to confirm you're not a bot" yang dipasang YouTube
      // untuk IP pusat data seperti Vercel — detailnya diambil dari panel info.
      if (player?.playabilityStatus?.status === 'ERROR') {
        throw new VideosSourceError('NOT_FOUND', 'Video tidak ditemukan atau privat.')
      }

      return this.getVideosDetailNext(id, html)
    }

    const micro = player?.microformat?.playerMicroformatRenderer ?? {}
    const owner = findFirst(initial, 'videoOwnerRenderer') ?? {}
    const subscriberLabel =
      getText(owner.subscriberCountText) ||
      owner.subscriberCountText?.accessibility?.accessibilityData?.label ||
      ''
    const likeLabel =
      /"likeCount":"?(\d+)/.exec(html)?.[1] ?? /([\d.,]+ ?(?:rb|jt)?) suka/.exec(html)?.[1] ?? ''
    const commentLabel = /"contextualInfo":\{"runs":\[\{"text":"([^"]+)"/.exec(html)?.[1] ?? ''
    const isLiveNow = !!micro.liveBroadcastDetails?.isLiveNow
    const concurrentLabel = isLiveNow
      ? getText(findFirst(initial, 'viewCount')?.videoViewCountRenderer?.viewCount)
      : ''
    const title = String(details.title ?? '')

    return {
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="${title.replaceAll('"', '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
      embeddable: player?.playabilityStatus?.playableInEmbed !== false,
      title,
      description: details.shortDescription ?? '',
      publishDate: micro.publishDate ?? '',
      uploadDate: micro.uploadDate ?? '',
      lengthSeconds: Number(details.lengthSeconds ?? 0),
      category: micro.category ?? '',
      keywords: details.keywords ?? [],
      views: Number(details.viewCount ?? 0),
      likes: getCount(likeLabel),
      comments: getCount(commentLabel),
      isLive: !!details.isLiveContent,
      isLiveNow,
      watchingNow: getCount(concurrentLabel),
      thumbnail: details.thumbnail?.thumbnails?.at(-1)?.url ?? '',
      channel: {
        id: details.channelId,
        name: details.author,
        url: micro.ownerProfileUrl ?? `https://www.youtube.com/channel/${details.channelId}`,
        avatar: owner.thumbnail?.thumbnails?.at(-1)?.url ?? '',
        verified: (owner.badges ?? []).length > 0,
        subscribers: getCount(subscriberLabel),
        subscribersLabel: subscriberLabel,
        // Membuka tautan ini memunculkan konfirmasi "Subscribe?" milik YouTube
        subscribeUrl: `https://www.youtube.com/channel/${details.channelId}?sub_confirmation=1`,
      },
    }
  }

  // Panel info di bawah video (youtubei/v1/next) tidak ikut dicek bot seperti
  // player. Durasi, kategori, dan kata kunci tidak tersedia di sini, jadi
  // dikosongkan dan disembunyikan tampilan.
  async getVideosDetailNext(id: string, html: string): Promise<VideosDetailEntity> {
    const clientVersion = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(html)?.[1] ?? FALLBACK_CLIENT_VERSION
    const res = await youtubeFetch('https://www.youtube.com/youtubei/v1/next?prettyPrint=false', {
      method: 'POST',
      headers: { ...HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion, hl: 'id', gl: 'ID' } },
        videoId: id,
      }),
    })
    if (res.status === 429) throw new VideosSourceError('BLOCKED', 'YouTube membatasi permintaan.')
    if (!res.ok) throw new VideosSourceError('UNAVAILABLE', `Panel info YouTube membalas ${res.status}.`)

    const data = await res.json()
    const primary = findFirst(data, 'videoPrimaryInfoRenderer')
    const secondary = findFirst(data, 'videoSecondaryInfoRenderer') ?? {}
    if (!primary) throw new VideosSourceError('NOT_FOUND', 'Video tidak ditemukan atau privat.')

    const owner = secondary.owner?.videoOwnerRenderer ?? {}
    const channelEndpoint = owner.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint ?? {}
    const channelId = channelEndpoint.browseId ?? ''
    const channelPath = channelEndpoint.canonicalBaseUrl ?? ''
    const subscriberLabel =
      getText(owner.subscriberCountText) ||
      owner.subscriberCountText?.accessibility?.accessibilityData?.label ||
      ''
    const viewCount = primary.viewCount?.videoViewCountRenderer
    const isLiveNow = !!viewCount?.isLive
    const views = Number(viewCount?.originalViewCount ?? 0) || getCount(getText(viewCount?.viewCount))
    const likeLabel = /"likeCountIfIndifferentNumber":"(\d+)"/.exec(JSON.stringify(data))?.[1] ?? ''
    const publishDate = getDateIso(getText(primary.dateText))
    const title = getText(primary.title)

    return {
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="${title.replaceAll('"', '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
      // Tidak diketahui dari panel ini; player embed sendiri yang akan memberi tahu kalau diblokir
      embeddable: true,
      title,
      description: secondary.attributedDescription?.content ?? getText(secondary.description),
      publishDate,
      uploadDate: publishDate,
      lengthSeconds: 0,
      category: '',
      keywords: [],
      views: isLiveNow ? 0 : views,
      likes: getCount(likeLabel),
      comments: 0,
      isLive: isLiveNow,
      isLiveNow,
      watchingNow: isLiveNow ? views : 0,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      channel: {
        id: channelId,
        name: getText(owner.title),
        url: channelPath
          ? `https://www.youtube.com${channelPath}`
          : `https://www.youtube.com/channel/${channelId}`,
        avatar: owner.thumbnail?.thumbnails?.at(-1)?.url ?? '',
        verified: (owner.badges ?? []).length > 0,
        subscribers: getCount(subscriberLabel),
        subscribersLabel: subscriberLabel,
        subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
      },
    }
  }
}

export const videosRepository = new VideosRepository()
