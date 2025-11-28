'use client'

import { useState } from 'react'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function NewTransactionPage() {
    const router = useRouter()
    const { createTransaction } = useTransactions({ autoFetch: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAWAL',
        amount: '',
        category: '',
        description: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { success, error } = await createTransaction({
            ...formData,
            amount: Number(formData.amount),
        })

        if (success) {
            alert('거래가 등록되었습니다.')
            router.push('/finance')
        } else {
            setError(error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">거래 등록</h1>
                <Button variant="outline" asChild size="sm">
                    <Link href="/finance">취소</Link>
                </Button>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="date">날짜</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">구분</Label>
                            <select
                                id="type"
                                name="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="DEPOSIT">입금</option>
                                <option value="WITHDRAWAL">출금</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">금액</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            placeholder="0"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">카테고리</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="예: 회비, 식대, 운영비"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">내용 (비고)</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="상세 내용을 입력하세요"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? '등록 중...' : '등록하기'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
