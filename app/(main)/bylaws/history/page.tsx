'use client'

import { useBylaws } from '@/lib/hooks/useBylaws'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'
import { format } from 'date-fns'

export default function BylawsHistoryPage() {
    const { bylawsHistory, loading, error, fetchBylawsHistory, setActiveBylaw } = useBylaws({ autoFetch: false })
    const { member } = useAuth()
    const isAdmin = member?.role === 'ADMIN' || member?.role === 'PRESIDENT'

    useEffect(() => {
        fetchBylawsHistory()
    }, [fetchBylawsHistory])

    const handleSetActive = async (id: string) => {
        if (confirm('이 회칙을 현재 적용 중인 회칙으로 설정하시겠습니까?')) {
            const { success, error } = await setActiveBylaw(id)
            if (success) {
                alert('활성 회칙이 변경되었습니다.')
                await fetchBylawsHistory()
            } else {
                alert(`변경 실패: ${error}`)
            }
        }
    }

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">에러 발생: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">회칙 개정 이력</h1>
                <Button variant="outline" asChild size="sm">
                    <Link href="/bylaws">돌아가기</Link>
                </Button>
            </div>

            <div className="space-y-4">
                {bylawsHistory.length > 0 ? (
                    bylawsHistory.map((bylaw) => (
                        <Card
                            key={bylaw.id}
                            className={`p-6 ${bylaw.is_active ? 'border-blue-500 border-2 bg-blue-50' : ''}`}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">{bylaw.title}</h3>
                                            {bylaw.is_active && (
                                                <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                                                    현재 적용 중
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            버전: {bylaw.version}
                                        </p>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                                            <p>작성일: {format(new Date(bylaw.created_at), 'yyyy-MM-dd HH:mm')}</p>
                                            <p>시행일: {bylaw.effective_date}</p>
                                            <p>수정일: {format(new Date(bylaw.updated_at), 'yyyy-MM-dd HH:mm')}</p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/bylaws/${bylaw.id}/edit`}>수정</Link>
                                            </Button>
                                            {!bylaw.is_active && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleSetActive(bylaw.id)}
                                                >
                                                    활성화
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="p-12 text-center text-gray-500">
                        이력이 없습니다.
                    </Card>
                )}
            </div>
        </div>
    )
}
