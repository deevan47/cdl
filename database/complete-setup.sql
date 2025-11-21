CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'admin', 'project_manager', 'lead_designer', 'research_associate', 
        'lead_developer', 'qa_engineer', 'content_strategist', 
        'jr_developer', 'editor', 'animator'
    )),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('flame', 'swayam')),
    scenario TEXT,
    status VARCHAR(50) DEFAULT 'setup' CHECK (status IN (
        'setup', 'in_progress', 'at_risk', 'lagging', 'completed'
    )),
    overall_progress DECIMAL(5,2) DEFAULT 0,
    project_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project stages table
CREATE TABLE project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL CHECK (name IN (
        'Pre-Production', 'Production', 'Post-Production'
    )),
    status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN (
        'on_track', 'at_risk', 'overdue', 'completed'
    )),
    progress DECIMAL(5,2) DEFAULT 0,
    is_open BOOLEAN DEFAULT true,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_hours INTEGER,
    status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN (
        'on_track', 'at_risk', 'overdue', 'completed'
    )),
    is_completed BOOLEAN DEFAULT false,
    stage_id UUID REFERENCES project_stages(id) ON DELETE CASCADE,
    dependencies JSONB,
    required_assets JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for stage assignments
CREATE TABLE stage_assignments (
    stage_id UUID REFERENCES project_stages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (stage_id, user_id)
);

-- Junction table for task assignments
CREATE TABLE task_assignments (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- ========================================
-- INSERT AUTH USERS (with bcrypt hashed passwords)
-- ========================================
-- Passwords:
-- admin: admin123 (hash: $2b$10$FnaDWUkmNNh9eCij1QdNieOE1cXDVBDWULbDm6fgMn9dyHtzgq1t2)
-- manager: manager123 (hash: $2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm)
-- user: user123 (hash: $2b$10$P73.i0bjBx5K58sUGmuWLeQhg.wWZcrcvZ9w47NsM4h7649.IFZNu)

INSERT INTO users (id, name, email, password, role, avatar, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@cdl.com', '$2b$10$FnaDWUkmNNh9eCij1QdNieOE1cXDVBDWULbDm6fgMn9dyHtzgq1t2', 'admin', 'https://i.pravatar.cc/150?u=admin', true),
('22222222-2222-2222-2222-222222222222', 'Manager User', 'manager@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'project_manager', 'https://i.pravatar.cc/150?u=manager', true),
('33333333-3333-3333-3333-333333333333', 'User User', 'user@cdl.com', '$2b$10$P73.i0bjBx5K58sUGmuWLeQhg.wWZcrcvZ9w47NsM4h7649.IFZNu', 'lead_developer', 'https://i.pravatar.cc/150?u=user', true);

-- ========================================
-- INSERT TEAM MEMBERS
-- ========================================

INSERT INTO users (name, email, password, role, avatar, is_active) VALUES
('Praharshini Kumar', 'praharshini.kumar@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'project_manager', 'https://i.pravatar.cc/150?u=praharshini', true),
('Varsha Kumar', 'varsha.kumar@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'lead_designer', 'https://i.pravatar.cc/150?u=varsha', true),
('Siddhant Salve', 'siddhant.salve@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'lead_developer', 'https://i.pravatar.cc/150?u=siddhant', true),
('Dipraj More', 'dipraj.more@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'qa_engineer', 'https://i.pravatar.cc/150?u=dipraj', true),
('Shweta Kumari', 'shweta.kumari@cdl.com', '$2b$10$hofeDn9I6bex7GeLmCx4IuKjM0vPUWS9MAa1wIwQWTz1AgGK6aqWm', 'content_strategist', 'https://i.pravatar.cc/150?u=shweta', true);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Get the project manager's user ID and insert projects in a single statement
WITH pm_user AS (
    SELECT id FROM users WHERE email = 'praharshini.kumar@cdl.com' LIMIT 1
)
INSERT INTO projects (name, platform, scenario, project_manager_id, deadline, status, overall_progress)
VALUES
    ('Project Phoenix', 'flame', '3D Animation Project for Internal Training', (SELECT id FROM pm_user), '2025-12-31', 'in_progress', 25),
    ('Quantum Computing Fundamentals', 'swayam', 'Expert Led Course for External Students', (SELECT id FROM pm_user), '2025-11-30', 'in_progress', 40);

-- Insert stages for FLAME project (3 stages)
INSERT INTO project_stages (name, project_id, status, progress) 
SELECT 'Pre-Production', id, 'on_track', 50 FROM projects WHERE name = 'Project Phoenix'
UNION ALL
SELECT 'Production', id, 'on_track', 10 FROM projects WHERE name = 'Project Phoenix'
UNION ALL
SELECT 'Post-Production', id, 'on_track', 0 FROM projects WHERE name = 'Project Phoenix';

-- Insert stages for SWAYAM project (2 stages)
INSERT INTO project_stages (name, project_id, status, progress) 
SELECT 'Production', id, 'on_track', 60 FROM projects WHERE name = 'Quantum Computing Fundamentals'
UNION ALL
SELECT 'Post-Production', id, 'on_track', 20 FROM projects WHERE name = 'Quantum Computing Fundamentals';

-- ========================================
-- INSERT TASKS (will be linked to stages after stages are created)
-- ========================================

-- Get stage IDs and insert tasks for FLAME project
INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Research and Moodboarding', 'Initial research phase and moodboard creation', '2025-09-15'::date, '2025-09-25'::date, 40, ps.id, 'completed', true
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Project Phoenix' AND ps.name = 'Pre-Production'
LIMIT 1;

INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Concept Art Development', 'Create concept art and visual style guides', '2025-09-26'::date, '2025-10-05'::date, 60, ps.id, 'completed', true
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Project Phoenix' AND ps.name = 'Pre-Production'
LIMIT 1;

INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Script Writing', 'Develop animation script and storyboard', '2025-10-06'::date, '2025-10-15'::date, 30, ps.id, 'on_track', false
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Project Phoenix' AND ps.name = 'Pre-Production'
LIMIT 1;

INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT '3D Modeling', 'Create 3D models and assets', '2025-10-16'::date, '2025-10-30'::date, 80, ps.id, 'on_track', false
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Project Phoenix' AND ps.name = 'Production'
LIMIT 1;

INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Texturing and Shading', 'Apply textures and materials to 3D models', '2025-11-01'::date, '2025-11-10'::date, 50, ps.id, 'on_track', false
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Project Phoenix' AND ps.name = 'Production'
LIMIT 1;

-- Tasks for SWAYAM project
INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Course Content Development', 'Develop course curriculum and materials', '2025-10-01'::date, '2025-10-10'::date, 50, ps.id, 'completed', true
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Quantum Computing Fundamentals' AND ps.name = 'Production'
LIMIT 1;

INSERT INTO tasks (name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed) 
SELECT 'Video Recording', 'Record course lectures and demonstrations', '2025-10-11'::date, '2025-10-20'::date, 60, ps.id, 'on_track', false
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id 
WHERE p.name = 'Quantum Computing Fundamentals' AND ps.name = 'Production'
LIMIT 1;

-- ========================================
-- SETUP COMPLETE
-- ========================================
SELECT 'Database setup complete!' as status;