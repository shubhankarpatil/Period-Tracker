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
                    title: "Anatomy: ovaries, uterus, and the HPG axis",
                    summary: "How the brain and reproductive system signal each other to drive a cycle.",
                    icon: "🧬",
                    details: {
                        intro: "The cycle is run by a feedback loop between the brain and the ovaries. Each part has a job that extends beyond reproduction.",
                        bullets: [
                            "Ovaries: primary endocrine glands. They produce estrogen and progesterone — hormones that affect bone density, mood, and metabolism, not just fertility.",
                            "Endometrium: the uterine lining thickens through the first half of the cycle and sheds at the end if no pregnancy occurs.",
                            "HPG axis: the hypothalamus and pituitary release hormones (GnRH, FSH, LH) that tell the ovaries when to grow and release an egg."
                        ],
                        myth: "The uterus only matters for pregnancy.",
                        fact: "Reproductive hormones affect bone density, cardiovascular health, and cognition across the lifespan."
                    }
                },
                {
                    title: "The four key hormones",
                    summary: "FSH, estrogen, LH, and progesterone — and what each one does.",
                    icon: "🔄",
                    details: {
                        intro: "Four hormones rise and fall in sequence to drive the cycle. Each peaks at a different point and does a different job.",
                        bullets: [
                            "FSH (follicle-stimulating hormone): recruits follicles in the ovaries to begin maturing at the start of each cycle.",
                            "Estrogen: thickens the uterine lining and lifts mood, focus, and energy as it climbs through the first half of the cycle.",
                            "LH (luteinizing hormone): a sharp surge in LH triggers the dominant follicle to release an egg — ovulation.",
                            "Progesterone: rises after ovulation. Stabilises the lining, raises basal body temperature, and has a calming effect at first."
                        ],
                        myth: "Hormones are only active during your period.",
                        fact: "Hormone levels change every day of the cycle. They influence sleep, mood, metabolism, and cognition continuously."
                    }
                },
                {
                    title: "What counts as a normal cycle",
                    summary: "Why 28 days isn't the rule, and what regularity actually means.",
                    icon: "⚙️",
                    details: {
                        intro: "28 days is the textbook average. A normal cycle is anywhere from 21 to 35 days, and consistency matters more than the exact number.",
                        bullets: [
                            "Follicular variability: the first half of the cycle can shift with stress, travel, illness, or sleep — the body delays ovulation until conditions improve.",
                            "Luteal stability: the second half is usually steady at 12-14 days. A consistently short luteal phase can point to low progesterone.",
                            "Fifth vital sign: many clinicians now track cycle patterns alongside heart rate and blood pressure. Meaningful changes can flag thyroid, stress, or activity issues."
                        ],
                        myth: "A regular cycle has to be 28 days.",
                        fact: "A cycle that's consistently 32 days is just as healthy as one that's consistently 28."
                    }
                }
            ]
        },
        {
            title: "Phase Deep-Dive",
            items: [
                {
                    title: "Menstrual Phase",
                    summary: "Days 1-5: hormones are at their lowest, the lining sheds.",
                    icon: "🩸",
                    details: {
                        intro: "Days 1-5. Estrogen and progesterone are at their lowest, the uterine lining sheds, and energy often dips in the first few days.",
                        bullets: [
                            "What's happening: the lining built up over the previous cycle sheds. The process is metabolically demanding, which is why fatigue is common.",
                            "Iron: blood loss depletes iron stores slightly. Lentils, spinach, red meat, and tofu help replenish — supplementation is rarely necessary for most.",
                            "Recovery: low hormones mean lower baseline stress resilience. Good sleep here sets up the rest of the cycle."
                        ],
                        myth: "You can't train hard on your period.",
                        fact: "Performance is typically unchanged during menstruation. Motivation may dip, but the body handles normal training loads fine."
                    }
                },
                {
                    title: "Follicular Phase",
                    summary: "Days 6-14: estrogen rises, energy and focus climb with it.",
                    icon: "🌱",
                    details: {
                        intro: "Days 6-14. FSH selects a dominant follicle, and estrogen rises steadily as it matures. Energy, mood, and recovery tend to climb with it.",
                        bullets: [
                            "Mood and focus: rising estrogen supports serotonin, which is why many people feel more sociable and confident through this phase.",
                            "Training: often the strongest window for high-intensity work and skill acquisition. Carbohydrate use is efficient and recovery is fast.",
                            "Skin: rising estrogen tends to support skin clarity, though this varies considerably between individuals."
                        ],
                        myth: "The follicular phase is just waiting for ovulation.",
                        fact: "This phase shows the highest cognitive plasticity in many studies — a strong window for learning complex new skills."
                    }
                },
                {
                    title: "Ovulatory Phase",
                    summary: "Days 15-21: the LH surge releases an egg, estrogen and testosterone peak.",
                    icon: "☀️",
                    details: {
                        intro: "Days 15-21. An LH surge triggers ovulation. Estrogen and testosterone peak together, then drop sharply.",
                        bullets: [
                            "Communication peak: estrogen at its highest tends to sharpen verbal fluency and confidence — a useful window for difficult conversations or interviews.",
                            "Fertility window: the egg survives 12-24 hours, but sperm can survive up to 5 days. The window opens several days before ovulation, not on the day itself.",
                            "Movement: high-intensity work tends to feel easiest here, but ligament laxity also peaks — warm up well and avoid maximal loads on cold joints."
                        ],
                        myth: "You're only fertile on the day of ovulation.",
                        fact: "The fertile window is roughly 5-6 days long, because sperm can survive in cervical fluid that long while waiting for the egg."
                    }
                },
                {
                    title: "Luteal Phase",
                    summary: "Days 22-28: progesterone rises, then drops sharply.",
                    icon: "🍂",
                    details: {
                        intro: "Days 22-28. The corpus luteum produces progesterone, which slows metabolism and stabilises the lining for a possible pregnancy.",
                        bullets: [
                            "Progesterone effect: progesterone has a calming, GABA-like effect at first. It drops sharply in the final week if there's no pregnancy — that drop is what triggers PMS symptoms.",
                            "Metabolic shift: basal metabolic rate rises 2-9%, hunger increases, and the body shifts toward burning more fat than carbs for fuel.",
                            "Mood window: serotonin can dip in the late luteal phase. Steady protein, magnesium, and consistent sleep blunt this more reliably than caffeine or sugar."
                        ],
                        myth: "PMS means something is wrong with you.",
                        fact: "PMS is a normal hormonal response. Severe symptoms (PMDD) affect 3-8% of cycling people and are highly treatable — worth raising with a clinician."
                    }
                }
            ]
        },
        {
            title: "Advanced Bio-Markers",
            items: [
                {
                    title: "Cervical fluid as a fertility signal",
                    summary: "Four stages of cervical fluid and what each one indicates.",
                    icon: "💧",
                    details: {
                        intro: "Cervical fluid changes consistency through the cycle. It's one of the most reliable signals of where you are hormonally.",
                        bullets: [
                            "Dry or tacky: just after the period. Low-estrogen environment, low fertility.",
                            "Creamy: rising estrogen, approaching the fertile window.",
                            "Egg-white (EWCM): clear, stretchy, high in water content. Indicates peak fertility — this fluid keeps sperm viable for several days.",
                            "Sticky or dry again: progesterone has risen after ovulation. Fertility window has closed."
                        ],
                        myth: "Any clear or white discharge is a sign of infection.",
                        fact: "Cyclical clear or white fluid is a sign of a healthy endocrine system. Persistent itching, odour, or unusual colour is what warrants a check-up."
                    }
                },
                {
                    title: "Basal body temperature",
                    summary: "How BBT confirms ovulation through the progesterone-driven thermal shift.",
                    icon: "🌡️",
                    details: {
                        intro: "Basal body temperature is your temperature at full rest. It tracks progesterone, which is why it's useful for confirming ovulation.",
                        bullets: [
                            "Pre-ovulation: low and stable, usually around 36.1-36.4°C (97.0-97.5°F).",
                            "The shift: after ovulation, progesterone raises temperature by 0.3-0.5°C (0.5-0.9°F) within about 24 hours.",
                            "Confirming ovulation: three consecutive daily readings higher than the previous six confirms it happened. BBT confirms ovulation in retrospect — it doesn't predict it."
                        ],
                        myth: "BBT works even if you take it at different times each day.",
                        fact: "Consistency is what makes the reading useful. Even a 30-minute difference in wake-up time, or a poor night's sleep, can throw off the result."
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
                                    <span style={{ fontSize: '0.75rem', color: '#FF6B99', fontWeight: 600, marginTop: 'auto' }}>Read more →</span>
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
