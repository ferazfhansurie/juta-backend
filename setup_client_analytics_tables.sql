-- ========================================
-- CLIENT ANALYTICS SYSTEM DATABASE TABLES
-- ========================================

-- Table to store client invoices
CREATE TABLE IF NOT EXISTS client_invoices (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(255) NOT NULL UNIQUE,
  company_id VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  paid_date DATE NULL,
  service_type VARCHAR(100) DEFAULT 'AI Bot Service',
  invoice_number VARCHAR(255) NOT NULL,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Table to store client payment history
CREATE TABLE IF NOT EXISTS client_payments (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  invoice_id VARCHAR(255) NOT NULL,
  company_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100), -- bank_transfer, credit_card, etc.
  reference_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  FOREIGN KEY (invoice_id) REFERENCES client_invoices(invoice_id)
);

-- Table to store client analytics and metrics
CREATE TABLE IF NOT EXISTS client_analytics (
  id SERIAL PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL UNIQUE,
  total_paid DECIMAL(10,2) DEFAULT 0,
  total_invoices INTEGER DEFAULT 0,
  avg_payment_time INTEGER DEFAULT 0, -- in days
  last_payment_date DATE,
  retention_score INTEGER DEFAULT 0, -- 0-100
  client_since DATE,
  status VARCHAR(50) DEFAULT 'active',
  services JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_invoices_company_id ON client_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_client_invoices_due_date ON client_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_client_invoices_created_date ON client_invoices(created_date);

CREATE INDEX IF NOT EXISTS idx_client_payments_company_id ON client_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_payment_date ON client_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_client_payments_invoice_id ON client_payments(invoice_id);

CREATE INDEX IF NOT EXISTS idx_client_analytics_company_id ON client_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_total_paid ON client_analytics(total_paid);
CREATE INDEX IF NOT EXISTS idx_client_analytics_retention_score ON client_analytics(retention_score);

-- Add comments for documentation
COMMENT ON TABLE client_invoices IS 'Stores all client invoices and their status';
COMMENT ON TABLE client_payments IS 'Stores payment records for invoices';
COMMENT ON TABLE client_analytics IS 'Stores aggregated client analytics and metrics';

-- Function to automatically update client analytics when payments are made
CREATE OR REPLACE FUNCTION update_client_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update client analytics when a payment is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO client_analytics (
      company_id,
      total_paid,
      total_invoices,
      avg_payment_time,
      last_payment_date,
      client_since,
      status
    )
    SELECT 
      NEW.company_id,
      COALESCE(SUM(ci.amount), 0),
      COUNT(ci.id),
      COALESCE(AVG(EXTRACT(DAYS FROM (cp.payment_date - ci.due_date))), 0),
      NEW.payment_date,
      MIN(ci.created_date),
      'active'
    FROM client_invoices ci
    LEFT JOIN client_payments cp ON ci.invoice_id = cp.invoice_id
    WHERE ci.company_id = NEW.company_id AND ci.status = 'paid'
    GROUP BY NEW.company_id
    ON CONFLICT (company_id) 
    DO UPDATE SET
      total_paid = EXCLUDED.total_paid,
      total_invoices = EXCLUDED.total_invoices,
      avg_payment_time = EXCLUDED.avg_payment_time,
      last_payment_date = EXCLUDED.last_payment_date,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics when payments are made
CREATE TRIGGER trigger_update_client_analytics
  AFTER INSERT OR UPDATE ON client_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_analytics();

-- Function to automatically add income to financial system when invoice is paid
CREATE OR REPLACE FUNCTION add_income_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- When an invoice is marked as paid, add it to the income sources
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Insert into income_sources table
    INSERT INTO income_sources (
      month,
      year,
      source_name,
      amount,
      description
    )
    VALUES (
      TO_CHAR(NEW.paid_date, 'Month'),
      EXTRACT(YEAR FROM NEW.paid_date),
      NEW.client_name || ' - ' || NEW.service_type,
      NEW.amount,
      'Invoice Payment: ' || NEW.invoice_number
    );
    
    -- Update monthly financial data
    INSERT INTO monthly_financial_data (
      month,
      year,
      total_income,
      total_expenses,
      net_budget
    )
    VALUES (
      TO_CHAR(NEW.paid_date, 'Month'),
      EXTRACT(YEAR FROM NEW.paid_date),
      NEW.amount,
      0,
      NEW.amount
    )
    ON CONFLICT (month, year)
    DO UPDATE SET
      total_income = monthly_financial_data.total_income + NEW.amount,
      net_budget = monthly_financial_data.net_budget + NEW.amount,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add income when invoice is paid
CREATE TRIGGER trigger_add_income_on_payment
  AFTER UPDATE ON client_invoices
  FOR EACH ROW
  EXECUTE FUNCTION add_income_on_payment();
