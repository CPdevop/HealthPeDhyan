-- Create admin user for HealthPeDhyan
-- Password: admin123 (hashed with bcrypt)

INSERT INTO users (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-user-001',
  'admin@healthpedhyan.com',
  'Admin User',
  '$2a$10$YourHashHere', -- This will be replaced
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  role = 'ADMIN';
