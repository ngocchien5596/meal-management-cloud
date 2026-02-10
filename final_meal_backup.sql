--
-- PostgreSQL database dump
--

\restrict 9HfhdUAnM2uKF2bi4K1gSo4jY2bBcme1NZgcCm43cYuQWHpgoAPQdLhIDb6YzLH

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY meal_management."Registration" DROP CONSTRAINT IF EXISTS "Registration_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Registration" DROP CONSTRAINT IF EXISTS "Registration_employeeId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."MenuItem" DROP CONSTRAINT IF EXISTS "MenuItem_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."MealReview" DROP CONSTRAINT IF EXISTS "MealReview_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."MealReview" DROP CONSTRAINT IF EXISTS "MealReview_employeeId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Ingredient" DROP CONSTRAINT IF EXISTS "Ingredient_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Guest" DROP CONSTRAINT IF EXISTS "Guest_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Employee" DROP CONSTRAINT IF EXISTS "Employee_positionId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Employee" DROP CONSTRAINT IF EXISTS "Employee_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."CheckinLog" DROP CONSTRAINT IF EXISTS "CheckinLog_mealEventId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."CheckinLog" DROP CONSTRAINT IF EXISTS "CheckinLog_guestId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."CheckinLog" DROP CONSTRAINT IF EXISTS "CheckinLog_employeeId_fkey";
ALTER TABLE IF EXISTS ONLY meal_management."Account" DROP CONSTRAINT IF EXISTS "Account_employeeId_fkey";
DROP INDEX IF EXISTS meal_management."SystemConfig_key_key";
DROP INDEX IF EXISTS meal_management."Registration_mealEventId_employeeId_key";
DROP INDEX IF EXISTS meal_management."RegistrationPreset_name_key";
DROP INDEX IF EXISTS meal_management."Position_name_key";
DROP INDEX IF EXISTS meal_management."MealReview_mealEventId_idx";
DROP INDEX IF EXISTS meal_management."MealPriceConfig_startDate_endDate_idx";
DROP INDEX IF EXISTS meal_management."MealEvent_qrToken_key";
DROP INDEX IF EXISTS meal_management."MealEvent_mealDate_mealType_key";
DROP INDEX IF EXISTS meal_management."Guest_qrToken_key";
DROP INDEX IF EXISTS meal_management."Employee_employeeCode_key";
DROP INDEX IF EXISTS meal_management."Employee_email_key";
DROP INDEX IF EXISTS meal_management."Department_name_key";
DROP INDEX IF EXISTS meal_management."CheckinLog_mealEventId_guestId_key";
DROP INDEX IF EXISTS meal_management."CheckinLog_mealEventId_employeeId_key";
DROP INDEX IF EXISTS meal_management."Account_sharedUserId_key";
DROP INDEX IF EXISTS meal_management."Account_employeeId_key";
ALTER TABLE IF EXISTS ONLY meal_management._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY meal_management."SystemConfig" DROP CONSTRAINT IF EXISTS "SystemConfig_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Registration" DROP CONSTRAINT IF EXISTS "Registration_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."RegistrationPreset" DROP CONSTRAINT IF EXISTS "RegistrationPreset_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Position" DROP CONSTRAINT IF EXISTS "Position_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."MenuItem" DROP CONSTRAINT IF EXISTS "MenuItem_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."MealReview" DROP CONSTRAINT IF EXISTS "MealReview_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."MealPriceConfig" DROP CONSTRAINT IF EXISTS "MealPriceConfig_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."MealEvent" DROP CONSTRAINT IF EXISTS "MealEvent_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Ingredient" DROP CONSTRAINT IF EXISTS "Ingredient_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Guest" DROP CONSTRAINT IF EXISTS "Guest_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Employee" DROP CONSTRAINT IF EXISTS "Employee_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Department" DROP CONSTRAINT IF EXISTS "Department_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."CheckinLog" DROP CONSTRAINT IF EXISTS "CheckinLog_pkey";
ALTER TABLE IF EXISTS ONLY meal_management."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
DROP TABLE IF EXISTS meal_management._prisma_migrations;
DROP TABLE IF EXISTS meal_management."SystemConfig";
DROP TABLE IF EXISTS meal_management."RegistrationPreset";
DROP TABLE IF EXISTS meal_management."Registration";
DROP TABLE IF EXISTS meal_management."Position";
DROP TABLE IF EXISTS meal_management."MenuItem";
DROP TABLE IF EXISTS meal_management."MealReview";
DROP TABLE IF EXISTS meal_management."MealPriceConfig";
DROP TABLE IF EXISTS meal_management."MealEvent";
DROP TABLE IF EXISTS meal_management."Ingredient";
DROP TABLE IF EXISTS meal_management."Guest";
DROP TABLE IF EXISTS meal_management."Employee";
DROP TABLE IF EXISTS meal_management."Department";
DROP TABLE IF EXISTS meal_management."CheckinLog";
DROP TABLE IF EXISTS meal_management."Account";
DROP TYPE IF EXISTS meal_management."Role";
DROP TYPE IF EXISTS meal_management."MealType";
DROP TYPE IF EXISTS meal_management."MealStatus";
DROP TYPE IF EXISTS meal_management."CheckinMethod";
DROP SCHEMA IF EXISTS meal_management;
--
-- Name: meal_management; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA meal_management;


ALTER SCHEMA meal_management OWNER TO pg_database_owner;

--
-- Name: SCHEMA meal_management; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA meal_management IS 'standard public schema';


--
-- Name: CheckinMethod; Type: TYPE; Schema: meal_management; Owner: meal_user
--

CREATE TYPE meal_management."CheckinMethod" AS ENUM (
    'QR_SCAN',
    'MANUAL',
    'SELF_SCAN'
);


ALTER TYPE meal_management."CheckinMethod" OWNER TO meal_user;

--
-- Name: MealStatus; Type: TYPE; Schema: meal_management; Owner: meal_user
--

CREATE TYPE meal_management."MealStatus" AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE meal_management."MealStatus" OWNER TO meal_user;

--
-- Name: MealType; Type: TYPE; Schema: meal_management; Owner: meal_user
--

CREATE TYPE meal_management."MealType" AS ENUM (
    'LUNCH',
    'DINNER'
);


ALTER TYPE meal_management."MealType" OWNER TO meal_user;

--
-- Name: Role; Type: TYPE; Schema: meal_management; Owner: meal_user
--

CREATE TYPE meal_management."Role" AS ENUM (
    'EMPLOYEE',
    'ADMIN_KITCHEN',
    'ADMIN_SYSTEM',
    'HR'
);


ALTER TYPE meal_management."Role" OWNER TO meal_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Account" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "passwordHash" text,
    "secretCode" character varying(50) NOT NULL,
    role meal_management."Role" DEFAULT 'EMPLOYEE'::meal_management."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "passwordChangedAt" timestamp(3) without time zone,
    "secretCodeChangedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sharedUserId" text
);


ALTER TABLE meal_management."Account" OWNER TO meal_user;

--
-- Name: CheckinLog; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."CheckinLog" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    "employeeId" text,
    "guestId" text,
    "checkinTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method meal_management."CheckinMethod" NOT NULL
);


ALTER TABLE meal_management."CheckinLog" OWNER TO meal_user;

--
-- Name: Department; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Department" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."Department" OWNER TO meal_user;

--
-- Name: Employee; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Employee" (
    id text NOT NULL,
    "employeeCode" text NOT NULL,
    "fullName" text NOT NULL,
    email text,
    "departmentId" text NOT NULL,
    "positionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."Employee" OWNER TO meal_user;

--
-- Name: Guest; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Guest" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    "fullName" text NOT NULL,
    note text,
    "qrToken" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE meal_management."Guest" OWNER TO meal_user;

--
-- Name: Ingredient; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Ingredient" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    name text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."Ingredient" OWNER TO meal_user;

