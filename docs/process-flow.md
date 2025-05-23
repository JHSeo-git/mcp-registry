```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant API as Next.js API
    participant DB as Drizzle DB
    participant GitHub as GitHub API
    participant Docker as Docker Registry

    %% 레포지토리 등록 프로세스
    Client->>API: POST /api/mcp/regist/github
    API->>GitHub: 레포지토리 정보 조회
    GitHub-->>API: 레포지토리 정보
    API->>DB: 레포지토리 정보 저장
    DB-->>API: 저장 완료
    API->>DB: 서버 정보 생성
    DB-->>API: 생성 완료
    API->>DB: 배포 정보 생성 (PENDING)
    DB-->>API: 생성 완료
    API-->>Client: 배포 ID 반환

    %% 배포 프로세스 (비동기)
    Note over API,Docker: 비동기 배포 프로세스 시작
    API->>GitHub: 레포지토리 클론
    GitHub-->>API: 클론 완료
    API->>Docker: Docker 로그인
    Docker-->>API: 로그인 성공
    API->>Docker: Docker 빌드 및 푸시
    Docker-->>API: 빌드/푸시 완료
    API->>DB: 도구 목록 저장
    DB-->>API: 저장 완료
    API->>DB: 배포 상태 업데이트 (SUCCESS)
    DB-->>API: 업데이트 완료

    %% 레포지토리 목록 조회
    Client->>API: GET /api/mcp/repositories
    API->>DB: 레포지토리 목록 조회
    DB-->>API: 레포지토리 목록
    API-->>Client: 레포지토리 목록 반환

    %% 배포 목록 조회
    Client->>API: GET /api/mcp/deployments/{repokey}
    API->>DB: 배포 목록 조회
    DB-->>API: 배포 목록
    API-->>Client: 배포 목록 반환

    %% 배포 로그 조회
    Client->>API: GET /api/mcp/deployments/{id}/logs
    API->>DB: 배포 로그 조회
    DB-->>API: 배포 로그
    API-->>Client: 배포 로그 반환

    %% 도구 호출
    Client->>API: POST /api/mcp/servers/tool/call/{repokey}
    API->>Docker: Docker 컨테이너 실행
    Docker-->>API: 도구 실행 결과
    API-->>Client: 도구 실행 결과 반환
```

## 프로세스 흐름 설명

1. **레포지토리 등록 프로세스**

   - 클라이언트가 GitHub 레포지토리 등록 요청 (`POST /api/mcp/regist/github`)
   - GitHub API를 통해 레포지토리 정보 조회
   - Drizzle DB에 레포지토리 정보 저장
   - 서버 정보 생성 (transportType 포함)
   - 초기 배포 정보 생성 (PENDING 상태)
   - 배포 ID 반환

2. **배포 프로세스 (비동기)**

   - GitHub에서 레포지토리 클론
   - Docker Registry 로그인
   - Docker 이미지 빌드 및 푸시
   - 도구 목록 생성 및 저장
   - 배포 상태 실시간 업데이트
   - 최종 상태 업데이트 (SUCCESS/FAILED)

3. **레포지토리 목록 조회**

   - 등록된 모든 레포지토리 목록 조회 (`GET /api/mcp/repositories`)
   - Drizzle DB에서 데이터 조회
   - 클라이언트에 목록 반환

4. **배포 목록 조회**

   - 특정 레포지토리의 모든 배포 목록 조회 (`GET /api/mcp/deployments/{repokey}`)
   - Drizzle DB에서 데이터 조회
   - 환경 변수 정보 포함
   - 클라이언트에 목록 반환

5. **배포 로그 조회**

   - 특정 배포의 상세 로그 조회 (`GET /api/mcp/deployments/{id}/logs`)
   - 배포 ID를 기준으로 조회
   - Drizzle DB에서 로그 데이터 조회
   - 클라이언트에 로그 반환

6. **도구 호출**
   - 특정 레포지토리의 도구 호출 (`POST /api/mcp/servers/tool/call/{repokey}`)
   - Docker 컨테이너를 통한 도구 실행
   - stdio 또는 sse 방식 지원 (현재는 stdio만 구현)
   - 도구 실행 결과 반환

## 기술 스택

- Next.js API Routes
- Drizzle ORM
- GitHub API
- Docker Registry
- PostgreSQL (Drizzle DB)
