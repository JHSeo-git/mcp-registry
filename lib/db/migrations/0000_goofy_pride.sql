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
	"server_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "environments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"server_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "uq_environments_server_id_key" UNIQUE("server_id","key")
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
	"updated_by" text,
	CONSTRAINT "uq_repos_repo_key" UNIQUE("repo_key")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"repo_id" uuid NOT NULL,
	"tag" text,
	"transport_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "uq_servers_repo_id" UNIQUE("repo_id")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"input_schema" jsonb NOT NULL,
	"server_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "uq_tools_server_id_name" UNIQUE("server_id","name")
);
--> statement-breakpoint
CREATE INDEX "idx_deployments_repo_id_server_id" ON "deployments" USING btree ("repo_id","server_id");--> statement-breakpoint
CREATE INDEX "idx_environments_server_id" ON "environments" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_tools_server_id" ON "tools" USING btree ("server_id");