--
-- Name: MealEvent; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."MealEvent" (
    id text NOT NULL,
    "mealDate" date NOT NULL,
    "mealType" meal_management."MealType" NOT NULL,
    status meal_management."MealStatus" DEFAULT 'DRAFT'::meal_management."MealStatus" NOT NULL,
    "qrToken" text,
    "qrGeneratedAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."MealEvent" OWNER TO meal_user;

--
-- Name: MealPriceConfig; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."MealPriceConfig" (
    id text NOT NULL,
    price double precision NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."MealPriceConfig" OWNER TO meal_user;

--
-- Name: MealReview; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."MealReview" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    "employeeId" text NOT NULL,
    comment text NOT NULL,
    images jsonb,
    "isAnonymous" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."MealReview" OWNER TO meal_user;

--
-- Name: MenuItem; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."MenuItem" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE meal_management."MenuItem" OWNER TO meal_user;

--
-- Name: Position; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Position" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."Position" OWNER TO meal_user;

--
-- Name: Registration; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."Registration" (
    id text NOT NULL,
    "mealEventId" text NOT NULL,
    "employeeId" text NOT NULL,
    "isCancelled" boolean DEFAULT false NOT NULL,
    "cancelledBy" text,
    "cancelledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."Registration" OWNER TO meal_user;

--
-- Name: RegistrationPreset; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."RegistrationPreset" (
    id text NOT NULL,
    name text NOT NULL,
    "mealType" text NOT NULL,
    weekdays text NOT NULL
);


ALTER TABLE meal_management."RegistrationPreset" OWNER TO meal_user;

--
-- Name: SystemConfig; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management."SystemConfig" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE meal_management."SystemConfig" OWNER TO meal_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: meal_management; Owner: meal_user
--

CREATE TABLE meal_management._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE meal_management._prisma_migrations OWNER TO meal_user;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml7q4pxe001eef84ydzu6oyq', 'cml7q4pxb001cef84jzavh3sn', '$2b$10$M4hAKAFgSdlBD33LJlhE1e4MVxi1hzsWdwSWeCU7KBwr6g4/7svCq', '376376', 'EMPLOYEE', true, '2026-02-04 16:54:56.181', NULL, NULL, '2026-02-04 14:46:32.641', '2026-02-04 16:54:56.181', 'abdfcf77-1f76-4219-8018-20fe56a1ea3e');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml7rhv4y0006htzm21qp31me', 'cml7rhv4t0004htzmy532nigy', '$2b$10$1Qpw4ipVooG27KGfBoswyuhiyAYTCrf4548j5FgDu9btoKuo9Gu0K', '630425', 'EMPLOYEE', true, '2026-02-06 08:33:34.747', NULL, NULL, '2026-02-04 15:24:45.537', '2026-02-06 08:33:34.747', 'f2ecdcdb-dd1f-43bc-8a1c-09d95847f1e4');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml9dx3bk00066z5p3d1l2g99', 'cml9dx3bg00046z5pjf6e20ep', '$2b$10$Nep6883YpNnkHJz5VFwKnucR8pObXUyUa1m2XcadQ.pG8XNrnZ8ku', '676797', 'EMPLOYEE', true, '2026-02-05 18:50:11.584', NULL, NULL, '2026-02-05 18:40:13.711', '2026-02-05 18:50:11.585', '00e9dd5d-107a-4571-a047-45f9c680de62');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml9ebia400526z5pse9jpmok', 'cml9ebia100506z5pfhozrb9f', '$2b$10$KTUTr13IL.8xnVi9M6gj4eWZC6ZNBi4P/Xx9mmGg3PcHdX2vR6NZK', '507602', 'EMPLOYEE', true, '2026-02-05 19:08:12.194', NULL, NULL, '2026-02-05 18:51:26.283', '2026-02-05 19:08:12.194', '3b81038f-116f-4c0c-aa6d-ef3945bf9adc');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml68dew9000ld4ub6502q26l', 'cml68dew8000jd4ub91qxsr1m', '$2b$10$HNhUoy.GgCzNSHMX9EovzOS9Lz5ZANEdekeaTsWjIHwB0R7neGR6q', '339176', 'EMPLOYEE', true, '2026-02-06 08:11:36.939', NULL, NULL, '2026-02-03 13:41:38.984', '2026-02-06 08:11:36.939', '196ad140-2a16-4621-a890-c76af828ed98');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml68c93f0009d4ubeni3ydbw', 'cml68c93b0007d4ubqpde75rh', '$2b$10$EYFJUykOqlBBhdXWDd6gouZJJTeAJZIeEoDjqAOAF0qZGr9/q04jO', '722478', 'EMPLOYEE', true, '2026-02-05 18:35:38.659', NULL, NULL, '2026-02-03 13:40:44.81', '2026-02-05 18:35:38.659', '7f2101e8-5c55-4210-a70d-69c3e73b29c8');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml7q2ess000aef84hph5gxly', 'cml7q2esn0008ef846loj14mq', '$2b$10$6.QAnUHzAHLfNutvTFezLePUoEw3N.OVStcEmXYGwj4YpgmG5N1m2', '637948', 'EMPLOYEE', true, '2026-02-04 14:44:57.455', NULL, NULL, '2026-02-04 14:44:44.908', '2026-02-04 14:44:57.455', '0bc9c69e-dfc9-43d1-bb54-c853d7306d46');
INSERT INTO meal_management."Account" (id, "employeeId", "passwordHash", "secretCode", role, "isActive", "lastLogin", "passwordChangedAt", "secretCodeChangedAt", "createdAt", "updatedAt", "sharedUserId") VALUES ('cml5af6ed0004wyk2juez7r7n', 'cml5af6ch0002wyk2xkyzouxc', '$2b$10$T8Bj6QjUaH94RkiiY4AycObWAIqiT7WF7YlTZ9GG48l1sTKmJl/zi', '05051996', 'ADMIN_SYSTEM', true, '2026-02-06 20:43:07.164', '2026-02-02 16:33:21.998', NULL, '2026-02-02 14:51:14.341', '2026-02-08 23:23:18.961', '655495a0-c6af-42c7-99bf-075963ec30be');


--
-- Data for Name: CheckinLog; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6dor14000199v9l6rp2vjk', 'cml5z4mwj0014qaid8g0o2kms', 'cml68dew8000jd4ub91qxsr1m', NULL, '2026-02-03 16:14:04.142', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6dwdis000313fe776c5qgs', 'cml5z4mwj0014qaid8g0o2kms', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-03 16:16:21.747', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6fowqd0001134eadtxlkty', 'cml5xl1s30000z37t7wwcivay', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-03 17:06:32.629', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6nboo300036p347pog2vl6', 'cml5ykf1b00065nrh40411k10', 'cml68dew8000jd4ub91qxsr1m', NULL, '2026-02-03 20:40:12.578', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6nc8bz00056p34pdbihcea', 'cml5ykf1b00065nrh40411k10', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-03 20:40:38.062', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6omq3s0003lu7pb55tt849', 'cml5z4mx5001eqaidjws9oi6i', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-03 21:16:47.271', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml6on4pq0005lu7phsd23yeb', 'cml5z4mx5001eqaidjws9oi6i', 'cml68dew8000jd4ub91qxsr1m', NULL, '2026-02-03 21:17:06.206', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7blt190001i8q35512bj2f', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-04 07:59:55.58', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7bq8bp0003i8q3ca2mkawr', 'cml5ykf1300035nrhwzg0koau', 'cml68dew8000jd4ub91qxsr1m', NULL, '2026-02-04 08:03:22.009', 'MANUAL');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7fyili0001ty9flxpc5y5b', 'cml5z4mwu0019qaiddybyybmw', 'cml68dew8000jd4ub91qxsr1m', NULL, '2026-02-04 10:21:34.085', 'QR_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7gpasi0001nnvukb5ijjhj', 'cml5z4mwu0019qaiddybyybmw', 'cml5af6ch0002wyk2xkyzouxc', NULL, '2026-02-04 10:22:36.641', 'QR_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7ho7240001qqvx0ydy564o', 'cml5z4mwu0019qaiddybyybmw', NULL, 'cml7h9wi20003nnvujq57pz67', '2026-02-04 10:49:44.763', 'QR_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7ib7tk0005gez2wn0vvvnv', 'cml5z4mwu0019qaiddybyybmw', 'cml68c93b0007d4ubqpde75rh', NULL, '2026-02-04 11:07:38.839', 'SELF_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7ra5j30001htzmku2iglpo', 'cml5z4mwu0019qaiddybyybmw', 'cml7q4pxb001cef84jzavh3sn', NULL, '2026-02-04 15:18:45.759', 'SELF_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml7sm2vv0003qoa4jrbw8oyp', 'cml5z4mwu0019qaiddybyybmw', 'cml7rhv4t0004htzmy532nigy', NULL, '2026-02-04 15:56:01.818', 'SELF_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml9dtbgj00016z5p2nnctpht', 'cml5z4zei005iqaido579xg3g', 'cml68c93b0007d4ubqpde75rh', NULL, '2026-02-05 18:37:17.633', 'SELF_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml9e5aa9004x6z5pn8uwxjl0', 'cml5z4zei005iqaido579xg3g', 'cml9dx3bg00046z5pjf6e20ep', NULL, '2026-02-05 18:46:35.984', 'SELF_SCAN');
INSERT INTO meal_management."CheckinLog" (id, "mealEventId", "employeeId", "guestId", "checkinTime", method) VALUES ('cml9ejpoj005a6z5pn33v5ldx', 'cml5z4zei005iqaido579xg3g', 'cml9ebia100506z5pfhozrb9f', NULL, '2026-02-05 18:57:49.122', 'SELF_SCAN');


