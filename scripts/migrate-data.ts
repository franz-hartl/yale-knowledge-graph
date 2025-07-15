import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as csv from 'csv-parse'

// Use the secret key for server-side operations
const supabaseUrl = 'https://gefrieuzuosbewltdbzq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CSVRow {
  ID: string
  FirstName: string
  LastName: string
  Email: string
  Job_Title: string
  Academic_Rank: string
  AcadUnitSchool: string
  Account_Name: string
  Track_type: string
  Track_type_category: string
  Academic_Tenure_status: string
  NetId: string
  Hiredate: string
  Website: string
  'Air/Pollution, chemicals, waste': string
  'Biodiversity Loss': string
  'Climate': string
  'Governance, Conflict, & Migration': string
  'Energy': string
  'Food': string
  'Health & Wellbeing': string
  'Infrastructure': string
  'Land': string
  'Poverty, Disparity, and Injustice': string
  'Urban Built Environment': string
  'Water': string
  'Activism': string
  'Arts & Humanities': string
  'Business & Management': string
  'Communication, Behavior, Awareness': string
  'Design': string
  'Faith, Morality, Ethics': string
  'International Relations': string
  'Law & Policy': string
  'Tech, Innovation, & Entrepreneurship': string
}

function parseScore(value: string): number {
  const parsed = parseInt(value)
  return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 5)
}

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr === '') return null
  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

async function migrateFacultyData() {
  const csvFilePath = path.join(__dirname, '../src/data/faculty_data_cleaned.csv')
  
  console.log('Reading CSV file...')
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8')
  
  const parser = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })
  
  const records: any[] = []
  
  parser.on('data', (row: CSVRow) => {
    // Skip rows without essential data
    if (!row.FirstName || !row.LastName || !row.Email) {
      return
    }
    
    const facultyRecord = {
      first_name: row.FirstName,
      last_name: row.LastName,
      email: row.Email.toLowerCase(),
      job_title: row.Job_Title || null,
      academic_rank: row.Academic_Rank || null,
      school: row.AcadUnitSchool || null,
      department: row.Account_Name || null,
      track_type: row.Track_type || null,
      track_type_category: row.Track_type_category || null,
      tenure_status: row.Academic_Tenure_status || null,
      hire_date: parseDate(row.Hiredate),
      website: row.Website || null,
      net_id: row.NetId || null,
      
      // Research interest scores
      air_pollution: parseScore(row['Air/Pollution, chemicals, waste']),
      biodiversity_loss: parseScore(row['Biodiversity Loss']),
      climate: parseScore(row['Climate']),
      governance_conflict_migration: parseScore(row['Governance, Conflict, & Migration']),
      energy: parseScore(row['Energy']),
      food: parseScore(row['Food']),
      health_wellbeing: parseScore(row['Health & Wellbeing']),
      infrastructure: parseScore(row['Infrastructure']),
      land: parseScore(row['Land']),
      poverty_disparity_injustice: parseScore(row['Poverty, Disparity, and Injustice']),
      urban_built_environment: parseScore(row['Urban Built Environment']),
      water: parseScore(row['Water']),
      activism: parseScore(row['Activism']),
      arts_humanities: parseScore(row['Arts & Humanities']),
      business_management: parseScore(row['Business & Management']),
      communication_behavior_awareness: parseScore(row['Communication, Behavior, Awareness']),
      design: parseScore(row['Design']),
      faith_morality_ethics: parseScore(row['Faith, Morality, Ethics']),
      international_relations: parseScore(row['International Relations']),
      law_policy: parseScore(row['Law & Policy']),
      tech_innovation_entrepreneurship: parseScore(row['Tech, Innovation, & Entrepreneurship'])
    }
    
    records.push(facultyRecord)
  })
  
  await new Promise((resolve, reject) => {
    parser.on('end', resolve)
    parser.on('error', reject)
  })
  
  console.log(`Parsed ${records.length} faculty records`)
  
  // Insert records in batches
  const batchSize = 50
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`)
    
    const { error } = await supabase
      .from('faculty')
      .upsert(batch, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error('Error inserting batch:', error)
      continue
    }
  }
  
  console.log('Migration completed!')
  
  // Get summary statistics
  const { count } = await supabase
    .from('faculty')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total faculty records in database: ${count}`)
}

// Run the migration
migrateFacultyData()
  .then(() => {
    console.log('Migration successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })