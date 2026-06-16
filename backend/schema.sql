-- SpendWise database schema for Supabase PostgreSQL
-- This file is executed by database.py and also by main.py when the FastAPI server starts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Main user profile table. The primary key matches auth.users.id.
CREATE TABLE IF NOT EXISTS public.spendwise (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email_address TEXT UNIQUE,
    phone_number TEXT,
    location TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.spendwise
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE;

-- Auth users already enforce unique email addresses. Keeping a separate unique
-- constraint on profile email can break re-signup flows if an old profile row
-- remains after an auth user is deleted or recreated.
ALTER TABLE public.spendwise
DROP CONSTRAINT IF EXISTS spendwise_email_address_key;

CREATE TABLE IF NOT EXISTS public.budget_setups (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.spendwise(id) ON DELETE CASCADE,
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_savings_goal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_groceries NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_transport NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_bills NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_entertainment NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_insurance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_education NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_health NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_eating_out NUMERIC(12, 2) NOT NULL DEFAULT 0,
    planned_other NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_groceries NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_transport NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_bills NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_entertainment NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_insurance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_education NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_health NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_eating_out NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_other NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_groceries NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_transport NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_bills NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_entertainment NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_insurance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_education NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_health NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_eating_out NUMERIC(12, 2) NOT NULL DEFAULT 0,
    this_month_other NUMERIC(12, 2) NOT NULL DEFAULT 0,
    setup_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT budget_setups_one_per_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.spendwise(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_setups_user_id ON public.budget_setups(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Keeps updated_at current when rows are edited.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_spendwise_updated_at ON public.spendwise;
CREATE TRIGGER set_spendwise_updated_at
BEFORE UPDATE ON public.spendwise
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_budget_setups_updated_at ON public.budget_setups;
CREATE TRIGGER set_budget_setups_updated_at
BEFORE UPDATE ON public.budget_setups
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Supabase Auth trigger: create a SpendWise profile row when a user signs up.
-- Keep this trigger intentionally small. Budget setup rows are created later by
-- the app so signup cannot fail because of budget setup constraints.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.spendwise (id, full_name, email_address, phone_number, location, terms_accepted)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'location',
        COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::BOOLEAN, FALSE)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.spendwise.full_name),
        email_address = COALESCE(EXCLUDED.email_address, public.spendwise.email_address),
        phone_number = COALESCE(EXCLUDED.phone_number, public.spendwise.phone_number),
        location = COALESCE(EXCLUDED.location, public.spendwise.location),
        terms_accepted = EXCLUDED.terms_accepted OR public.spendwise.terms_accepted,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security policies for Supabase Auth clients.
ALTER TABLE public.spendwise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own SpendWise profile" ON public.spendwise;
CREATE POLICY "Users can view their own SpendWise profile"
ON public.spendwise FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own SpendWise profile" ON public.spendwise;
CREATE POLICY "Users can update their own SpendWise profile"
ON public.spendwise FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own SpendWise profile" ON public.spendwise;
CREATE POLICY "Users can insert their own SpendWise profile"
ON public.spendwise FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own budget setup" ON public.budget_setups;
CREATE POLICY "Users can view their own budget setup"
ON public.budget_setups FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budget setup" ON public.budget_setups;
CREATE POLICY "Users can insert their own budget setup"
ON public.budget_setups FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own budget setup" ON public.budget_setups;
CREATE POLICY "Users can update their own budget setup"
ON public.budget_setups FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
CREATE POLICY "Users can insert their own expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses"
ON public.expenses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses"
ON public.expenses FOR DELETE
USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.spendwise TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.budget_setups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;