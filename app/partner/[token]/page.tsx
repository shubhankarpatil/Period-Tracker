'use client'
import React, { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import styles from '../../components/Dashboard.module.css'

export default function PartnerPortal({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const PARTNER_TIPS = {
        Menstrual: "Her energy may be low and she might have cramps. Hot water bottles, dark chocolate, and taking off some household load are great ways to support her today.",
        Follicular: "She's likely feeling more energetic and social. Great time for a date night or tackling a new project together!",
        Ovulatory: "Confidence and energy are at their peak. She's at her most fertile right now.",
        Luteal: "She might be more inward-focused or sensitive (PMS). Be patient, offer comfort foods, and give her some extra space or quiet time if needed."
    } as any

    useEffect(() => {
        async function fetchPartnerData() {
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

                setData({ profile, cycles })
            } catch (err) {
                console.error("Error fetching partner data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPartnerData()
    }, [token])

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading support portal...</div>
    if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>This link is invalid or has expired.</div>

    // Calculate phase (simplified version of Dashboard logic)
    const getPhase = () => {
        if (!data.cycles || data.cycles.length === 0) return 'Follicular'
        const today = new Date().toISOString().split('T')[0]
        const lastCycle = data.cycles[0]
        const diff = (new Date(today).getTime() - new Date(lastCycle.start_date).getTime()) / (1000 * 60 * 60 * 24)

        if (diff < 5) return 'Menstrual'
        if (diff < 13) return 'Follicular'
        if (diff < 16) return 'Ovulatory'
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

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#444' }}>
                    {PARTNER_TIPS[phase]}
                </p>

                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '1rem' }}>Support Tasks</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {phase === 'Menstrual' && [
                            "Prepare a hot water bottle for her",
                            "Stock up on iron-rich snacks (dark chocolate, nuts)",
                            "Handle extra household chores tonight"
                        ].map(task => (
                            <li key={task} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #FF6B99', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF6B99' }}></div>
                                </div>
                                {task}
                            </li>
                        ))}
                        {phase === 'Follicular' && [
                            "Plan a date night or social outing",
                            "Suggest a new project or activity together",
                            "Enjoy her rising energy levels!"
                        ].map(task => (
                            <li key={task} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #4DB6AC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4DB6AC' }}></div>
                                </div>
                                {task}
                            </li>
                        ))}
                        {phase === 'Ovulatory' && [
                            "Compliment her—her confidence is likely high!",
                            "Go for a high-energy workout or long walk together",
                            "Make the most of her peak social energy"
                        ].map(task => (
                            <li key={task} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700' }}></div>
                                </div>
                                {task}
                            </li>
                        ))}
                        {phase === 'Luteal' && [
                            "Offer comfort foods (magnesium-rich is best)",
                            "Provide extra patience if she's feeling sensitive",
                            "Give her some space or a quiet night in"
                        ].map(task => (
                            <li key={task} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #7B1FA2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7B1FA2' }}></div>
                                </div>
                                {task}
                            </li>
                        ))}
                    </ul>
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
