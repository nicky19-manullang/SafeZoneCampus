-- Add lat and lng columns to reports table
ALTER TABLE reports ADD COLUMN lat DECIMAL(10, 8) NULL;
ALTER TABLE reports ADD COLUMN lng DECIMAL(11, 8) NULL;

-- This script adds location coordinates support to existing databases
-- Run this to enable the map functionality