--
-- Data for Name: Department; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceq5000312o42bxbfzao', 'Phân xưởng Khai thác', '2026-02-01 15:29:24.349', '2026-02-09 11:33:02.051');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceq4000212o49ignom06', 'Phân xưởng Nghiền liệu', '2026-02-01 15:29:24.349', '2026-02-09 11:33:02.211');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceq4000112o4arhgfldb', 'Ban Kiểm soát', '2026-02-01 15:29:24.349', '2026-02-09 11:33:02.219');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml50m3qn00015sf7bmytit2k', 'Phân xưởng Cơ điện', '2026-02-02 10:16:41.328', '2026-02-09 11:33:02.229');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml511ofw00045sf7b8q3t91y', 'Ban Tổng Giám đốc', '2026-02-02 10:28:47.997', '2026-02-09 11:33:02.237');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml3wcepp000012o4y17t3yor', 'Phân xưởng Lò nung', '2026-02-01 15:29:24.349', '2026-02-09 11:33:02.264');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58ydmu0000yw6j36a1cegk', 'Phân xưởng Nghiền xi và Đóng bao', '2026-02-02 14:10:10.95', '2026-02-09 11:33:02.279');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58yl5x0001yw6j6k059gwh', 'Phòng Chiến lược kinh doanh', '2026-02-02 14:10:20.71', '2026-02-09 11:33:02.282');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58yqve0002yw6jla6luolh', 'Phòng Chính trị - Nhân sự', '2026-02-02 14:10:28.106', '2026-02-09 11:33:02.285');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58ywnb0003yw6j8i2aw3g7', 'Phòng Công nghệ thông tin', '2026-02-02 14:10:35.592', '2026-02-09 11:33:02.288');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58z4zw0004yw6jotfsgshu', 'Phòng Kỹ thuật công nghệ', '2026-02-02 14:10:46.412', '2026-02-09 11:33:02.291');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58z9ji0005yw6j86qqh9xd', 'Phòng Quản lý chất lượng', '2026-02-02 14:10:52.303', '2026-02-09 11:33:02.3');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58zdpx0006yw6j4paty9nw', 'Phòng Tài chính Kế toán', '2026-02-02 14:10:57.717', '2026-02-09 11:33:02.315');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58zhku0007yw6jt5guryas', 'Phòng Đầu tư và Quản lý tài sản', '2026-02-02 14:11:02.718', '2026-02-09 11:33:02.318');
INSERT INTO meal_management."Department" (id, name, "createdAt", "updatedAt") VALUES ('cml58zn560008yw6j78qbo0qa', 'Văn phòng', '2026-02-02 14:11:09.93', '2026-02-09 11:33:02.32');


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml68dew8000jd4ub91qxsr1m', '478139', 'Bùi Đức Hoàng', NULL, 'cml58ywnb0003yw6j8i2aw3g7', 'cml591op9000ayw6jgqldd6nk', '2026-02-03 13:41:38.982', '2026-02-03 16:48:59.247');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml68c93b0007d4ubqpde75rh', '478167', 'Nguyễn Thái Hưng', NULL, 'cml58ywnb0003yw6j8i2aw3g7', 'cml591op9000ayw6jgqldd6nk', '2026-02-03 13:40:44.804', '2026-02-04 10:07:19.881');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml7q2esn0008ef846loj14mq', '482826', 'Hồ Minh Hoàng', NULL, 'cml58yl5x0001yw6j6k059gwh', 'cml3wceqq000712o4u41hauls', '2026-02-04 14:44:44.902', '2026-02-04 14:44:44.902');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml7q4pxb001cef84jzavh3sn', '478169', 'Nguyễn Hoàng Dương', NULL, 'cml58ywnb0003yw6j8i2aw3g7', 'cml591op9000ayw6jgqldd6nk', '2026-02-04 14:46:32.638', '2026-02-04 14:46:32.638');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml7rhv4t0004htzmy532nigy', '246233', 'Trần Hải Sơn', NULL, 'cml58ywnb0003yw6j8i2aw3g7', 'cml3wceqq000812o4nvj0z92f', '2026-02-04 15:24:45.53', '2026-02-05 18:15:19.026');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml9dx3bg00046z5pjf6e20ep', '21111999', 'Ngọc', NULL, 'cml58zdpx0006yw6j4paty9nw', 'cml591op9000ayw6jgqldd6nk', '2026-02-05 18:40:13.706', '2026-02-05 18:40:13.706');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml9ebia100506z5pfhozrb9f', '080623', 'Bùi Minh Anh', NULL, 'cml58zdpx0006yw6j4paty9nw', 'cml591op9000ayw6jgqldd6nk', '2026-02-05 18:51:26.28', '2026-02-05 18:51:26.28');
INSERT INTO meal_management."Employee" (id, "employeeCode", "fullName", email, "departmentId", "positionId", "createdAt", "updatedAt") VALUES ('cml5af6ch0002wyk2xkyzouxc', '480190', 'Bùi Ngọc Chiến', 'admin@company.com', 'cml58ywnb0003yw6j8i2aw3g7', 'cml591op9000ayw6jgqldd6nk', '2026-02-02 14:51:14.272', '2026-02-07 08:37:45.59');


--
-- Data for Name: Guest; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cml688u690003d4ubkzz57ygm', 'cml5z4mwj0014qaid8g0o2kms', 'Giang1', 'Kiểm toán', 'GUEST-cml5z4mwj0014qaid8g0o2kms-1770100685505', '2026-02-03 13:38:05.505');
INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cml7h9wi20003nnvujq57pz67', 'cml5z4mwu0019qaiddybyybmw', 'Dương', '', 'GUEST-cml5z4mwu0019qaiddybyybmw-1770176317897', '2026-02-04 10:38:37.897');
INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cml7i8aha0001gez2tirto8rm', 'cml5z4mwu0019qaiddybyybmw', 'Hoàng KD', 'quên đăng ký ăn', 'GUEST-cml5z4mwu0019qaiddybyybmw-1770177922290', '2026-02-04 11:05:22.29');
INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cmla7wuz300dw6z5pcucnmj24', 'cml5z4zei005iqaido579xg3g', 'Lê Anh Lâm', 'CNPN ra công tác', 'GUEST-cml5z4zei005iqaido579xg3g-1770341991373', '2026-02-06 08:39:51.374');
INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cmla90cj300dy6z5p0zxtbo4f', 'cml5z4zei005iqaido579xg3g', 'Uyên Phương', 'CNPN ra công tác', 'GUEST-cml5z4zei005iqaido579xg3g-1770343833710', '2026-02-06 09:10:33.71');
INSERT INTO meal_management."Guest" (id, "mealEventId", "fullName", note, "qrToken", "createdAt") VALUES ('cmla90clz00e06z5polmz0d9c', 'cml5z4zei005iqaido579xg3g', 'CR7', 'Ả Rập', 'GUEST-cml5z4zei005iqaido579xg3g-1770343833814', '2026-02-06 09:10:33.814');


