import { LoginForm } from './login-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'ログイン - Birgerik Core',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role === 'admin') {
    redirect('/admin/certifications')
  }

  return <LoginForm />
}
