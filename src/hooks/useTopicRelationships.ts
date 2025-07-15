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

            // Calculate weighted connection strength based on expertise levels
            const weightedConnection = faculty.reduce((total, f) => {
              const score1 = f[topic1 as keyof typeof f] as number || 0
              const score2 = f[topic2 as keyof typeof f] as number || 0
              
              // Only include faculty with expertise in both topics
              if (score1 > 0 && score2 > 0) {
                // Weight by the minimum score (bottleneck approach)
                const connectionWeight = Math.min(score1, score2)
                return total + connectionWeight
              }
              return total
            }, 0)

            // Determine connection criteria
            const sameCategory = topicCategories[topic1] === topicCategories[topic2]
            
            // Define more permissive thresholds based on actual shared faculty
            const strongThreshold = sameCategory ? 3 : 6 // More permissive
            const mediumThreshold = sameCategory ? 2 : 3
            const weakThreshold = sameCategory ? 1 : 2

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

              // Boost strength based on weighted connection (expertise depth)
              const weightedBoost = Math.min(weightedConnection / 50, 0.3) // Cap at 30% boost
              strength += weightedBoost

              // Boost strength for same category connections
              if (sameCategory) {
                strength *= 1.2
              }

              // Ensure strength doesn't exceed 1.0
              strength = Math.min(strength, 1.0)

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

        console.log(`Generated ${relationships.length} meaningful connections with improved thresholds`)
        console.log('Top 10 strongest connections:', relationships.slice(0, 10).map(r => ({
          connection: `${r.source} ↔ ${r.target}`,
          sharedFaculty: r.sharedFaculty,
          strength: r.strength.toFixed(3),
          type: r.type
        })))
        
        // Additional analysis logging
        console.log('\n📊 Connection Analysis:')
        console.log('='.repeat(50))
        
        // Analyze faculty score distributions
        const topicCounts = topicKeys.map(topic => {
          const count = faculty.filter(f => f[topic] > 0).length
          const highCount = faculty.filter(f => f[topic] >= 5).length
          const veryHighCount = faculty.filter(f => f[topic] >= 10).length
          return { topic, count, highCount, veryHighCount }
        })
        
        topicCounts.sort((a, b) => b.count - a.count)
        console.log('Top 10 topics by faculty count (score > 0):')
        topicCounts.slice(0, 10).forEach(t => {
          console.log(`${t.topic.padEnd(35)}: ${t.count} faculty (${t.highCount} high, ${t.veryHighCount} very high)`)
        })
        
        // Analyze connection strength distribution
        const strengthDistribution = {
          strong: relationships.filter(r => r.type === 'strong').length,
          medium: relationships.filter(r => r.type === 'medium').length,
          weak: relationships.filter(r => r.type === 'weak').length
        }
        
        console.log('\nConnection strength distribution:')
        console.log(`Strong: ${strengthDistribution.strong}, Medium: ${strengthDistribution.medium}, Weak: ${strengthDistribution.weak}`)
        console.log('\nNew thresholds: Same category (Strong: 3, Medium: 2, Weak: 1) | Cross category (Strong: 6, Medium: 3, Weak: 2)')
        
        // Show some examples of missed connections (high individual topics with low shared)
        console.log('\n🔍 Analyzing potential missed connections...')
        const allPairs = []
        for (let i = 0; i < topicKeys.length; i++) {
          for (let j = i + 1; j < topicKeys.length; j++) {
            const topic1 = topicKeys[i]
            const topic2 = topicKeys[j]
            const sharedFaculty = faculty.filter(f => {
              const score1 = f[topic1] as number
              const score2 = f[topic2] as number
              return score1 > 0 && score2 > 0
            }).length
            
            const highSharedFaculty = faculty.filter(f => {
              const score1 = f[topic1] as number
              const score2 = f[topic2] as number
              return score1 >= 5 && score2 >= 5
            }).length
            
            const weightedConnection = faculty.reduce((total, f) => {
              const score1 = f[topic1] as number || 0
              const score2 = f[topic2] as number || 0
              if (score1 > 0 && score2 > 0) {
                return total + Math.min(score1, score2)
              }
              return total
            }, 0)
            
            allPairs.push({ topic1, topic2, sharedFaculty, highSharedFaculty, weightedConnection })
          }
        }
        
        allPairs.sort((a, b) => b.sharedFaculty - a.sharedFaculty)
        console.log('Top 15 topic pairs by shared faculty (including those below current threshold):')
        allPairs.slice(0, 15).forEach(pair => {
          const isIncluded = relationships.some(r => 
            (r.source === pair.topic1 && r.target === pair.topic2) ||
            (r.source === pair.topic2 && r.target === pair.topic1)
          )
          console.log(`${pair.topic1.padEnd(25)} ↔ ${pair.topic2.padEnd(25)}: ${pair.sharedFaculty} faculty (${pair.highSharedFaculty} high-score, weighted: ${pair.weightedConnection}) ${isIncluded ? '✓' : '✗'}`)
        })

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