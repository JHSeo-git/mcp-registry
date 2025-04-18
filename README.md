# mcp-registry

## 서버 요구 사항

- docker
- node

## Docs

- [component diagram](./docs/component-diagram.md)
- [db relations](./docs/db-relations.md)
- [process diagram](./docs/process-diagram.md)
- [process flow](./docs/process-flow.md)

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

```

## TODO

- [ ] github token 용 프로젝트 계정 생성 필요
```
