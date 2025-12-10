-- insert_test_data.sql
USE health;

-- Insert default users (id fixed for consistent foreign keys)
-- gold / smiths123ABC$ (bcrypt hash)
INSERT INTO users (id, username, first_name, last_name, email, hashed_password) VALUES
(1, 'gold', 'Gold', 'User', 'gold@example.com',
 '$2b$10$mXeUBqI5RRyaaB8Su6tbvORtHSLNJjSkDrGljQpWJ4kH6//ULqks.'),
(2, 'alex', 'Alex', 'Taylor', 'alex@example.com',
 '$2b$10$osIIgagscAnMJfojTpQhi./uDaPo/MvWUE5RJfIFlSxIi6Upvd4oa');

-- Sample activities for user gold (id = 1)
INSERT INTO activities (user_id, activity_date, activity_type, duration_minutes, intensity, distance_km, calories, notes) VALUES
(1, '2025-11-01', 'Running', 30, 'High', 5.00, 320, 'Evening run in the park'),
(1, '2025-11-03', 'Walking', 45, 'Low', 3.50, 180, 'Walk to uni and back'),
(1, '2025-11-05', 'Gym', 60, 'High', NULL, 400, 'Weights and cardio mix'),
(1, '2025-11-07', 'Cycling', 40, 'Medium', 12.00, 350, 'Cycle around town');

-- Some activities for Alex (id = 2)
INSERT INTO activities (user_id, activity_date, activity_type, duration_minutes, intensity, distance_km, calories, notes) VALUES
(2, '2025-11-02', 'Swimming', 30, 'Medium', NULL, 250, 'Pool session'),
(2, '2025-11-04', 'Running', 20, 'Medium', 3.00, 210, 'Quick lunchtime run');