--
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml64p28k0003mwfddkjt48jr', 'cml5z4mwj0014qaid8g0o2kms', 'thịt bò', 20, 'kg', 120000, 2400000, '2026-02-03 11:58:43.988', '2026-02-03 11:58:43.988');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8ufi9k00018gav02k1buj8', 'cml5z4zei005iqaido579xg3g', 'Gạo ST25', 30, 'kg', 20000, 600000, '2026-02-05 09:34:40.564', '2026-02-05 09:34:40.564');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8ugryp00038gav8yv5uwr0', 'cml5z4zei005iqaido579xg3g', 'Thịt gà', 10, 'kg', 80000, 800000, '2026-02-05 09:35:39.792', '2026-02-05 09:35:39.792');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8uif2900058gav0c6kw2kf', 'cml5z4zei005iqaido579xg3g', 'Rau cải xoong', 5, 'kg', 20000, 100000, '2026-02-05 09:36:56.385', '2026-02-05 09:36:56.385');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8uixvs00078gavyidi5ni2', 'cml5z4zei005iqaido579xg3g', 'Gia vị', 0.5, 'kg', 30000, 15000, '2026-02-05 09:37:20.773', '2026-02-05 09:37:20.773');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8uk418000f8gavj4qe1bqp', 'cml5z4zei005iqaido579xg3g', 'Mía', 5, 'kg', 10000, 50000, '2026-02-05 09:38:15.403', '2026-02-05 09:38:15.403');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8um3my000j8gav2kjfyzg8', 'cml5z4shc003rqaid4eau978r', 'Gạo ST25', 10, 'kg', 25000, 250000, '2026-02-05 09:39:48.202', '2026-02-05 09:39:48.202');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8up52x000l8gavnkba5305', 'cml5z4shc003rqaid4eau978r', 'Thịt bò', 5, 'kg', 200000, 1000000, '2026-02-05 09:42:10.04', '2026-02-05 09:42:10.04');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8upe6y000n8gav0syxqbna', 'cml5z4shc003rqaid4eau978r', 'Bắp cải', 5, 'kg', 10000, 50000, '2026-02-05 09:42:21.849', '2026-02-05 09:42:21.849');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml8uu32e000p8gavuffrj019', 'cml5z4shc003rqaid4eau978r', 'Trứng gà ta', 40, 'quả', 2500, 100000, '2026-02-05 09:46:00.71', '2026-02-05 09:46:00.71');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml90q0j90001vpurjce9szn6', 'cml5yx1wk00083xujrj295xs5', 'Thịt ba chỉ', 15, 'kg', 120000, 1800000, '2026-02-05 12:30:48.496', '2026-02-05 12:30:48.496');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml90q8770003vpuru44wztl6', 'cml5yx1wk00083xujrj295xs5', 'Rau muống', 5, 'kg', 7000, 35000, '2026-02-05 12:30:58.422', '2026-02-05 12:30:58.422');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml90s4rm0009vpurnpplsrbo', 'cml5z4zeo005nqaid3pna0bz4', 'Tôm', 5, 'kg', 200000, 1000000, '2026-02-05 12:32:27.297', '2026-02-05 12:32:27.297');
INSERT INTO meal_management."Ingredient" (id, "mealEventId", name, quantity, unit, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ('cml90sg0c000bvpur8zzf6mz0', 'cml5z4zeo005nqaid3pna0bz4', 'Cải xoong', 5, 'kg', 20000, 100000, '2026-02-05 12:32:41.867', '2026-02-05 12:32:41.867');


--
-- Data for Name: MealEvent; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5xxfz10000i4jnbldrr91k', '2026-02-28', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 01:49:17.725', '2026-02-03 01:49:17.725');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1g00095nrhq8t4w1ob', '2026-02-09', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.604', '2026-02-03 09:07:09.604');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1l000c5nrhj1u2wlk9', '2026-02-10', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.608', '2026-02-03 09:07:09.608');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1s000f5nrh2wqaqp32', '2026-02-11', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.615', '2026-02-03 09:07:09.615');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1w000i5nrhcpoxlxqw', '2026-02-12', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.619', '2026-02-03 09:07:09.619');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf20000l5nrhsu1spvzd', '2026-02-13', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.623', '2026-02-03 09:07:09.623');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf25000o5nrhugyc6gjv', '2026-02-16', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.628', '2026-02-03 09:07:09.628');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf29000r5nrhmfbsr00d', '2026-02-17', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.632', '2026-02-03 09:07:09.632');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf2d000u5nrhr4r20ys3', '2026-02-18', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.636', '2026-02-03 09:07:09.636');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf2i000x5nrhth2i56h6', '2026-02-19', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.641', '2026-02-03 09:07:09.641');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf2p00105nrhp1li188e', '2026-02-20', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.648', '2026-02-03 09:07:09.648');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf2u00135nrh5i3ykshc', '2026-02-23', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.653', '2026-02-03 09:07:09.653');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf2z00165nrhca58vk52', '2026-02-24', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.658', '2026-02-03 09:07:09.658');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf3500195nrhm53wa9bc', '2026-02-25', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.664', '2026-02-03 09:07:09.664');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf39001c5nrh5dio8plc', '2026-02-26', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.669', '2026-02-03 09:07:09.669');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf3g001f5nrhdiuypmqz', '2026-02-27', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:07:09.675', '2026-02-03 09:07:09.675');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5yx1wk00083xujrj295xs5', '2026-02-08', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:16:59.107', '2026-02-03 09:16:59.107');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5yx1x2000j3xuj2ahvguqb', '2026-02-15', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:16:59.125', '2026-02-03 09:16:59.125');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5yx1xm000u3xujjmeu1m2v', '2026-02-22', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:16:59.146', '2026-02-03 09:16:59.146');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mxg001jqaideiuzsing', '2026-02-09', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.947', '2026-02-03 09:22:52.947');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mxp001oqaidhv5qaz95', '2026-02-10', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.956', '2026-02-03 09:22:52.956');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mxz001tqaidhoil4lue', '2026-02-11', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.966', '2026-02-03 09:22:52.966');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4my7001yqaidwcp9pmmu', '2026-02-12', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.975', '2026-02-03 09:22:52.975');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4myf0023qaidmnhgopvl', '2026-02-13', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.983', '2026-02-03 09:22:52.983');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4myn0028qaidik7iccpr', '2026-02-16', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.99', '2026-02-03 09:22:52.99');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4myv002dqaidohg3a4vl', '2026-02-17', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:52.999', '2026-02-03 09:22:52.999');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mz4002iqaidgqih6b9c', '2026-02-18', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.007', '2026-02-03 09:22:53.007');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mzd002nqaid1wee9srl', '2026-02-19', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.016', '2026-02-03 09:22:53.016');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mzl002sqaidnrl2zrzf', '2026-02-20', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.024', '2026-02-03 09:22:53.024');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mzt002xqaidvt0bobb4', '2026-02-23', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.032', '2026-02-03 09:22:53.032');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4n000032qaidxyyj30dj', '2026-02-24', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.04', '2026-02-03 09:22:53.04');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4n080037qaidshvcqu97', '2026-02-25', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.047', '2026-02-03 09:22:53.047');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4n0g003cqaidnbwekimy', '2026-02-26', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.055', '2026-02-03 09:22:53.055');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4n0o003hqaidgynyfa4i', '2026-02-27', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:22:53.063', '2026-02-03 09:22:53.063');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4shc003rqaid4eau978r', '2026-02-07', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:00.143', '2026-02-03 09:23:00.143');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4si20046qaidl4n60ydu', '2026-02-14', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:00.17', '2026-02-03 09:23:00.17');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4sio004lqaidud3y8afm', '2026-02-21', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:00.192', '2026-02-03 09:23:00.192');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4sj80050qaidqmgl0apo', '2026-02-28', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:00.212', '2026-02-03 09:23:00.212');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zeo005nqaid3pna0bz4', '2026-02-08', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:09.119', '2026-02-03 09:23:09.119');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zfn006cqaidq7616783', '2026-02-14', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:09.155', '2026-02-03 09:23:09.155');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zfw006hqaid0tco7s5m', '2026-02-15', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:09.163', '2026-02-03 09:23:09.163');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zh10076qaidmly1l0tg', '2026-02-21', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:09.205', '2026-02-03 09:23:09.205');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zh8007bqaidlq1c53u5', '2026-02-22', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:23:09.212', '2026-02-03 09:23:09.212');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjla001if6bbg50hsi8e', '2026-03-01', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.838', '2026-02-03 09:31:21.838');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjlk001lf6bbd6xyb8mc', '2026-03-01', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.847', '2026-02-03 09:31:21.847');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjlq001of6bbmj6wwqmv', '2026-03-02', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.854', '2026-02-03 09:31:21.854');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjlv001rf6bb00nqcrq9', '2026-03-02', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.859', '2026-02-03 09:31:21.859');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjm2001uf6bbfcuou9tv', '2026-03-03', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.866', '2026-02-03 09:31:21.866');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjm8001xf6bbksd54m6l', '2026-03-03', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.871', '2026-02-03 09:31:21.871');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjmd0020f6bbql2x7emp', '2026-03-04', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.877', '2026-02-03 09:31:21.877');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjmj0023f6bbnslkmtii', '2026-03-04', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.883', '2026-02-03 09:31:21.883');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjmn0026f6bbl1meefie', '2026-03-05', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.887', '2026-02-03 09:31:21.887');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjmt0029f6bb664yh7tp', '2026-03-05', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.892', '2026-02-03 09:31:21.892');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjmy002cf6bbwtkelonz', '2026-03-06', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.898', '2026-02-03 09:31:21.898');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjn4002ff6bb7pw6kpej', '2026-03-06', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.903', '2026-02-03 09:31:21.903');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjn8002if6bb3wovf9g5', '2026-03-07', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.908', '2026-02-03 09:31:21.908');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjnc002lf6bbec6umipc', '2026-03-07', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.912', '2026-02-03 09:31:21.912');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjni002of6bb6sqhyap8', '2026-03-08', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.917', '2026-02-03 09:31:21.917');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjnm002rf6bb1ac0if8r', '2026-03-08', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.921', '2026-02-03 09:31:21.921');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjnq002uf6bbnw0vt84i', '2026-03-09', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.926', '2026-02-03 09:31:21.926');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjnv002xf6bbdujdzh1g', '2026-03-09', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.93', '2026-02-03 09:31:21.93');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjo10030f6bb8briy0qb', '2026-03-10', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.937', '2026-02-03 09:31:21.937');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjo70033f6bbcxjb6eef', '2026-03-10', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.943', '2026-02-03 09:31:21.943');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjod0036f6bbti7wrh7v', '2026-03-11', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.949', '2026-02-03 09:31:21.949');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjoh0039f6bb3sir3i5i', '2026-03-11', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.953', '2026-02-03 09:31:21.953');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjon003cf6bbplpgnygo', '2026-03-12', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.958', '2026-02-03 09:31:21.958');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjos003ff6bblm0u50km', '2026-03-12', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.964', '2026-02-03 09:31:21.964');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjoy003if6bb4kr71a9d', '2026-03-13', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.97', '2026-02-03 09:31:21.97');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjp4003lf6bbc53mnlpo', '2026-03-13', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.976', '2026-02-03 09:31:21.976');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjpa003of6bb7v2ouszk', '2026-03-14', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.982', '2026-02-03 09:31:21.982');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjpf003rf6bbsb7b4c5i', '2026-03-14', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.987', '2026-02-03 09:31:21.987');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjpl003uf6bbj3xspmfk', '2026-03-15', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.992', '2026-02-03 09:31:21.992');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjpr003xf6bbekdn39s1', '2026-03-15', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:21.999', '2026-02-03 09:31:21.999');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjpx0040f6bb4tj18vj2', '2026-03-16', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.005', '2026-02-03 09:31:22.005');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjq30043f6bb3glgwbcb', '2026-03-16', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.01', '2026-02-03 09:31:22.01');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjq80046f6bbd8s5ecan', '2026-03-17', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.016', '2026-02-03 09:31:22.016');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjqd0049f6bb9bun33dz', '2026-03-17', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.021', '2026-02-03 09:31:22.021');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjqi004cf6bbv7ui5jkh', '2026-03-18', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.026', '2026-02-03 09:31:22.026');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjqo004ff6bboarjq3rp', '2026-03-18', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.032', '2026-02-03 09:31:22.032');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mwj0014qaid8g0o2kms', '2026-02-04', 'DINNER', 'COMPLETED', 'MEAL-cml5z4mwj0014qaid8g0o2kms-1770109795971', '2026-02-03 16:09:55.971', '2026-02-03 16:09:55.971', '2026-02-03 16:48:01.722', NULL, '2026-02-03 09:22:52.914', '2026-02-03 16:48:01.722');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1b00065nrh40411k10', '2026-02-06', 'LUNCH', 'COMPLETED', 'MEAL-cml5ykf1b00065nrh40411k10-1770125939532', '2026-02-03 20:38:59.532', '2026-02-03 20:38:59.532', '2026-02-03 20:41:20.285', NULL, '2026-02-03 09:07:09.599', '2026-02-03 20:41:20.285');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5ykf1300035nrhwzg0koau', '2026-02-05', 'LUNCH', 'COMPLETED', 'MEAL-cml5ykf1300035nrhwzg0koau-1770166785790', '2026-02-04 07:59:45.79', '2026-02-04 07:59:45.79', '2026-02-04 08:03:50.21', NULL, '2026-02-03 09:07:09.591', '2026-02-04 08:03:50.21');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4zei005iqaido579xg3g', '2026-02-07', 'DINNER', 'COMPLETED', 'MEAL-cml5z4zei005iqaido579xg3g-1770284422086', '2026-02-05 16:40:22.086', '2026-02-05 16:40:22.086', '2026-02-07 16:55:50.875', NULL, '2026-02-03 09:23:09.113', '2026-02-07 16:55:50.875');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjqu004if6bbplsh0deo', '2026-03-19', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.038', '2026-02-03 09:31:22.038');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjqz004lf6bb60qysgyz', '2026-03-19', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.043', '2026-02-03 09:31:22.043');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjr5004of6bbt8soz48f', '2026-03-20', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.049', '2026-02-03 09:31:22.049');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjra004rf6bb41bu9qg7', '2026-03-20', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.054', '2026-02-03 09:31:22.054');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjrf004uf6bbxq14g8ly', '2026-03-21', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.059', '2026-02-03 09:31:22.059');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjrk004xf6bb8v88hyu2', '2026-03-21', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.063', '2026-02-03 09:31:22.063');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjrp0050f6bb533c57xf', '2026-03-22', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.069', '2026-02-03 09:31:22.069');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjrt0053f6bbeymqloun', '2026-03-22', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.072', '2026-02-03 09:31:22.072');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjry0056f6bbgqrtmpvo', '2026-03-23', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.078', '2026-02-03 09:31:22.078');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjs30059f6bbdhp9fzwk', '2026-03-23', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.083', '2026-02-03 09:31:22.083');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjs8005cf6bbw6lyra3w', '2026-03-24', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.088', '2026-02-03 09:31:22.088');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjsd005ff6bbh4yhae0k', '2026-03-24', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.093', '2026-02-03 09:31:22.093');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjsi005if6bbn8h7oaef', '2026-03-25', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.098', '2026-02-03 09:31:22.098');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjso005lf6bbqzxvft8y', '2026-03-25', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.104', '2026-02-03 09:31:22.104');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjsu005of6bb5yp6e3lk', '2026-03-26', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.11', '2026-02-03 09:31:22.11');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjt1005rf6bb5tzbvcgy', '2026-03-26', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.117', '2026-02-03 09:31:22.117');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjt7005uf6bbhelj9kvi', '2026-03-27', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.123', '2026-02-03 09:31:22.123');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjtc005xf6bbi8241854', '2026-03-27', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.127', '2026-02-03 09:31:22.127');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjti0060f6bbh33wc75w', '2026-03-28', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.133', '2026-02-03 09:31:22.133');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjtm0063f6bb2f21zpm4', '2026-03-28', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.138', '2026-02-03 09:31:22.138');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjtr0066f6bbrnjj1c83', '2026-03-29', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.143', '2026-02-03 09:31:22.143');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjty0069f6bb31t0frf2', '2026-03-29', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.149', '2026-02-03 09:31:22.149');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfju2006cf6bbtvk0f5ou', '2026-03-30', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.154', '2026-02-03 09:31:22.154');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfju7006ff6bbaro6ry5w', '2026-03-30', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.159', '2026-02-03 09:31:22.159');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjud006if6bb5pudfjrp', '2026-03-31', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.164', '2026-02-03 09:31:22.164');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5zfjui006lf6bbz199yyrz', '2026-03-31', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:31:22.169', '2026-02-03 09:31:22.169');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml61lqk100004n3xu6lt8bng', '2026-02-03', 'DINNER', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 10:32:10.032', '2026-02-03 10:32:10.032');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5yx1w600013xujn0ojjslg', '2026-02-03', 'LUNCH', 'DRAFT', NULL, NULL, NULL, NULL, NULL, '2026-02-03 09:16:59.093', '2026-02-03 11:37:59.085');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5xl1s30000z37t7wwcivay', '2026-02-04', 'LUNCH', 'COMPLETED', 'MEAL-cml5xl1s30000z37t7wwcivay-1770113130388', '2026-02-03 17:05:30.388', '2026-02-03 17:05:30.388', '2026-02-03 17:09:55.469', NULL, '2026-02-03 01:39:39.46', '2026-02-03 17:09:55.47');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mx5001eqaidjws9oi6i', '2026-02-06', 'DINNER', 'COMPLETED', 'MEAL-cml5z4mx5001eqaidjws9oi6i-1770128165457', '2026-02-03 21:16:05.457', '2026-02-03 21:16:05.457', '2026-02-03 21:19:17.979', NULL, '2026-02-03 09:22:52.936', '2026-02-03 21:19:17.979');
INSERT INTO meal_management."MealEvent" (id, "mealDate", "mealType", status, "qrToken", "qrGeneratedAt", "startedAt", "endedAt", "createdBy", "createdAt", "updatedAt") VALUES ('cml5z4mwu0019qaiddybyybmw', '2026-02-05', 'DINNER', 'COMPLETED', 'MEAL-cml5z4mwu0019qaiddybyybmw-1770173969297', '2026-02-04 09:59:29.297', '2026-02-04 09:59:29.297', '2026-02-05 09:33:53.691', NULL, '2026-02-03 09:22:52.925', '2026-02-05 09:33:53.691');


