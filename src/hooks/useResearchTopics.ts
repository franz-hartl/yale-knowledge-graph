import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ResearchTopic } from '../types'

export const useResearchTopics = () => {
  const [topics, setTopics] = useState<ResearchTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('research_topics')
          .select('*')
          .order('display_name')

        if (fetchError) throw fetchError

        setTopics(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch topics')
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  return { topics, loading, error }
}