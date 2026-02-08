'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './Dashboard.module.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import BottomNav from './BottomNav'
import Modal from './Modal'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { jsPDF } from 'jspdf'
import KnowledgeHub from './KnowledgeHub'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
type Tab = 'home' | 'graph' | 'knowledge' | 'profile' | 'logout'

export default function Dashboard({ session }: { session: any }) {
    const [profile, setProfile] = useState<any>(null)
    const [partnerEmail, setPartnerEmail] = useState('')
    const [userName, setUserName] = useState('')
    const [isEditingName, setIsEditingName] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isCyclesLoading, setIsCyclesLoading] = useState(true)
    const [cycleDay, setCycleDay] = useState(1)
    const [phase, setPhase] = useState<string | null>(null)

    // Calendar state
    const [date, setDate] = useState<Value>(new Date())
    const [periodDates, setPeriodDates] = useState<string[]>([])
    const [dateDayMap, setDateDayMap] = useState<Record<string, number>>({})
    const [cycleIdMap, setCycleIdMap] = useState<Record<string, string>>({})
    const [cycles, setCycles] = useState<any[]>([])

    // Prediction State
    const [predictedPeriodDates, setPredictedPeriodDates] = useState<string[]>([])
    const [predictedFertileDates, setPredictedFertileDates] = useState<string[]>([])

    // Daily Logs State
    const [dailyLogs, setDailyLogs] = useState<Record<string, any>>({})
    const [isDayModalOpen, setIsDayModalOpen] = useState(false)
    const [isLogModalOpen, setIsLogModalOpen] = useState(false) // Deprecated, but keeping for safety until verify, actually removing it from usage
    const [logForm, setLogForm] = useState<{
        mood: string,
        symptoms: string[],
        basalTemp: string,
        mucus: string,
        lhTest: string
    }>({
        mood: '',
        symptoms: [],
        basalTemp: '',
        mucus: '',
        lhTest: ''
    })

    // View State
    const [isEditingPartner, setIsEditingPartner] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('home')
    const [isDesktop, setIsDesktop] = useState(false)
    const [activeStartDate, setActiveStartDate] = useState<Date>(new Date())
    const [discreetMode, setDiscreetMode] = useState(false)

    const maskSensitiveText = (text: string) => {
        if (!discreetMode || !text) return text
        return text.replace(/Ovulation|Period/gi, (match: string) =>
            match.toLowerCase().includes('ovulation') ? 'Peak' : 'Start'
        )
    }
    const [customSymptom, setCustomSymptom] = useState('')

    // Notifications Logic
    const [lastNotifiedPhase, setLastNotifiedPhase] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('lastNotifiedPhase')
        return null
    })
    const [lastRemindedDate, setLastRemindedDate] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('lastRemindedDate')
        return null
    })

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([])
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
    const [toasts, setToasts] = useState<any[]>([])

    const addNotification = (text: string, type: 'info' | 'remind' | 'support' = 'info') => {
        const newId = Date.now() + Math.random()

        setNotifications(prev => {
            // Prevent duplicate unread notifications with same text
            if (prev.some(n => n.text === text && n.unread)) {
                return prev
            }

            const newNotif = {
                id: newId,
                text,
                type,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: true
            }
            return [newNotif, ...prev]
        })

        // Handle toasts outside the setter to avoid side-effect duplication
        // Deduplicate active toasts to prevent visual flooding
        setToasts(prev => {
            if (prev.some(t => t.text === text)) return prev
            const toastId = newId + 1000 // Ensure unique from newId

            setTimeout(() => {
                setToasts(tPrev => tPrev.filter(t => t.id !== toastId))
            }, 5000)

            return [...prev, { id: toastId, text, type }]
        })
    }

    const PHASE_TIPS = {
        Menstrual: {
            nutrition: "Focus on iron-rich foods like spinach and lean meats. Warm teas can help with cramps.",
            exercise: "Rest or gentle stretching. Listen to your body's need for recovery.",
            insight: "Hormones (Estrogen and Progesterone) are at their lowest. Your body is focusing on shedding the uterine lining; prioritising rest and nourishment aids this process."
        },
        Follicular: {
            nutrition: "Eat fermented foods like yogurt. Complex carbs will provide stable energy.",
            exercise: "Energy is rising! Great time for cardio or strength training.",
            insight: "FSH (Follicle Stimulating Hormone) signals ovaries to prepare an egg. Rising Estrogen improves cognitive focus and social confidence."
        },
        Ovulatory: {
            nutrition: "High-fibre veggies like broccoli. Stay hydrated to support cervical mucus.",
            exercise: "Peak energy! High-intensity workouts (HIIT) or social classes.",
            insight: "An LH (Luteinizing Hormone) surge triggers egg release. Testosterone peaks here, often increasing your strength and physical drive."
        },
        Luteal: {
            nutrition: "Magnesium-rich foods like dark chocolate and pumpkin seeds. Avoid excess salt.",
            exercise: "Strength training is effective, but watch for lower endurance. Try yoga.",
            insight: "Progesterone dominates to stabilize the uterine lining. The drop in hormones at the end of this phase can trigger irritability or bloating (PMS)."
        }
    } as any

    const PARTNER_TIPS = {
        Menstrual: "Her energy may be low and she might have cramps. Hot water bottles, dark chocolate, and taking off some household load are great ways to support her today.",
        Follicular: "She's likely feeling more energetic and social. Great time for a date night or tackling a new project together!",
        Ovulatory: "Confidence and energy are at their peak. She's at her most fertile right now.",
        Luteal: "She might be more inward-focused or sensitive (PMS). Be patient, offer comfort foods, and give her some extra space or quiet time if needed."
    } as any

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        title: string
        message: string
        confirmText?: string
        isAlert?: boolean
        onConfirm: () => void
        onCancel?: () => void
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    })

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }))

    const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = "Confirm", onCancel?: () => void) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            confirmText,
            isAlert: false,
            onConfirm: () => {
                onConfirm()
                closeModal()
            },
            onCancel: () => {
                if (onCancel) onCancel()
                closeModal()
            }
        })
    }

    const showAlert = (title: string, message: string) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            isAlert: true,
            onConfirm: () => closeModal()
        })
    }

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 900)
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsDayModalOpen(false)
        }
        if (typeof window !== 'undefined') {
            handleResize()
            window.addEventListener('resize', handleResize)
            window.addEventListener('keydown', handleEsc)
            return () => {
                window.removeEventListener('resize', handleResize)
                window.removeEventListener('keydown', handleEsc)
            }
        }
    }, [])

    // Handle logout
    useEffect(() => {
        if (activeTab === 'logout') {
            showConfirm(
                'Sign Out',
                'Are you sure you want to sign out?',
                () => {
                    supabase.auth.signOut().then(() => {
                        window.location.href = '/'
                    })
                },
                'Sign Out',
                () => setActiveTab('home')
            )
        }
    }, [activeTab])

    useEffect(() => {
        getProfile()
        fetchCycles()
    }, [session])

    // Prediction Logic
    useEffect(() => {
        if (cycles.length > 0) {
            // 1. Calculate Average Cycle Length from last 6 cycles
            const sorted = [...cycles].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            let totalDays = 0
            let gaps = 0

            for (let i = 1; i < sorted.length; i++) {
                const prev = new Date(sorted[i - 1].start_date)
                const curr = new Date(sorted[i].start_date)
                const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
                if (diff > 20 && diff < 40) { // Filter outliers
                    totalDays += diff
                    gaps++
                }
            }

            const avgCycle = gaps > 0 ? Math.round(totalDays / gaps) : 28

            // 2. Predict Next 6 Cycles
            const lastStart = new Date(sorted[sorted.length - 1].start_date)
            const pDates: string[] = []
            const fDates: string[] = []

            for (let i = 1; i <= 6; i++) {
                // Next Period Start
                const nextStart = new Date(lastStart)
                nextStart.setDate(lastStart.getDate() + (avgCycle * i))

                // Period Duration (Assume 4 days)
                for (let d = 0; d < 4; d++) {
                    const pDay = new Date(nextStart)
                    pDay.setDate(nextStart.getDate() + d)
                    pDates.push(getLocalDateString(pDay))
                }

                // Fertile Window: Ovulation ~14 days BEFORE next period start
                const ovulationDay = new Date(nextStart)
                ovulationDay.setDate(nextStart.getDate() - 14)

                for (let f = -4; f <= 1; f++) {
                    const fDay = new Date(ovulationDay)
                    fDay.setDate(ovulationDay.getDate() + f)
                    fDates.push(getLocalDateString(fDay))
                }
            }
            setPredictedPeriodDates(pDates)
            setPredictedFertileDates(fDates)
        } else {
            setPredictedPeriodDates([])
            setPredictedFertileDates([])
        }
    }, [cycles])

    // Update phase on date change
    useEffect(() => {
        updatePhaseInfo(date as Date, cycles)
    }, [date, cycles])


    async function getProfile() {
        try {
            setLoading(true)
            const { user } = session
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                const { data: newData, error: createError } = await supabase
                    .from('profiles')
                    .insert([{ id: user.id, email: user.email }])
                    .select()
                    .single()
                if (createError) throw createError
                data = newData
            }
            if (data) {
                setProfile(data)
                setPartnerEmail(data.partner_email || '')
                setUserName(data.name || data.full_name || '')

                // Check if they haven't logged mood today
                const todayStr = new Date().toISOString().split('T')[0]
                const { data: todayLog } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('date', todayStr)
                    .single()

                if (!todayLog || !todayLog.mood) {
                    const lastRemind = localStorage.getItem('lastRemindedDate')
                    if (lastRemind !== todayStr) {
                        addNotification("Don't forget to log your mood and symptoms for today! ✨", "remind")
                        localStorage.setItem('lastRemindedDate', todayStr)
                        setLastRemindedDate(todayStr)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user data!', error)
        } finally {
            setLoading(false)
        }
    }

    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    async function fetchCycles() {
        setIsCyclesLoading(true)
        const { user } = session

        const { data: cycleData, error: cycleError } = await supabase
            .from('cycles')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

        const { data: logData, error: logError } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)

        if (cycleError) console.error('Error cycles:', cycleError)
        if (logError) console.warn('Error logs (tables might be missing):', logError)

        if (cycleData) {
            setCycles(cycleData)
            const dates: string[] = []
            const dayMap: Record<string, number> = {}
            const idMap: Record<string, string> = {}

            cycleData.forEach((cycle: any) => {
                const [sYear, sMonth, sDay] = cycle.start_date.split('-').map(Number)
                const start = new Date(sYear, sMonth - 1, sDay)

                let end: Date
                if (cycle.end_date) {
                    const [eYear, eMonth, eDay] = cycle.end_date.split('-').map(Number)
                    end = new Date(eYear, eMonth - 1, eDay)
                } else {
                    end = new Date(start)
                    end.setDate(end.getDate() + 4)
                }

                let dayCount = 1
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dStr = getLocalDateString(d)
                    dates.push(dStr)
                    dayMap[dStr] = dayCount
                    idMap[dStr] = cycle.id
                    dayCount++
                }
            })
            setPeriodDates(dates)
            setDateDayMap(dayMap)
            setCycleIdMap(idMap)

            updatePhaseInfo(new Date(), cycleData)
        }

        if (logData) {
            const logs: Record<string, any> = {}
            logData.forEach((log: any) => {
                logs[log.date] = log
            })
            setDailyLogs(logs)
        }
        setIsCyclesLoading(false)
        setLoading(false)
    }

    const updatePhaseInfo = (targetDate: Date, cycles: any[]) => {
        // Use a specific cycles loading guard to prevent premature phase calculation
        if (isCyclesLoading && (!cycles || cycles.length === 0)) {
            return
        }

        // If truly no cycles after loading, default to Follicular
        if (!cycles || cycles.length === 0) {
            setCycleDay(1)
            setPhase('Follicular')
            return
        }

        const targetStr = getLocalDateString(targetDate)
        // Find most recent start <= target
        const pastCycles = cycles.filter((c: any) => c.start_date <= targetStr)

        if (pastCycles.length > 0) {
            // We need to sort by start_date DESC to get the *nearest* past cycle
            // The API returns ordered descending, but filter preserves order? Yes.
            const currentCycle = pastCycles[0] // Assuming cycles is ordered DESC

            const [sYear, sMonth, sDay] = currentCycle.start_date.split('-').map(Number)
            const start = new Date(sYear, sMonth - 1, sDay)

            const diffTime = targetDate.getTime() - start.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

            setCycleDay(diffDays > 0 ? diffDays : 1)

            if (diffDays <= 5) setPhase('Menstrual')
            else if (diffDays <= 14) setPhase('Follicular')
            else if (diffDays <= 21) setPhase('Ovulation')
            else setPhase('Luteal')
        } else {
            setCycleDay(1)
            setPhase('Follicular')
        }
    }

    // Effect to trigger phase-change notifications
    useEffect(() => {
        if (phase && lastNotifiedPhase !== phase) {
            // User Notification
            const phaseMsg = phase === 'Ovulation'
                ? "You're in your Ovulation phase! Peak fertility and energy! 🌟"
                : `You've entered the ${phase} phase. Check your Roadmap for tips! ✨`
            addNotification(phaseMsg, "info")

            // Partner Notification
            if (profile?.partner_email) {
                notifyPartnerOfPhaseChange(phase)
            }

            // Persist the notified phase
            setLastNotifiedPhase(phase)
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastNotifiedPhase', phase)
            }
        }
    }, [phase, profile?.partner_email, lastNotifiedPhase])

    const notifyPartnerOfPhaseChange = async (newPhase: string) => {
        if (!profile?.partner_email || lastNotifiedPhase === newPhase) return
        try {
            // In a real app, this would be an API call to a backend/Edge Function
            console.log(`[SIMULATED EMAIL] Sending phase update to ${profile.partner_email}: ${newPhase} phase started.`)
            setLastNotifiedPhase(newPhase)
            // Mocking the supabase function call as specified in the plan
            /* await supabase.functions.invoke('phase-alert', { body: { ... } }) */
        } catch (err) {
            console.error("Email notification failed:", err)
        }
    }

    useEffect(() => {
        if (phase && profile?.partner_email) {
            notifyPartnerOfPhaseChange(phase)
        }
    }, [phase, profile?.partner_email])

    async function handleDayClick(value: Value, event: React.MouseEvent<HTMLButtonElement>) {
        if (!value) return
        const dateStr = getLocalDateString(value as Date)
        // Set date
        setDate(value)

        // Prepare Log Form
        const existing = dailyLogs[dateStr] || {}
        setLogForm({
            mood: existing.mood || '',
            symptoms: existing.symptoms || [],
            basalTemp: existing.basal_temp?.toString() || '',
            mucus: existing.cervical_mucus || '',
            lhTest: existing.lh_test || ''
        })

        // Open Modal
        setIsDayModalOpen(true)
    }

    // Extracted Period Logic (called from Modal)
    async function handlePeriodAction() {
        const dateStr = getLocalDateString(date as Date)
        setIsDayModalOpen(false)

        const { data: currentCycles, error } = await supabase
            .from('cycles')
            .select('*')
            .eq('user_id', session.user.id)
            .order('start_date', { ascending: true })

        if (error || !currentCycles) return

        const addDays = (dStr: string, days: number) => {
            const [y, m, d] = dStr.split('-').map(Number)
            const dObj = new Date(y, m - 1, d)
            dObj.setDate(dObj.getDate() + days)
            return getLocalDateString(dObj)
        }

        const existingCycle = currentCycles.find((c: any) => {
            const start = c.start_date
            let end = c.end_date || addDays(start, 4)
            return dateStr >= start && dateStr <= end
        })

        if (existingCycle) {
            // ... Delete/Shrink Logic ...
            const start = existingCycle.start_date
            const end = existingCycle.end_date || addDays(start, 4)

            if (dateStr === end) {
                if (start === end) {
                    showConfirm("Delete Period?", "Remove this single-day period log?", async () => {
                        await supabase.from('cycles').delete().eq('id', existingCycle.id)
                        fetchCycles()
                    }, "Delete")
                } else {
                    showConfirm("Shrink Period?", `Remove ${dateStr} from the period?`, async () => {
                        await supabase.from('cycles').update({ end_date: addDays(dateStr, -1) }).eq('id', existingCycle.id)
                        fetchCycles()
                    }, "Remove Date")
                }
            } else {
                showConfirm("Delete Period?", "This will delete the entire period range. Are you sure?", async () => {
                    await supabase.from('cycles').delete().eq('id', existingCycle.id)
                    fetchCycles()
                }, "Delete All")
            }
        } else {
            // ... Merge/Extend/Insert Logic ...
            const prevDay = addDays(dateStr, -1)
            const nextDay = addDays(dateStr, 1)

            const cycleEndingYesterday = currentCycles.find((c: any) => {
                const start = c.start_date
                let end = c.end_date || addDays(start, 4)
                return end === prevDay
            })
            const cycleStartingTomorrow = currentCycles.find((c: any) => c.start_date === nextDay)

            if (cycleEndingYesterday && cycleStartingTomorrow) {
                showConfirm("Merge Periods?", "Merge these period logs into one?", async () => {
                    const newEnd = cycleStartingTomorrow.end_date || addDays(cycleStartingTomorrow.start_date, 4)
                    await supabase.from('cycles').update({ end_date: newEnd }).eq('id', cycleEndingYesterday.id)
                    await supabase.from('cycles').delete().eq('id', cycleStartingTomorrow.id)
                    fetchCycles()
                }, "Merge")
            } else if (cycleEndingYesterday) {
                showConfirm("Extend Period?", `Extend period to include ${dateStr}?`, async () => {
                    await supabase.from('cycles').update({ end_date: dateStr }).eq('id', cycleEndingYesterday.id)
                    fetchCycles()
                }, "Extend")
            } else if (cycleStartingTomorrow) {
                showConfirm("Start Earlier?", `Start period earlier on ${dateStr}?`, async () => {
                    await supabase.from('cycles').update({ start_date: dateStr }).eq('id', cycleStartingTomorrow.id)
                    fetchCycles()
                }, "Update Start")
            } else {
                showConfirm("Log Period?", `Log period start on ${dateStr}?`, async () => {
                    await supabase.from('cycles').insert([{
                        user_id: session.user.id,
                        start_date: dateStr,
                        end_date: dateStr
                    }])
                    fetchCycles()
                }, "Log Period")
            }
        }
    }

    function getTileClassName({ date, view }: { date: Date, view: string }) {
        if (view === 'month') {
            const dStr = getLocalDateString(date)
            const classes = []

            if (periodDates.includes(dStr)) {
                const checkRelative = (offset: number) => {
                    const ref = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    ref.setDate(ref.getDate() + offset)
                    return periodDates.includes(getLocalDateString(ref))
                }
                const hasPrev = checkRelative(-1)
                const hasNext = checkRelative(1)

                if (hasPrev && hasNext) classes.push(styles.periodRangeMiddle)
                else if (!hasPrev && hasNext) classes.push(styles.periodRangeStart)
                else if (hasPrev && !hasNext) classes.push(styles.periodRangeEnd)
                else classes.push(styles.periodRangeSingle)
            } else if (predictedFertileDates.includes(dStr)) {
                const checkRelative = (offset: number) => {
                    const ref = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    ref.setDate(ref.getDate() + offset)
                    return predictedFertileDates.includes(getLocalDateString(ref))
                }
                const hasPrev = checkRelative(-1)
                const hasNext = checkRelative(1)

                if (hasPrev && hasNext) classes.push(styles.fertileRangeMiddle)
                else if (!hasPrev && hasNext) classes.push(styles.fertileRangeStart)
                else if (hasPrev && !hasNext) classes.push(styles.fertileRangeEnd)
                else classes.push(styles.fertileRangeSingle)
            } else if (predictedPeriodDates.includes(dStr)) {
                classes.push(styles.predictedPeriod)
            }

            if (dailyLogs[dStr]) {
                classes.push(styles.hasLog)
            }
            return classes.join(' ')
        }
        return null
    }

    const handleSaveLog = async () => {
        const dStr = getLocalDateString(date as Date)
        const { error } = await supabase
            .from('daily_logs')
            .upsert({
                user_id: session.user.id,
                date: dStr,
                mood: logForm.mood,
                symptoms: logForm.symptoms,
                basal_temp: logForm.basalTemp ? parseFloat(logForm.basalTemp) : null,
                cervical_mucus: logForm.mucus,
                lh_test: logForm.lhTest
            }, { onConflict: 'user_id, date' })

        if (error) showAlert("Error", error.message)
        else {
            setIsLogModalOpen(false)
            fetchCycles()
        }
    }

    const openLogModal = () => {
        const dStr = getLocalDateString(date as Date)
        const existing = dailyLogs[dStr] || {}
        setLogForm({
            mood: existing.mood || '',
            symptoms: existing.symptoms || [],
            basalTemp: existing.basal_temp?.toString() || '',
            mucus: existing.cervical_mucus || '',
            lhTest: existing.lh_test || ''
        })
        setIsLogModalOpen(true)
    }

    const downloadCSV = () => {
        // Collect all dates that have logs or periods
        const allDates = new Set([...Object.keys(dailyLogs), ...periodDates, ...predictedPeriodDates])
        const sortedDates = Array.from(allDates).sort()

        const headers = ["Date", "Cycle Day", "Phase", "Mood", "Symptoms", "Basal Temp", "Cervical Mucus", "LH Test"]
        const rows = sortedDates.map(dStr => {
            const dateObj = new Date(dStr)
            const log = dailyLogs[dStr] || {}

            // Re-calculate phase for each date in export (or use simple mapping if available)
            // For simplicity in export, we'll use the headers and data we have
            return [
                dStr,
                dateDayMap[dStr] || '',
                // Note: phase calculation for every past date might be slow, usually user wants the raw data markers
                '',
                log.mood || '',
                (log.symptoms || []).join('; '),
                log.basal_temp || '',
                log.cervical_mucus || '',
                log.lh_test || ''
            ].map(val => `"${val}"`).join(',')
        })

        const csvContent = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `period-tracker-data-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    async function updatePartnerEmail() {
        try {
            setLoading(true)
            const { user } = session
            const { error } = await supabase.from('profiles').update({
                partner_email: partnerEmail
            }).eq('id', user.id)
            if (error) throw error
            showAlert('Success', 'Partner email updated!')
        } catch (error) {
            showAlert('Error', 'Error updating profile!')
        } finally {
            setLoading(false)
        }
    }

    const generatePartnerToken = async () => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ partner_token: token })
                .eq('id', session.user.id)

            if (error) throw error
            // Update local profile state if possible, or just wait for next fetch
            setProfile((prev: any) => ({ ...prev, partner_token: token }))
            showAlert("Success", "Partner share link generated!")
        } catch (err) {
            console.error(err)
            showAlert("Error", "Failed to generate token. Please ensure your database is updated.")
        }
    }

    async function updateUserName() {
        try {
            setLoading(true)
            const { user } = session
            const { error } = await supabase.from('profiles').update({
                name: userName
            }).eq('id', user.id)
            if (error) throw error
            setProfile({ ...profile, name: userName })
            showAlert('Success', 'Name updated!')
        } catch (error: any) {
            console.error(error)
            showAlert('Error', `Error updating name! ${error.message || ''}. Please ensure the 'name' column exists in your 'profiles' table.`)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => { await supabase.auth.signOut() }

    const handleResetMonth = () => {
        const monthName = activeStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        showConfirm(`Reset ${monthName}?`, `This will delete current month's known cycles.`, async () => {
            const startOfMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1)
            const endOfMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 0)
            const startStr = getLocalDateString(startOfMonth)
            const endStr = getLocalDateString(endOfMonth)

            const { error } = await supabase
                .from('cycles')
                .delete()
                .eq('user_id', session.user.id)
                .gte('start_date', startStr)
                .lte('start_date', endStr)

            if (error) showAlert("Error", error.message)
            else {
                showAlert("Success", `Data for ${monthName} reset.`)
                fetchCycles()
            }
        }, "Reset Month")
    }

    const downloadPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.text("Period Tracker Report", 105, 20, { align: "center" })

        doc.setFontSize(14)
        doc.text(`User: ${formattedName}`, 20, 40)
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 50)

        doc.setFontSize(18)
        doc.text("Recent Cycles", 20, 70)
        doc.setFontSize(12)
        let y = 80
        cycles.slice(0, 10).forEach((c, i) => {
            doc.text(`${i + 1}. Start: ${c.start_date} | Phase: ${c.phase || 'N/A'}`, 25, y)
            y += 10
        })

        if (y > 250) { doc.addPage(); y = 20 }

        doc.setFontSize(18)
        doc.text("Daily Logs (Last 30 days)", 20, y + 10)
        y += 20
        const logEntries = Object.entries(dailyLogs).sort().reverse().slice(0, 30)
        logEntries.forEach(([date, log]: [string, any]) => {
            if (y > 260) { doc.addPage(); y = 20 }
            doc.setFontSize(10)
            doc.text(`${date}: Mood: ${log.mood || 'N/A'}`, 25, y)
            y += 5
            doc.setFontSize(9)
            doc.text(`Symptoms: ${log.symptoms?.join(', ') || 'None'}`, 30, y)
            y += 5
            if (log.basal_temp || log.cervical_mucus || log.lh_test) {
                doc.text(`Medical: Temp: ${log.basal_temp || '--'}°C, Mucus: ${log.cervical_mucus || '--'}, LH: ${log.lh_test || '--'}`, 30, y)
                y += 5
            }
            y += 3
        })

        doc.save(`period-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    if (loading && !profile) return <div className={styles.loading}>Loading Dashboard...</div>

    const formattedName = (userName && userName.trim().length > 0)
        ? userName.trim().charAt(0).toUpperCase() + userName.trim().slice(1)
        : (profile?.email
            ? (() => {
                const prefix = profile.email.split('@')[0].split(/[._]/)[0].replace(/[0-9]/g, '');
                return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'User';
            })()
            : 'User')

    // Graph Data
    const graphData = cycles.slice(0, 6).reverse().map(c => {
        const start = new Date(c.start_date)
        const end = new Date(c.end_date || c.start_date)
        let e = c.end_date ? new Date(c.end_date) : new Date(start)
        if (!c.end_date) e.setDate(e.getDate() + 4)

        const diff = Math.floor((e.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return {
            date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            length: diff
        }
    })

    // BBT Trend Data
    const bbtData = Object.entries(dailyLogs)
        .filter(([_, log]) => log.basal_temp)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .slice(-30)
        .map(([date, log]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: parseFloat(log.basal_temp)
        }))


    return (
        <div className={styles.dashboard} style={{
            paddingLeft: activeTab === 'knowledge' ? '80px' : undefined, // Maintain a small gap for sidebar but remove the rest
            paddingRight: activeTab === 'knowledge' ? '0' : undefined,
            paddingTop: activeTab === 'knowledge' ? '1rem' : undefined
        }}>
            {/* Toast System */}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.type] || ''}`}>
                        {toast.text}
                    </div>
                ))}
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel || closeModal}
                confirmText={modalConfig.confirmText}
                isAlert={modalConfig.isAlert}
            />

            {activeTab !== 'knowledge' && (
                <header className={styles.header} style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingBottom: '2.5rem',
                    width: '100%'
                }}>
                    <div style={{ flex: 1, paddingRight: '140px' }}>
                        <h1 style={{ fontSize: isDesktop ? '3.2rem' : '2.2rem', marginBottom: '0.25rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>Hey, {formattedName}</h1>
                        <p style={{ fontSize: '1.1rem', color: '#666', fontWeight: 400 }}>Your health overview for today</p>
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }}>
                            <div
                                className={styles.notificationBell}
                                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                            >
                                🔔
                                {notifications.filter(n => n.unread).length > 0 && (
                                    <span className={styles.unreadBadge}>
                                        {notifications.filter(n => n.unread).length}
                                    </span>
                                )}
                            </div>

                            {/* Notification Panel */}
                            {isNotificationPanelOpen && (
                                <div className={styles.notificationPanel}>
                                    <div className={styles.notificationHeader}>
                                        <h4>Notifications</h4>
                                        <button
                                            className={styles.markAllBtn}
                                            onClick={() => {
                                                setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
                                            }}
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className={styles.notificationList}>
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`${styles.notificationItem} ${n.unread ? styles.unread : ''}`}
                                                    onClick={() => {
                                                        setNotifications(prev => prev.map(notif =>
                                                            notif.id === n.id ? { ...notif, unread: false } : notif
                                                        ))
                                                    }}
                                                >
                                                    <p>{discreetMode ? n.text.replace(/Ovulation|Period/gi, (match: string) => match.toLowerCase().includes('ovulation') ? 'Peak' : 'Start') : n.text}</p>
                                                    <span className={styles.notificationTime}>{n.time}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.emptyNotifications}>
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setDiscreetMode(!discreetMode)}
                            className="btn-secondary"
                            style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                background: discreetMode ? '#333' : '#fff',
                                color: discreetMode ? '#fff' : '#333',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{discreetMode ? '🔓' : '🔒'}</span>
                            {discreetMode ? 'Reveal Data' : 'Discreet Mode'}
                        </button>
                    </div>
                </header>
            )}

            <div className={styles.grid} style={{
                gridTemplateColumns: (activeTab === 'profile' || activeTab === 'knowledge') ? '1fr' :
                    (activeTab === 'graph' && isDesktop) ? '0.8fr 1.5fr 1fr' :
                        (activeTab === 'home' && isDesktop) ? '1fr 1.5fr' : '1fr 1.5fr 1fr',
                paddingBottom: '2rem',
                width: activeTab === 'knowledge' ? '100%' : undefined,
                maxWidth: activeTab === 'knowledge' ? '100vw' : undefined,
                margin: activeTab === 'knowledge' ? '0' : '0 auto'
            }}>
                {/* LEFT COLUMN: Cycle Info */}
                <div className="mobile-view-wrapper" style={{ display: (activeTab === 'home' || activeTab === 'graph') ? 'block' : 'none' }}>
                    <div className={`${styles.card} ${styles.cycleCard}`} style={{
                        padding: activeTab === 'graph' && isDesktop ? '1rem' : '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: activeTab === 'graph' && isDesktop ? '2.5rem' : '3rem' }}>{cycleDay}</h2>
                            <span className={`${styles.phaseName} ${styles.tooltip}`}>
                                {discreetMode ? 'Status' : (phase || 'Calculating...')}
                                <span className={styles.tooltipText}>
                                    {discreetMode
                                        ? 'Confidential cycle status'
                                        : (() => {
                                            if (phase === 'Menstrual') return "The shedding of the uterine lining (your period).";
                                            if (phase === 'Follicular') return "Estrogen rises as follicles mature for ovulation.";
                                            if (phase === 'Ovulation') return "The release of an egg; your most fertile window.";
                                            if (phase === 'Luteal') return "Post-ovulation; uterine lining thickens for potential pregnancy.";
                                            return `You are currently in the ${phase} phase.`;
                                        })()
                                    }
                                </span>
                            </span>
                        </div>
                        <p className={`${styles.phaseDesc} ${styles.tooltip}`} style={{ fontSize: '1rem', marginTop: '0' }}>
                            {discreetMode ? 'Metric A' : 'Day of cycle'}
                            <span className={styles.tooltipText}>{discreetMode ? 'Confidential time marker' : 'Number of days since your last period started.'}</span>
                        </p>

                        <div style={{ margin: '2rem 0', height: '12px', background: '#F0F0F0', borderRadius: '6px', position: 'relative' }}>
                            <div style={{
                                width: `${Math.min((cycleDay / 28) * 100, 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #FF9A9E 0%, #FECFEF 100%)',
                                borderRadius: '6px'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                left: `${Math.min((cycleDay / 28) * 100, 100)}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                border: '4px solid #FECFEF',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}></div>
                        </div>


                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                            <span>{discreetMode ? 'Start' : 'Period'}</span>
                            <span>{discreetMode ? 'Peak' : 'Ovulation'}</span>
                            <span>{discreetMode ? 'Target' : 'Next Period'}</span>
                        </div>

                        {/* Selected Date Log Summary */}
                        {dailyLogs[getLocalDateString(date as Date)] && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#555' }}>
                                    Logs for {new Date(date as Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {dailyLogs[getLocalDateString(date as Date)].mood && (
                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#E3F2FD', color: '#1565C0', borderRadius: '10px' }}>
                                            {dailyLogs[getLocalDateString(date as Date)].mood}
                                        </span>
                                    )}
                                    {dailyLogs[getLocalDateString(date as Date)].basal_temp && (
                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#F3E5F5', color: '#7B1FA2', borderRadius: '10px' }}>
                                            {dailyLogs[getLocalDateString(date as Date)].basal_temp}°C
                                        </span>
                                    )}
                                    {dailyLogs[getLocalDateString(date as Date)].cervical_mucus && (
                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#E0F2F1', color: '#00796B', borderRadius: '10px' }}>
                                            {dailyLogs[getLocalDateString(date as Date)].cervical_mucus}
                                        </span>
                                    )}
                                    {dailyLogs[getLocalDateString(date as Date)].lh_test && (
                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#FFF3E0', color: '#E65100', borderRadius: '10px' }}>
                                            {discreetMode ? 'Ind' : 'LH'}: {dailyLogs[getLocalDateString(date as Date)].lh_test}
                                        </span>
                                    )}
                                    {dailyLogs[getLocalDateString(date as Date)].symptoms?.map((s: string) => (
                                        <span key={s} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#FFEBEE', color: '#C62828', borderRadius: '10px' }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>




                    {/* Hormonal Roadmap Card */}
                    {activeTab === 'home' && (
                        <div className={styles.card} style={{ marginTop: '1.5rem', borderLeft: '4px solid #FF6B99', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {discreetMode ? '💡 Insights' : '🗺️ Hormonal Roadmap'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '0.8rem', background: '#FCECF0', borderRadius: '12px' }}>
                                    <strong style={{ color: '#FF6B99', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        {discreetMode ? 'Nutrition' : '🥗 Nutrition Tip'}
                                    </strong>
                                    <p style={{ fontSize: '0.85rem', margin: 0, color: '#444' }}>{phase ? maskSensitiveText(PHASE_TIPS[phase]?.nutrition) : '...'}</p>
                                </div>
                                <div style={{ padding: '0.8rem', background: '#E0F2F1', borderRadius: '12px' }}>
                                    <strong style={{ color: '#00796B', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        {discreetMode ? 'Movement' : '🧘 Exercise Tip'}
                                    </strong>
                                    <p style={{ fontSize: '0.85rem', margin: 0, color: '#444' }}>{phase ? maskSensitiveText(PHASE_TIPS[phase]?.exercise) : '...'}</p>
                                </div>
                                <div style={{ padding: '0.8rem', background: '#FFF8E1', borderRadius: '12px' }}>
                                    <strong style={{ color: '#F57F17', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        {discreetMode ? 'Observation' : '✨ Phase Insight'}
                                    </strong>
                                    <p style={{ fontSize: '0.85rem', margin: 0, color: '#444' }}>{phase ? maskSensitiveText(PHASE_TIPS[phase]?.insight) : '...'}</p>
                                </div>
                                <div style={{ padding: '0.8rem', background: '#E8EAF6', borderRadius: '12px', border: '1px dashed #C5CAE9' }}>
                                    <strong style={{ color: '#3F51B5', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        {discreetMode ? 'Patterns' : '🔍 Symptom Patterns'}
                                    </strong>
                                    <p style={{ fontSize: '0.85rem', margin: 0, color: '#444' }}>
                                        {(() => {
                                            const recentLogs = Object.values(dailyLogs).slice(0, 15);
                                            const symptoms = recentLogs.flatMap((log: any) => log.symptoms || []);
                                            const counts = symptoms.reduce((acc: any, s: string) => {
                                                acc[s] = (acc[s] || 0) + 1;
                                                return acc;
                                            }, {});
                                            const topSymptom = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                                            return topSymptom
                                                ? `"${topSymptom[0]}" is your most logged symptom recently. It often flags during the ${discreetMode ? 'current' : (phase || 'current')} phase for you.`
                                                : "Keep logging symptoms daily to see long-term hormonal patterns!";
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>



                {/* CENTER COLUMN: Calendar & Graph */}
                <div className="mobile-view-wrapper" style={{ display: (activeTab === 'home' || activeTab === 'graph' || (isDesktop && activeTab !== 'profile' && activeTab !== 'knowledge')) ? 'block' : 'none', width: '100%' }}>

                    {/* Calendar View */}
                    <div className={styles.card} style={{ minHeight: '400px', display: (activeTab === 'graph' && !isDesktop) ? 'none' : 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Calendar</h3>
                            <button
                                onClick={handleResetMonth}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ff4d4f',
                                    color: '#ff4d4f',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}
                            >
                                Clear Month's Logs
                            </button>
                        </div>
                        <div className={styles.calendarWrapper}>
                            <Calendar
                                onChange={setDate}
                                value={date}
                                onClickDay={handleDayClick}
                                tileClassName={getTileClassName}
                                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate || new Date())}
                            />
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <h4>Legend</h4>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#FF6B99', borderRadius: '50%' }}></span> {discreetMode ? 'Event' : 'Period'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ width: '10px', height: '10px', border: '2px dashed #ff9a9e', borderRadius: '50%' }}></span> {discreetMode ? 'Future' : 'Predicted'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#4A4E50', borderRadius: '50%' }}></span> {discreetMode ? 'Window' : 'Fertile'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ width: '6px', height: '6px', background: '#ffd700', borderRadius: '50%' }}></span> Logs
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graph View (hidden on desktop graph tab, shown on mobile graph tab or other tabs) */}
                    <div className={styles.card} style={{
                        minHeight: '300px',
                        display: activeTab === 'graph' && isDesktop ? 'none' : (activeTab === 'graph' ? 'block' : 'none'),
                        marginTop: isDesktop ? '1rem' : '0'
                    }}>
                        <h3>{discreetMode ? 'Data History' : 'Cycle History'}</h3>
                        <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis hide />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="length" fill="#ff9a9e" radius={[10, 10, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginTop: '1rem' }}>
                            {discreetMode ? 'Historical Lengths' : 'Last 6 Cycles Duration'}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: Graph (shown on graph page as 3rd column) */}
                <div className="mobile-view-wrapper" style={{ display: activeTab === 'graph' && isDesktop ? 'block' : 'none' }}>
                    <div className={styles.card} style={{ minHeight: '400px' }}>
                        <h3>{discreetMode ? 'Data History' : 'Cycle History'}</h3>
                        <div style={{ width: '100%', height: 350, marginTop: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis hide />
                                    <RechartsTooltip />
                                    <Bar dataKey="length" fill="#FF6B99" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
                            {discreetMode ? 'Historical Lengths' : 'Last 6 Cycles Duration'}
                        </p>
                    </div>

                    {/* BBT Trend Chart */}
                    <div className={styles.card} style={{ height: '400px', display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{discreetMode ? 'Metric B Trend' : 'Basal Body Temperature Trend'}</h3>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            {bbtData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={bbtData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#888' }}
                                        />
                                        <YAxis
                                            domain={['dataMin - 0.2', 'dataMax + 0.2']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#888' }}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="#FF6B99"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#FF6B99', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem' }}>
                                    {discreetMode ? 'No Metric B data logged in the last 30 days.' : 'No BBT data logged in the last 30 days.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KNOWLEDGE SECTION */}
                <div style={{
                    display: activeTab === 'knowledge' ? 'block' : 'none',
                    width: '100%',
                    margin: 0,
                    padding: 0
                }}>
                    <KnowledgeHub discreetMode={discreetMode} />
                </div>

                {/* PROFILE SECTION */}
                <div className="mobile-view-wrapper" style={{
                    display: activeTab === 'profile' ? 'block' : 'none',
                    gridColumn: activeTab === 'profile' ? '1 / -1' : 'auto'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
                        gap: '1rem'
                    }}>
                        {/* User Information */}
                        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3>User Information</h3>
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                                    {!isEditingName && userName ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ fontWeight: 500, flex: 1 }}>{userName}</div>
                                            <button onClick={() => setIsEditingName(true)} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Edit</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                placeholder="Enter your name"
                                                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                            <button
                                                onClick={async () => { await updateUserName(); setIsEditingName(false); }}
                                                className="btn-primary"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{session?.user?.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Account Created</label>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{new Date(session?.user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>

                        {/* Cycle Statistics */}
                        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3>{discreetMode ? 'Summary Metrics' : 'Cycle Statistics'}</h3>
                            <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '0.75rem', flex: 1 }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>{discreetMode ? 'Metric A Length' : 'Avg Cycle Length'}</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#FF6B99' }}>
                                        {cycles.length > 1 ? (() => {
                                            const sorted = [...cycles].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                                            let totalDays = 0, gaps = 0
                                            for (let i = 1; i < sorted.length; i++) {
                                                const diff = (new Date(sorted[i].start_date).getTime() - new Date(sorted[i - 1].start_date).getTime()) / (1000 * 60 * 60 * 24)
                                                if (diff > 20 && diff < 40) { totalDays += diff; gaps++ }
                                            }
                                            return gaps > 0 ? Math.round(totalDays / gaps) : 28
                                        })() : 28} days
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>{discreetMode ? 'Metric B Duration' : 'Avg Period'}</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#FF6B99' }}>
                                        {cycles.length > 0 ? Math.round(cycles.reduce((sum, c) => sum + (c.duration || 0), 0) / cycles.length) || 4 : 4} days
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>{discreetMode ? 'Next Target' : 'Next Period'}</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FF6B99' }}>
                                        {predictedPeriodDates.length > 0 ? new Date(predictedPeriodDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Regularity</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FF6B99' }}>
                                        {(() => {
                                            if (cycles.length < 3) return 'Need data';
                                            const lengths = [];
                                            const sorted = [...cycles].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                                            for (let i = 1; i < sorted.length; i++) {
                                                lengths.push((new Date(sorted[i].start_date).getTime() - new Date(sorted[i - 1].start_date).getTime()) / (1000 * 60 * 60 * 24));
                                            }
                                            const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
                                            const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
                                            const stdDev = Math.sqrt(variance);
                                            if (stdDev < 2) return 'Stable';
                                            if (stdDev < 4) return 'Moderate';
                                            return 'Variable';
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Total Cycles</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FF6B99' }}>{cycles.length}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Total Logs</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FF6B99' }}>{Object.keys(dailyLogs).length}</div>
                                </div>
                            </div>
                        </div>




                        {/* Partner Connectivity */}
                        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3>Partner Connectivity</h3>
                            <p className={styles.infoText}>We'll send them tips when it matters.</p>
                            <div style={{ flex: 1 }}>
                                {!isEditingPartner && profile?.partner_email ? (
                                    <div className={styles.flexRow} style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{profile.partner_email}</span>
                                        <button onClick={() => setIsEditingPartner(true)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Edit</button>
                                    </div>
                                ) : (
                                    <div className={styles.inputGroup}>
                                        <label>Partner's Email</label>
                                        <div className={styles.flexRow}>
                                            <input
                                                type="email"
                                                value={partnerEmail}
                                                onChange={(e) => setPartnerEmail(e.target.value)}
                                                placeholder="partner@example.com"
                                            />
                                            <button
                                                onClick={async () => { await updatePartnerEmail(); setIsEditingPartner(false); }}
                                                className="btn-primary"
                                                disabled={!partnerEmail}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {profile?.partner_email && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#F3E5F5', borderRadius: '12px', border: '1px solid #E1BEE7' }}>
                                        <strong style={{ color: '#7B1FA2', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                            {discreetMode ? 'Support Tip' : `💡 How to support her in the ${phase} phase`}
                                        </strong>
                                        <p style={{ fontSize: '0.85rem', margin: 0, color: '#4A148C', lineHeight: '1.4' }}>
                                            {phase ? maskSensitiveText(PARTNER_TIPS[phase as keyof typeof PARTNER_TIPS]) : '...'}
                                        </p>
                                    </div>
                                )}

                                <div style={{ marginTop: '1rem', padding: '1.2rem', background: '#F0F4FF', borderRadius: '16px', border: '1px solid #D1E3FF' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1A73E8', fontSize: '0.95rem' }}>
                                        🔗 Partner Share Link
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: '#5F6368', marginBottom: '1rem' }}>
                                        Share your cycle status with your partner without sharing your password.
                                    </p>

                                    {profile?.partner_token ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{
                                                background: 'white', padding: '0.5rem', borderRadius: '8px',
                                                fontSize: '0.75rem', color: '#888', wordBreak: 'break-all',
                                                border: '1px solid #E8EAED'
                                            }}>
                                                {typeof window !== 'undefined' ? `${window.location.origin}/partner/${profile.partner_token}` : ''}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/partner/${profile.partner_token}`
                                                    navigator.clipboard.writeText(url)
                                                    showAlert("Copied!", "Link copied to clipboard.")
                                                }}
                                                className="btn-primary"
                                                style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                                            >
                                                Copy Link
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={!profile?.partner_email ? styles.tooltip : ""} style={{ width: '100%' }}>
                                            <button
                                                onClick={generatePartnerToken}
                                                className="btn-primary"
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.85rem',
                                                    opacity: !profile?.partner_email ? 0.6 : 1,
                                                    cursor: !profile?.partner_email ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={!profile?.partner_email}
                                            >
                                                Generate Share Link
                                            </button>
                                            {!profile?.partner_email && (
                                                <span className={styles.tooltipText} style={{ bottom: '125%', left: '50%', transform: 'translateX(-50%)', marginLeft: 0 }}>
                                                    Please save a partner's email first to enable sharing.
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Management & Account */}
                        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3>Management & Account</h3>
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                <button
                                    onClick={downloadPDF}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Download Data as PDF
                                </button>
                                <button
                                    onClick={downloadCSV}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Export All Data (CSV)
                                </button>


                                <button
                                    onClick={() => {
                                        showConfirm(
                                            'Delete All Data',
                                            'Are you sure you want to delete ALL your cycle and log data? This cannot be undone!',
                                            () => {
                                                Promise.all([
                                                    supabase.from('cycles').delete().eq('user_id', session.user.id),
                                                    supabase.from('daily_logs').delete().eq('user_id', session.user.id)
                                                ]).then(() => {
                                                    setCycles([])
                                                    setDailyLogs({})
                                                    setPeriodDates([])
                                                    showAlert('Success', 'All data deleted successfully')
                                                })
                                            },
                                            'Delete All'
                                        )
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Delete All Data
                                </button>
                                <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }} />
                                <button
                                    onClick={() => {
                                        showConfirm(
                                            'Delete Account',
                                            'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone!',
                                            () => {
                                                showConfirm(
                                                    'Final Warning',
                                                    'This is your final warning. Delete account and all data permanently?',
                                                    () => {
                                                        supabase.auth.admin.deleteUser(session.user.id).then(() => {
                                                            showAlert('Account Deleted', 'Your account has been permanently removed.')
                                                            window.location.href = '/'
                                                        })
                                                    },
                                                    'Permanently Delete'
                                                )
                                            },
                                            'Delete'
                                        )
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%', background: '#d32f2f' }}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Day Detail Modal (Unified) */}
            {isDayModalOpen && (
                <div className={styles.modalOverlay}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsDayModalOpen(false) }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                    }}
                >
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{getLocalDateString(date as Date)}</h3>
                            <button onClick={() => setIsDayModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Period Action Section */}
                        <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#FFF0F5', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 600, color: '#b71c1c' }}>{discreetMode ? 'Event' : 'Period'}</span>
                                <button
                                    onClick={handlePeriodAction}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: periodDates.includes(getLocalDateString(date as Date)) ? 'white' : '#ff4d4f',
                                        color: periodDates.includes(getLocalDateString(date as Date)) ? '#ff4d4f' : 'white',
                                        border: periodDates.includes(getLocalDateString(date as Date)) ? '1px solid #ff4d4f' : 'none',
                                        borderRadius: '8px', cursor: 'pointer', fontWeight: 500
                                    }}
                                >
                                    {periodDates.includes(getLocalDateString(date as Date)) ? 'Edit / Remove' : (discreetMode ? 'Log Event' : 'Log Period')}
                                </button>
                            </div>
                        </div>

                        {/* Daily Log Section */}
                        <div style={{ margin: '1.5rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mood</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Happy', 'Calm', 'Irritable', 'Sad', 'Anxious', 'Energetic'].map(m => (
                                    <button key={m}
                                        onClick={() => setLogForm(prev => ({ ...prev, mood: prev.mood === m ? '' : m }))}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '20px', border: 'none',
                                            background: logForm.mood === m ? '#FF6B99' : '#f0f0f0',
                                            color: logForm.mood === m ? 'white' : '#666',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ margin: '1.5rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Symptoms</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Cramps', 'Headache', 'Bloating', 'Acne', 'Fatigue', 'Cravings'].map(s => (
                                    <button key={s}
                                        onClick={() => {
                                            const exists = logForm.symptoms.includes(s)
                                            setLogForm(prev => ({
                                                ...prev,
                                                symptoms: exists ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]
                                            }))
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '20px', border: 'none',
                                            background: logForm.symptoms.includes(s) ? '#FF8A65' : '#f0f0f0',
                                            color: logForm.symptoms.includes(s) ? 'white' : '#666',
                                            cursor: 'pointer'
                                        }}
                                    >
                                    </button>
                                ))}
                            </div>
                            {/* Custom Symptom Addition */}
                            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={customSymptom}
                                    onChange={(e) => setCustomSymptom(e.target.value)}
                                    placeholder="Add custom..."
                                    style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', fontSize: '0.85rem' }}
                                />
                                <button
                                    onClick={() => {
                                        if (customSymptom.trim()) {
                                            if (!logForm.symptoms.includes(customSymptom.trim())) {
                                                setLogForm(prev => ({ ...prev, symptoms: [...prev.symptoms, customSymptom.trim()] }))
                                            }
                                            setCustomSymptom('')
                                        }
                                    }}
                                    style={{ padding: '0.45rem 1rem', background: '#FF8A65', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Medical Markers Section */}
                        <div style={{ margin: '1.5rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>
                                {discreetMode ? 'Biomarkers' : 'Biological Markers'}
                            </label>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                    {discreetMode ? 'Metric A' : 'Basal Temperature (°C)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={logForm.basalTemp}
                                    onChange={(e) => setLogForm(prev => ({ ...prev, basalTemp: e.target.value }))}
                                    placeholder="e.g. 36.50"
                                    style={{
                                        width: '100%', padding: '0.6rem 1rem', borderRadius: '20px',
                                        border: '1px solid #eee', background: '#f9f9f9', outline: 'none',
                                        fontSize: '0.9rem', color: '#333'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                    {discreetMode ? 'Texture' : 'Cervical Mucus'}
                                </label>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {['Dry', 'Sticky', 'Creamy', 'Watery', 'Eggwhite'].map(type => (
                                        <button key={type}
                                            onClick={() => setLogForm(prev => ({ ...prev, mucus: prev.mucus === type ? '' : type }))}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '20px', border: 'none',
                                                background: logForm.mucus === type ? '#9CCC65' : '#f0f0f0',
                                                color: logForm.mucus === type ? 'white' : '#666',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                                            }}
                                        >
                                            {type === 'Eggwhite' ? (discreetMode ? 'Optimal' : 'Egg White') : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                    {discreetMode ? 'Test Result' : 'LH Ovulation Test'}
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Negative', 'Positive', 'Peak'].map(res => (
                                        <button key={res}
                                            onClick={() => setLogForm(prev => ({ ...prev, lhTest: prev.lhTest === res ? '' : res }))}
                                            style={{
                                                flex: 1, padding: '0.5rem 1rem', borderRadius: '20px', border: 'none',
                                                background: logForm.lhTest === res ? '#9CCC65' : '#f0f0f0',
                                                color: logForm.lhTest === res ? 'white' : '#666',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                                            }}
                                        >
                                            {res}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => { handleSaveLog(); setIsDayModalOpen(false); }} style={{ flex: 1, padding: '1rem', background: '#FF6B99', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Save Daily Log</button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    )
}
