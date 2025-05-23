CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "role" varchar check("role" in('admin', 'student')) not null default 'student',
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "student_profiles"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "address" varchar not null,
  "city" varchar not null,
  "state" varchar not null,
  "zip_code" varchar not null,
  "phone_number" varchar not null,
  "school_type" varchar check("school_type" in('high_school', 'college')) not null,
  "school_level" varchar not null,
  "school_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  "student_id" varchar,
  "gpa" float,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "scholarship_programs"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" text not null,
  "total_budget" numeric not null,
  "per_student_budget" numeric not null,
  "school_type_eligibility" varchar check("school_type_eligibility" in('high_school', 'college', 'both')) not null,
  "min_gpa" numeric not null,
  "min_units" integer,
  "semester" varchar not null,
  "academic_year" varchar not null,
  "application_deadline" date not null,
  "community_service_days" integer not null default '6',
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  "available_slots" integer
);
CREATE TABLE IF NOT EXISTS "document_requirements"(
  "id" integer primary key autoincrement not null,
  "scholarship_program_id" integer not null,
  "name" varchar not null,
  "description" text not null,
  "is_required" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("scholarship_program_id") references "scholarship_programs"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "scholarship_applications"(
  "id" integer primary key autoincrement not null,
  "student_profile_id" integer not null,
  "scholarship_program_id" integer not null,
  "status" varchar check("status" in('draft', 'submitted', 'documents_pending', 'documents_under_review', 'documents_approved', 'documents_rejected', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed', 'rejected')) not null default 'draft',
  "admin_notes" text,
  "submitted_at" datetime,
  "reviewed_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("student_profile_id") references "student_profiles"("id") on delete cascade,
  foreign key("scholarship_program_id") references "scholarship_programs"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "document_uploads"(
  "id" integer primary key autoincrement not null,
  "scholarship_application_id" integer not null,
  "document_requirement_id" integer not null,
  "file_path" varchar not null,
  "original_filename" varchar not null,
  "status" varchar check("status" in('pending_review', 'approved', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other')) not null default 'pending_review',
  "rejection_reason" text,
  "uploaded_at" datetime not null,
  "reviewed_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("scholarship_application_id") references "scholarship_applications"("id") on delete cascade,
  foreign key("document_requirement_id") references "document_requirements"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "community_service_reports"(
  "id" integer primary key autoincrement not null,
  "scholarship_application_id" integer not null,
  "description" text not null,
  "days_completed" integer not null,
  "status" varchar check("status" in('pending_review', 'approved', 'rejected_insufficient_hours', 'rejected_incomplete_documentation', 'rejected_other')) not null default 'pending_review',
  "rejection_reason" text,
  "submitted_at" datetime not null,
  "reviewed_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("scholarship_application_id") references "scholarship_applications"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "disbursements"(
  "id" integer primary key autoincrement not null,
  "scholarship_application_id" integer not null,
  "amount" numeric not null,
  "status" varchar check("status" in('pending', 'processing', 'disbursed', 'on_hold', 'cancelled')) not null default 'pending',
  "payment_method" varchar,
  "reference_number" varchar,
  "disbursed_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("scholarship_application_id") references "scholarship_applications"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "notifications"(
  "id" integer primary key autoincrement not null,
  "created_at" datetime,
  "updated_at" datetime
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2024_05_20_000001_create_student_profiles_table',1);
INSERT INTO migrations VALUES(5,'2024_05_20_000002_create_scholarship_programs_table',1);
INSERT INTO migrations VALUES(6,'2024_05_20_000003_create_document_requirements_table',1);
INSERT INTO migrations VALUES(7,'2024_05_20_000004_create_scholarship_applications_table',1);
INSERT INTO migrations VALUES(8,'2024_05_20_000005_create_document_uploads_table',1);
INSERT INTO migrations VALUES(9,'2024_05_20_000006_create_community_service_reports_table',1);
INSERT INTO migrations VALUES(10,'2024_05_20_000007_create_disbursements_table',1);
INSERT INTO migrations VALUES(11,'2025_05_21_050906_add_student_id_and_gpa_to_student_profiles_table',2);
INSERT INTO migrations VALUES(12,'2025_05_21_053143_fix_scholarship_program_available_slots',3);
INSERT INTO migrations VALUES(13,'2025_05_23_033115_create_notifications_table',4);
