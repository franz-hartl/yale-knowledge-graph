-- Direct PostgreSQL import script
-- Run with: psql "postgresql://postgres:[password]@db.gefrieuzuosbewltdbzq.supabase.co:5432/postgres" -f scripts/direct-psql-import.sql

-- Clear existing data
DELETE FROM faculty;

-- Create temporary table for CSV import
CREATE TEMP TABLE faculty_temp (
    id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    worker_status TEXT,
    yale_relationships TEXT,
    jobcatgroup TEXT,
    school TEXT,
    contact_subscriber_id TEXT,
    department TEXT,
    academic_rank TEXT,
    job_title TEXT,
    track_type TEXT,
    track_type_category TEXT,
    acad_unit_fac_arts_sci TEXT,
    job_family TEXT,
    tenure_status TEXT,
    acad_unit_center TEXT,
    net_id TEXT,
    hire_date TEXT,
    complete TEXT,
    no_data TEXT,
    website TEXT,
    air_pollution TEXT,
    biodiversity_loss TEXT,
    climate TEXT,
    governance_conflict_migration TEXT,
    energy TEXT,
    food TEXT,
    health_wellbeing TEXT,
    infrastructure TEXT,
    land TEXT,
    poverty_disparity_injustice TEXT,
    urban_built_environment TEXT,
    water TEXT,
    activism TEXT,
    arts_humanities TEXT,
    business_management TEXT,
    communication_behavior_awareness TEXT,
    design TEXT,
    faith_morality_ethics TEXT,
    international_relations TEXT,
    law_policy TEXT,
    tech_innovation_entrepreneurship TEXT,
    notes TEXT
);

-- Import CSV data
\COPY faculty_temp FROM '/Users/franzhartl/Desktop/PS-AI/yale-knowledge-graph/src/data/faculty_data_cleaned.csv' WITH CSV HEADER;

-- Insert into main table with proper data types and deduplication
INSERT INTO faculty (
    first_name, last_name, email, job_title, academic_rank, school, department,
    track_type, track_type_category, tenure_status, hire_date, website, net_id,
    air_pollution, biodiversity_loss, climate, governance_conflict_migration,
    energy, food, health_wellbeing, infrastructure, land, poverty_disparity_injustice,
    urban_built_environment, water, activism, arts_humanities, business_management,
    communication_behavior_awareness, design, faith_morality_ethics, international_relations,
    law_policy, tech_innovation_entrepreneurship
)
SELECT DISTINCT ON (LOWER(email))
    first_name,
    last_name,
    LOWER(email),
    job_title,
    academic_rank,
    school,
    department,
    track_type,
    track_type_category,
    tenure_status,
    CASE WHEN hire_date ~ '^\d{4}-\d{2}-\d{2}' THEN hire_date::DATE ELSE NULL END,
    website,
    net_id,
    GREATEST(0, LEAST(5, COALESCE(air_pollution::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(biodiversity_loss::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(climate::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(governance_conflict_migration::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(energy::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(food::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(health_wellbeing::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(infrastructure::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(land::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(poverty_disparity_injustice::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(urban_built_environment::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(water::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(activism::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(arts_humanities::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(business_management::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(communication_behavior_awareness::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(design::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(faith_morality_ethics::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(international_relations::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(law_policy::INTEGER, 0))),
    GREATEST(0, LEAST(5, COALESCE(tech_innovation_entrepreneurship::INTEGER, 0)))
FROM faculty_temp
WHERE first_name IS NOT NULL 
  AND last_name IS NOT NULL 
  AND email IS NOT NULL
  AND email != ''
ORDER BY LOWER(email);

-- Show results
SELECT COUNT(*) as total_faculty FROM faculty;
SELECT 
    COUNT(*) FILTER (WHERE climate > 0) as climate_faculty,
    COUNT(*) FILTER (WHERE health_wellbeing > 0) as health_faculty,
    COUNT(*) FILTER (WHERE energy > 0) as energy_faculty
FROM faculty;