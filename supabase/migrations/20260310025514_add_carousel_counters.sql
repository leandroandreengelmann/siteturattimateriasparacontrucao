-- Migration to add counters to carousel_settings
ALTER TABLE "public"."carousel_settings" ADD COLUMN IF NOT EXISTS "has_timer" boolean DEFAULT false;
ALTER TABLE "public"."carousel_settings" ADD COLUMN IF NOT EXISTS "timer_target_date" timestamp with time zone;
ALTER TABLE "public"."carousel_settings" ADD COLUMN IF NOT EXISTS "has_quantity" boolean DEFAULT false;
ALTER TABLE "public"."carousel_settings" ADD COLUMN IF NOT EXISTS "quantity_count" integer;
