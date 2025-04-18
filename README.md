# mcp-registry

## 서버 요구 사항

- docker
- node

## Get started

### .env

```bash
cp .env.example .env
```

```
POSTGRES_DB="your database name"
POSTGRES_USER="your database username"
POSTGRES_PASSWORD="your database password"
POSTGRES_URL="your database url"

DOCKER_DOMAIN="your docker domain"
DOCKER_USER="your docker username"
DOCKER_PASSWORD="your docker password"

GITHUB_TOKEN="your github token"
```

### Installation

- bun: https://bun.sh/docs/installation

```bash
bun i
```

### Docker compose up

```bash
docker compose up -d
```

### DB Migration

```bash
bun db:m
```

### Development run

```bash
bun dev
```

## How to regist

### public

1. repository form 입력
2. regist 클릭

### private

1. token 발급
2. wire code project list up
3. repository 선택
4. regist 클릭

## deployment process

1. github repository를 clone해서
2. Dockerfile이 있는지 확인하고
3. Dockerfile을 빌드한 뒤
4. docker registry(harbor 등)에 image push
5. 이 진행상황을 프론트에서 실시간 로그로 확인할 수 있게(github actions 로그처럼)
   간단하게 처리한다면 deploy... 라고만 표시할 수도 있음
6. 각각 배포 상태를 db 에 저장하여 관리

## tool playground

1. connect 클릭
2. 백엔드에서 mcp서버 실행: docker run?
   어디서 실행? 백엔드 서버에서 docker run?
   아니면 다른 곳에서 실행? 그러면 어떻게 클라이언트가 연결함?

### tool runner

> https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/63#discussioncomment-11639955  
> https://github.com/supercorp-ai/supergateway

stdio <-> sse gateway

```bash
docker run -it --rm -p 8000:8000 supercorp/supergateway \
    --stdio "npx -y @modelcontextprotocol/server-filesystem /" \
    --port 8000
```

- [smithery serverless hosting](https://smithery.ai/docs/deployments#serverless-hosting)처럼 x분(e.g: 5분) timeout으로 실행

  - websocket 실행 시 5분 timeout 처리

### tool client

> not deployed yet, but soon

```bash
npx -y @modelcontextprotocol/inspector --cli http://localhost:8181 --method tools/list
npx -y @modelcontextprotocol/inspector --cli http://localhost:8181 --method tools/call --tool-name echo --tool-arg message=test
```

## TODO

- [ ] github token 용 프로젝트 계정 생성 필요
