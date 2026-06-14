-- ============================================================
-- AI Trip Planner — Auth & Profile Schema
-- Run on a fresh database OR apply the ALTER TABLE section
-- to an existing install that already has the users table.
-- ============================================================

-- ── Users (core identity + profile fields) ─────────────────

CREATE TABLE IF NOT EXISTS users (
  id           INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100),
  username     VARCHAR(50)   NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  password     VARCHAR(255)  NOT NULL,
  role         ENUM('user','agency') NOT NULL DEFAULT 'user',
  phone        VARCHAR(30),
  country      VARCHAR(100),
  city         VARCHAR(100),
  bio          TEXT,
  avatar_url   VARCHAR(600),
  last_login   DATETIME,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email    (email),
  UNIQUE KEY uq_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Migration: add new columns to existing users table ──────
-- Run this block if users table already exists:
--
-- ALTER TABLE users
--   ADD COLUMN IF NOT EXISTS full_name   VARCHAR(100)   AFTER username,
--   ADD COLUMN IF NOT EXISTS phone       VARCHAR(30)    AFTER email,
--   ADD COLUMN IF NOT EXISTS country     VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS city        VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS bio         TEXT,
--   ADD COLUMN IF NOT EXISTS avatar_url  VARCHAR(600),
--   ADD COLUMN IF NOT EXISTS last_login  DATETIME,
--   ADD COLUMN IF NOT EXISTS updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── Travel preferences (one row per user) ──────────────────

CREATE TABLE IF NOT EXISTS user_preferences (
  id                  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id             INT          NOT NULL,
  travel_style        VARCHAR(60),
  budget              VARCHAR(30),
  preferred_climate   VARCHAR(60),
  favorite_activities JSON,
  travel_type         VARCHAR(60),
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE  KEY uq_user_pref  (user_id),
  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Travel history ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_history (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL,
  country          VARCHAR(100) NOT NULL,
  city             VARCHAR(100),
  country_code     VARCHAR(10),
  match_percentage TINYINT      UNSIGNED,
  travel_style     VARCHAR(60),
  budget           VARCHAR(30),
  image_url        VARCHAR(600),
  viewed_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hist_user (user_id),
  INDEX idx_hist_date (viewed_at),
  CONSTRAINT fk_hist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Saved destinations (favourites) ────────────────────────

CREATE TABLE IF NOT EXISTS saved_destinations (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL,
  country          VARCHAR(100) NOT NULL,
  city             VARCHAR(100),
  destination_name VARCHAR(200),
  image_url        VARCHAR(600),
  match_percentage TINYINT      UNSIGNED,
  saved_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_dest (user_id, country, city),
  INDEX idx_fav_user (user_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Agency packages ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS packages (
  id                INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  agency_user_id    INT           NOT NULL,
  agency_name       VARCHAR(200),
  title             VARCHAR(300)  NOT NULL,
  destination       VARCHAR(200)  NOT NULL,
  country           VARCHAR(100),
  price             DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration          VARCHAR(100),
  image             VARCHAR(600),
  description       TEXT,
  included_services TEXT,
  excluded_services TEXT,
  tags              JSON,
  status            ENUM('draft','active','featured') NOT NULL DEFAULT 'active',
  contact_email     VARCHAR(255),
  contact_phone     VARCHAR(30),
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pkg_agency (agency_user_id),
  INDEX idx_pkg_status (status),
  CONSTRAINT fk_pkg_agency FOREIGN KEY (agency_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Agency profiles ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agencies (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL,
  agency_name      VARCHAR(200),
  phone            VARCHAR(30),
  website          VARCHAR(300),
  description      TEXT,
  logo_url         VARCHAR(600),
  total_trips      INT          NOT NULL DEFAULT 0,
  active_trips     INT          NOT NULL DEFAULT 0,
  total_bookings   INT          NOT NULL DEFAULT 0,
  total_travelers  INT          NOT NULL DEFAULT 0,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_agency_user (user_id),
  CONSTRAINT fk_agency_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
