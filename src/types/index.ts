export interface Faculty {
  id: string
  first_name: string
  last_name: string
  email: string
  job_title?: string
  academic_rank?: string
  school?: string
  department?: string
  track_type?: string
  track_type_category?: string
  tenure_status?: string
  hire_date?: string
  website?: string
  net_id?: string
  
  // Research interest scores (0-5 scale)
  air_pollution: number
  biodiversity_loss: number
  climate: number
  governance_conflict_migration: number
  energy: number
  food: number
  health_wellbeing: number
  infrastructure: number
  land: number
  poverty_disparity_injustice: number
  urban_built_environment: number
  water: number
  activism: number
  arts_humanities: number
  business_management: number
  communication_behavior_awareness: number
  design: number
  faith_morality_ethics: number
  international_relations: number
  law_policy: number
  tech_innovation_entrepreneurship: number
  
  // Calculated fields
  expertise_breadth?: number
  is_bridge_connector?: boolean
}

export interface ResearchTopic {
  id: string
  topic_key: string
  display_name: string
  description?: string
  category: 'environmental' | 'social' | 'solutions'
  color_hex: string
}

export interface FacultyWithRelevance extends Faculty {
  relevance_score: number
  topic_matches: Array<{
    topic: string
    score: number
  }>
}

export interface UserSearch {
  id: string
  session_id?: string
  selected_topics: string[]
  results_count: number
  created_at: string
}

export interface Filters {
  school?: string
  rank?: string
  minExpertiseBreadth?: number
  searchTerm?: string
}

// Topic keys for type safety
export const TOPIC_KEYS = {
  // Environmental topics
  air_pollution: 'air_pollution',
  biodiversity_loss: 'biodiversity_loss',
  climate: 'climate',
  governance_conflict_migration: 'governance_conflict_migration',
  energy: 'energy',
  food: 'food',
  health_wellbeing: 'health_wellbeing',
  infrastructure: 'infrastructure',
  land: 'land',
  poverty_disparity_injustice: 'poverty_disparity_injustice',
  urban_built_environment: 'urban_built_environment',
  water: 'water',
  // Solution topics
  activism: 'activism',
  arts_humanities: 'arts_humanities',
  business_management: 'business_management',
  communication_behavior_awareness: 'communication_behavior_awareness',
  design: 'design',
  faith_morality_ethics: 'faith_morality_ethics',
  international_relations: 'international_relations',
  law_policy: 'law_policy',
  tech_innovation_entrepreneurship: 'tech_innovation_entrepreneurship',
} as const

export type TopicKey = keyof typeof TOPIC_KEYS