# 프로젝트 구조 및 아키텍처 원칙 (Project Structure & Architectural Principles)

**작성자**: Architect Reviewer
**문서 버전**: 1.0
**참고 문서**: `0-domain-definition.md`, `2-prd.md`

이 문서는 '함월' 프로젝트의 유지보수성, 확장성, 안정성을 보장하기 위한 아키텍처 원칙과 디렉토리 구조를 정의합니다.

---

## 1. 최상위 원칙 (Top-level Principles)
모든 스택(Frontend, Backend/DB)에 공통으로 적용되는 핵심 원칙입니다.

1.  **KISS (Keep It Simple, Stupid)**: 불필요한 복잡성을 피하고, 현재 요구사항에 가장 적합한 단순한 해결책을 선택한다. 과도한 엔지니어링(Over-engineering)을 지양한다.
2.  **SoC (Separation of Concerns)**: 관심사를 명확히 분리한다. UI, 비즈니스 로직, 데이터 접근 계층이 서로 뒤섞이지 않도록 한다.
3.  **SSOT (Single Source of Truth)**: 데이터의 원천은 하나여야 한다. 상태 관리나 데이터베이스 설계 시 중복을 최소화하고 일관성을 유지한다.
4.  **YAGNI (You Aren't Gonna Need It)**: 당장 필요하지 않은 기능이나 추상화는 미리 구현하지 않는다.

## 2. 의존성 레이어 원칙 (Dependency Layer Principles)
시스템의 결합도를 낮추고 유연성을 높이기 위한 의존성 규칙입니다.

1.  **단방향 의존성**: 의존성은 항상 **상위 수준(정책/비즈니스 로직)에서 하위 수준(세부 구현/유틸리티)**으로 흘러야 한다.
    *   *UI Components* -> *Business Logic (Hooks/Services)* -> *Data Access (API/Supabase Client)*
2.  **추상화 의존**: 구체적인 구현체보다는 인터페이스나 추상화된 계층에 의존하도록 설계한다 (필요 시).
3.  **순환 참조 금지**: 모듈 간의 순환 참조(A -> B -> A)는 절대 허용하지 않는다.

## 3. 코드 네이밍 원칙 (Code Naming Principles)
가독성과 일관성을 위한 명명 규칙입니다.

1.  **명확성 우선**: 축약어 사용을 지양하고, 이름만 보고도 역할과 의도를 알 수 있도록 구체적으로 짓는다. (예: `getUser` (X) -> `fetchUserProfile` (O))
2.  **언어**: 모든 코드(변수, 함수, 주석 등)는 **영어** 사용을 원칙으로 한다. (도메인 용어는 합의된 영문명 사용)
3.  **Casing**:
    *   **PascalCase**: React 컴포넌트, 클래스, 타입/인터페이스 (`UserProfile`, `MemberType`)
    *   **camelCase**: 변수, 함수, Hooks (`isLoading`, `submitForm`, `useAuth`)
    *   **UPPER_SNAKE_CASE**: 상수 (`MAX_RETRY_COUNT`, `API_BASE_URL`)
    *   **kebab-case**: 파일명(일반 TS/JS 파일), URL 경로 (`user-profile.ts`, `/my-page`)
4.  **파일명 규칙**:
    *   React 컴포넌트 파일: `PascalCase.tsx` (예: `Header.tsx`)
    *   Next.js Page/Route 파일: 프레임워크 규칙 준수 (`page.tsx`, `layout.tsx`)

## 4. 테스트 품질 원칙 (Test Quality Principles)
신뢰할 수 있는 시스템을 만들기 위한 테스트 기준입니다.

1.  **테스트의 목적**: 단순히 커버리지를 높이는 것이 아니라, **비즈니스 로직의 정확성**과 **사용자 시나리오의 완결성**을 검증하는 데 집중한다.
2.  **테스트 피라미드**:
    *   **Unit Test**: 유틸리티 함수, 복잡한 비즈니스 로직 (Hooks) 위주로 작성.
    *   **Integration Test**: 주요 컴포넌트와 데이터 흐름 검증.
    *   **E2E Test**: 핵심 사용자 시나리오(가입, 회칙 조회, 장부 확인) 검증.
3.  **Given-When-Then**: 테스트 코드는 준비(Given), 실행(When), 검증(Then) 단계가 명확히 드러나도록 작성한다.

## 5. 설정, 보안, 운영 원칙 (Config, Security, Ops Principles)

1.  **환경 변수 분리**: 민감한 정보(API Key, DB URL)는 코드에 하드코딩하지 않고 `.env` 파일로 관리한다.
2.  **최소 권한 원칙**: Supabase RLS(Row Level Security)를 철저히 적용하여, 사용자는 본인에게 허용된 데이터에만 접근할 수 있어야 한다.
3.  **에러 핸들링**: 모든 예외 상황(네트워크 오류, 데이터 없음 등)에 대해 사용자에게 적절한 피드백(Toast, Error Page)을 제공해야 한다.
4.  **CI/CD**: 코드가 메인 브랜치에 병합되기 전, 린트(Lint)와 빌드(Build) 테스트를 통과해야 한다.

## 6. 디렉토리 구조 (Directory Structure)
Next.js App Router 기반의 구조를 제안합니다.

```
/
├── .github/                # GitHub Actions workflows
├── app/                    # Next.js App Router (Pages & Layouts)
│   ├── (auth)/             # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── join/
│   ├── (main)/             # 메인 서비스 라우트 그룹
│   │   ├── bylaws/         # 회칙 관련
│   │   ├── finance/        # 장부 관련
│   │   └── members/        # 회원 관련
│   ├── api/                # Backend API Routes (필요 시)
│   ├── layout.tsx          # Root Layout
│   └── page.tsx            # Landing Page
├── components/             # React Components
│   ├── ui/                 # 공통 UI 컴포넌트 (Button, Input, Card 등)
│   ├── layout/             # 레이아웃 컴포넌트 (Header, Footer, Sidebar)
│   └── features/           # 기능별 복합 컴포넌트 (BylawList, LedgerTable)
├── lib/                    # Core Business Logic & Utilities
│   ├── supabase/           # Supabase Client & Types
│   ├── hooks/              # Custom React Hooks
│   ├── utils/              # Helper Functions (Date formatting, Currency 등)
│   └── constants/          # 상수 정의
├── types/                  # TypeScript Type Definitions
│   └── database.types.ts   # Supabase Generated Types
├── public/                 # Static Assets (Images, Fonts)
├── styles/                 # Global Styles (Tailwind 설정 등)
├── docs/                   # Project Documentation
├── .env.local              # Environment Variables
├── next.config.js          # Next.js Configuration
├── package.json            # Dependencies
└── README.md               # Project Entry Point
```

### 백엔드 (Supabase)
백엔드 로직은 주로 Supabase의 기능(Database, Auth, Edge Functions)을 활용하므로 별도의 백엔드 서버 디렉토리는 없으나, 데이터베이스 스키마와 정책은 문서화 또는 마이그레이션 파일로 관리합니다.

*   **Database Schema**: `docs/schema.sql` (또는 Supabase Migration 파일)
*   **Security Policies**: RLS 정책 정의서
