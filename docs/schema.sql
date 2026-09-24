-- 1. users

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    role            ENUM('ADMIN','SALES_REP') NOT NULL,
    status          ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 2. customers

CREATE TABLE customers (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(150)  NOT NULL,
    phone             VARCHAR(20),
    email             VARCHAR(150),
    address           VARCHAR(255),
    city              VARCHAR(100),
    status            ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    assigned_user_id  BIGINT,
    CONSTRAINT fk_customer_user FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);


-- 3. visits

CREATE TABLE visits (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id       BIGINT NOT NULL,
    user_id           BIGINT NOT NULL,
    visit_date        DATETIME NOT NULL,
    purpose           VARCHAR(150),
    discussion        TEXT NOT NULL,
    product_interest  VARCHAR(150),
    competitor        VARCHAR(150),
    requirement       VARCHAR(255),
    remarks           VARCHAR(255),
    follow_up_date    DATE,
    CONSTRAINT fk_visit_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_visit_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_followup_after_visit
        CHECK (follow_up_date IS NULL OR follow_up_date >= DATE(visit_date))
);


-- 4. tasks

CREATE TABLE tasks (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id       BIGINT NOT NULL,
    visit_id          BIGINT,
    assigned_user_id  BIGINT NOT NULL,
    title             VARCHAR(200) NOT NULL,
    due_date          DATE,
    priority          ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
    status            ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'OPEN',
    CONSTRAINT fk_task_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_task_visit FOREIGN KEY (visit_id) REFERENCES visits(id),
    CONSTRAINT fk_task_user FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);


-- 5. ai_insights
-- NOTE: competitive_risk added (not in the original spec schema) to store the
-- AI service's competitiveRisk output, which the web/mobile UI already display.

CREATE TABLE ai_insights (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_id          BIGINT NOT NULL UNIQUE,
    summary           TEXT,
    sentiment         ENUM('POSITIVE','NEUTRAL','NEGATIVE'),
    opportunity       ENUM('LOW','MEDIUM','HIGH'),
    recommendation    TEXT,
    priority          ENUM('LOW','MEDIUM','HIGH'),
    competitive_risk  ENUM('LOW','MEDIUM','HIGH'),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insight_visit FOREIGN KEY (visit_id) REFERENCES visits(id)
);