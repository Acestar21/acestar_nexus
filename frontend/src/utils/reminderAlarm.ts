const BACKUP_KEY = 'nexus_reminder_alarm_backup'

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

export function hasAlarm(remindAt?: string): boolean {
	return Boolean(remindAt)
}
