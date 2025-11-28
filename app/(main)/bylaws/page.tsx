'use client'

import { useBylaws } from '@/lib/hooks/useBylaws'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function BylawsPage() {
    const { currentBylaw, loading, error } = useBylaws()
    const { member } = useAuth()
    const isAdmin = member?.role === 'ADMIN' || member?.role === 'PRESIDENT'

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">에러 발생: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">회칙</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link href="/bylaws/history">개정 이력</Link>
                    </Button>
                    {isAdmin && (
                        <Button asChild size="sm">
                            <Link href="/bylaws/new">개정하기</Link>
                        </Button>
                    )}
                </div>
            </div>

            {currentBylaw ? (
                <Card className="p-6">
                    <div className="mb-4 border-b pb-4">
                        <h2 className="text-xl font-semibold">{currentBylaw.title}</h2>
                        <div className="mt-2 text-sm text-gray-500">
                            <span className="mr-4">버전: {currentBylaw.version}</span>
                            <span>시행일: {currentBylaw.effective_date}</span>
                        </div>
                    </div>
                    <div className="prose prose-blue max-w-none dark:prose-invert">
                        <ReactMarkdown>{currentBylaw.content}</ReactMarkdown>
                    </div>
                </Card>
            ) : (
                <Card className="p-12 text-center text-gray-500">
                    등록된 회칙이 없습니다.
                </Card>
            )}
        </div>
    )
}
