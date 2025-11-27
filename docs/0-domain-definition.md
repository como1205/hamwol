# 도메인 정의서 (Domain Definition)

## 1. 개요 (Overview)
*   **프로젝트명**: 함월 (Hamwol) - 고등학교 계모임 관리 시스템
*   **목적**: 계모임 회원들의 정보 공유, 회칙 관리, 그리고 투명한 자금(장부) 관리를 웹 기반으로 제공하여 접근성과 신뢰성을 높임.
*   **배포 목표**: 무료 사용 가능한 웹 호스팅 및 DB 사용 (예: Vercel + Supabase).

## 2. 업무 범위 (Scope)
1.  **회칙 관리 (Bylaws Management)**
    *   회칙의 제정 및 개정 이력을 관리.
    *   과거 회칙 조회 및 최신 회칙 명시.
2.  **회원 관리 (Member Management)**
    *   회원 명부 관리 (연락처, 가입일 등).
    *   역할 부여 (회장, 총무, 일반 회원).
3.  **장부 관리 (Ledger Management)**
    *   회비 입금 및 지출 내역 기록.
    *   실시간 잔액 계산 및 조회.
    *   비고란을 통한 지출 증빙 또는 메모.

## 3. 주요 사용자 (Actors)
*   **관리자 (Admin)**: 회장 또는 총무. 회칙 수정, 회원 정보 관리, 장부 기입/수정 권한 보유.
*   **일반 회원 (Member)**: 본인 정보 수정, 회칙 조회, 장부 조회(읽기 전용) 권한 보유.

## 4. 엔티티 정의 (Entities)

### 4.1. 회원 (Member)
| 속성명 | 설명 | 데이터 타입 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | 고유 식별자 | UUID | PK |
| `name` | 이름 | String | |
| `email` | 이메일 | String | 로그인 ID |
| `phone` | 전화번호 | String | |
| `role` | 역할 | Enum | ADMIN, MEMBER |
| `status` | 상태 | Enum | ACTIVE, INACTIVE |
| `joined_at` | 가입일 | Date | |

### 4.2. 회칙 (Bylaw)
| 속성명 | 설명 | 데이터 타입 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | 고유 식별자 | UUID | PK |
| `version` | 버전 | String | 예: 1.0, 2024-1차 |
| `title` | 제목 | String | |
| `content` | 내용 | Text | Markdown 또는 HTML |
| `created_at` | 작성일 | DateTime | |
| `effective_date` | 시행일 | Date | |
| `author_id` | 작성자 | UUID | FK (Member) |

### 4.3. 장부 거래 (Transaction)
| 속성명 | 설명 | 데이터 타입 | 비고 |
| :--- | :--- | :--- | :--- |
| `id` | 고유 식별자 | UUID | PK |
| `date` | 거래 일자 | Date | |
| `type` | 거래 유형 | Enum | DEPOSIT(입금), WITHDRAWAL(출금) |
| `amount` | 금액 | Decimal | |
| `balance` | 거래 후 잔액 | Decimal | (계산됨 또는 스냅샷) |
| `category` | 분류 | String | 예: 회비, 식대, 경조사비 |
| `description` | 비고/내용 | String | |
| `created_by` | 기입자 | UUID | FK (Member) |

## 5. 업무 흐름 (Workflows)

### 5.1. 회칙 관리
1.  **조회**: 모든 회원은 현재 유효한 회칙을 조회할 수 있다.
2.  **수정(개정)**: 관리자는 새로운 버전의 회칙을 작성한다.
3.  **확정**: 작성된 회칙을 게시하면 이력이 남고, 새로운 '현재 회칙'이 된다.

### 5.2. 장부 관리
1.  **입/출금 등록**: 관리자는 날짜, 금액, 사유를 입력하여 거래를 생성한다.
2.  **잔액 갱신**: 거래 등록 시 전체 잔액이 재계산되거나 갱신된다.
3.  **조회**: 회원은 전체 거래 내역과 현재 잔액을 조회할 수 있다.

## 6. 메뉴 구조 (Menu Structure)
*   **홈 (Dashboard)**
    *   공지사항 (최신 회칙 변경 등)
    *   현재 잔액 요약
*   **소개 및 회칙 (About)**
    *   모임 소개
    *   회칙 보기 (탭: 현재 회칙 / 개정 이력)
*   **회원 명부 (Members)**
    *   회원 리스트
    *   조직도 (임원진 표시)
*   **재정 관리 (Finance)**
    *   장부 현황 (입출금 리스트)
    *   통계 (월별/연별 수입 지출 - *Optional*)
*   **마이페이지 (My Page)**
    *   내 정보 수정

## 7. 비기능 요구사항 (Non-functional Requirements)
*   **비용**: 서버 및 데이터베이스 비용 0원 유지 (Free Tier 활용).
*   **접근성**: PC/Mobile 웹 브라우저 어디서든 접근 가능 (Responsive Design).
*   **데이터 보존**: 회칙 및 장부 데이터의 무결성 보장.

## 8. 기술 스택 제안 (Tech Stack Proposal)
*   **Frontend**: Next.js (React) - Vercel 배포
*   **Backend/DB**: Supabase (PostgreSQL + Auth) - Free Tier
*   **Styling**: Tailwind CSS (빠르고 깔끔한 UI 구성)
