# mcp-registry

## deployment

1. github repository list up
2. github repository 선택
3. deployment 클릭

---

1. github repository를 clone해서
2. Dockerfile이 있는지 확인하고
3. Dockerfile을 빌드한 뒤
4. docker registry(harbor 등)에 image push
5. 이 진행상황을 프론트에서 실시간 로그로 확인할 수 있게(github actions 로그처럼)
   간단하게 처리한다면 deploy... 라고만 표시할 수도 있음
6. 각각 배포 상태를 db 에 저장하여 관리

### smithery deployment 참고

supabase + supabase.realtime 사용함

```json
{
  "ref": null,
  "event": "postgres_changes",
  "payload": {
    "data": {
      "table": "deployments",
      "type": "UPDATE",
      "record": {
        "branch": "main",
        "commit": "1790685d5111bb50f2947adcf24f0650a37a4fe2",
        "commit_message": "feat: update mcp server configs",
        "created_at": "2025-04-13T13:11:35.432204",
        "deployment_url": "https://smithery-a32267b9-a1d0-49e3-b112-d4f72a9dcc52.fly.dev",
        "id": "8f84a3b5-6501-4819-9c4d-b15463ab575f",
        "logs": "Found cached build config files...\nUsing smithery.yaml from repository\nUsing Dockerfile from repository\nSuccessfully obtained required build config files. Preparing build...\nBuilding Docker image...\nStarting deployment...\nDeployment successful!\n",
        "repo": "610bf9d1-ccb8-44b0-9878-16be3b29075e",
        "server_id": "a32267b9-a1d0-49e3-b112-d4f72a9dcc52",
        "status": "SUCCESS",
        "updated_at": "2025-04-13T13:12:10.343931"
      },
      "columns": [
        {
          "name": "id",
          "type": "uuid"
        },
        {
          "name": "server_id",
          "type": "uuid"
        },
        {
          "name": "status",
          "type": "deployment_status"
        },
        {
          "name": "commit",
          "type": "text"
        },
        {
          "name": "commit_message",
          "type": "text"
        },
        {
          "name": "repo",
          "type": "uuid"
        },
        {
          "name": "branch",
          "type": "text"
        },
        {
          "name": "deployment_url",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "timestamp"
        },
        {
          "name": "updated_at",
          "type": "timestamp"
        },
        {
          "name": "logs",
          "type": "text"
        }
      ],
      "errors": null,
      "schema": "public",
      "commit_timestamp": "2025-04-13T13:12:10.349Z",
      "old_record": {
        "id": "8f84a3b5-6501-4819-9c4d-b15463ab575f"
      }
    },
    "ids": [18106521, 98814511]
  },
  "topic": "realtime:deployments"
}
```

## runner

- client에서 [mcp-runner](https://github.com/JHSeo-git/mcp-runner) websocket server를 통해 mcp 연결 및 tool 호출

  - GET /ws 으로 websocket 실행 및 주소를 얻어오고
  - wss:// 연결 하여 tool 호출

- [smithery serverless hosting](https://smithery.ai/docs/deployments#serverless-hosting)처럼 x분(e.g: 5분) timeout으로 실행

  - websocket 실행 시 5분 timeout 처리
