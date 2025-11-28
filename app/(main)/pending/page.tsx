'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PendingPage() {
    const { member, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirect if user is approved
        if (member && member.role !== 'GUEST') {
            router.push('/bylaws')
        }
    }, [member, router])

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="max-w-md p-8 text-center">
                <div className="mb-4 text-6xl">⏳</div>
                <h1 className="mb-4 text-2xl font-bold text-gray-900">
                    승인 대기 중
                </h1>
                <p className="mb-6 text-gray-600">
                    회원 가입이 완료되었습니다.<br />
                    관리자의 승인을 기다리고 있습니다.
                </p>

                {member && (
                    <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
                        <h2 className="mb-2 text-sm font-semibold text-gray-700">가입 정보</h2>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">이름:</span> {member.name}</p>
                            <p><span className="font-medium">이메일:</span> {member.email}</p>
                            {member.phone && (
                                <p><span className="font-medium">전화번호:</span> {member.phone}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>관리자에게 문의하세요</strong><br />
                        승인이 완료되면 회칙 및 장부를 조회할 수 있습니다.
                    </p>
                </div>
            </Card>
        </div>
    )
}
