import { describe, it, expect } from 'vitest'
import {
    calculatePhase,
    phaseForDay,
    parseLocalDate,
    formatLocalDate,
} from './cyclePhase'

describe('phaseForDay', () => {
    it('classifies day 1-5 as Menstrual', () => {
        expect(phaseForDay(1)).toBe('Menstrual')
        expect(phaseForDay(5)).toBe('Menstrual')
    })

    it('classifies day 6-14 as Follicular', () => {
        expect(phaseForDay(6)).toBe('Follicular')
        expect(phaseForDay(14)).toBe('Follicular')
    })

    it('classifies day 15-21 as Ovulatory', () => {
        expect(phaseForDay(15)).toBe('Ovulatory')
        expect(phaseForDay(21)).toBe('Ovulatory')
    })

    it('classifies day 22+ as Luteal', () => {
        expect(phaseForDay(22)).toBe('Luteal')
        expect(phaseForDay(28)).toBe('Luteal')
        expect(phaseForDay(45)).toBe('Luteal')
    })
})

describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD as local-time without UTC shift', () => {
        const d = parseLocalDate('2026-05-07')
        expect(d.getFullYear()).toBe(2026)
        expect(d.getMonth()).toBe(4)
        expect(d.getDate()).toBe(7)
    })
})

describe('formatLocalDate', () => {
    it('formats with leading zeros', () => {
        expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
        expect(formatLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31')
    })

    it('roundtrips with parseLocalDate', () => {
        const s = '2026-05-07'
        expect(formatLocalDate(parseLocalDate(s))).toBe(s)
    })
})

describe('calculatePhase', () => {
    it('returns Follicular day 1 when no cycles', () => {
        expect(calculatePhase([], new Date(2026, 4, 7))).toEqual({
            day: 1,
            phase: 'Follicular',
        })
    })

    it('returns Follicular day 1 when target is before any cycle', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-10' }],
                new Date(2026, 4, 5)
            )
        ).toEqual({ day: 1, phase: 'Follicular' })
    })

    it('day 1 = the start date (Menstrual)', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 1)
            )
        ).toEqual({ day: 1, phase: 'Menstrual' })
    })

    it('day 5 boundary stays Menstrual', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 5)
            )
        ).toEqual({ day: 5, phase: 'Menstrual' })
    })

    it('day 6 transitions to Follicular', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 6)
            )
        ).toEqual({ day: 6, phase: 'Follicular' })
    })

    it('day 14 stays Follicular', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 14)
            )
        ).toEqual({ day: 14, phase: 'Follicular' })
    })

    it('day 15 transitions to Ovulatory', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 15)
            )
        ).toEqual({ day: 15, phase: 'Ovulatory' })
    })

    it('day 21 stays Ovulatory', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 21)
            )
        ).toEqual({ day: 21, phase: 'Ovulatory' })
    })

    it('day 22 transitions to Luteal', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-05-01' }],
                new Date(2026, 4, 22)
            )
        ).toEqual({ day: 22, phase: 'Luteal' })
    })

    it('picks the most recent past cycle and ignores future ones', () => {
        expect(
            calculatePhase(
                [
                    { start_date: '2026-04-01' },
                    { start_date: '2026-05-01' },
                    { start_date: '2026-06-01' },
                ],
                new Date(2026, 4, 7)
            )
        ).toEqual({ day: 7, phase: 'Follicular' })
    })

    it('handles cycles passed in any order', () => {
        expect(
            calculatePhase(
                [
                    { start_date: '2026-05-01' },
                    { start_date: '2026-04-01' },
                ],
                new Date(2026, 4, 3)
            )
        ).toEqual({ day: 3, phase: 'Menstrual' })
    })

    it('crosses month boundary correctly', () => {
        expect(
            calculatePhase(
                [{ start_date: '2026-04-28' }],
                new Date(2026, 4, 5)
            )
        ).toEqual({ day: 8, phase: 'Follicular' })
    })
})
