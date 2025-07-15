-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  job_title VARCHAR(255),
  academic_rank VARCHAR(100),
  school VARCHAR(255),
  department VARCHAR(255),
  track_type VARCHAR(100),
  track_type_category VARCHAR(100),
  tenure_status VARCHAR(100),
  hire_date DATE,
  website VARCHAR(500),
  net_id VARCHAR(50),
  
  -- Research interest scores (0-5 scale)
  air_pollution INTEGER DEFAULT 0 CHECK (air_pollution >= 0 AND air_pollution <= 5),
  biodiversity_loss INTEGER DEFAULT 0 CHECK (biodiversity_loss >= 0 AND biodiversity_loss <= 5),
  climate INTEGER DEFAULT 0 CHECK (climate >= 0 AND climate <= 5),
  governance_conflict_migration INTEGER DEFAULT 0 CHECK (governance_conflict_migration >= 0 AND governance_conflict_migration <= 5),
  energy INTEGER DEFAULT 0 CHECK (energy >= 0 AND energy <= 5),
  food INTEGER DEFAULT 0 CHECK (food >= 0 AND food <= 5),
  health_wellbeing INTEGER DEFAULT 0 CHECK (health_wellbeing >= 0 AND health_wellbeing <= 5),
  infrastructure INTEGER DEFAULT 0 CHECK (infrastructure >= 0 AND infrastructure <= 5),
  land INTEGER DEFAULT 0 CHECK (land >= 0 AND land <= 5),
  poverty_disparity_injustice INTEGER DEFAULT 0 CHECK (poverty_disparity_injustice >= 0 AND poverty_disparity_injustice <= 5),
  urban_built_environment INTEGER DEFAULT 0 CHECK (urban_built_environment >= 0 AND urban_built_environment <= 5),
  water INTEGER DEFAULT 0 CHECK (water >= 0 AND water <= 5),
  activism INTEGER DEFAULT 0 CHECK (activism >= 0 AND activism <= 5),
  arts_humanities INTEGER DEFAULT 0 CHECK (arts_humanities >= 0 AND arts_humanities <= 5),
  business_management INTEGER DEFAULT 0 CHECK (business_management >= 0 AND business_management <= 5),
  communication_behavior_awareness INTEGER DEFAULT 0 CHECK (communication_behavior_awareness >= 0 AND communication_behavior_awareness <= 5),
  design INTEGER DEFAULT 0 CHECK (design >= 0 AND design <= 5),
  faith_morality_ethics INTEGER DEFAULT 0 CHECK (faith_morality_ethics >= 0 AND faith_morality_ethics <= 5),
  international_relations INTEGER DEFAULT 0 CHECK (international_relations >= 0 AND international_relations <= 5),
  law_policy INTEGER DEFAULT 0 CHECK (law_policy >= 0 AND law_policy <= 5),
  tech_innovation_entrepreneurship INTEGER DEFAULT 0 CHECK (tech_innovation_entrepreneurship >= 0 AND tech_innovation_entrepreneurship <= 5),
  
  -- Calculated fields
  expertise_breadth INTEGER GENERATED ALWAYS AS (
    (CASE WHEN air_pollution > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN biodiversity_loss > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN climate > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN governance_conflict_migration > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN energy > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN food > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN health_wellbeing > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN infrastructure > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN land > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN poverty_disparity_injustice > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN urban_built_environment > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN water > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN activism > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN arts_humanities > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN business_management > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN communication_behavior_awareness > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN design > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN faith_morality_ethics > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN international_relations > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN law_policy > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN tech_innovation_entrepreneurship > 0 THEN 1 ELSE 0 END)
  ) STORED,
  
  is_bridge_connector BOOLEAN GENERATED ALWAYS AS (
    (CASE WHEN air_pollution > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN biodiversity_loss > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN climate > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN governance_conflict_migration > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN energy > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN food > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN health_wellbeing > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN infrastructure > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN land > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN poverty_disparity_injustice > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN urban_built_environment > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN water > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN activism > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN arts_humanities > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN business_management > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN communication_behavior_awareness > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN design > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN faith_morality_ethics > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN international_relations > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN law_policy > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN tech_innovation_entrepreneurship > 0 THEN 1 ELSE 0 END)
    >= 4
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research topics reference table
CREATE TABLE IF NOT EXISTS research_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_key VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('environmental', 'social', 'solutions')),
  color_hex VARCHAR(7) DEFAULT '#3B82F6'
);

