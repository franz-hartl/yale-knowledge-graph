import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as csv from 'csv-parse'

// Use the secret key for server-side operations
const supabaseUrl = 'https://gefrieuzuosbewltdbzq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

// If no service key, try using the anon key with a warning
const supabaseKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnJpZXV6dW9zYmV3bHRkYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzI1MzcsImV4cCI6MjA2ODE0ODUzN30.ltvNOVqHrrPEPlFqUCGzs5IdjIWw_OqhTYAIC5XG4r0'

if (!supabaseServiceKey) {
  console.warn('⚠️  Warning: Using anon key - migration may fail due to RLS policies')
  console.warn('⚠️  To use service key: SUPABASE_SERVICE_KEY=your-service-key npm run migrate')
}

const supabase = createClient(supabaseUrl, supabaseKey)

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
  
  // First, let's verify we can insert by checking RLS
  console.log('\n🔐 Testing database permissions...')
  const testRecord = {
    email: 'test-migration@yale.edu',
    first_name: 'Test',
    last_name: 'Migration',
    climate: 1
  }
  
  const { error: testError } = await supabase
    .from('faculty')
    .upsert(testRecord, { onConflict: 'email' })
  
  if (testError) {
    console.error('❌ Permission test failed:', testError.message)
    if (testError.message.includes('row-level security')) {
      console.error('\n⚠️  Row Level Security is blocking inserts!')
      console.error('Please either:')
      console.error('1. Use the service key: SUPABASE_SERVICE_KEY=your-service-key npm run migrate')
      console.error('2. Or temporarily disable RLS in Supabase dashboard')
      process.exit(1)
    }
  } else {
    console.log('✅ Permission test passed!')
    // Clean up test record
    await supabase.from('faculty').delete().eq('email', 'test-migration@yale.edu')
  }
  
  // Insert records in batches
  const batchSize = 50
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    console.log(`\nInserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(records.length / batchSize)}...`)
    
    const { data, error } = await supabase
      .from('faculty')
      .upsert(batch, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error('❌ Error inserting batch:', error.message)
      errorCount += batch.length
      continue
    }
    
    successCount += batch.length
    console.log(`✅ Batch inserted successfully`)
  }
  
  console.log('\n📊 Migration Summary:')
  console.log(`✅ Success: ${successCount} records`)
  console.log(`❌ Errors: ${errorCount} records`)
  
  console.log('\n🔍 Verifying data...')
  
  // Get summary statistics
  const { count } = await supabase
    .from('faculty')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total faculty records in database: ${count}`)
  
  // Verify some actual data got inserted
  const { data: climateData } = await supabase
    .from('faculty')
    .select('first_name, last_name, climate')
    .gt('climate', 0)
    .limit(5)
  
  const { data: healthData } = await supabase
    .from('faculty')
    .select('first_name, last_name, health_wellbeing')
    .gt('health_wellbeing', 0)
    .limit(5)
  
  console.log(`\n✅ Faculty with climate expertise: ${climateData?.length || 0}`)
  if (climateData && climateData.length > 0) {
    console.log('Sample:', climateData.slice(0, 2).map(f => `${f.first_name} ${f.last_name}`).join(', '))
  }
  
  console.log(`\n✅ Faculty with health & wellbeing expertise: ${healthData?.length || 0}`)
  if (healthData && healthData.length > 0) {
    console.log('Sample:', healthData.slice(0, 2).map(f => `${f.first_name} ${f.last_name}`).join(', '))
  }
  
  if (!climateData?.length && !healthData?.length) {
    console.error('\n❌ Warning: No faculty with expertise scores > 0 found!')
    console.error('Data may not have been inserted correctly.')
  }
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