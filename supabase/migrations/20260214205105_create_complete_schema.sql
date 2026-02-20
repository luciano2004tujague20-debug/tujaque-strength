/*
  # Esquema Completo Tujague Strength v2.0
  
  ## Descripción
  Creación completa del esquema de base de datos para el sistema de coaching de fuerza.
  Incluye planes, órdenes, comprobantes y sistema de seguridad RLS.
  
  ## Tablas Creadas
  
  1. **plans** - Catálogo de planes de entrenamiento
     - `id` (uuid, PK)
     - `code` (text, unique) - Código único del plan
     - `name` (text) - Nombre público del plan
     - `cadence` (text) - 'weekly' o 'monthly'
     - `days` (integer) - Días de entrenamiento por semana
     - `price_ars` (integer) - Precio en pesos argentinos
     - `active` (boolean) - Si el plan está disponible
     - `benefits` (jsonb) - Beneficios e información adicional
     - `created_at` (timestamptz)
  
  2. **orders** - Órdenes de compra de clientes
     - `id` (uuid, PK)
     - `order_id` (text, unique) - ID legible (TS-YYMMDD-XXXXX)
     - `plan_id` (uuid, FK) - Referencia al plan
     - `customer_name` (text) - Nombre del cliente
     - `customer_email` (text) - Email del cliente
     - `customer_ref` (text) - Referencia opcional (IG, DNI, etc)
     - `payment_method` (text) - 'ars', 'usd', 'crypto'
     - `amount_ars` (integer) - Monto total en ARS
     - `status` (text) - Estado: 'awaiting_payment', 'under_review', 'paid', 'rejected'
     - `payment_id` (text) - ID de pago externo (MercadoPago)
     - `extra_video` (boolean) - Si incluye revisión técnica por video
     - `extra_video_price_ars` (integer) - Precio del extra si aplica
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  3. **receipts** - Comprobantes de pago subidos por clientes
     - `id` (uuid, PK)
     - `order_uuid` (uuid, FK) - Referencia a orders.id
     - `file_path` (text) - Ruta en storage
     - `file_mime` (text) - Tipo MIME del archivo
     - `file_size` (integer) - Tamaño en bytes
     - `original_name` (text) - Nombre original del archivo
     - `reference_text` (text) - Referencia adicional del cliente
     - `uploaded_at` (timestamptz)
  
  ## Seguridad
  - RLS habilitado en todas las tablas
  - plans: Lectura pública, escritura solo admin
  - orders: Los clientes solo ven sus propias órdenes
  - receipts: Los clientes solo suben a sus órdenes
  
  ## Índices
  - Búsqueda rápida por order_id
  - Búsqueda por email de cliente
  - Relaciones FK optimizadas
*/

-- =======================
-- TABLA: plans
-- =======================

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  cadence text NOT NULL CHECK (cadence IN ('weekly', 'monthly')),
  days integer NOT NULL CHECK (days > 0),
  price_ars integer NOT NULL CHECK (price_ars >= 0),
  active boolean DEFAULT true,
  benefits jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices para plans
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_plans_code ON plans(code);

-- RLS para plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer planes activos
CREATE POLICY "Lectura pública de planes activos"
  ON plans FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- =======================
-- TABLA: orders
-- =======================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text UNIQUE NOT NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_ref text,
  payment_method text NOT NULL CHECK (payment_method IN ('ars', 'usd', 'crypto')),
  amount_ars integer NOT NULL CHECK (amount_ars >= 0),
  status text DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment', 'under_review', 'paid', 'rejected')),
  payment_id text,
  extra_video boolean DEFAULT false,
  extra_video_price_ars integer DEFAULT 0 CHECK (extra_video_price_ars >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- RLS para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: Los clientes pueden ver sus propias órdenes validando con email
CREATE POLICY "Clientes ven sus propias órdenes"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (
    customer_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR customer_email = current_setting('app.current_user_email', true)
  );

-- =======================
-- TABLA: receipts
-- =======================

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_uuid uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_mime text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0),
  original_name text NOT NULL,
  reference_text text,
  uploaded_at timestamptz DEFAULT now()
);

