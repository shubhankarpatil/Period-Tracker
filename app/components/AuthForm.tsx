'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './AuthForm.module.css'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')

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
            else setMessage('Check your email for the confirmation link!')
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
        else setMessage('Password reset link sent to your email!')
        setLoading(false)
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Period Tracker</h1>
                <p className={styles.subtitle}>Private. Secure. Minimal.</p>

                <form onSubmit={handleAuth} className={styles.form}>
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

                    {message && <p className={styles.message}>{message}</p>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <p className={styles.toggleText}>
                    {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className={styles.linkBtn}>
                        {isSignUp ? "Sign In" : "Create one"}
                    </button>
                </p>
            </div >
        </div >
    )
}