--
-- Data for Name: MealPriceConfig; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."MealPriceConfig" (id, price, "startDate", "endDate", "createdAt", "updatedAt") VALUES ('cml7lx5vp00012l5v7p4xuc2a', 26000, '2026-02-01', '2026-02-04', '2026-02-04 05:48:41.606', '2026-02-04 07:22:43.385');
INSERT INTO meal_management."MealPriceConfig" (id, price, "startDate", "endDate", "createdAt", "updatedAt") VALUES ('cml7pa33v0001mxizmbsxntg2', 25000, '2026-02-05', NULL, '2026-02-04 07:22:43.387', '2026-02-04 07:22:43.387');


--
-- Data for Name: MealReview; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml94x6zq0001ifgwjjnlpokw', 'cml5xl1s30000z37t7wwcivay', 'cml5af6ch0002wyk2xkyzouxc', 'a', '["http://localhost:4000/static/uploads/reviews/1770276498938-859421726"]', true, '2026-02-05 07:28:21.923', '2026-02-05 07:28:21.923');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9552ib0003ifgw0ljp9lq5', 'cml5xl1s30000z37t7wwcivay', 'cml5af6ch0002wyk2xkyzouxc', 'a', '[]', true, '2026-02-05 07:34:29.363', '2026-02-05 07:34:29.363');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml955upw0001htsxj4dt800w', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'aaaa', '[]', true, '2026-02-05 07:35:05.925', '2026-02-05 07:35:05.925');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml95enax0003htsxdnpn2r26', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'bữa ăn ngon quá', '["http://localhost:4000/static/uploads/reviews/1770277313563-937235966"]', true, '2026-02-05 07:41:56.218', '2026-02-05 07:41:56.218');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9623d80001ey0n6lm2ghq0', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'Có ruồi trong khay cơm. Đề nghị nhà bếp có biện pháp che đậy phù hợp', '["http://localhost:4000/static/uploads/reviews/1770278408413-17464564"]', false, '2026-02-05 08:00:10.125', '2026-02-05 08:00:10.125');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml965mwb00013f730hk5c3yx', 'cml5z4mwu0019qaiddybyybmw', 'cml5af6ch0002wyk2xkyzouxc', 'DEBUG TEST REVIEW 2026-02-05T08:02:55.402Z', NULL, true, '2026-02-05 08:02:55.403', '2026-02-05 08:02:55.403');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9669wt0001vu37ll3w86do', 'cml5z4mwu0019qaiddybyybmw', 'cml5af6ch0002wyk2xkyzouxc', 'DEBUG TEST REVIEW 2026-02-05T08:03:25.228Z', NULL, true, '2026-02-05 08:03:25.229', '2026-02-05 08:03:25.229');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml966vd2000123aktw0a5k19', 'cml5z4mwu0019qaiddybyybmw', 'cml5af6ch0002wyk2xkyzouxc', 'DEBUG TEST REVIEW 2026-02-05T08:03:53.029Z', NULL, true, '2026-02-05 15:03:53.029', '2026-02-05 15:03:53.029');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml967wtw0001s0h3dfhskzu2', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'test giờ đúng', '[]', true, '2026-02-05 15:04:41.587', '2026-02-05 15:04:41.587');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml968xey0003s0h3erqt2rrw', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'test1', '["http://localhost:4000/static/uploads/reviews/1770278727691-495419760"]', true, '2026-02-05 15:05:29.002', '2026-02-05 15:05:29.002');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9691me0005s0h3h6cikj1o', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'hii', '[]', true, '2026-02-05 15:05:34.454', '2026-02-05 15:05:34.454');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9695t50007s0h3yrxcdlhc', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'ok ngon', '[]', true, '2026-02-05 15:05:39.881', '2026-02-05 15:05:39.881');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml96vk4n0001lttplitm9mb0', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'cũng cung :D', '[]', true, '2026-02-05 15:23:04.87', '2026-02-05 15:23:04.87');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml96vz7n0003lttpfemnr30l', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'Hoàng ml', '[]', true, '2026-02-05 15:23:24.419', '2026-02-05 15:23:24.419');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml9750jc0005lttpoxu2c73l', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'Tùng dương', '[]', true, '2026-02-05 15:30:26.039', '2026-02-05 15:30:26.039');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cml975ww30007lttpu06roo23', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'chậm thế', '[]', true, '2026-02-05 15:31:07.97', '2026-02-05 15:31:07.97');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cmla6xrxu00ct6z5praiscp8g', 'cml5ykf1b00065nrh40411k10', 'cml68dew8000jd4ub91qxsr1m', '2
', '[]', true, '2026-02-06 08:12:34.457', '2026-02-06 08:12:34.457');
INSERT INTO meal_management."MealReview" (id, "mealEventId", "employeeId", comment, images, "isAnonymous", "createdAt", "updatedAt") VALUES ('cmldvzwdr0014uazconqxs0o9', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', 'ok', '[]', true, '2026-02-08 22:17:22.478', '2026-02-08 22:17:22.478');


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml65qrg30001tc6pajciuq6j', 'cml5z4mwj0014qaid8g0o2kms', 'Cá kho', '2026-02-03 12:28:02.926');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml65qzef0003tc6pbzzns9cf', 'cml5z4mwj0014qaid8g0o2kms', 'Canh hàu', '2026-02-03 12:28:13.239');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml65r55v0005tc6pa4d3223p', 'cml5z4mwj0014qaid8g0o2kms', 'Thị kho tàu', '2026-02-03 12:28:20.706');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml6gebcs0003134e8t8oo9ry', 'cml5ykf1300035nrhwzg0koau', 'Cá kho', '2026-02-03 17:26:17.978');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8ujaen00098gavdmbfg0fg', 'cml5z4zei005iqaido579xg3g', 'Cơm trắng', '2026-02-05 09:37:37.007');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8ujhx9000b8gav4ycuxtdy', 'cml5z4zei005iqaido579xg3g', 'Gà kho xả ớt', '2026-02-05 09:37:46.748');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8ujsio000d8gavmcx1pu3l', 'cml5z4zei005iqaido579xg3g', 'Rau cải xoong luộc', '2026-02-05 09:38:00.48');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8uk84d000h8gav3bry24gc', 'cml5z4zei005iqaido579xg3g', 'Mía', '2026-02-05 09:38:20.701');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8uube1000r8gavz2zckon9', 'cml5z4shc003rqaid4eau978r', 'Cơm trắng', '2026-02-05 09:46:11.496');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8uui87000t8gav7w4fehqf', 'cml5z4shc003rqaid4eau978r', 'Thịt bò kho', '2026-02-05 09:46:20.357');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8uulzn000v8gavwzld2cw4', 'cml5z4shc003rqaid4eau978r', 'Trứng chiên', '2026-02-05 09:46:25.234');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml8uutav000x8gavhk7nhmn8', 'cml5z4shc003rqaid4eau978r', 'Bắp cải luộc', '2026-02-05 09:46:34.71');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml90rl0y0005vpur9ae6cp8b', 'cml5yx1wk00083xujrj295xs5', 'Thịt ba chỉ rán', '2026-02-05 12:32:01.713');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml90rr6d0007vpur9lafxkxy', 'cml5yx1wk00083xujrj295xs5', 'Rau muống xào tỏi', '2026-02-05 12:32:09.684');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml90smed000dvpurxc4299zu', 'cml5z4zeo005nqaid3pna0bz4', 'Cải xoong luộc', '2026-02-05 12:32:50.148');
INSERT INTO meal_management."MenuItem" (id, "mealEventId", name, "createdAt") VALUES ('cml90sswj000fvpur4i4ocqu7', 'cml5z4zeo005nqaid3pna0bz4', 'Tôm xào khế', '2026-02-05 12:32:58.578');


