import { relations } from "drizzle-orm"
import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "SUCCESS",
  "FAILED",
  "PENDING",
  "IN_PROGRESS",
])

export const deployments = pgTable(
  "deployments",
  {
    id: uuid("id").primaryKey(),
    status: deploymentStatusEnum("status").notNull(),
    commit: text("commit").notNull(),
    commitMessage: text("commit_message"),
    branch: text("branch").notNull(),
    deploymentUrl: text("deployment_url"),
    logs: text("logs"),
    repoId: uuid("repo_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [index("idx_deployments_repo_id").on(table.repoId)]
)

export const servers = pgTable(
  "servers",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    deploymentId: uuid("deployment_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [index("idx_servers_deployment_id").on(table.deploymentId)]
)

export const tools = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    inputSchema: jsonb("input_schema").notNull(),
    serverId: uuid("server_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [index("idx_tools_server_id").on(table.serverId)]
)

export const repos = pgTable(
  "repos",
  {
    id: uuid("id").primaryKey(),
    repoKey: text("repo_key").notNull(),
    project: text("project").notNull(),
    name: text("name").notNull(),
    baseDirectory: text("base_directory").notNull(),
    url: text("url").notNull(),
    registry: text("registry").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [index("idx_repos_repo_key").on(table.repoKey)]
)

export const reposRelations = relations(repos, ({ many }) => ({
  deployments: many(deployments),
}))

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  repo: one(repos, {
    fields: [deployments.repoId],
    references: [repos.id],
  }),
  servers: one(servers, {
    fields: [deployments.id],
    references: [servers.deploymentId],
  }),
}))

export const serversRelations = relations(servers, ({ one, many }) => ({
  deployment: one(deployments, {
    fields: [servers.deploymentId],
    references: [deployments.id],
  }),
  tools: many(tools),
}))

export const toolsRelations = relations(tools, ({ one }) => ({
  server: one(servers, {
    fields: [tools.serverId],
    references: [servers.id],
  }),
}))

export type Deployment = typeof deployments.$inferSelect
export type Tool = typeof tools.$inferSelect
export type Repo = typeof repos.$inferSelect
export type DeploymentStatus = (typeof deploymentStatusEnum.enumValues)[number]
