export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

type Props = { params: Promise<{ certId: string; setId: string }> }

export default async function ModeSelectPage({ params }: Props) {
  const { certId, setId } = await params
  redirect(`/study/${certId}/${setId}/practice`)
}