--
-- Data for Name: Position; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceqq000612o4rnagrbhp', 'Giám đốc', '2026-02-01 15:29:24.386', '2026-02-01 15:29:24.386');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceqq000712o4u41hauls', 'Trưởng phòng', '2026-02-01 15:29:24.386', '2026-02-01 15:29:24.386');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceqq000512o4lgchugdi', 'Phó Tổng Giám đốc', '2026-02-01 15:29:24.386', '2026-02-02 14:12:02.356');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml3wceqq000812o4nvj0z92f', 'Phó phòng', '2026-02-01 15:29:24.386', '2026-02-02 14:12:17.227');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml5918gz0009yw6jwkk42wjq', 'Kiểm soát viên', '2026-02-02 14:12:24.227', '2026-02-02 14:12:24.227');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml591op9000ayw6jgqldd6nk', 'Nhân viên', '2026-02-02 14:12:45.261', '2026-02-02 14:12:45.261');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml591s6u000byw6jrghw62hf', 'Chuyên viên', '2026-02-02 14:12:49.782', '2026-02-02 14:12:49.782');
INSERT INTO meal_management."Position" (id, name, "createdAt", "updatedAt") VALUES ('cml68ahva0004d4ubnkwcqzxi', 'Tổng Giám đốc', '2026-02-03 13:39:22.869', '2026-02-03 13:39:22.869');


