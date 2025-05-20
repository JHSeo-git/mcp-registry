import { relations } from "drizzle-orm"
import { index, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "SUCCESS",
  "FAILED",
  "PENDING",
  "IN_PROGRESS",
])

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
  (table) => [unique("uq_repos_repo_key").on(table.repoKey)]
)

export const servers = pgTable(
  "servers",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    repoId: uuid("repo_id").notNull(),
    tag: text("tag"),
    transportType: text("transport_type").notNull(),
    commandType: text("command_type").notNull(),
    command: text("command"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [unique("uq_servers_repo_id").on(table.repoId)]
)

export const tools = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    inputSchema: jsonb("input_schema").notNull(),
    serverId: uuid("server_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [
    index("idx_tools_server_id").on(table.serverId),
    unique("uq_tools_server_id_name").on(table.serverId, table.name),
  ]
)

export const environments = pgTable(
  "environments",
  {
    id: uuid("id").primaryKey(),
    key: text("key").notNull(),
    serverId: uuid("server_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [
    index("idx_environments_server_id").on(table.serverId),
    unique("uq_environments_server_id_key").on(table.serverId, table.key),
  ]
)

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
    serverId: uuid("server_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (table) => [index("idx_deployments_repo_id_server_id").on(table.repoId, table.serverId)]
)

export const reposRelations = relations(repos, ({ many, one }) => ({
  deployments: many(deployments),
  servers: one(servers, {
    fields: [repos.id],
    references: [servers.repoId],
  }),
}))

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  repo: one(repos, {
    fields: [deployments.repoId],
    references: [repos.id],
  }),
  servers: one(servers, {
    fields: [deployments.serverId],
    references: [servers.id],
  }),
}))

export const serversRelations = relations(servers, ({ many }) => ({
  deployments: many(deployments),
  tools: many(tools),
  environments: many(environments),
}))

export const toolsRelations = relations(tools, ({ one }) => ({
  server: one(servers, {
    fields: [tools.serverId],
    references: [servers.id],
  }),
}))

export const environmentsRelations = relations(environments, ({ one }) => ({
  server: one(servers, {
    fields: [environments.serverId],
    references: [servers.id],
  }),
}))

export type Deployment = typeof deployments.$inferSelect
export type Tool = typeof tools.$inferSelect
export type Repo = typeof repos.$inferSelect
export type Environment = typeof environments.$inferSelect
export type DeploymentStatus = (typeof deploymentStatusEnum.enumValues)[number]
