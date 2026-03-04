'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BookHeart, Award, FolderHeart, LayoutList, CheckCircle, Users, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const allNavItems = [
  { href: '/admin/certifications', icon: Award, label: '資格管理', roles: ['admin', 'question_manager'] },
  { href: '/admin/question-sets', icon: FolderHeart, label: '問題集管理', roles: ['admin', 'question_manager'] },
  { href: '/admin/questions', icon: LayoutList, label: '問題管理', roles: ['admin', 'question_manager'] },
  { href: '/admin/exams', icon: CheckCircle, label: '試験管理', roles: ['admin', 'question_manager'] },
  { href: '/admin/users', icon: Users, label: 'ユーザ管理', roles: ['admin'] },
]

export function AdminSidebar({ role }: { role: string }) {
  const navItems = allNavItems.filter((item) => item.roles.includes(role))
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const handleNav = (href: string) => {
    if (pathname === href) return
    setPendingHref(href)
    startTransition(() => {
      router.push(href)
    })
  }

  // トランジション完了後にリセット
  if (!isPending && pendingHref) {
    setPendingHref(null)
  }

  return (
    <aside className="w-64 bg-white border-r border-teal-100 flex flex-col shrink-0 shadow-sm">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-teal-50">
        <div className="bg-teal-100 text-teal-500 p-1.5 rounded-lg mr-3">
          <BookHeart className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-teal-900">Birgerik Core</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isLoading = pendingHref === href && isPending

          return (
            <button
              key={href}
              onClick={() => handleNav(href)}
              disabled={isPending}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-bold transition-all duration-300',
                isActive
                  ? 'bg-teal-400 text-white shadow-md shadow-teal-200 translate-x-1'
                  : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600',
                isPending && !isLoading && 'opacity-60 cursor-default'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
