-- Fix security warnings by setting proper search_path for functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || NEW.id::text),
    NEW.email,
    'cashier'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the calculate_medicine_margin function
CREATE OR REPLACE FUNCTION public.calculate_medicine_margin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_price > 0 AND NEW.selling_price > 0 THEN
    NEW.margin_percentage := ((NEW.selling_price - NEW.unit_price) / NEW.unit_price) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;