--
-- Data for Name: Registration; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xae800ar6z5pypxxasr9', 'cml5ykf1g00095nrhq8t4w1ob', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.742', '2026-02-06 08:12:11.742');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaea00at6z5p93bs53bt', 'cml5z4mxg001jqaideiuzsing', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.745', '2026-02-06 08:12:11.745');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7r1tyv0001mos2tdenqk4p', 'cml5z4mwu0019qaiddybyybmw', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 15:12:17.525', '2026-02-04 15:12:17.525');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7i90aq0003gez24q5uc4wu', 'cml5z4mwu0019qaiddybyybmw', 'cml68c93b0007d4ubqpde75rh', false, NULL, NULL, '2026-02-04 11:05:55.778', '2026-02-04 11:05:55.778');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaed00av6z5p14e6eayv', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.748', '2026-02-06 08:12:11.748');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaef00ax6z5p4zahml56', 'cml5z4mxp001oqaidhv5qaz95', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.75', '2026-02-06 08:12:11.75');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaeh00az6z5pvt0e1pch', 'cml5ykf1s000f5nrh2wqaqp32', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.752', '2026-02-06 08:12:11.752');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaek00b16z5po7re0iy0', 'cml5z4mxz001tqaidhoil4lue', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.754', '2026-02-06 08:12:11.754');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaen00b36z5ptk1fqweq', 'cml5ykf1w000i5nrhcpoxlxqw', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.757', '2026-02-06 08:12:11.757');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaep00b56z5pqyktma3z', 'cml5z4my7001yqaidwcp9pmmu', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.76', '2026-02-06 08:12:11.76');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaes00b76z5pa195n4l9', 'cml5ykf20000l5nrhsu1spvzd', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.763', '2026-02-06 08:12:11.763');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaeu00b96z5pk8hfuumz', 'cml5z4myf0023qaidmnhgopvl', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.765', '2026-02-06 08:12:11.765');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaew00bb6z5pgibr4wiy', 'cml5ykf25000o5nrhugyc6gjv', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.767', '2026-02-06 08:12:11.767');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaey00bd6z5pj3nd878c', 'cml5z4myn0028qaidik7iccpr', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.769', '2026-02-06 08:12:11.769');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaf100bf6z5px4sepaxf', 'cml5ykf29000r5nrhmfbsr00d', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.772', '2026-02-06 08:12:11.772');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaf400bh6z5p9dq7z3gv', 'cml5z4myv002dqaidohg3a4vl', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.774', '2026-02-06 08:12:11.774');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaf600bj6z5pu25hxaaa', 'cml5ykf2d000u5nrhr4r20ys3', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.777', '2026-02-06 08:12:11.777');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xaf900bl6z5pyno3tf1l', 'cml5z4mz4002iqaidgqih6b9c', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.779', '2026-02-06 08:12:11.779');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5ykf1700055nrhsxki0oei', 'cml5ykf1300035nrhwzg0koau', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:07:09.594', '2026-02-04 11:44:25.016');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5ykf1d00085nrh8c7injps', 'cml5ykf1b00065nrh40411k10', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:07:09.6', '2026-02-04 11:44:25.038');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5ykf1i000b5nrhtdy5urq9', 'cml5ykf1g00095nrhq8t4w1ob', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:07:09.605', '2026-02-04 11:44:25.048');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafb00bn6z5p9sqbthiu', 'cml5ykf2i000x5nrhth2i56h6', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.781', '2026-02-06 08:12:11.781');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafd00bp6z5pj63jtwf3', 'cml5z4mzd002nqaid1wee9srl', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.784', '2026-02-06 08:12:11.784');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafl00bv6z5p293xeu7g', 'cml5ykf2u00135nrh5i3ykshc', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.792', '2026-02-06 08:12:11.792');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafn00bx6z5p9ig71fed', 'cml5z4mzt002xqaidvt0bobb4', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.794', '2026-02-06 08:12:11.794');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafv00bz6z5px4yknjqt', 'cml5ykf2z00165nrhca58vk52', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.801', '2026-02-06 08:12:11.801');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xafy00c16z5pomrmqnw2', 'cml5z4n000032qaidxyyj30dj', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.805', '2026-02-06 08:12:11.805');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xag100c36z5p41l99enk', 'cml5ykf3500195nrhm53wa9bc', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.808', '2026-02-06 08:12:11.808');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5z4mwl0016qaidg7p9gaor', 'cml5z4mwj0014qaid8g0o2kms', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:22:52.917', '2026-02-03 16:17:13.458');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5z4mww001bqaidm8kolsg0', 'cml5z4mwu0019qaiddybyybmw', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:22:52.927', '2026-02-04 11:44:26.523');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml5z4mx7001gqaid1w1tm3ir', 'cml5z4mx5001eqaidjws9oi6i', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-03 09:22:52.938', '2026-02-04 11:44:27.26');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q1kcy0001ef84jb9csjsz', 'cml5ykf1b00065nrh40411k10', 'cml68c93b0007d4ubqpde75rh', false, NULL, NULL, '2026-02-04 14:44:05.457', '2026-02-04 14:44:05.457');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q1urh0005ef84qs5jubkz', 'cml5z4zei005iqaido579xg3g', 'cml68c93b0007d4ubqpde75rh', false, NULL, NULL, '2026-02-04 14:44:18.941', '2026-02-04 14:44:18.941');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xag400c56z5p7h4c730y', 'cml5z4n080037qaidshvcqu97', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.81', '2026-02-06 08:12:11.81');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xag600c76z5p76s0kfdk', 'cml5ykf39001c5nrh5dio8plc', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.813', '2026-02-06 08:12:11.813');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xag800c96z5p3msrge4e', 'cml5z4n0g003cqaidnbwekimy', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.815', '2026-02-06 08:12:11.815');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xagb00cb6z5pm7rb6tlk', 'cml5ykf3g001f5nrhdiuypmqz', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.818', '2026-02-06 08:12:11.818');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xage00cd6z5prz3xmaz6', 'cml5z4n0o003hqaidgynyfa4i', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:11.821', '2026-02-06 08:12:11.821');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7ri9rb0008htzmnm1w3y5h', 'cml5z4mwu0019qaiddybyybmw', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-04 15:25:04.486', '2026-02-04 15:25:04.486');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla6xmkb00cr6z5pg7h6d373', 'cml5z4sj80050qaidqmgl0apo', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-06 08:12:27.514', '2026-02-06 08:12:27.514');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaz6000guazcpdos3y1o', 'cml5ykf29000r5nrhmfbsr00d', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.425', '2026-02-08 22:15:21.425');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaza000iuazcgz2kak15', 'cml5ykf2d000u5nrhr4r20ys3', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.429', '2026-02-08 22:15:21.429');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaze000kuazc2l4wv3ii', 'cml5ykf2i000x5nrhth2i56h6', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.433', '2026-02-08 22:15:21.433');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxazh000muazcl2vqd274', 'cml5ykf2p00105nrhp1li188e', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.437', '2026-02-08 22:15:21.437');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxazs000ouazcuqgkqr2y', 'cml5z4sio004lqaidud3y8afm', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.447', '2026-02-08 22:15:21.447');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxazw000quazcpvrob7ef', 'cml5yx1xm000u3xujjmeu1m2v', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.451', '2026-02-08 22:15:21.451');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb03000suazc9v32igpb', 'cml5ykf2u00135nrh5i3ykshc', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.458', '2026-02-08 22:15:21.458');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb07000uuazcc7bu91vc', 'cml5ykf2z00165nrhca58vk52', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.462', '2026-02-08 22:15:21.462');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb0a000wuazczwcyco92', 'cml5ykf3500195nrhm53wa9bc', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.466', '2026-02-08 22:15:21.466');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb0e000yuazckrxh4pn9', 'cml5ykf39001c5nrh5dio8plc', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.469', '2026-02-08 22:15:21.469');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb0i0010uazcu46vkkuv', 'cml5ykf3g001f5nrhdiuypmqz', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.473', '2026-02-08 22:15:21.473');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxb140012uazce70u435g', 'cml5z4sj80050qaidqmgl0apo', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.495', '2026-02-08 22:15:21.495');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9ceunx0001ap7ip7gnduin', 'cml5ykf1g00095nrhq8t4w1ob', 'cml68c93b0007d4ubqpde75rh', false, NULL, NULL, '2026-02-05 17:58:03.065', '2026-02-05 17:58:03.065');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9fqkzw005k6z5p3nel6aud', 'cml5z4mxp001oqaidhv5qaz95', 'cml9ebia100506z5pfhozrb9f', false, NULL, NULL, '2026-02-05 19:31:09.259', '2026-02-05 19:31:09.259');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ukt000def84ijy7q7gp', 'cml5ykf1300035nrhwzg0koau', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.356', '2026-02-04 14:45:05.356');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ul3000fef84qv4fn0mi', 'cml5ykf1b00065nrh40411k10', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.366', '2026-02-04 14:45:05.366');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ul7000hef84c4waz7p5', 'cml5ykf1g00095nrhq8t4w1ob', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.37', '2026-02-04 14:45:05.37');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ula000jef84z8499i7k', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.373', '2026-02-04 14:45:05.373');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ulc000lef846zoxxtlh', 'cml5ykf1s000f5nrh2wqaqp32', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.376', '2026-02-04 14:45:05.376');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ulf000nef840pxamlkw', 'cml5ykf1w000i5nrhcpoxlxqw', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.378', '2026-02-04 14:45:05.378');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ulj000pef843uq6fqh5', 'cml5ykf20000l5nrhsu1spvzd', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.383', '2026-02-04 14:45:05.383');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2uln000ref84yvjry5cv', 'cml5ykf25000o5nrhugyc6gjv', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.386', '2026-02-04 14:45:05.386');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ulq000tef84rw3r0bmk', 'cml5ykf29000r5nrhmfbsr00d', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.39', '2026-02-04 14:45:05.39');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2ulu000vef84bcxk4jvp', 'cml5ykf2d000u5nrhr4r20ys3', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.393', '2026-02-04 14:45:05.393');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2um3000xef84r8mm981y', 'cml5ykf2i000x5nrhth2i56h6', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.403', '2026-02-04 14:45:05.403');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2um6000zef8413b6krp6', 'cml5ykf2p00105nrhp1li188e', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.405', '2026-02-04 14:45:05.405');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2um90011ef84xbn4gyl4', 'cml5ykf2u00135nrh5i3ykshc', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.408', '2026-02-04 14:45:05.408');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2umc0013ef84hklpsfxk', 'cml5ykf2z00165nrhca58vk52', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.411', '2026-02-04 14:45:05.411');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2umf0015ef84aw8t8wd4', 'cml5ykf3500195nrhm53wa9bc', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.415', '2026-02-04 14:45:05.415');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2umi0017ef84h4nco4g1', 'cml5ykf39001c5nrh5dio8plc', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.418', '2026-02-04 14:45:05.418');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q2uml0019ef84gk3ykrk3', 'cml5ykf3g001f5nrhdiuypmqz', 'cml7q2esn0008ef846loj14mq', false, NULL, NULL, '2026-02-04 14:45:05.421', '2026-02-04 14:45:05.421');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9dzbh200086z5ph0mh1xpx', 'cml5z4zei005iqaido579xg3g', 'cml9dx3bg00046z5pjf6e20ep', false, NULL, NULL, '2026-02-05 18:41:57.586', '2026-02-05 18:41:57.586');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9eyhcd005c6z5p3998lsx0', 'cml5yx1wk00083xujrj295xs5', 'cml9ebia100506z5pfhozrb9f', false, NULL, NULL, '2026-02-05 19:09:18.156', '2026-02-05 19:09:18.156');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9eyipb005e6z5pp1ysj0bd', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml9ebia100506z5pfhozrb9f', false, NULL, NULL, '2026-02-05 19:09:19.917', '2026-02-05 19:09:19.917');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml9fyaed005m6z5pz6ylr1bq', 'cml5z4zei005iqaido579xg3g', 'cml9ebia100506z5pfhozrb9f', false, NULL, NULL, '2026-02-05 19:37:08.772', '2026-02-05 19:37:08.772');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jszx00d26z5p1kmdmir4', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.256', '2026-02-06 08:29:42.256');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0500d46z5pqiuzy92m', 'cml5ykf1s000f5nrh2wqaqp32', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.292', '2026-02-06 08:29:42.292');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0a00d66z5pd9xl3xqq', 'cml5ykf1w000i5nrhcpoxlxqw', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.297', '2026-02-06 08:29:42.297');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0f00d86z5p016pn7mx', 'cml5ykf20000l5nrhsu1spvzd', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.302', '2026-02-06 08:29:42.302');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0q00da6z5pagk2te5z', 'cml5ykf25000o5nrhugyc6gjv', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.313', '2026-02-06 08:29:42.313');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0u00dc6z5p36my91jb', 'cml5ykf29000r5nrhmfbsr00d', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.317', '2026-02-06 08:29:42.317');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt0x00de6z5p9f1oe2u2', 'cml5ykf2d000u5nrhr4r20ys3', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.32', '2026-02-06 08:29:42.32');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1000dg6z5pqkytqehc', 'cml5ykf2i000x5nrhth2i56h6', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.323', '2026-02-06 08:29:42.323');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1300di6z5pf2xx64ak', 'cml5ykf2p00105nrhp1li188e', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.326', '2026-02-06 08:29:42.326');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1600dk6z5peqvssdi5', 'cml5ykf2u00135nrh5i3ykshc', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.329', '2026-02-06 08:29:42.329');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1900dm6z5pw7kfxp23', 'cml5ykf2z00165nrhca58vk52', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.332', '2026-02-06 08:29:42.332');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1c00do6z5phzdoiiqy', 'cml5ykf3500195nrhm53wa9bc', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.335', '2026-02-06 08:29:42.335');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1f00dq6z5pwxbj3fx3', 'cml5ykf39001c5nrh5dio8plc', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.338', '2026-02-06 08:29:42.338');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmla7jt1h00ds6z5pa07biba3', 'cml5ykf3g001f5nrhdiuypmqz', 'cml7rhv4t0004htzmy532nigy', false, NULL, NULL, '2026-02-06 08:29:42.34', '2026-02-06 08:29:42.34');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml6f38bn0002j1ku4er4xv8l', 'cml5z4mwu0019qaiddybyybmw', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-03 16:49:41.218', '2026-02-03 21:19:58.627');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml68e4g4000nd4ub13dwguzf', 'cml5z4mwj0014qaid8g0o2kms', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-03 13:42:12.099', '2026-02-03 16:45:01.277');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxawy0002uazchemvy2nf', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.345', '2026-02-08 22:15:21.345');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaxj0004uazcb8m046g4', 'cml5ykf1s000f5nrh2wqaqp32', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.367', '2026-02-08 22:15:21.367');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaxu0006uazcs624pwly', 'cml5ykf1w000i5nrhcpoxlxqw', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.377', '2026-02-08 22:15:21.377');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml6ehtr9000513feuk1q27vt', 'cml5ykf1300035nrhwzg0koau', 'cml68dew8000jd4ub91qxsr1m', false, NULL, NULL, '2026-02-03 16:33:02.564', '2026-02-04 08:04:21.474');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53ii001hef84rd73kpgw', 'cml5ykf1300035nrhwzg0koau', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.25', '2026-02-04 14:46:50.25');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53in001jef84g6y82omv', 'cml5ykf1b00065nrh40411k10', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.255', '2026-02-04 14:46:50.255');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53iq001lef84emjfeyd2', 'cml5ykf1g00095nrhq8t4w1ob', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.257', '2026-02-04 14:46:50.257');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53it001nef84ru81ztpb', 'cml5ykf1l000c5nrhj1u2wlk9', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.26', '2026-02-04 14:46:50.26');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53iw001pef847oowus1x', 'cml5ykf1s000f5nrh2wqaqp32', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.264', '2026-02-04 14:46:50.264');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53j0001ref84jsohbzfq', 'cml5ykf1w000i5nrhcpoxlxqw', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.268', '2026-02-04 14:46:50.268');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53j4001tef848cfyemn2', 'cml5ykf20000l5nrhsu1spvzd', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.271', '2026-02-04 14:46:50.271');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53j6001vef84lycjux8r', 'cml5ykf25000o5nrhugyc6gjv', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.274', '2026-02-04 14:46:50.274');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53ja001xef842gnxt5fd', 'cml5ykf29000r5nrhmfbsr00d', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.277', '2026-02-04 14:46:50.277');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53je001zef84qf6s0dub', 'cml5ykf2d000u5nrhr4r20ys3', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.282', '2026-02-04 14:46:50.282');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53jh0021ef846huydiu6', 'cml5ykf2i000x5nrhth2i56h6', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.285', '2026-02-04 14:46:50.285');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53jk0023ef844u0fl076', 'cml5ykf2p00105nrhp1li188e', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.288', '2026-02-04 14:46:50.288');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53jn0025ef84r1uuaylu', 'cml5ykf2u00135nrh5i3ykshc', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.291', '2026-02-04 14:46:50.291');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53jq0027ef84e3oj32rn', 'cml5ykf2z00165nrhca58vk52', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.294', '2026-02-04 14:46:50.294');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53ju0029ef840ldbe2in', 'cml5ykf3500195nrhm53wa9bc', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.297', '2026-02-04 14:46:50.297');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53jx002bef8463xo2ud0', 'cml5ykf39001c5nrh5dio8plc', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.301', '2026-02-04 14:46:50.301');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cml7q53k0002def84q3sql75t', 'cml5ykf3g001f5nrhdiuypmqz', 'cml7q4pxb001cef84jzavh3sn', false, NULL, NULL, '2026-02-04 14:46:50.304', '2026-02-04 14:46:50.304');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaxy0008uazcwe4hl9r7', 'cml5ykf20000l5nrhsu1spvzd', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.382', '2026-02-08 22:15:21.382');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaym000auazcoy4oh22z', 'cml5z4si20046qaidl4n60ydu', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.405', '2026-02-08 22:15:21.405');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxayw000cuazcbhlx1l30', 'cml5yx1x2000j3xuj2ahvguqb', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.415', '2026-02-08 22:15:21.415');
INSERT INTO meal_management."Registration" (id, "mealEventId", "employeeId", "isCancelled", "cancelledBy", "cancelledAt", "createdAt", "updatedAt") VALUES ('cmldvxaz2000euazcs3bjwg50', 'cml5ykf25000o5nrhugyc6gjv', 'cml5af6ch0002wyk2xkyzouxc', false, NULL, NULL, '2026-02-08 22:15:21.421', '2026-02-08 22:15:21.421');


