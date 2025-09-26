-- Fix security issues with customer and profile data access

-- Drop existing overly permissive customer policies
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

-- Drop existing overly permissive profile policies  
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create role-based customer access policies
CREATE POLICY "Admins and managers can manage all customers"
ON public.customers
FOR ALL
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'manager'))
WITH CHECK (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Pharmacists can view customer medical data"
ON public.customers  
FOR SELECT
TO authenticated
USING (public.get_current_user_role() = 'pharmacist');

CREATE POLICY "Cashiers can view basic customer info only"
ON public.customers
FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = 'cashier'
);

CREATE POLICY "Cashiers can create customers with limited data"
ON public.customers
FOR INSERT  
TO authenticated
WITH CHECK (
  public.get_current_user_role() = 'cashier' AND
  medical_conditions IS NULL AND
  allergies IS NULL AND
  insurance_info IS NULL AND
  date_of_birth IS NULL
);

CREATE POLICY "Cashiers can update basic customer info only"
ON public.customers
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'cashier')
WITH CHECK (
  public.get_current_user_role() = 'cashier' AND
  medical_conditions IS NULL AND
  allergies IS NULL AND  
  insurance_info IS NULL AND
  date_of_birth IS NULL
);

-- Create role-based profile access policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins and managers can view all profiles"
ON public.profiles
FOR SELECT  
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Update user activities policies for proper oversight
DROP POLICY IF EXISTS "Users can view their own activities" ON public.user_activities;

CREATE POLICY "Users can view their own activities"
ON public.user_activities
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all activities"
ON public.user_activities
FOR SELECT
TO authenticated  
USING (public.get_current_user_role() IN ('admin', 'manager'));