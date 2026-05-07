'use client'
import React, { useState } from 'react'
import styles from './Dashboard.module.css'

export default function KnowledgeHub({ discreetMode = false, isDesktop = false }: { discreetMode?: boolean, isDesktop?: boolean }) {
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
                    summary: "Beyond the basics: The endocrine role of the ovaries and the uterine lining.",
                    icon: "🧬",
                    details: {
                        intro: "Reproductive anatomy is a sophisticated communication network between the brain and the body.",
                        bullets: [
                            "Ovaries: They aren't just egg storage; they are primary endocrine glands producing the hormones that regulate much of your physiology.",
                            "Endometrium: The uterine lining thickens to 10-12mm to prepare for a fertilized egg. If none arrives, the tissue sheds.",
                            "HPG Axis: The Hypothalamic-Pituitary-Gonadal axis is the signaling pathway from your brain that tells your body when to cycle."
                        ],
                        myth: "The uterus only matters for pregnancy.",
                        fact: "Hormones produced by the reproductive system impact bone density, heart health, and cognitive function throughout your life."
                    }
                },
                {
                    title: "The Hormonal Symphony",
                    summary: "Meet the 4 key players: FSH, LH, estrogen, and progesterone.",
                    icon: "🔄",
                    details: {
                        intro: "Your cycle is driven by a symphony of four master hormones rising and falling in sequence.",
                        bullets: [
                            "FSH (Follicle Stimulating Hormone): The 'Start' signal. It recruits follicles in the ovaries to grow.",
                            "Estrogen: The 'Builder'. It thickens your lining and boosts your mood, skin, and energy levels.",
                            "LH (Luteinizing Hormone): The 'Trigger'. A massive surge in LH causes the dominant follicle to release an egg (ovulation).",
                            "Progesterone: The 'Calmer'. After ovulation, it stabilizes the lining and raises your core body temperature."
                        ],
                        myth: "Hormones are only active during your period.",
                        fact: "Your hormonal levels are changing every single day of the month, influencing everything from metabolism to sleep quality."
                    }
                },
                {
                    title: "Cycle Engineering",
                    summary: "Why 28 days? Understanding variability, stress, and what 'normal' actually means.",
                    icon: "⚙️",
                    details: {
                        intro: "While 28 days is the textbook average, a healthy range is actually 21 to 35 days.",
                        bullets: [
                            "The Follicular Variable: The first half of your cycle can vary based on stress, travel, or illness, as the body waits for a safe time to ovulate.",
                            "The Luteal Constant: The second half of your cycle is usually a steady 12-14 days. If it's shorter, it may indicate low progesterone.",
                            "Biological Resilience: Your cycle is a 'Fifth Vital Sign' that doctors increasingly track alongside heart rate, blood pressure, temperature, and respiration. Changes often flag underlying shifts in thyroid health or activity levels."
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
                        intro: "Days 1-5. Your hormones are at their lowest levels, which is why you may feel quiet or reflective.",
                        bullets: [
                            "System Reset: Your body is shedding the previous month's preparation. It's a high-energy metabolic process.",
                            "Iron Focus: Because of blood loss, focusing on iron-rich foods (lentils, spinach, red meat) is biologically essential.",
                            "Rest is Productive: Low hormones mean low baseline stress resilience. Prioritizing sleep now builds a better Follicular phase."
                        ],
                        myth: "You can't exercise on your period.",
                        fact: "Gentle movement can actually help blood flow and reduce cramps, but chasing personal bests isn't the goal."
                    }
                },
                {
                    title: "Follicular Phase",
                    summary: "Spring: Rising estrogen and peak creativity.",
                    icon: "🌱",
                    details: {
                        intro: "Days 6-14. FSH rises, and the body selects a dominant follicle to advance toward ovulation.",
                        bullets: [
                            "Estrogen Glow: As estrogen climbs, so does serotonin. You'll likely feel more sociable, creative, and confident.",
                            "Building Strength: This is the best time for high-intensity training. Your body is more efficient at using stored carbs for fuel.",
                            "Skin Health: Pores appear smaller and skin is generally at its clearest during peak estrogen."
                        ],
                        myth: "The Follicular phase is just 'waiting' for ovulation.",
                        fact: "This is actually when your brain is most plastic and capable of learning complex new skills."
                    }
                },
                {
                    title: "Ovulatory Phase",
                    summary: "Summer: Peak fertility, energy, and confidence.",
                    icon: "☀️",
                    details: {
                        intro: "Days 15-21. The LH surge releases an egg. Estrogen and testosterone peak together, then drop sharply.",
                        bullets: [
                            "Communication peak: estrogen at its highest sharpens verbal fluency and social confidence — a strong window for difficult conversations or interviews.",
                            "Fertility window: the egg lives 12-24 hours, but sperm can survive up to 5 days. The fertile window opens days before ovulation, not on the day itself.",
                            "Energy crest: high-intensity workouts feel easiest, but ligament laxity also peaks — be careful not to over-extend."
                        ],
                        myth: "You're only fertile on the day of ovulation.",
                        fact: "The fertile window is roughly 5-6 days long because sperm can survive in cervical fluid that long while waiting for the egg."
                    }
                },
                {
                    title: "Luteal Phase",
                    summary: "Autumn: Inward focus and the PMS window.",
                    icon: "🍂",
                    details: {
                        intro: "Days 22-28. The corpus luteum produces progesterone, which slows you down and primes the body for a possible pregnancy.",
                        bullets: [
                            "Progesterone effect: rising progesterone has a calming, GABA-like effect at first, then drops sharply in the final week — that drop is what triggers PMS symptoms.",
                            "Metabolic shift: basal metabolic rate rises 2-9%, hunger increases, and the body burns more fat than carbs for fuel.",
                            "Mood window: serotonin can dip in the late luteal phase. Steady protein, magnesium, and consistent sleep blunt this more than caffeine or sugar will."
                        ],
                        myth: "PMS means something is wrong with you.",
                        fact: "PMS is a normal hormonal response, but severe symptoms (PMDD) affect 3-8% of cycling people and are highly treatable — worth bringing up with a doctor."
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
                            "Creamy: Approaching the fertile window as estrogen rises.",
                            "Egg-White (EWCM): Peak fertility. Clear, stretchy, and high in water content to assist sperm longevity.",
                            "Sticky/Dry again: Post-ovulation. Progesterone has taken over."
                        ],
                        myth: "Any discharge is an infection.",
                        fact: "Cyclical clear/white fluid is a sign of a high-functioning, healthy endocrine system."
                    }
                },
                {
                    title: "Basal Temperature",
                    summary: "Understanding the 'Thermal Shift' and the progesterone peak.",
                    icon: "🌡️",
                    details: {
                        intro: "BBT is your body's temperature at total rest. It's a proxy for progesterone levels.",
                        bullets: [
                            "Pre-Ovulation: Low and stable (usually around 36.1-36.4°C / 97.0-97.5°F).",
                            "The Shift: After ovulation, progesterone raises your temp by 0.3-0.5°C (0.5-0.9°F) within 24 hours.",
                            "Confirming Ovulation: To confirm it happened, you need 3 daily temps higher than the previous 6 days. It doesn't predict; it confirms."
                        ],
                        myth: "BBT works if you take it at different times.",
                        fact: "Consistency is key. Even a 30-minute difference in wake-up time can throw off the reading."
                    }
                }
            ]
        }
    ]

    return (
        <div style={{ padding: '0', position: 'relative' }}>
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
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000
                }} onClick={() => setSelectedItem(null)}>
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        width: 'calc(100% - 1rem)',
                        maxWidth: '650px',
                        maxHeight: isDesktop ? 'min(85vh, 700px)' : '70vh',
                        borderRadius: '8px',
                        padding: '0 2.5rem',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            paddingTop: '1rem',
                            paddingBottom: '1rem',
                            marginLeft: '-2.5rem',
                            marginRight: '-2.5rem',
                            paddingLeft: '2.5rem',
                            paddingRight: '2.5rem',
                            borderBottom: '1px solid #eee',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            zIndex: 1
                        }}>
                            <span style={{ fontSize: '2rem' }}>{selectedItem.icon}</span>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, flex: 1, minWidth: 0 }}>{mask(selectedItem.title)}</h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >&times;</button>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: '#333', lineHeight: '1.6', marginTop: '1.5rem', marginBottom: '2rem' }}>
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

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem',
                            position: 'sticky',
                            bottom: 0,
                            background: 'white',
                            paddingTop: '1rem',
                            paddingBottom: '1rem',
                            marginLeft: '-2.5rem',
                            marginRight: '-2.5rem',
                            paddingLeft: '2.5rem',
                            paddingRight: '2.5rem',
                            borderTop: '1px solid #eee',
                            borderBottomLeftRadius: '8px',
                            borderBottomRightRadius: '8px'
                        }}>
                            <button
                                className="btn-primary"
                                onClick={() => setSelectedItem(null)}
                                style={{ width: '100%', padding: '1rem', borderRadius: '6px' }}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