--
-- Data for Name: RegistrationPreset; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."RegistrationPreset" (id, name, "mealType", weekdays) VALUES ('cml3wcer8000b12o4wz9mp52r', 'Hành chính – Trưa', 'LUNCH', '1,2,3,4,5');
INSERT INTO meal_management."RegistrationPreset" (id, name, "mealType", weekdays) VALUES ('cml3wcer8000d12o41elrtc12', 'Hành chính – Trưa+Tối', 'LUNCH,DINNER', '1,2,3,4,5');
INSERT INTO meal_management."RegistrationPreset" (id, name, "mealType", weekdays) VALUES ('cml3wcer8000c12o4c3c2v0yp', 'Full tháng – Trưa', 'LUNCH', '0,1,2,3,4,5,6');
INSERT INTO meal_management."RegistrationPreset" (id, name, "mealType", weekdays) VALUES ('cml3wcer8000e12o4mf1waz8j', 'Full tháng – Trưa+Tối', 'LUNCH,DINNER', '0,1,2,3,4,5,6');


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management."SystemConfig" (id, key, value, "updatedBy", "createdAt", "updatedAt") VALUES ('cml3wceqz000912o4qfcknq58', 'CUT_OFF_HOUR', '16', 'cml3wceto000i12o4iop0lger', '2026-02-01 15:29:24.395', '2026-02-02 14:13:00.539');
INSERT INTO meal_management."SystemConfig" (id, key, value, "updatedBy", "createdAt", "updatedAt") VALUES ('cml3wceqz000a12o4ub4m2k2h', 'MEAL_PRICE', '25000', 'cml5af6ed0004wyk2juez7r7n', '2026-02-01 15:29:24.395', '2026-02-02 16:28:29.855');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: meal_management; Owner: meal_user
--

INSERT INTO meal_management._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('212fc1ff-6cc7-4d51-ba0b-6aa4bb4120c5', '4ef83f5fc542469eb2e2ffb0867b560fbf4b0f055bf8388f6d87e0d6405ae8ed', '2026-02-01 15:20:12.253064+00', '20260201152011_init', NULL, NULL, '2026-02-01 15:20:11.871537+00', 1);
INSERT INTO meal_management._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('369d3c81-fdb5-4c9e-bc4e-10ec7a6764f3', '32b7eed926e736a4392da59e9329ebb9a5d4d2f8e12632126d59c537ad2a0d71', '2026-02-02 14:07:17.653537+00', '20260202140717_increase_secret_code_length', NULL, NULL, '2026-02-02 14:07:17.641148+00', 1);
INSERT INTO meal_management._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('0adda3fe-c847-4efb-915c-535d2bb19bb7', '1e399ebbef5353d73a4690cf6f2f82c94d4955f3e7f233a5fb0695f4a0d4c387', '2026-02-04 04:57:15.194209+00', '20260204045715_add_meal_price_config', NULL, NULL, '2026-02-04 04:57:15.09406+00', 1);
INSERT INTO meal_management._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('af59d5a2-016c-4ee6-89a2-71a8f4a0ca06', 'c442b421713349b1bcb9503a8cf3c47262d4b4996c0306646d3d580695cc2b0a', '2026-02-05 04:39:03.644887+00', '20260205043903_add_meal_review', NULL, NULL, '2026-02-05 04:39:03.605097+00', 1);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: CheckinLog CheckinLog_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."CheckinLog"
    ADD CONSTRAINT "CheckinLog_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: Guest Guest_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Guest"
    ADD CONSTRAINT "Guest_pkey" PRIMARY KEY (id);


--
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (id);


--
-- Name: MealEvent MealEvent_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MealEvent"
    ADD CONSTRAINT "MealEvent_pkey" PRIMARY KEY (id);


--
-- Name: MealPriceConfig MealPriceConfig_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MealPriceConfig"
    ADD CONSTRAINT "MealPriceConfig_pkey" PRIMARY KEY (id);


--
-- Name: MealReview MealReview_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MealReview"
    ADD CONSTRAINT "MealReview_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: Position Position_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Position"
    ADD CONSTRAINT "Position_pkey" PRIMARY KEY (id);


--
-- Name: RegistrationPreset RegistrationPreset_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."RegistrationPreset"
    ADD CONSTRAINT "RegistrationPreset_pkey" PRIMARY KEY (id);


--
-- Name: Registration Registration_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Registration"
    ADD CONSTRAINT "Registration_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_employeeId_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Account_employeeId_key" ON meal_management."Account" USING btree ("employeeId");


--
-- Name: Account_sharedUserId_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Account_sharedUserId_key" ON meal_management."Account" USING btree ("sharedUserId");


--
-- Name: CheckinLog_mealEventId_employeeId_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "CheckinLog_mealEventId_employeeId_key" ON meal_management."CheckinLog" USING btree ("mealEventId", "employeeId");


--
-- Name: CheckinLog_mealEventId_guestId_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "CheckinLog_mealEventId_guestId_key" ON meal_management."CheckinLog" USING btree ("mealEventId", "guestId");


--
-- Name: Department_name_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Department_name_key" ON meal_management."Department" USING btree (name);


--
-- Name: Employee_email_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Employee_email_key" ON meal_management."Employee" USING btree (email);


--
-- Name: Employee_employeeCode_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Employee_employeeCode_key" ON meal_management."Employee" USING btree ("employeeCode");


--
-- Name: Guest_qrToken_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Guest_qrToken_key" ON meal_management."Guest" USING btree ("qrToken");


--
-- Name: MealEvent_mealDate_mealType_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "MealEvent_mealDate_mealType_key" ON meal_management."MealEvent" USING btree ("mealDate", "mealType");


--
-- Name: MealEvent_qrToken_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "MealEvent_qrToken_key" ON meal_management."MealEvent" USING btree ("qrToken");


--
-- Name: MealPriceConfig_startDate_endDate_idx; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE INDEX "MealPriceConfig_startDate_endDate_idx" ON meal_management."MealPriceConfig" USING btree ("startDate", "endDate");


--
-- Name: MealReview_mealEventId_idx; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE INDEX "MealReview_mealEventId_idx" ON meal_management."MealReview" USING btree ("mealEventId");


--
-- Name: Position_name_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Position_name_key" ON meal_management."Position" USING btree (name);


--
-- Name: RegistrationPreset_name_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "RegistrationPreset_name_key" ON meal_management."RegistrationPreset" USING btree (name);


--
-- Name: Registration_mealEventId_employeeId_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "Registration_mealEventId_employeeId_key" ON meal_management."Registration" USING btree ("mealEventId", "employeeId");


--
-- Name: SystemConfig_key_key; Type: INDEX; Schema: meal_management; Owner: meal_user
--

CREATE UNIQUE INDEX "SystemConfig_key_key" ON meal_management."SystemConfig" USING btree (key);


--
-- Name: Account Account_employeeId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Account"
    ADD CONSTRAINT "Account_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES meal_management."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CheckinLog CheckinLog_employeeId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."CheckinLog"
    ADD CONSTRAINT "CheckinLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES meal_management."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CheckinLog CheckinLog_guestId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."CheckinLog"
    ADD CONSTRAINT "CheckinLog_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES meal_management."Guest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CheckinLog CheckinLog_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."CheckinLog"
    ADD CONSTRAINT "CheckinLog_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_departmentId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Employee"
    ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES meal_management."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Employee Employee_positionId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Employee"
    ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES meal_management."Position"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Guest Guest_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Guest"
    ADD CONSTRAINT "Guest_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ingredient Ingredient_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Ingredient"
    ADD CONSTRAINT "Ingredient_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MealReview MealReview_employeeId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MealReview"
    ADD CONSTRAINT "MealReview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES meal_management."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MealReview MealReview_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MealReview"
    ADD CONSTRAINT "MealReview_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."MenuItem"
    ADD CONSTRAINT "MenuItem_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Registration Registration_employeeId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Registration"
    ADD CONSTRAINT "Registration_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES meal_management."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Registration Registration_mealEventId_fkey; Type: FK CONSTRAINT; Schema: meal_management; Owner: meal_user
--

ALTER TABLE ONLY meal_management."Registration"
    ADD CONSTRAINT "Registration_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES meal_management."MealEvent"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 9HfhdUAnM2uKF2bi4K1gSo4jY2bBcme1NZgcCm43cYuQWHpgoAPQdLhIDb6YzLH

