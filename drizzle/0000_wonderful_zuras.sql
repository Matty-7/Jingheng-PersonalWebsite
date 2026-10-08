CREATE TABLE `learning_items` (
	`owner_key` text NOT NULL,
	`concept_id` text NOT NULL,
	`understood` integer DEFAULT 0 NOT NULL,
	`answer_choice` integer,
	`question_version` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner_key`, `concept_id`)
);
--> statement-breakpoint
CREATE TABLE `learning_profiles` (
	`owner_key` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`current_id` text NOT NULL,
	`updated_at` integer NOT NULL
);
