```mermaid
graph TD
    A[사용자] --> B[Site Header]
    B --> C[서버 등록]
    B --> D[서버 목록]
    B --> E[배포 관리]
    B --> F[로그 확인]

    C --> G[Register Component]
    D --> H[Servers Component]
    E --> I[Deployments Component]
    F --> J[Logs Component]

    G --> K[서버 정보 입력]
    K --> L[등록 처리]

    H --> M[서버 목록 표시]
    M --> N[서버 상태 확인]

    I --> O[배포 목록 표시]
    O --> P[배포 상태 관리]

    J --> Q[로그 데이터 표시]
    Q --> R[로그 필터링]

    subgraph UI Components
        S[Icons]
        T[UI Elements]
    end

    G --> S
    H --> S
    I --> S
    J --> S
    G --> T
    H --> T
    I --> T
    J --> T
```

## 컴포넌트 흐름 설명

1. **사용자 인터페이스 흐름**

   - 사용자는 Site Header를 통해 주요 기능에 접근
   - 네비게이션 메뉴를 통해 각 컴포넌트로 이동

2. **서버 등록 흐름**

   - Register 컴포넌트에서 서버 정보 입력
   - 입력된 정보를 기반으로 서버 등록 처리

3. **서버 관리 흐름**

   - Servers 컴포넌트에서 등록된 서버 목록 표시
   - 각 서버의 상태 모니터링

4. **배포 관리 흐름**

   - Deployments 컴포넌트에서 배포 목록 관리
   - 배포 상태 및 진행 상황 확인

5. **로그 관리 흐름**

   - Logs 컴포넌트에서 시스템 로그 확인
   - 로그 필터링 및 검색 기능 제공

6. **공통 UI 요소**
   - Icons 컴포넌트: 전체 시스템에서 사용되는 아이콘
   - UI Elements: 재사용 가능한 UI 컴포넌트들
