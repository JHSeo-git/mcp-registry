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
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"deployment_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"input_schema" jsonb NOT NULL,
	"server_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE INDEX "idx_deployments_repo_id" ON "deployments" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "idx_repos_repo_key" ON "repos" USING btree ("repo_key");--> statement-breakpoint
CREATE INDEX "idx_servers_deployment_id" ON "servers" USING btree ("deployment_id");--> statement-breakpoint
CREATE INDEX "idx_tools_server_id" ON "tools" USING btree ("server_id");