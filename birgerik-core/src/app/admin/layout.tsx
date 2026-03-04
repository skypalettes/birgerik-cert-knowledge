import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { LogoutButton } from '@/components/admin/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ログインページ（user が null）はシェルなしで children のみ描画。
  // 認証保護は middleware が担当しているため、ここでリダイレクトしない。
  if (!user) {
    return <>{children}</>
  }

  const role = (user.user_metadata?.role as string) || 'admin'

  return (
    <div className="flex h-screen overflow-hidden bg-teal-50 text-gray-800 antialiased">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-teal-100 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">{user.email}</span>
            <LogoutButton />
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
