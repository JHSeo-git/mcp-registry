```mermaid
graph TD
    A[사용자] --> B[Layout]
    B --> C[서버 등록]
    B --> D[서버 목록]
    B --> E[배포 관리]

    C --> G[Registry Component]
    D --> H[Servers Component]
    E --> I[Deployments Component]

    G --> K[서버 정보 입력]
    K --> L[등록 처리]
    K --> M[SSH 키 관리]

    H --> N[서버 목록 표시]
    N --> O[서버 상태 확인]
    N --> P[서버 상세 정보]

    I --> Q[배포 목록 표시]
    Q --> R[배포 상태 관리]
    Q --> S[배포 상세 정보]

    subgraph UI Components
        W[Icons]
        X[UI Elements]
        Y[Providers]
        Z[Navigation]
    end

    G --> W
    H --> W
    I --> W
    G --> X
    H --> X
    I --> X
    G --> Y
    H --> Y
    I --> Y
    G --> Z
    H --> Z
    I --> Z
```

## 컴포넌트 흐름 설명

1. **사용자 인터페이스 흐름**

   - 사용자는 Layout을 통해 주요 기능에 접근
   - 네비게이션을 통해 각 컴포넌트로 이동

2. **서버 등록 흐름**

   - Registry 컴포넌트에서 서버 정보 입력
   - SSH 키 관리 기능 포함
   - 입력된 정보를 기반으로 서버 등록 처리

3. **서버 관리 흐름**

   - Servers 컴포넌트에서 등록된 서버 목록 표시
   - 각 서버의 상태 모니터링
   - 서버 상세 정보 확인 기능

4. **배포 관리 흐름**

   - Deployments 컴포넌트에서 배포 목록 관리
   - 배포 상태 및 진행 상황 확인
   - 배포 상세 정보 확인 기능

5. **공통 UI 요소**
   - Icons: shadcn/ui 아이콘 컴포넌트
   - UI Elements: shadcn/ui 기반의 재사용 가능한 UI 컴포넌트
   - Providers: 전역 상태 관리 (React Context)
   - Navigation: Next.js App Router 기반 네비게이션

```

```
