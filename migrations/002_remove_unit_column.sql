-- Remove unit column from products table
-- This migration removes the unit field from products as it's no longer needed

ALTER TABLE products DROP COLUMN IF EXISTS unit;
