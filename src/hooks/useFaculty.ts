import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Faculty } from '../types';

export const useFaculty = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .order('last_name');

        if (error) throw error;

        setFaculty(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch faculty');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  return { faculty, loading, error };
};