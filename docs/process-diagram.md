```mermaid
graph TD
    %% 주요 컴포넌트
    Client[클라이언트] --> NextAPI[Next.js API]
    NextAPI --> DrizzleDB[(Drizzle DB)]
    NextAPI --> GitHubAPI[GitHub API]
    NextAPI --> DockerRegistry[Docker Registry]
    NextAPI --> SSHManager[SSH Manager]

    %% 레포지토리 등록 프로세스
    subgraph 레포지토리 등록
        direction TB
        R1["POST /api/mcp/regist/github"] --> R2[GitHub 레포지토리 정보 조회]
        R2 --> R3[DB에 레포지토리 저장]
        R3 --> R4[초기 배포 정보 생성]
        R4 --> R5[배포 ID 반환]
    end

    %% 배포 프로세스
    subgraph 배포 프로세스
        direction TB
        D1[GitHub 레포지토리 클론] --> D2[Docker Registry 로그인]
        D2 --> D3[Docker 이미지 빌드]
        D3 --> D4[Docker 이미지 푸시]
        D4 --> D5[SSH를 통한 서버 배포]
        D5 --> D6[배포 상태 업데이트]
    end

    %% 조회 프로세스
    subgraph 조회 프로세스
        direction TB
        Q1["GET /api/mcp/repositories"] --> Q2[레포지토리 목록 조회]
        Q3["GET /api/mcp/deployments"] --> Q4[배포 목록 조회]
        Q5["GET /api/mcp/deployments/{id}/logs"] --> Q6[배포 로그 조회]
        Q7["GET /api/mcp/servers"] --> Q8[서버 목록 조회]
    end

    %% 서버 관리 프로세스
    subgraph 서버 관리
        direction TB
        S1["POST /api/mcp/servers"] --> S2[서버 정보 저장]
        S2 --> S3[SSH 키 등록]
        S3 --> S4[서버 상태 확인]
    end

    %% 연결 관계
    Client --> R1
    Client --> Q1
    Client --> Q3
    Client --> Q5
    Client --> Q7
    Client --> S1

    NextAPI --> R1
    NextAPI --> D1
    NextAPI --> Q1
    NextAPI --> Q3
    NextAPI --> Q5
    NextAPI --> Q7
    NextAPI --> S1

    GitHubAPI --> R2
    GitHubAPI --> D1

    DockerRegistry --> D2
    DockerRegistry --> D4

    SSHManager --> D5
    SSHManager --> S3
    SSHManager --> S4

    DrizzleDB --> R3
    DrizzleDB --> R4
    DrizzleDB --> D6
    DrizzleDB --> Q2
    DrizzleDB --> Q4
    DrizzleDB --> Q6
    DrizzleDB --> Q8
    DrizzleDB --> S2

    %% 스타일
    classDef process fill:#2d3748,stroke:#4a5568,stroke-width:1px,color:#fff
    classDef api fill:#2c5282,stroke:#2b6cb0,stroke-width:1px,color:#fff
    classDef db fill:#2f855a,stroke:#38a169,stroke-width:1px,color:#fff
    classDef client fill:#742a2a,stroke:#c53030,stroke-width:1px,color:#fff

    class Client client
    class NextAPI,GitHubAPI,DockerRegistry,SSHManager api
    class DrizzleDB db
    class R1,R2,R3,R4,R5,D1,D2,D3,D4,D5,D6,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,S1,S2,S3,S4 process
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
   - 서버 정보 관리
   - 데이터 영속성 보장

4. **GitHub API**

   - 레포지토리 정보 조회
   - 소스 코드 클론
   - 커밋 정보 관리

5. **Docker Registry**

   - Docker 이미지 빌드
   - 이미지 저장 및 관리
   - 배포 이미지 제공

6. **SSH Manager**
   - 서버 SSH 키 관리
   - 원격 서버 배포
   - 서버 상태 모니터링

### 프로세스 흐름

1. **레포지토리 등록**

   - GitHub 레포지토리 정보 조회
   - DB에 레포지토리 정보 저장
   - 초기 배포 정보 생성

2. **배포 프로세스**

   - 소스 코드 클론
   - Docker 이미지 빌드 및 푸시
   - SSH를 통한 서버 배포
   - 배포 상태 실시간 업데이트

3. **조회 프로세스**

   - 레포지토리 목록 조회
   - 배포 목록 조회
   - 배포 로그 조회
   - 서버 목록 조회

4. **서버 관리 프로세스**
   - 서버 정보 등록
   - SSH 키 관리
   - 서버 상태 모니터링

### 데이터 흐름

- 실선 화살표: 주요 데이터 흐름
- 점선 화살표: 보조 데이터 흐름
- 서브그래프: 관련 프로세스 그룹화
