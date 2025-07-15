import { createClient } from '@supabase/supabase-js'

const dbEndpoint = process.env.REACT_APP_DB_ENDPOINT || ''
const apiToken = process.env.REACT_APP_API_TOKEN || ''

if (!dbEndpoint || !apiToken) {
  throw new Error('Missing database configuration')
}

export const supabase = createClient(dbEndpoint, apiToken)