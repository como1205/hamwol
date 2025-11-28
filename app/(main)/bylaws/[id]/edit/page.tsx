'use client'

import { useState, useEffect } from 'react'
import { useBylaws } from '@/lib/hooks/useBylaws'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function EditBylawPage() {
    const router = useRouter()
    const params = useParams()
    const bylawId = params.id as string
    const { fetchBylawById, updateBylaw } = useBylaws({ autoFetch: false })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        version: '',
        title: '',
        content: '',
        effective_date: '',
    })

    useEffect(() => {
        const loadBylaw = async () => {
            const { success, data, error } = await fetchBylawById(bylawId)
            if (success && data) {
                setFormData({
                    version: data.version,
                    title: data.title,
                    content: data.content,
                    effective_date: data.effective_date,
                })
            } else {
                setError(error || '회칙을 불러올 수 없습니다.')
            }
            setLoading(false)
        }
        loadBylaw()
    }, [bylawId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const { success, error } = await updateBylaw(bylawId, formData)

        if (success) {
            alert('회칙이 수정되었습니다.')
            router.push('/bylaws/history')
        } else {
            setError(error)
        }
        setSubmitting(false)
    }

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">회칙 수정</h1>
                <Button variant="outline" asChild size="sm">
                    <Link href="/bylaws/history">취소</Link>
                </Button>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="version">버전</Label>
                            <Input
                                id="version"
                                name="version"
                                placeholder="예: 2024-1"
                                value={formData.version}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="effective_date">시행일</Label>
                            <Input
                                id="effective_date"
                                name="effective_date"
                                type="date"
                                value={formData.effective_date}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="회칙 제목"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">내용 (Markdown)</Label>
                        <textarea
                            id="content"
                            name="content"
                            className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Markdown 형식으로 작성하세요"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? '수정 중...' : '수정하기'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
