'use client'
import React, { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../components/Dashboard.module.css'

export default function PartnerPortal({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [data, setData] = useState<any>(null)
    const [supportTasks, setSupportTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPartnerData = async () => {
        try {
            // Fetch profile first to get user_id
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('partner_token', token)
                .single()

            if (profileError) throw profileError

            // Fetch most recent cycle logs for phase calculation
            const { data: cycles, error: cycleError } = await supabase
                .from('cycles')
                .select('*')
                .eq('user_id', profile.id)
                .order('start_date', { ascending: false })

            if (cycleError) throw cycleError

            // Fetch dynamic support tasks
            const { data: tasks, error: tasksError } = await supabase
                .from('supplies')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: true })

            if (!tasksError) setSupportTasks(tasks || [])

            setData({ profile, cycles })
        } catch (err) {
            console.error("Error fetching partner data:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPartnerData()
    }, [token])

    const PARTNER_TIPS = {
        Menstrual: "Her energy may be low and she might have cramps. Hot water bottles, dark chocolate, and taking off some household load are great ways to support her today.",
        Follicular: "She's likely feeling more energetic and social. Great time for a date night or tackling a new project together!",
        Ovulatory: "Confidence and energy are at their peak. She's at her most fertile right now.",
        Luteal: "She might be more inward-focused or sensitive (PMS). Be patient, offer comfort foods, and give her some extra space or quiet time if needed."
    } as any

    const toggleSupportTask = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('supplies')
                .update({ is_checked: !currentStatus })
                .eq('id', id)
            if (error) throw error
            setSupportTasks(prev => prev.map(t => t.id === id ? { ...t, is_checked: !currentStatus } : t))
        } catch (err) {
            console.error("Error toggling task:", err)
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading support portal...</div>
    if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>This link is invalid or has expired.</div>

    // Calculate phase (simplified version of Dashboard logic)
    const getPhase = () => {
        if (!data.cycles || data.cycles.length === 0) return 'Follicular'

        const today = new Date()
        const lastCycle = data.cycles[0]

        const [sYear, sMonth, sDay] = lastCycle.start_date.split('-').map(Number)
        const start = new Date(sYear, sMonth - 1, sDay)

        const diffTime = today.getTime() - start.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

        if (diffDays <= 5) return 'Menstrual'
        if (diffDays <= 14) return 'Follicular'
        if (diffDays <= 21) return 'Ovulatory'
        return 'Luteal'
    }

    const phase = getPhase()

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.4rem', color: '#FF6B99', marginBottom: '0.5rem' }}>Partner Support Portal</h1>
                <p style={{ color: '#666' }}>Helping you support {data.profile.name || 'your partner'}</p>
            </header>

            <div className={styles.card} style={{ borderLeft: '6px solid #FF6B99', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{
                        background: '#FCECF0', color: '#FF6B99',
                        padding: '0.4rem 1rem', borderRadius: '20px',
                        fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase'
                    }}>
                        {phase} Phase
                    </span>
                    <h2 style={{ marginTop: '1.2rem', fontSize: '1.8rem' }}>How to support her today</h2>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: '#F3E5F5',
                    borderRadius: '12px',
                    border: '1px solid #E1BEE7'
                }}>
                    <strong style={{ color: '#7B1FA2', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                        💡 How to support her in the {phase} phase
                    </strong>
                    <p style={{ fontSize: '1.05rem', margin: 0, color: '#4A148C', lineHeight: '1.6' }}>
                        {PARTNER_TIPS[phase]}
                    </p>
                </div>

                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '1.5rem' }}>🤝 Active Support Checklist</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {supportTasks.length > 0 ? supportTasks.map(task => (
                            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    checked={task.is_checked}
                                    onChange={() => toggleSupportTask(task.id, task.is_checked)}
                                    className={styles.supportTaskCheckbox}
                                />
                                <span className={`${styles.supportTaskText} ${task.is_checked ? styles.supportTaskTextChecked : ''}`}>
                                    {task.item}
                                </span>
                            </div>
                        )) : (
                            <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
                                No specific tasks requested yet. Just being there helps!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ marginTop: '1.5rem', background: '#f8f9fa' }}>
                <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>Support Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Phase Update:</strong> She's entered the {phase} phase.</p>
                        <span style={{ fontSize: '0.7rem', color: '#999' }}>Just now</span>
                    </div>
                </div>
            </div>

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                <p>This is a temporary, secure view. Data is encrypted and read-only.</p>
            </footer>
        </div>
    )
}