-- Índices para receipts
CREATE INDEX IF NOT EXISTS idx_receipts_order ON receipts(order_uuid);

-- RLS para receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Política: Solo lectura de comprobantes de órdenes propias
CREATE POLICY "Ver comprobantes de órdenes propias"
  ON receipts FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = receipts.order_uuid
      AND orders.customer_email = current_setting('app.current_user_email', true)
    )
  );

-- =======================
-- DATOS INICIALES: PLANES
-- =======================

-- PLAN SEMANAL 3 DÍAS
INSERT INTO plans (code, name, cadence, days, price_ars, active, benefits)
VALUES (
  'semanal-3',
  'Plan Semanal 3 Días',
  'weekly',
  3,
  18000,
  true,
  jsonb_build_object(
    'includes', jsonb_build_array(
      'Rutina técnica de iniciación',
      'Corrección de movimientos básicos',
      'Sentadilla, Banca y Peso Muerto',
      'Progresión lineal semanal',
      'Soporte WhatsApp en horarios laborales'
    ),
    'ideal_for', 'Principiantes en fuerza o con poca experiencia en powerlifting',
    'frequency', '3 sesiones por semana'
  )
);

-- PLAN SEMANAL 5 DÍAS
INSERT INTO plans (code, name, cadence, days, price_ars, active, benefits)
VALUES (
  'semanal-5',
  'Plan Semanal 5 Días',
  'weekly',
  5,
  32000,
  true,
  jsonb_build_object(
    'includes', jsonb_build_array(
      'Especialización en Powerlifting',
      'Optimización de marcas personales',
      'Programación avanzada de fuerza',
      'Periodización semanal de cargas',
      'Seguimiento de rendimiento',
      'Soporte WhatsApp prioritario'
    ),
    'ideal_for', 'Atletas intermedios que buscan mejorar sus marcas',
    'frequency', '5 sesiones por semana',
    'highlight', 'popular'
  )
);

-- PLAN MENSUAL 3 DÍAS
INSERT INTO plans (code, name, cadence, days, price_ars, active, benefits)
VALUES (
  'mensual-3',
  'Plan Mensual 3 Días',
  'monthly',
  3,
  50000,
  true,
  jsonb_build_object(
    'includes', jsonb_build_array(
      'Periodización de fuerza mensual',
      'Seguimiento de volumen semanal',
      'Ajustes progresivos de cargas',
      'Check-in semanal de rendimiento',
      'Modificaciones según feedback',
      'Soporte WhatsApp prioritario'
    ),
    'ideal_for', 'Atletas que buscan planificación a mediano plazo',
    'frequency', '3 sesiones por semana',
    'duration', '30 días de programación'
  )
);

-- PLAN MENSUAL ELITE 5 DÍAS
INSERT INTO plans (code, name, cadence, days, price_ars, active, benefits)
VALUES (
  'mensual-elite-5',
  'Plan Mensual Elite 5 Días',
  'monthly',
  5,
  100000,
  true,
  jsonb_build_object(
    'includes', jsonb_build_array(
      'Análisis RPE avanzado y autoregulación',
      'Peaking personalizado para competencias',
      'Contacto prioritario WhatsApp',
      'Seguimiento diario de rendimiento',
      'Videollamadas de estrategia mensual',
      'Ajustes en tiempo real',
      'Acceso a recursos exclusivos'
    ),
    'ideal_for', 'Atletas de élite que compiten',
    'frequency', '5 sesiones por semana',
    'duration', '30 días con seguimiento intensivo',
    'highlight', 'elite'
  )
);

-- =======================
-- STORAGE BUCKET
-- =======================

-- Crear bucket para comprobantes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: Permitir subida a usuarios autenticados o anon con validación
CREATE POLICY "Permitir subida de comprobantes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] ~ '^TS-[0-9]{6}-[A-Z0-9]{6}$'
  );