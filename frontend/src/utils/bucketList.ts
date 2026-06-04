const CHECKED_KEY = 'nexus_bucket_checked'

export function readCheckedIds(): Set<number> {
	try {
		const raw = JSON.parse(localStorage.getItem(CHECKED_KEY) || '[]')
		return new Set(Array.isArray(raw) ? raw : [])
	} catch {
		return new Set()
	}
}

export function writeCheckedIds(ids: Set<number>) {
	localStorage.setItem(CHECKED_KEY, JSON.stringify([...ids]))
}

export function toggleChecked(id: number): Set<number> {
	const next = readCheckedIds()
	if (next.has(id)) next.delete(id)
	else next.add(id)
	writeCheckedIds(next)
	return next
}
