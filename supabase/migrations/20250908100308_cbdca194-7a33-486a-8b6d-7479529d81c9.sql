-- Create default admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@pharmacy.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "username": "admin"}',
  false,
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile for admin user
INSERT INTO public.profiles (
  id,
  full_name,
  username,
  email,
  role,
  status,
  join_date,
  permissions
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  'admin',
  'admin@pharmacy.com',
  'admin',
  'active',
  now(),
  ARRAY['all_access']
) ON CONFLICT (id) DO NOTHING;