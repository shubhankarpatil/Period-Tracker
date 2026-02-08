'use client'
import React, { useState } from 'react'
import styles from './Dashboard.module.css'

export default function KnowledgeHub({ discreetMode = false }: { discreetMode?: boolean }) {
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const mask = (text: string) => {
        if (!discreetMode || !text) return text
        return text.replace(/Ovulation|Period|Menstrual|Luteal|Follicular/gi, (match: string) => {
            const low = match.toLowerCase()
            if (low === 'ovulation') return 'Peak'
            if (low === 'period' || low === 'menstrual') return 'Start'
            if (low === 'luteal') return 'Phase B'
            if (low === 'follicular') return 'Phase A'
            return 'Event'
        })
    }

    const sections = [
        {
            title: "Basics & Anatomy",
            items: [
                {
                    title: "Anatomy: The Powerhouse",
                    summary: "Beyond the basics: The Endocrine role of the ovaries and the uterine 'Nest'.",
                    icon: "🧬",
                    details: {
                        intro: "Reproductive anatomy is a sophisticated communication network between the brain and the body.",
                        bullets: [
                            "Ovaries: They aren't just egg storage; they are primary endocrine glands producing the hormones that drive your life.",
                            "Endometrium: The uterine lining that thickens to 10-12mm to prepare for a 'nest'. If no egg is fertilized, this complex tissue sheds.",
                            "HPG Axis: The 'Hypothalamic-Pituitary-Gonadal' axis is the radio signal from your brain that tells your body when to cycle."
                        ],
                        myth: "The uterus is just for babies.",
                        fact: "Hormones produced by the reproductive system impact bone density, heart health, and cognitive function throughout your life."
                    }
                },
                {
                    title: "The Hormonal Symphony",
                    summary: "Meet the 4 key players: FSH, LH, Estrogen, and Progesterone.",
                    icon: "🔄",
                    details: {
                        intro: "Your cycle is driven by an 'orchestra' of four master hormones rising and falling in perfect sequence.",
                        bullets: [
                            "FSH (Follicle Stimulating Hormone): The 'Start' signal. It recruits follicles in the ovaries to grow.",
                            "Estrogen: The 'Builder'. It thickens your lining and boosts your mood, skin, and energy levels.",
                            "LH (Luteinizing Hormone): The 'Trigger'. A massive surge in LH causes the dominant follicle to release an egg (Ovulation).",
                            "Progesterone: The 'Calmer'. After ovulation, it stabilizes the lining and raises your core body temperature."
                        ],
                        myth: "Hormones are only active during your period.",
                        fact: "Your hormonal levels are changing every single day of the month, influencing everything from metabolism to sleep quality."
                    }
                },
                {
                    title: "Cycle Engineering",
                    summary: "Why 28 days? Understanding variability, stress, and the biological clock.",
                    icon: "⚙️",
                    details: {
                        intro: "While 28 days is the 'textbook' average, a healthy range is actually 21 to 35 days.",
                        bullets: [
                            "The Follicular Variable: The first half of your cycle can vary based on stress, travel, or illness, as the body waits for a 'safe' time to ovulate.",
                            "The Luteal Constant: The second half of your cycle is usually a very steady 12-14 days. If it's shorter, it might indicate low progesterone.",
                            "Biological Resilience: Your cycle is a 'Fifth Vital Sign'. Changes often flag underlying shifts in thyroid health or activity levels."
                        ],
                        myth: "A regular cycle must be exactly 28 days.",
                        fact: "Regularity is about consistency, not the number. A cycle that is always 32 days is just as healthy as one that is 28."
                    }
                }
            ]
        },
        {
            title: "Phase Deep-Dive",
            items: [
                {
                    title: "Menstrual Phase",
                    summary: "Winter: A time of renewal and biological reset.",
                    icon: "🩸",
                    details: {
                        intro: "Days 1-5. Your hormones are at their lowest levels, which is why you may feel 'quiet' or reflective.",
                        bullets: [
                            "System Reset: Your body is shedding the previous month's preparation. It's a high-energy metabolic process.",
                            "Iron Focus: Because of blood loss, focusing on iron-rich foods (lentils, spinach, red meat) is biologically essential.",
                            "Rest is Productive: Low hormones mean low baseline stress resilience. Prioritizing sleep now builds a better Follicular phase."
                        ],
                        myth: "You can't exercise on your period.",
                        fact: "Gentle movement can actually help move blood flow and reduce cramps, but 'PR' attempts shouldn't be the goal."
                    }
                },
                {
                    title: "Follicular Phase",
                    summary: "Spring: Rising estrogen and peak creativity.",
                    icon: "🌱",
                    details: {
                        intro: "Days 6-14. FSH rises, and the body selects a 'dominant follicle' to win the race to ovulation.",
                        bullets: [
                            "Estrogen Glow: As estrogen climbs, so does serotonin. You'll likely feel more sociable, creative, and confident.",
                            "Building Strength: This is the best time for high-intensity training. Your body is more efficient at using stored carbs for fuel.",
                            "Skin Health: Pores appear smaller and skin is generally at its clearest during peak estrogen."
                        ],
                        myth: "The Follicular phase is just 'waiting' for ovulation.",
                        fact: "This is actually when your brain is most plastic and capable of learning complex new skills!"
                    }
                }
            ]
        },
        {
            title: "Advanced Bio-Markers",
            items: [
                {
                    title: "Cervical Fluid Secrets",
                    summary: "The 4 stages of mucus as a primary fertility indicator.",
                    icon: "💧",
                    details: {
                        intro: "Your cervix produces fluid that changes consistency to reflect your hormonal state.",
                        bullets: [
                            "Dry/Tacky: Post-period. Low estrogen environment.",
                            "Creamy: Approach to the window. Estrogen is rising.",
                            "Egg-White (EWCM): Peak fertility. Clear, stretchy, and high-water content to assist sperm longevity.",
                            "Sticky/Dry again: Post-ovulation. Progesterone has taken over."
                        ],
                        myth: "Any discharge is an infection.",
                        fact: "Cyclical clear/white fluid is a sign of a high-functioning, healthy endocrine system."
                    }
                },
                {
                    title: "Basal Temperature",
                    summary: "Understanding the 'Thermal Shift' and the Progesterone peak.",
                    icon: "🌡️",
                    details: {
                        intro: "BBT is your body's temperature at total rest. It's a proxy for Progesterone levels.",
                        bullets: [
                            "Pre-Ovulation: Low and stable (usually around 36.1-36.4°C).",
                            "The Shift: After ovulation, Progesterone raises your temp by 0.3-0.5°C within 24 hours.",
                            "Confirming Ovulation: To confirm it happened, you need 3 temps higher than the previous 6. It doesn't predict; it confirms."
                        ],
                        myth: "BBT works if you take it at different times.",
                        fact: "Consistency is key. Even a 30-minute difference in wake-up time can throw off the reading."
                    }
                }
            ]
        }
    ]

    return (
        <div style={{ padding: '0', marginLeft: '1.5rem', position: 'relative' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Knowledge Hub</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>A deep biological guide to your cycle and health.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {sections.map(section => (
                    <section key={section.title}>
                        <h2 style={{ fontSize: '1.2rem', color: '#FF6B99', marginBottom: '1.2rem', fontWeight: 600 }}>{section.title}</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.2rem'
                        }}>
                            {section.items.map(item => (
                                <div
                                    key={item.title}
                                    className={styles.card}
                                    onClick={() => setSelectedItem(item)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        border: '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF6B99'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.icon}</div>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{mask(item.title)}</h3>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0, lineHeight: '1.5' }}>{mask(item.summary)}</p>
                                    <span style={{ fontSize: '0.75rem', color: '#FF6B99', fontWeight: 600, marginTop: 'auto' }}>Read Deep-Dive →</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Deep-Dive Modal Overlay */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }} onClick={() => setSelectedItem(null)}>
                    <div style={{
                        backgroundColor: 'white',
                        maxWidth: '650px',
                        width: '100%',
                        maxHeight: '85vh',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        position: 'relative',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: '#f5f5f5',
                                border: 'none',
                                width: '36px',
                                height: '36px',
                                borderRadius: '18px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >✕</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>{selectedItem.icon}</span>
                            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{mask(selectedItem.title)}</h2>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.6', marginBottom: '2rem' }}>
                            {mask(selectedItem.details.intro)}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                            {selectedItem.details.bullets.map((bullet: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ color: '#FF6B99', fontWeight: 'bold' }}>•</div>
                                    <div style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>{mask(bullet)}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '2px dashed #eee', paddingTop: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: '#fa5252', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Myth</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>"{mask(selectedItem.details.myth)}"</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: '#40c057', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Biological Fact</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#222', fontWeight: 500 }}>{mask(selectedItem.details.fact)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={() => setSelectedItem(null)}
                            style={{ width: '100%', marginTop: '3rem', padding: '1rem' }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