-- User searches table (for analytics)
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  selected_topics TEXT[], -- Array of topic keys
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_faculty_school ON faculty(school);
CREATE INDEX idx_faculty_rank ON faculty(academic_rank);
CREATE INDEX idx_faculty_expertise_breadth ON faculty(expertise_breadth);
CREATE INDEX idx_faculty_email ON faculty(email);
CREATE INDEX idx_user_searches_created_at ON user_searches(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Allow read access to all tables for anonymous users
CREATE POLICY "Faculty readable by all" ON faculty
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Research topics readable by all" ON research_topics
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "User searches insertable by all" ON user_searches
  FOR INSERT TO anon
  WITH CHECK (true);

-- Insert research topics data
INSERT INTO research_topics (topic_key, display_name, description, category, color_hex) VALUES
  -- Environmental topics
  ('air_pollution', 'Air/Pollution, Chemicals, Waste', 'Research on air quality, pollution, chemical contaminants, and waste management', 'environmental', '#EF4444'),
  ('biodiversity_loss', 'Biodiversity Loss', 'Study of species extinction, habitat loss, and ecosystem degradation', 'environmental', '#F59E0B'),
  ('climate', 'Climate', 'Climate change research, atmospheric science, and climate impacts', 'environmental', '#10B981'),
  ('governance_conflict_migration', 'Governance, Conflict, & Migration', 'Research on governance systems, conflict resolution, and human migration', 'social', '#6366F1'),
  ('energy', 'Energy', 'Renewable energy, energy systems, and sustainable power solutions', 'environmental', '#8B5CF6'),
  ('food', 'Food', 'Food systems, agriculture, nutrition, and food security', 'environmental', '#EC4899'),
  ('health_wellbeing', 'Health & Wellbeing', 'Public health, medical research, and community wellbeing', 'social', '#06B6D4'),
  ('infrastructure', 'Infrastructure', 'Built environment, transportation, and urban infrastructure', 'environmental', '#78716C'),
  ('land', 'Land', 'Land use, soil science, and terrestrial ecosystems', 'environmental', '#84CC16'),
  ('poverty_disparity_injustice', 'Poverty, Disparity, and Injustice', 'Social equity, economic disparity, and justice research', 'social', '#F97316'),
  ('urban_built_environment', 'Urban Built Environment', 'Urban planning, architecture, and sustainable cities', 'environmental', '#0EA5E9'),
  ('water', 'Water', 'Water resources, hydrology, and aquatic systems', 'environmental', '#14B8A6'),
  -- Solution topics
  ('activism', 'Activism', 'Social movements, community organizing, and advocacy', 'solutions', '#DC2626'),
  ('arts_humanities', 'Arts & Humanities', 'Creative arts, literature, and humanistic inquiry', 'solutions', '#7C3AED'),
  ('business_management', 'Business & Management', 'Business innovation, management, and organizational studies', 'solutions', '#2563EB'),
  ('communication_behavior_awareness', 'Communication, Behavior, Awareness', 'Communication studies, behavioral science, and public awareness', 'solutions', '#0891B2'),
  ('design', 'Design', 'Design thinking, innovation, and creative problem-solving', 'solutions', '#BE185D'),
  ('faith_morality_ethics', 'Faith, Morality, Ethics', 'Religious studies, ethical frameworks, and moral philosophy', 'solutions', '#9333EA'),
  ('international_relations', 'International Relations', 'Global affairs, diplomacy, and international cooperation', 'solutions', '#1E40AF'),
  ('law_policy', 'Law & Policy', 'Legal studies, policy analysis, and regulatory frameworks', 'solutions', '#059669'),
  ('tech_innovation_entrepreneurship', 'Tech, Innovation, & Entrepreneurship', 'Technology development, innovation, and entrepreneurial ventures', 'solutions', '#EA580C')
ON CONFLICT (topic_key) DO NOTHING;