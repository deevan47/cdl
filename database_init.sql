SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'cdl_management' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS cdl_management;
CREATE DATABASE cdl_management;

\c cdl_management;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'research_associate', 'animator_Specialist', 'editor', 'animator', 'assistant_administrator')),
    avatar TEXT,
    password TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('flame', 'swayam')),
    scenario TEXT,
    status VARCHAR(50) DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'at_risk', 'lagging', 'completed')),
    overall_progress DECIMAL(5,2) DEFAULT 0,
    project_manager_id UUID REFERENCES users(id),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL CHECK (name IN ('Pre-Production', 'Production', 'Post-Production')),
    status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'overdue', 'completed')),
    progress DECIMAL(5,2) DEFAULT 0,
    is_open BOOLEAN DEFAULT true,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_hours INTEGER,
    status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'overdue', 'completed')),
    is_completed BOOLEAN DEFAULT false,
    stage_id UUID REFERENCES project_stages(id) ON DELETE CASCADE,
    dependencies JSONB,
    required_assets JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stage_assignments (
    stage_id UUID REFERENCES project_stages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (stage_id, user_id)
);

CREATE TABLE task_assignments (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);