'use client'

import { useMembers } from '@/lib/hooks/useMembers'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function MembersPage() {
    const { members, loading, error, updateMemberRole } = useMembers()
    const { member: currentUser } = useAuth()
    const isPresident = currentUser?.role === 'PRESIDENT'
    const isAdmin = currentUser?.role === 'ADMIN'
    const canManageRoles = isPresident || isAdmin

    const handleRoleChange = async (memberId: string, currentRole: string) => {
        if (!canManageRoles) return

        // Safety check
        if (currentRole === 'PRESIDENT') {
            alert('회장의 권한은 변경할 수 없습니다.')
            return
        }

        // Prevent self-demotion warning (optional but good UX)
        if (memberId === currentUser?.id) {
            if (!confirm('본인의 권한을 변경하시겠습니까? 관리자 권한을 잃을 수 있습니다.')) {
                return
            }
        }

        const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN'
        if (confirm(`해당 회원의 역할을 ${newRole === 'ADMIN' ? '관리자' : '일반 회원'}로 변경하시겠습니까?`)) {
            const { success, error } = await updateMemberRole(memberId, newRole)
            if (!success) {
                alert(`역할 변경 실패: ${error}`)
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
            <h1 className="text-2xl font-bold text-gray-900">회원 목록</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                    <Card key={member.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{member.name}</h3>
                                <p className="text-sm text-gray-500">{member.email}</p>
                                {member.phone && (
                                    <p className="text-sm text-gray-500">{member.phone}</p>
                                )}
                            </div>
                            <div className={`rounded-full px-2 py-1 text-xs font-medium ${member.role === 'PRESIDENT'
                                ? 'bg-purple-100 text-purple-700'
                                : member.role === 'ADMIN'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {member.role === 'PRESIDENT' ? '회장' : member.role === 'ADMIN' ? '관리자' : '회원'}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                            <span>가입일: {format(new Date(member.joined_at), 'yyyy.MM.dd')}</span>
                            {canManageRoles && member.role !== 'PRESIDENT' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleRoleChange(member.id, member.role)}
                                >
                                    권한 변경
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
