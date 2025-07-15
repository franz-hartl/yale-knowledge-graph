const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse')

// Use the secret key for server-side operations
const supabaseUrl = 'https://gefrieuzuosbewltdbzq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseScore(value) {
  const parsed = parseInt(value)
  return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 5)
}

function parseDate(dateStr) {
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
  
  return new Promise((resolve, reject) => {
    const records = []
    
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      
      console.log(`Processing ${rows.length} rows...`)
      
      for (const row of rows) {
        // Skip rows without essential data
        if (!row.FirstName || !row.LastName || !row.Email) {
          continue
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
      }
      
      console.log(`Parsed ${records.length} faculty records`)
      
      // Insert records in batches
      const batchSize = 50
      let successCount = 0
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}...`)
        
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
        
        successCount += batch.length
      }
      
      console.log(`Migration completed! Successfully inserted ${successCount} records.`)
      
      // Get summary statistics
      const { count } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true })
      
      console.log(`Total faculty records in database: ${count}`)
      
      resolve()
    })
  })
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