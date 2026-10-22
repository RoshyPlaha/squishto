CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"short_code" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
