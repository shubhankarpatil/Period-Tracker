'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'bug' | 'suggestion' | 'other'

const TYPES: { value: FeedbackType, label: string }[] = [
    { value: 'bug', label: '🐛 Bug' },
    { value: 'suggestion', label: '💡 Suggestion' },
    { value: 'other', label: '✉️ Other' },
]

const MAX_LEN = 500

export default function FeedbackModal({
    isOpen,
    onClose,
    session,
    isDesktop,
}: {
    isOpen: boolean
    onClose: () => void
    session: any
    isDesktop: boolean
}) {
    const [type, setType] = useState<FeedbackType>('suggestion')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setType('suggestion')
            setMessage('')
            setError(null)
            setSuccess(false)
            setSubmitting(false)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onEsc)
        return () => window.removeEventListener('keydown', onEsc)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleSubmit = async () => {
        const trimmed = message.trim()
        if (!trimmed) {
            setError('Please write a message before sending.')
            return
        }
        setSubmitting(true)
        setError(null)

        const userId = session?.user?.id
        const email = session?.user?.email

        const { error: dbError } = await supabase
            .from('feedback')
            .insert({ user_id: userId, type, message: trimmed })

        if (dbError) {
            setSubmitting(false)
            setError('Could not save feedback. Please try again.')
            return
        }

        try {
            await fetch('/api/notify-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, message: trimmed, email, userId }),
            })
        } catch {
            // Email notify is best-effort; the row is already saved.
        }

        setSubmitting(false)
        setSuccess(true)
    }

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 2000
            }}
        >
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                padding: '0 2rem',
                borderRadius: '8px',
                width: 'calc(100% - 1rem)',
                maxWidth: '440px',
                maxHeight: isDesktop ? 'min(90vh, 600px)' : '70vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    marginLeft: '-2rem',
                    marginRight: '-2rem',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                    borderBottom: '1px solid #eee',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    zIndex: 1
                }}>
                    <h3 style={{ margin: 0 }}>✉️ Drop a Note</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {success ? (
                    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💌</div>
                        <h4 style={{ margin: '0 0 0.5rem', color: '#333' }}>Thanks for writing in!</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                            We read every note and use it to make the app better.
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ margin: '1.5rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                What's this about?
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        onClick={() => setType(t.value)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: type === t.value ? '#FF6B99' : '#f0f0f0',
                                            color: type === t.value ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ margin: '1.5rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: 500 }}>Your message</label>
                                <span style={{ fontSize: '0.75rem', color: message.length > MAX_LEN ? '#d32f2f' : '#999' }}>
                                    {message.length}/{MAX_LEN}
                                </span>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
                                placeholder="Tell us what's on your mind…"
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    background: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    color: '#333',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                margin: '0 0 1rem',
                                padding: '0.6rem 0.8rem',
                                background: '#fdecea',
                                color: '#b71c1c',
                                borderRadius: '6px',
                                fontSize: '0.85rem'
                            }}>
                                {error}
                            </div>
                        )}
                    </>
                )}

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: success ? '1rem' : '2rem',
                    position: 'sticky',
                    bottom: 0,
                    background: 'white',
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    marginLeft: '-2rem',
                    marginRight: '-2rem',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                    borderTop: '1px solid #eee',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px'
                }}>
                    {success ? (
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '1rem',
                                background: '#FF6B99', color: 'white',
                                border: 'none', borderRadius: '6px',
                                cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Done
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !message.trim()}
                            style={{
                                flex: 1, padding: '1rem',
                                background: submitting || !message.trim() ? '#ddd' : '#FF6B99',
                                color: 'white', border: 'none', borderRadius: '6px',
                                cursor: submitting || !message.trim() ? 'not-allowed' : 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {submitting ? 'Sending…' : 'Send'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
