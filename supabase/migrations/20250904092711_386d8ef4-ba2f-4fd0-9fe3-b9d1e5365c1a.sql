-- Create enum types for better data integrity
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'pharmacist', 'cashier');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.medicine_category AS ENUM ('prescription', 'over_counter', 'supplement', 'medical_device');
CREATE TYPE public.sale_status AS ENUM ('completed', 'pending', 'cancelled', 'returned');
CREATE TYPE public.purchase_status AS ENUM ('pending', 'received', 'cancelled');

-- Profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'cashier',
  status user_status NOT NULL DEFAULT 'active',
  permissions TEXT[] DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  total_sales DECIMAL(10,2) DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Medicines/Inventory table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  category medicine_category NOT NULL DEFAULT 'over_counter',
  manufacturer TEXT,
  supplier_id UUID REFERENCES public.suppliers(id),
  batch_number TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  unit_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  margin_percentage DECIMAL(5,2),
  expiry_date DATE,
  manufacture_date DATE,
  barcode TEXT,
  description TEXT,
  storage_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  medical_conditions TEXT[],
  allergies TEXT[],
  insurance_info TEXT,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sales/Transactions table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  cashier_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status sale_status NOT NULL DEFAULT 'completed',
  notes TEXT,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sale items (individual items in each sale)
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
  ordered_by UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status purchase_status NOT NULL DEFAULT 'pending',
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expected_date DATE,
  received_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id),
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User Activity Log
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for suppliers (authenticated users can manage)
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (true);

-- RLS Policies for medicines (authenticated users can manage)
CREATE POLICY "Authenticated users can view medicines" ON public.medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage medicines" ON public.medicines FOR ALL TO authenticated USING (true);

-- RLS Policies for customers (authenticated users can manage)
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL TO authenticated USING (true);

-- RLS Policies for sales (authenticated users can manage)
CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON public.sales FOR ALL TO authenticated USING (true);

-- RLS Policies for sale items (authenticated users can manage)
CREATE POLICY "Authenticated users can view sale items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sale items" ON public.sale_items FOR ALL TO authenticated USING (true);

-- RLS Policies for purchase orders (authenticated users can manage)
CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase orders" ON public.purchase_orders FOR ALL TO authenticated USING (true);

-- RLS Policies for purchase items (authenticated users can manage)
CREATE POLICY "Authenticated users can view purchase items" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase items" ON public.purchase_items FOR ALL TO authenticated USING (true);

-- RLS Policies for user activities (users can view their own activities)
CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create activities" ON public.user_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate medicine margin
CREATE OR REPLACE FUNCTION public.calculate_medicine_margin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_price > 0 AND NEW.selling_price > 0 THEN
    NEW.margin_percentage := ((NEW.selling_price - NEW.unit_price) / NEW.unit_price) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate margin
CREATE TRIGGER calculate_margin_trigger
  BEFORE INSERT OR UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.calculate_medicine_margin();

-- Indexes for better performance
CREATE INDEX idx_medicines_name ON public.medicines(name);
CREATE INDEX idx_medicines_category ON public.medicines(category);
CREATE INDEX idx_medicines_expiry ON public.medicines(expiry_date);
CREATE INDEX idx_sales_date ON public.sales(sale_date);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_cashier ON public.sales(cashier_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);