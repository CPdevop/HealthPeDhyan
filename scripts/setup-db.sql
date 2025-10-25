-- HealthPeDhyan Database Setup
-- Run this to create all tables and the admin user

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    "passwordHash" TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    description TEXT,
    "heroImage" TEXT,
    "galleryJson" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "shortSummary" TEXT,
    "nutritionJson" JSONB,
    "ingredientsText" TEXT,
    "allergensText" TEXT,
    "healthScore" INTEGER DEFAULT 0,
    "searchVector" TEXT,
    "isPalmOilFree" BOOLEAN DEFAULT FALSE,
    "isArtificialColorFree" BOOLEAN DEFAULT FALSE,
    "isLowSugar" BOOLEAN DEFAULT FALSE,
    "isWholeGrain" BOOLEAN DEFAULT FALSE,
    "isMeetsStandard" BOOLEAN DEFAULT FALSE,
    FOREIGN KEY ("brandId") REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products("brandId");
CREATE INDEX IF NOT EXISTS idx_products_category ON products("categoryId");

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);

-- Product Badges (many-to-many)
CREATE TABLE IF NOT EXISTS product_badges (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    rationale TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("productId", "badgeId"),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("badgeId") REFERENCES badges(id) ON DELETE CASCADE
);

-- Ingredient Flags table
CREATE TABLE IF NOT EXISTS ingredient_flags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Product Ingredient Flags
CREATE TABLE IF NOT EXISTS product_ingredient_flags (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("productId", "flagId"),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("flagId") REFERENCES ingredient_flags(id) ON DELETE CASCADE
);

-- Affiliate Links table
CREATE TABLE IF NOT EXISTS affiliate_links (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    merchant TEXT NOT NULL,
    url TEXT NOT NULL,
    "paramsJson" JSONB,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    "bodyMarkdown" TEXT NOT NULL,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    category TEXT,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    "metaJson" JSONB,
    "publishedAt" TIMESTAMP,
    "canonicalUrl" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT,
    year INTEGER,
    url TEXT,
    summary TEXT,
    "tagsJson" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    "aliasesJson" JSONB,
    "riskLevel" TEXT DEFAULT 'LOW',
    "referencesJson" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_slug ON ingredients(slug);

-- Insert admin user
-- Password: admin123 (hashed with bcrypt, cost 10)
INSERT INTO users (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
    'admin-' || gen_random_uuid()::text,
    'admin@healthpedhyan.com',
    'Admin User',
    '$2a$10$Uvb.Qo2FRnMi4uEgbJkN8OQFvPFBj.py.QD0ZkGpv3AyLeGY1yese',
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database setup complete! ✅' as message;
