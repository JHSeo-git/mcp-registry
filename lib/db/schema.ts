import { relations } from "drizzle-orm"
import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// deployment status enum 정의
export const deploymentStatusEnum = pgEnum("deployment_status", [
  "SUCCESS",
  "FAILED",
  "PENDING",
  "IN_PROGRESS",
])

// deployments 테이블 정의
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
  (table) => [index("idx_deployments_repo_id_commit").on(table.repoId, table.commit)]
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
}))

export type Deployment = typeof deployments.$inferSelect
export type Repo = typeof repos.$inferSelect
export type DeploymentStatus = (typeof deploymentStatusEnum.enumValues)[number]
