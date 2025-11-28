'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function MyPage() {
    const { member, updateProfile, updatePassword, withdraw } = useAuth()
    const [loading, setLoading] = useState(false)

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
    })

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: '',
    })

    useEffect(() => {
        if (member) {
            setProfileData({
                name: member.name,
                phone: member.phone || '',
            })
        }
    }, [member])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { success, error } = await updateProfile(profileData.name, profileData.phone)

        if (success) {
            alert('프로필이 수정되었습니다.')
        } else {
            alert(`수정 실패: ${error}`)
        }
        setLoading(false)
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.password !== passwordData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }

        if (passwordData.password.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.')
            return
        }

        setLoading(true)
        const { success, error } = await updatePassword(passwordData.password)

        if (success) {
            alert('비밀번호가 변경되었습니다.')
            setPasswordData({ password: '', confirmPassword: '' })
        } else {
            alert(`변경 실패: ${error}`)
        }
        setLoading(false)
    }

    const handleWithdraw = async () => {
        if (confirm('정말로 탈퇴하시겠습니까? 탈퇴 후에는 복구할 수 없습니다.')) {
            const { success, error } = await withdraw()
            if (!success) {
                alert(`탈퇴 실패: ${error}`)
            }
        }
    }

    if (!member) return <div className="p-4 text-center">로딩 중...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">내 정보 관리</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 프로필 수정 */}
                <Card className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">기본 정보 수정</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input value={member.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">전화번호</Label>
                            <Input
                                id="phone"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={loading}>저장하기</Button>
                        </div>
                    </form>
                </Card>

                {/* 비밀번호 변경 */}
                <Card className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">비밀번호 변경</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">새 비밀번호</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">비밀번호 확인</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={loading}>변경하기</Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* 회원 탈퇴 */}
            <Card className="border-red-100 bg-red-50 p-6">
                <h2 className="mb-2 text-lg font-semibold text-red-700">회원 탈퇴</h2>
                <p className="mb-4 text-sm text-red-600">
                    탈퇴 시 계정은 비활성화되며, 기존 데이터(회칙 작성, 장부 기록 등)는 보존됩니다.
                </p>
                <Button variant="destructive" onClick={handleWithdraw} disabled={loading}>
                    회원 탈퇴
                </Button>
            </Card>
        </div>
    )
}
