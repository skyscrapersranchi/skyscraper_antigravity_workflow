-- Migration: Create submit_lead SECURITY DEFINER RPC and configure row security
-- Project: skyscrapers-skyline-crm

-- Revoke direct anon mutations on leads and activities
REVOKE INSERT, UPDATE, DELETE ON TABLE public.leads FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.activities FROM anon;
REVOKE SELECT ON TABLE public.leads FROM anon;

-- Grant EXECUTE on submit_lead to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
