import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Faculty, FacultyWithRelevance } from '../types'

export const useFacultySearch = (selectedTopics: string[]) => {
  const [results, setResults] = useState<FacultyWithRelevance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateRelevance = (faculty: Faculty, topics: string[]): number => {
    if (topics.length === 0) return 0
    
    let totalScore = 0
    const matches: Array<{ topic: string; score: number }> = []
    
    topics.forEach(topic => {
      const score = faculty[topic as keyof Faculty] as number || 0
      totalScore += score
      if (score > 0) {
        matches.push({ topic, score })
      }
    })
    
    return topics.length > 0 ? totalScore / topics.length : 0
  }

  const searchFaculty = useCallback(async (topics: string[]) => {
    if (topics.length === 0) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Build the query to get faculty with any of the selected topics > 0
      const conditions = topics.map(topic => `${topic}.gt.0`).join(',')
      
      const { data, error: searchError } = await supabase
        .from('faculty')
        .select('*')
        .or(conditions)
        .order('expertise_breadth', { ascending: false })
        .limit(100)

      if (searchError) throw searchError

      if (data) {
        // Calculate relevance scores and sort by relevance
        const resultsWithRelevance = data
          .map(faculty => {
            const relevanceScore = calculateRelevance(faculty, topics)
            const topicMatches = topics
              .map(topic => ({
                topic,
                score: faculty[topic as keyof Faculty] as number || 0
              }))
              .filter(match => match.score > 0)
              .sort((a, b) => b.score - a.score)

            return {
              ...faculty,
              relevance_score: relevanceScore,
              topic_matches: topicMatches
            }
          })
          .filter(faculty => faculty.relevance_score > 0)
          .sort((a, b) => b.relevance_score - a.relevance_score)

        setResults(resultsWithRelevance)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    searchFaculty(selectedTopics)
  }, [selectedTopics, searchFaculty])

  return { results, loading, error, searchFaculty }
}