import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <main className="w-full max-w-4xl text-center">
        {/* 로고 및 타이틀 */}
        <div className="mb-12">
          <h1 className="mb-4 text-6xl font-bold text-blue-600">함월</h1>
          <p className="text-xl text-gray-600">
            고등학교 계모임 관리 시스템
          </p>
        </div>

        {/* 소개 */}
        <Card className="mb-8 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            투명하고 편리한 모임 관리
          </h2>
          <p className="mb-6 text-gray-600">
            함월은 고등학교 동창 계모임을 위한 웹 서비스입니다.
            <br />
            회비 관리, 회칙 조회, 회원 관리를 한 곳에서 간편하게 해결하세요.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-6">
              <div className="mb-2 text-4xl">📋</div>
              <h3 className="mb-2 font-semibold text-gray-800">회칙 관리</h3>
              <p className="text-sm text-gray-600">
                언제든지 최신 회칙을 확인하고 개정 이력을 조회할 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-6">
              <div className="mb-2 text-4xl">💰</div>
              <h3 className="mb-2 font-semibold text-gray-800">장부 관리</h3>
              <p className="text-sm text-gray-600">
                투명한 회비 입출금 내역과 현재 잔액을 실시간으로 확인하세요.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-6">
              <div className="mb-2 text-4xl">👥</div>
              <h3 className="mb-2 font-semibold text-gray-800">회원 관리</h3>
              <p className="text-sm text-gray-600">
                회원 정보를 관리하고 역할을 부여할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA 버튼 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link href="/join">회원가입</Link>
          </Button>
        </div>

        {/* 푸터 */}
        <p className="mt-12 text-sm text-gray-500">
          모바일에 최적화된 디자인으로 언제 어디서나 편리하게 이용하세요.
        </p>
      </main>
    </div>
  )
}
