export interface Page<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

const MAX_PAGE = 200

export const fetchPages = async <T>(
  load: (cursor: string | null) => Promise<Page<T>>
) => {
  const items: T[] = []
  let cursor: string | null = null

  for (let page = 0; page < MAX_PAGE; page += 1) {
    const result = await load(cursor)
    items.push(...result.items)

    if (!result.hasMore || !result.nextCursor) return items

    cursor = result.nextCursor
  }

  return items
}
