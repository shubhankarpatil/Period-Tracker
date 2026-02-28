'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (data?.session) {
                // If we have a session, check if it's a recovery flow
                // Supabase usually handles the hash fragment automatically for client-side clients
                router.push('/?type=recovery')
            } else {
                // Fallback to home
                router.push('/')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
            color: '#666'
        }}>
            <p>Authenticating...</p>
        </div>
    )
}
