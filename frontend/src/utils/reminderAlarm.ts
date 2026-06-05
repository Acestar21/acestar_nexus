const BACKUP_KEY = 'nexus_reminder_alarm_backup'
const DISABLED_KEY = 'nexus_reminder_alarm_disabled'

function readBackup(): Record<number, string> {
	try {
		return JSON.parse(localStorage.getItem(BACKUP_KEY) || '{}')
	} catch {
		return {}
	}
}

export function saveAlarmBackup(id: number, remindAt: string) {
	const map = readBackup()
	map[id] = remindAt
	localStorage.setItem(BACKUP_KEY, JSON.stringify(map))
}

export function popAlarmBackup(id: number): string | undefined {
	const map = readBackup()
	const value = map[id]
	if (value) {
		delete map[id]
		localStorage.setItem(BACKUP_KEY, JSON.stringify(map))
	}
	return value
}

function readDisabled(): Record<number, boolean> {
	try {
		return JSON.parse(localStorage.getItem(DISABLED_KEY) || '{}')
	} catch {
		return {}
	}
}

export function isAlarmEnabled(id: number | undefined, remindAt?: string): boolean {
	if (!remindAt) return false
	if (!id) return true
	const map = readDisabled()
	return !map[id]
}

export function setAlarmEnabled(id: number, enabled: boolean) {
	const map = readDisabled()
	if (enabled) {
		delete map[id]
	} else {
		map[id] = true
	}
	localStorage.setItem(DISABLED_KEY, JSON.stringify(map))
}

export function hasAlarm(remindAt?: string): boolean {
	return Boolean(remindAt)
}
