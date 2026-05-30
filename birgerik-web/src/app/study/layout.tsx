import { CyberBackground } from '@/components/shared/cyber-background'
import { CyberHeader } from '@/components/shared/cyber-header'

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <CyberBackground />
      <CyberHeader active="study" />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  )
}
