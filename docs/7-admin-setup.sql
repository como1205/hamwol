-- ==============================================================================
-- Admin Promotion Script
-- ==============================================================================

-- 1. Promote a user to ADMIN
-- Replace 'your_email@example.com' with the email address of the user you want to promote
update public.members
set role = 'ADMIN'
where email = 'your_email@example.com';

-- 2. Verify the change
select email, role, status from public.members where role = 'ADMIN';
