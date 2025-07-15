import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface TopicCount {
  topic_key: string
  faculty_count: number
}

export const useFacultyTopicCounts = () => {
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopicCounts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all faculty records
        const { data: faculty, error: facultyError } = await supabase
          .from('faculty')
          .select('*')

        if (facultyError) throw facultyError

        // Calculate counts for each topic
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

        const counts: TopicCount[] = topicKeys.map(topicKey => {
          const facultyCount = faculty?.filter(f => {
            const score = f[topicKey as keyof typeof f] as number
            return score > 0
          }).length || 0

          return {
            topic_key: topicKey,
            faculty_count: facultyCount
          }
        })

        setTopicCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch topic counts')
      } finally {
        setLoading(false)
      }
    }

    fetchTopicCounts()
  }, [])

  const getTopicCount = (topicKey: string): number => {
    const topicCount = topicCounts.find(tc => tc.topic_key === topicKey)
    return topicCount?.faculty_count || 0
  }

  return { topicCounts, loading, error, getTopicCount }
}