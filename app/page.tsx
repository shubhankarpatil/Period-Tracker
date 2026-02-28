'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <main className="main-container">
      {!session ? (
        <Suspense fallback={<div>Loading form...</div>}>
          <AuthForm />
        </Suspense>
      ) : (
        <Dashboard session={session} />
      )}
    </main>
  )
}
