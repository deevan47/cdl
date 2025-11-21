-- Verification queries to check data was inserted correctly

-- Check users
SELECT 'Users' as table_name;
SELECT id, name, role, email FROM users;

-- Check projects
SELECT 'Projects' as table_name;
SELECT id, name, platform, status, overall_progress FROM projects;

-- Check stages with project names
SELECT 'Project Stages' as table_name;
SELECT p.name as project_name, ps.name as stage_name, ps.status, ps.progress
FROM project_stages ps 
JOIN projects p ON ps.project_id = p.id
ORDER BY p.name, ps.name;

-- Check tasks with project and stage names
SELECT 'Tasks' as table_name;
SELECT p.name as project_name, ps.name as stage_name, t.name as task_name, 
       t.status, t.is_completed, t.start_date, t.end_date
FROM tasks t 
JOIN project_stages ps ON t.stage_id = ps.id 
JOIN projects p ON ps.project_id = p.id
ORDER BY p.name, ps.name, t.start_date;

-- Check task assignments
SELECT 'Task Assignments' as table_name;
SELECT u.name as user_name, t.name as task_name, p.name as project_name
FROM task_assignments ta
JOIN users u ON ta.user_id = u.id
JOIN tasks t ON ta.task_id = t.id
JOIN project_stages ps ON t.stage_id = ps.id
JOIN projects p ON ps.project_id = p.id
ORDER BY u.name, p.name;