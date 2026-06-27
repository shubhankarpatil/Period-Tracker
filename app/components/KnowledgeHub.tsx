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
                    title: "How your body runs the cycle",
                    summary: "Your brain and ovaries are constantly talking to each other — here's how that conversation drives your cycle.",
                    icon: "🧬",
                    details: {
                        intro: "Your cycle isn't just a reproductive process — it's run by a two-way conversation between your brain and your ovaries, and it affects far more than fertility.",
                        bullets: [
                            "Ovaries: they produce estrogen and progesterone — hormones that shape your mood, energy, and bone health throughout your life, not just when you're trying to conceive.",
                            "Uterine lining: it thickens through the first half of the cycle to prepare for a possible pregnancy, then sheds at the end if one doesn't happen.",
                            "Brain signals: your brain sends hormone messages to your ovaries each cycle, telling them when to ripen an egg and when to release it. When something disrupts you — stress, illness, poor sleep — your brain can delay that signal."
                        ],
                        myth: "The uterus only matters for pregnancy.",
                        fact: "The hormones your ovaries produce affect your bone density, heart health, and brain function across your whole life — not just during your reproductive years."
                    }
                },
                {
                    title: "The four key hormones",
                    summary: "FSH, estrogen, LH, and progesterone — what each one does and when.",
                    icon: "🔄",
                    details: {
                        intro: "Four hormones rise and fall in a specific sequence each cycle. Each one has a different job, and together they shape how you feel from one week to the next.",
                        bullets: [
                            "FSH: your brain releases this at the start of each cycle to tell your ovaries to start ripening an egg.",
                            "Estrogen: rises through the first half of the cycle. It builds the uterine lining and tends to lift your mood, focus, and energy as it climbs.",
                            "LH: spikes sharply at mid-cycle to trigger the release of the egg — that moment is ovulation.",
                            "Progesterone: rises after ovulation. It steadies the uterine lining, slightly raises your body temperature, and has a calming effect at first — until it drops near the end of the cycle."
                        ],
                        myth: "Hormones are only active during your period.",
                        fact: "Hormone levels shift every single day of your cycle. They're quietly influencing your sleep, mood, metabolism, and focus all month long."
                    }
                },
                {
                    title: "What counts as a normal cycle",
                    summary: "Why 28 days isn't the rule, and what regularity actually means.",
                    icon: "⚙️",
                    details: {
                        intro: "28 days is the average you hear about, but a healthy cycle can be anywhere from 21 to 35 days. What matters more than the exact number is that yours is consistent.",
                        bullets: [
                            "First half variability: the first half of your cycle can shift when you're stressed, travelling, sick, or sleep-deprived — your body holds off on releasing an egg until things settle.",
                            "Second half stability: the second half is usually steady at around 12-14 days. If it's consistently shorter than that, it can sometimes point to low progesterone — worth mentioning to a doctor.",
                            "Worth tracking: doctors increasingly treat cycle patterns as a health indicator alongside things like blood pressure. Noticeable changes in your cycle can sometimes flag stress, thyroid issues, or changes in activity level."
                        ],
                        myth: "A regular cycle has to be 28 days.",
                        fact: "A cycle that's consistently 32 days is just as healthy as one that's consistently 28. Consistency matters more than the number."
                    }
                }
            ]
        },
        {
            title: "Phase Deep-Dive",
            items: [
                {
                    title: "Menstrual Phase",
                    summary: "Days 1-5: hormones are at their lowest and the lining sheds. Rest is important here.",
                    icon: "🩸",
                    details: {
                        intro: "Days 1-5. This is the start of your cycle. Estrogen and progesterone are at their lowest, your body is shedding the uterine lining, and it's normal to feel more tired than usual.",
                        bullets: [
                            "What's happening: the lining your body built up last cycle is shedding. Your body is doing real work here, which is why fatigue is so common — it's not in your head.",
                            "Iron: losing blood means losing a little iron. Foods like lentils, spinach, red meat, and tofu can help top it up — most people don't need supplements unless a doctor recommends them.",
                            "Recovery: with hormones low, your stress resilience is lower too. Prioritising sleep during these days sets you up better for the rest of the cycle."
                        ],
                        myth: "You can't train hard on your period.",
                        fact: "Your body can handle normal exercise during your period just fine. You might not feel like it, but physically, performance is usually unchanged."
                    }
                },
                {
                    title: "Follicular Phase",
                    summary: "Days 6-14: estrogen rises and most people start feeling more like themselves again.",
                    icon: "🌱",
                    details: {
                        intro: "Days 6-14. Your body picks one egg to mature, and estrogen rises steadily as it does. Most people notice more energy, better mood, and faster recovery during this phase.",
                        bullets: [
                            "Mood and focus: rising estrogen boosts serotonin — the reason many people feel more sociable, motivated, and clear-headed as this phase progresses.",
                            "Exercise: this is often your strongest window for hard workouts. Your body processes carbs efficiently and recovers quickly.",
                            "Skin: rising estrogen tends to support clearer skin for many people, though how much you notice this varies."
                        ],
                        myth: "The follicular phase is just waiting for ovulation.",
                        fact: "Research suggests this phase is actually your best window for learning new skills — your brain is more adaptable than at any other point in the cycle."
                    }
                },
                {
                    title: "Ovulatory Phase",
                    summary: "Days 15-21: the egg is released and you're likely feeling your most energetic.",
                    icon: "☀️",
                    details: {
                        intro: "Days 15-21. A hormone surge triggers the release of an egg. Estrogen and testosterone peak around the same time, which is why this phase often feels like your best week.",
                        bullets: [
                            "Confidence peak: estrogen at its highest can make you feel sharper and more articulate — many people find this a naturally good time for important conversations, presentations, or social plans.",
                            "Fertility window: the egg only survives 12-24 hours, but sperm can survive for up to 5 days. This means your fertile window actually opens several days before ovulation, not just on the day itself.",
                            "Exercise: high-intensity workouts tend to feel easiest now, but your joints are slightly more flexible than usual — warm up properly to avoid strains."
                        ],
                        myth: "You're only fertile on the day of ovulation.",
                        fact: "Your fertile window is roughly 5-6 days long, because sperm can wait in cervical fluid for several days before the egg arrives."
                    }
                },
                {
                    title: "Luteal Phase",
                    summary: "Days 22-28: progesterone rises then drops — this is where PMS symptoms can appear.",
                    icon: "🍂",
                    details: {
                        intro: "Days 22-28. After the egg is released, the follicle it came from starts producing progesterone. This prepares the body in case of pregnancy, but if that doesn't happen, progesterone drops sharply — and that drop is what causes PMS.",
                        bullets: [
                            "Progesterone effect: progesterone has a calming effect at first. But when it falls in the final week, it can bring irritability, low mood, and low energy with it — that's not weakness, that's biology.",
                            "Appetite and energy: your body burns slightly more calories than usual during this phase (roughly 2-9% more), which is why hunger increases. Cravings are a real physiological response, not just habit.",
                            "What helps: steady protein, magnesium-rich foods, and consistent sleep tend to ease the mood dip more reliably than caffeine or sugar."
                        ],
                        myth: "PMS means something is wrong with you.",
                        fact: "PMS is a normal hormonal response. If symptoms are severe enough to affect your daily life, that may be PMDD — it's common, well-understood, and very treatable. Worth talking to a doctor about."
                    }
                }
            ]
        },
        {
            title: "Body Signals Worth Knowing",
            items: [
                {
                    title: "Cervical fluid as a fertility signal",
                    summary: "How your discharge changes through the cycle — and what it's actually telling you.",
                    icon: "💧",
                    details: {
                        intro: "Cervical fluid changes texture and appearance throughout your cycle. Once you know what to look for, it's one of the clearest signs of where you are hormonally.",
                        bullets: [
                            "Dry or tacky: just after your period ends. Estrogen is low, and fertility is low too.",
                            "Creamy: estrogen is rising and you're moving toward your fertile window.",
                            "Clear and stretchy (like egg white): this is peak fertility. This type of fluid is designed to keep sperm alive and help it move — it's your body signalling that ovulation is close.",
                            "Sticky or dry again: progesterone has taken over after ovulation. The fertile window is closed."
                        ],
                        myth: "Clear or white discharge means something is wrong.",
                        fact: "Discharge that changes through the month is a sign of a healthy cycle. It's persistent itching, an unusual smell, or a colour change that's worth getting checked."
                    }
                },
                {
                    title: "Basal body temperature",
                    summary: "How tracking your resting temperature can confirm when ovulation has happened.",
                    icon: "🌡️",
                    details: {
                        intro: "Basal body temperature (BBT) is your temperature first thing in the morning, before you get up or do anything. It's a useful tool because progesterone — which rises after ovulation — slightly raises your body temperature.",
                        bullets: [
                            "Before ovulation: your temperature sits low and stable, usually around 36.1–36.4°C (97.0–97.5°F).",
                            "After ovulation: progesterone causes a small but clear rise of about 0.3–0.5°C (0.5–0.9°F), usually within 24 hours.",
                            "How to confirm: three days in a row where your temperature is higher than the previous six is a reliable sign that ovulation has happened. One important thing to know: BBT tells you ovulation already occurred — it can't predict it in advance."
                        ],
                        myth: "BBT still works if you measure at different times each day.",
                        fact: "The reading only means something if it's consistent. Even waking up 30 minutes earlier than usual, or having a bad night's sleep, can shift your temperature enough to confuse the pattern."
                    }
                }
            ]
        }
    ]

    return (
        <div style={{ padding: '0', position: 'relative' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Knowledge Hub</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Everything you need to understand your cycle, explained simply.</p>

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
