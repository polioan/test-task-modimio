CREATE TABLE "admins" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"login" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email_verified_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "users_login_unique" UNIQUE("login"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
