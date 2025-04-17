CREATE TYPE "public"."deployment_status" AS ENUM('SUCCESS', 'FAILED', 'PENDING', 'IN_PROGRESS');--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "deployment_status" NOT NULL,
	"commit" text NOT NULL,
	"commit_message" text,
	"branch" text NOT NULL,
	"deployment_url" text,
	"logs" text,
	"repo_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"repo_key" text NOT NULL,
	"project" text NOT NULL,
	"name" text NOT NULL,
	"base_directory" text NOT NULL,
	"url" text NOT NULL,
	"registry" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE INDEX "idx_deployments_repo_id_commit" ON "deployments" USING btree ("repo_id","commit");--> statement-breakpoint
CREATE INDEX "idx_repos_repo_key" ON "repos" USING btree ("repo_key");