'use client'

import { useBylaws } from '@/lib/hooks/useBylaws'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'
import { format } from 'date-fns'

export default function BylawsHistoryPage() {
    const { bylawsHistory, loading, error, fetchBylawsHistory } = useBylaws()

    useEffect(() => {
        fetchBylawsHistory()
    }, [fetchBylawsHistory])

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
                        <Card key={bylaw.id} className="p-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{bylaw.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        버전: {bylaw.version} | 시행일: {bylaw.effective_date}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    작성일: {format(new Date(bylaw.created_at), 'yyyy-MM-dd')}
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
