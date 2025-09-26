-- Fix critical business data RLS policies for security

-- Medicines table - restrict based on roles
DROP POLICY IF EXISTS "Authenticated users can manage medicines" ON public.medicines;
DROP POLICY IF EXISTS "Authenticated users can view medicines" ON public.medicines;

CREATE POLICY "Admins and managers can manage all medicines" 
ON public.medicines 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Staff can view medicines" 
ON public.medicines 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'pharmacist'::text, 'cashier'::text]));

CREATE POLICY "Pharmacists can update medicine stock" 
ON public.medicines 
FOR UPDATE 
USING (get_current_user_role() = 'pharmacist'::text)
WITH CHECK (get_current_user_role() = 'pharmacist'::text);

-- Sales table - restrict based on roles  
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;

CREATE POLICY "Admins and managers can manage all sales" 
ON public.sales 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Pharmacists can view all sales" 
ON public.sales 
FOR SELECT 
USING (get_current_user_role() = 'pharmacist'::text);

CREATE POLICY "Cashiers can manage their own sales" 
ON public.sales 
FOR ALL 
USING (auth.uid() = cashier_id);

-- Sale items table - restrict based on roles
DROP POLICY IF EXISTS "Authenticated users can manage sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can view sale items" ON public.sale_items;

CREATE POLICY "Admins and managers can manage all sale items" 
ON public.sale_items 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Staff can view sale items for authorized sales" 
ON public.sale_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
    AND (
      get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'pharmacist'::text])
      OR (get_current_user_role() = 'cashier'::text AND s.cashier_id = auth.uid())
    )
  )
);

CREATE POLICY "Staff can create sale items for authorized sales" 
ON public.sale_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
    AND (
      get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'pharmacist'::text])
      OR (get_current_user_role() = 'cashier'::text AND s.cashier_id = auth.uid())
    )
  )
);

-- Purchase orders table - restrict to admins and managers only
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can view purchase orders" ON public.purchase_orders;

CREATE POLICY "Admins and managers can manage purchase orders" 
ON public.purchase_orders 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Pharmacists can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
USING (get_current_user_role() = 'pharmacist'::text);

-- Purchase items table - restrict to admins and managers only
DROP POLICY IF EXISTS "Authenticated users can manage purchase items" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can view purchase items" ON public.purchase_items;

CREATE POLICY "Admins and managers can manage purchase items" 
ON public.purchase_items 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Pharmacists can view purchase items" 
ON public.purchase_items 
FOR SELECT 
USING (get_current_user_role() = 'pharmacist'::text);

-- Suppliers table - restrict to admins and managers only
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;

CREATE POLICY "Admins and managers can manage suppliers" 
ON public.suppliers 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'manager'::text]));

CREATE POLICY "Pharmacists can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (get_current_user_role() = 'pharmacist'::text);