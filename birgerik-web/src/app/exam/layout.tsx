import { CyberBackground } from '@/components/shared/cyber-background'

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <CyberBackground />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
