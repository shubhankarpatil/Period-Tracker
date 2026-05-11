'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './AuthForm.module.css'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')
    const [isRecovery, setIsRecovery] = useState(false)
    const [newPassword, setNewPassword] = useState('')

    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (searchParams.get('type') === 'recovery') {
            setIsRecovery(true)
        }
    }, [searchParams])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) setMessage(error.message)
            else setMessage('Check your email for the confirmation link.')
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) setMessage(error.message)
        }
        setLoading(false)
    }

    const handleResetPassword = async () => {
        if (!email) {
            setMessage('Please enter your email address first.')
            return
        }
        setLoading(true)
        setMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        })
        if (error) setMessage(error.message)
        else setMessage('Password reset link sent. Check your email.')
        setLoading(false)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (!newPassword) {
            setMessage('Please enter a new password.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Password updated successfully. You can now sign in.')
            setNewPassword('')
            // Optionally redirect to sign-in or dashboard
            router.push('/auth')
        }
        setLoading(false)
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Period Tracker</h1>
                <p className={styles.subtitle}>Private. Secure. Minimal.</p>

                <form onSubmit={isRecovery ? handleUpdatePassword : handleAuth} className={styles.form}>
                    {!isRecovery ? (
                        <>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            {!isSignUp && (
                                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className={styles.forgotBtn}
                                        disabled={loading}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.inputGroup}>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {message && <p className={styles.message} style={{ color: message.includes('successfully') ? '#40c057' : '#d32f2f' }}>{message}</p>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Processing...' : (isRecovery ? 'Update Password' : (isSignUp ? 'Sign Up' : 'Sign In'))}
                    </button>
                </form>

                {!isRecovery && (
                    <p className={styles.toggleText}>
                        {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
                        <button onClick={() => setIsSignUp(!isSignUp)} className={styles.linkBtn}>
                            {isSignUp ? "Sign In" : "Create one"}
                        </button>
                    </p>
                )}
            </div >
        </div >
    )
}
