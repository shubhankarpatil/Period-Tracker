export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal'

export interface CycleRecord {
    start_date: string
}

export interface PhaseResult {
    day: number
    phase: CyclePhase
}

export function parseLocalDate(dateString: string): Date {
    const [y, m, d] = dateString.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function formatLocalDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function phaseForDay(day: number): CyclePhase {
    if (day <= 5) return 'Menstrual'
    if (day <= 14) return 'Follicular'
    if (day <= 21) return 'Ovulatory'
    return 'Luteal'
}

export function calculatePhase(cycles: CycleRecord[], target: Date): PhaseResult {
    if (!cycles || cycles.length === 0) {
        return { day: 1, phase: 'Follicular' }
    }

    const targetStr = formatLocalDate(target)
    const pastCycles = cycles.filter(c => c.start_date <= targetStr)

    if (pastCycles.length === 0) {
        return { day: 1, phase: 'Follicular' }
    }

    const currentCycle = pastCycles.reduce((latest, c) =>
        c.start_date > latest.start_date ? c : latest
    )

    const start = parseLocalDate(currentCycle.start_date)
    const diffMs = target.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    const day = diffDays > 0 ? diffDays : 1

    return { day, phase: phaseForDay(day) }
}
