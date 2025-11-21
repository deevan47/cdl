-- Insert 5 team members
INSERT INTO users (id, name, email, role, avatar, created_at) VALUES
('pm1', 'Praharshini Kumar', 'praharshini.kumar@cdl.com', 'project_manager', 'https://i.pravatar.cc/150?u=praharshini', NOW()),
('design1', 'Varsha Kumar', 'varsha.kumar@cdl.com', 'lead_designer', 'https://i.pravatar.cc/150?u=varsha', NOW()),
('dev1', 'Siddhant Salve', 'siddhant.salve@cdl.com', 'lead_developer', 'https://i.pravatar.cc/150?u=siddhant', NOW()),
('qa1', 'Dipraj More', 'dipraj.more@cdl.com', 'qa_engineer', 'https://i.pravatar.cc/150?u=dipraj', NOW()),
('content1', 'Shweta Kumari', 'shweta.kumari@cdl.com', 'content_strategist', 'https://i.pravatar.cc/150?u=shweta', NOW());

-- Insert sample FLAME project
INSERT INTO projects (id, name, platform, scenario, project_manager_id, deadline, status, overall_progress, created_at) VALUES
('p1', 'Project Phoenix', 'flame', '3D Animation Project for Internal Training', 'pm1', '2025-12-31', 'in_progress', 25, NOW());

-- Insert sample SWAYAM project
INSERT INTO projects (id, name, platform, scenario, project_manager_id, deadline, status, overall_progress, created_at) VALUES
('p2', 'Quantum Computing Fundamentals', 'swayam', 'Expert Led Course for External Students', 'pm1', '2025-11-30', 'in_progress', 40, NOW());

-- Insert stages for FLAME project (3 stages)
INSERT INTO project_stages (id, name, project_id, status, progress, created_at) VALUES
('s1-1', 'Pre-Production', 'p1', 'on_track', 50, NOW()),
('s1-2', 'Production', 'p1', 'on_track', 10, NOW()),
('s1-3', 'Post-Production', 'p1', 'on_track', 0, NOW());

-- Insert stages for SWAYAM project (2 stages)
INSERT INTO project_stages (id, name, project_id, status, progress, created_at) VALUES
('s2-1', 'Production', 'p2', 'on_track', 60, NOW()),
('s2-2', 'Post-Production', 'p2', 'on_track', 20, NOW());

-- Insert tasks for FLAME project
INSERT INTO tasks (id, name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed, created_at) VALUES
('t1-1-1', 'Research and Moodboarding', 'Initial research phase and moodboard creation', '2025-09-15', '2025-09-25', 40, 's1-1', 'completed', true, NOW()),
('t1-1-2', 'Concept Art Development', 'Create concept art and visual style guides', '2025-09-26', '2025-10-05', 60, 's1-1', 'completed', true, NOW()),
('t1-1-3', 'Script Writing', 'Develop animation script and storyboard', '2025-10-06', '2025-10-15', 30, 's1-1', 'on_track', false, NOW()),
('t1-2-1', '3D Modeling', 'Create 3D models and assets', '2025-10-16', '2025-10-30', 80, 's1-2', 'on_track', false, NOW()),
('t1-2-2', 'Texturing and Shading', 'Apply textures and materials to 3D models', '2025-11-01', '2025-11-10', 50, 's1-2', 'on_track', false, NOW()),
('t1-3-1', 'Animation', 'Animate 3D models and scenes', '2025-11-11', '2025-11-20', 70, 's1-3', 'on_track', false, NOW()),
('t1-3-2', 'Rendering', 'Render final animation sequences', '2025-11-21', '2025-11-30', 40, 's1-3', 'on_track', false, NOW());

-- Insert tasks for SWAYAM project
INSERT INTO tasks (id, name, description, start_date, end_date, estimated_hours, stage_id, status, is_completed, created_at) VALUES
('t2-1-1', 'Course Content Development', 'Develop course curriculum and materials', '2025-10-01', '2025-10-10', 50, 's2-1', 'completed', true, NOW()),
('t2-1-2', 'Video Recording', 'Record course lectures and demonstrations', '2025-10-11', '2025-10-20', 60, 's2-1', 'on_track', false, NOW()),
('t2-1-3', 'Slide Deck Creation', 'Create presentation slides for lectures', '2025-10-21', '2025-10-25', 20, 's2-1', 'on_track', false, NOW()),
('t2-2-1', 'Video Editing', 'Edit and enhance recorded videos', '2025-10-26', '2025-11-05', 40, 's2-2', 'on_track', false, NOW()),
('t2-2-2', 'Quality Assurance', 'Review and test course materials', '2025-11-06', '2025-11-15', 30, 's2-2', 'on_track', false, NOW()),
('t2-2-3', 'Platform Integration', 'Upload course to SWAYAM platform', '2025-11-16', '2025-11-20', 15, 's2-2', 'on_track', false, NOW());

-- Assign users to tasks
INSERT INTO task_assignments (task_id, user_id) VALUES
-- FLAME project assignments
('t1-1-1', 'content1'),
('t1-1-2', 'design1'),
('t1-1-3', 'content1'),
('t1-2-1', 'dev1'),
('t1-2-2', 'design1'),
('t1-3-1', 'dev1'),
('t1-3-2', 'dev1'),
-- SWAYAM project assignments
('t2-1-1', 'content1'),
('t2-1-2', 'content1'),
('t2-1-3', 'design1'),
('t2-2-1', 'qa1'),
('t2-2-2', 'qa1'),
('t2-2-3', 'dev1');

-- Assign users to stages
INSERT INTO stage_assignments (stage_id, user_id) VALUES
-- FLAME project stage assignments
('s1-1', 'design1'),
('s1-1', 'content1'),
('s1-2', 'dev1'),
('s1-2', 'design1'),
('s1-3', 'dev1'),
('s1-3', 'qa1'),
-- SWAYAM project stage assignments
('s2-1', 'content1'),
('s2-1', 'design1'),
('s2-2', 'qa1'),
('s2-2', 'dev1');