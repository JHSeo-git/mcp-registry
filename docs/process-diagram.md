```mermaid
graph TD
    %% 주요 컴포넌트
    Client[클라이언트] --> NextAPI[Next.js API]
    NextAPI --> DrizzleDB[(Drizzle DB)]
    NextAPI --> GitHubAPI[GitHub API]
    NextAPI --> DockerRegistry[Docker Registry]

    %% 레포지토리 등록 프로세스
    subgraph 레포지토리 등록
        direction TB
        R1["POST /api/mcp/regist/github"] --> R2[GitHub 레포지토리 정보 조회]
        R2 --> R3[DB에 레포지토리 저장]
        R3 --> R4[Docker 이미지 빌드]
        R4 --> R5[도구 메타데이터 생성]
        R5 --> R6[배포 ID 반환]
    end

    %% 조회 프로세스
    subgraph 조회 프로세스
        direction TB
        Q1["GET /api/mcp/repositories"] --> Q2[레포지토리 목록 조회]
        Q3["GET /api/mcp/repositories/{repokey}"] --> Q4[레포지토리 상세 조회]
        Q5["GET /api/mcp/deployments/{repokey}"] --> Q6[배포 목록 조회]
        Q7["GET /api/mcp/deployments/{id}/logs"] --> Q8[배포 로그 조회]
    end

    %% 도구 호출 프로세스
    subgraph 도구 호출
        direction TB
        T1["POST /api/mcp/servers/tool/call/{repokey}"] --> T2[도구 호출 요청]
        T2 --> T3[Docker 컨테이너 실행]
        T3 --> T4[도구 실행 결과 반환]
    end

    %% 연결 관계
    Client --> R1
    Client --> Q1
    Client --> Q3
    Client --> Q5
    Client --> Q7
    Client --> T1

    NextAPI --> R1
    NextAPI --> Q1
    NextAPI --> Q3
    NextAPI --> Q5
    NextAPI --> Q7
    NextAPI --> T1

    GitHubAPI --> R2

    DockerRegistry --> R4
    DockerRegistry --> T3

    DrizzleDB --> R3
    DrizzleDB --> R5
    DrizzleDB --> Q2
    DrizzleDB --> Q4
    DrizzleDB --> Q6
    DrizzleDB --> Q8

    %% 스타일
    classDef process fill:#2d3748,stroke:#4a5568,stroke-width:1px,color:#fff
    classDef api fill:#2c5282,stroke:#2b6cb0,stroke-width:1px,color:#fff
    classDef db fill:#2f855a,stroke:#38a169,stroke-width:1px,color:#fff
    classDef client fill:#742a2a,stroke:#c53030,stroke-width:1px,color:#fff

    class Client client
    class NextAPI,GitHubAPI,DockerRegistry api
    class DrizzleDB db
    class R1,R2,R3,R4,R5,R6,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,T1,T2,T3,T4 process
```

## 다이어그램 설명

### 주요 컴포넌트

1. **클라이언트**

   - 웹 인터페이스를 통해 시스템과 상호작용
   - API 요청을 통해 다양한 기능 수행

2. **Next.js API**

   - 모든 API 요청의 진입점
   - 비즈니스 로직 처리
   - 외부 서비스와의 통합 관리

3. **Drizzle DB**

   - 레포지토리 정보 저장
   - 배포 상태 및 로그 관리
   - 도구 메타데이터 관리
   - 데이터 영속성 보장

4. **GitHub API**

   - 레포지토리 정보 조회
   - 소스 코드 클론
   - 커밋 정보 관리

5. **Docker Registry**
   - Docker 이미지 빌드
   - 이미지 저장 및 관리
   - 도구 실행을 위한 컨테이너 제공

### 프로세스 흐름

1. **레포지토리 등록**

   - GitHub 레포지토리 정보 조회
   - DB에 레포지토리 정보 저장
   - Docker 이미지 빌드
   - 도구 메타데이터 생성
   - 배포 ID 반환

2. **조회 프로세스**

   - 레포지토리 목록 조회
   - 레포지토리 상세 조회
   - 배포 목록 조회
   - 배포 로그 조회

3. **도구 호출 프로세스**
   - 도구 호출 요청
   - Docker 컨테이너 실행
   - 도구 실행 결과 반환

### 데이터 흐름

- 실선 화살표: 주요 데이터 흐름
- 서브그래프: 관련 프로세스 그룹화

### 주요 API 엔드포인트

1. **레포지토리 관리**

   - `POST /api/mcp/regist/github`: GitHub 레포지토리 등록
   - `GET /api/mcp/repositories`: 레포지토리 목록 조회
   - `GET /api/mcp/repositories/{repokey}`: 레포지토리 상세 조회

2. **배포 관리**

   - `GET /api/mcp/deployments/{repokey}`: 배포 목록 조회
   - `GET /api/mcp/deployments/{id}/logs`: 배포 로그 조회

3. **도구 호출**
   - `POST /api/mcp/servers/tool/call/{repokey}`: 도구 호출 및 실행

```

```
