import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface TopicRelationship {
  source: string
  target: string
  sharedFaculty: number
  strength: number
  type: 'strong' | 'medium' | 'weak'
}

export const useTopicRelationships = () => {
  const [relationships, setRelationships] = useState<TopicRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const calculateTopicRelationships = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all faculty records
        const { data: faculty, error: facultyError } = await supabase
          .from('faculty')
          .select('*')

        if (facultyError) throw facultyError
        if (!faculty) throw new Error('No faculty data found')

        // Topic keys for analysis
        const topicKeys = [
          'air_pollution',
          'biodiversity_loss',
          'climate',
          'governance_conflict_migration',
          'energy',
          'food',
          'health_wellbeing',
          'infrastructure',
          'land',
          'poverty_disparity_injustice',
          'urban_built_environment',
          'water',
          'activism',
          'arts_humanities',
          'business_management',
          'communication_behavior_awareness',
          'design',
          'faith_morality_ethics',
          'international_relations',
          'law_policy',
          'tech_innovation_entrepreneurship'
        ]

        // Category mapping for within-category connections
        const topicCategories: Record<string, string> = {
          'air_pollution': 'environmental',
          'biodiversity_loss': 'environmental',
          'climate': 'environmental',
          'governance_conflict_migration': 'environmental',
          'energy': 'environmental',
          'food': 'environmental',
          'health_wellbeing': 'social',
          'infrastructure': 'social',
          'land': 'environmental',
          'poverty_disparity_injustice': 'social',
          'urban_built_environment': 'social',
          'water': 'environmental',
          'activism': 'solutions',
          'arts_humanities': 'solutions',
          'business_management': 'solutions',
          'communication_behavior_awareness': 'solutions',
          'design': 'solutions',
          'faith_morality_ethics': 'solutions',
          'international_relations': 'solutions',
          'law_policy': 'solutions',
          'tech_innovation_entrepreneurship': 'solutions'
        }

        const relationships: TopicRelationship[] = []

        // Calculate relationships between all topic pairs
        for (let i = 0; i < topicKeys.length; i++) {
          for (let j = i + 1; j < topicKeys.length; j++) {
            const topic1 = topicKeys[i]
            const topic2 = topicKeys[j]

            // Count faculty with scores > 0 in both topics
            const sharedFaculty = faculty.filter(f => {
              const score1 = f[topic1 as keyof typeof f] as number
              const score2 = f[topic2 as keyof typeof f] as number
              return score1 > 0 && score2 > 0
            }).length

            // Determine connection criteria
            const sameCategory = topicCategories[topic1] === topicCategories[topic2]
            
            // Define thresholds
            const strongThreshold = sameCategory ? 8 : 15 // Lower threshold for same category
            const mediumThreshold = sameCategory ? 4 : 8
            const weakThreshold = sameCategory ? 2 : 5

            // Only create connection if above minimum threshold
            if (sharedFaculty >= weakThreshold) {
              let connectionType: 'strong' | 'medium' | 'weak'
              let strength: number

              if (sharedFaculty >= strongThreshold) {
                connectionType = 'strong'
                strength = 0.8
              } else if (sharedFaculty >= mediumThreshold) {
                connectionType = 'medium'
                strength = 0.5
              } else {
                connectionType = 'weak'
                strength = 0.2
              }

              // Boost strength for same category connections
              if (sameCategory) {
                strength *= 1.2
              }

              relationships.push({
                source: topic1,
                target: topic2,
                sharedFaculty,
                strength,
                type: connectionType
              })
            }
          }
        }

        // Sort by shared faculty count (strongest connections first)
        relationships.sort((a, b) => b.sharedFaculty - a.sharedFaculty)

        console.log(`Generated ${relationships.length} meaningful connections (was ~210 before)`)
        console.log('Top 10 strongest connections:', relationships.slice(0, 10))

        setRelationships(relationships)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate topic relationships')
        console.error('Error calculating topic relationships:', err)
      } finally {
        setLoading(false)
      }
    }

    calculateTopicRelationships()
  }, [])

  return { relationships, loading, error }
}