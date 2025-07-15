const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Configuration
const supabaseUrl = 'https://gefrieuzuosbewltdbzq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// If no service key, use anon key with warning
const supabaseKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnJpZXV6dW9zYmV3bHRkYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzI1MzcsImV4cCI6MjA2ODE0ODUzN30.ltvNOVqHrrPEPlFqUCGzs5IdjIWw_OqhTYAIC5XG4r0';

if (!supabaseServiceKey) {
  console.warn('\n⚠️  WARNING: Using anon key - migration may fail due to RLS policies');
  console.warn('⚠️  To use service key: SUPABASE_SERVICE_KEY=your-service-key node scripts/migrate-data-simple.js\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseScore(value) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 5);
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === '') return null;
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

async function migrateFacultyData() {
  try {
    const csvFilePath = path.join(__dirname, '../src/data/faculty_data_cleaned.csv');
    
    console.log('📖 Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const csvRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`✅ Parsed ${csvRecords.length} records from CSV\n`);
    
    // Transform records and handle duplicates
    const emailMap = new Map();
    csvRecords
      .filter(row => row.FirstName && row.LastName && row.Email)
      .forEach(row => {
        const email = row.Email.toLowerCase();
        
        // If we've seen this email before, merge the expertise scores (take the max)
        if (emailMap.has(email)) {
          const existing = emailMap.get(email);
          existing.air_pollution = Math.max(existing.air_pollution, parseScore(row['Air/Pollution, chemicals, waste']));
          existing.biodiversity_loss = Math.max(existing.biodiversity_loss, parseScore(row['Biodiversity Loss']));
          existing.climate = Math.max(existing.climate, parseScore(row['Climate']));
          existing.governance_conflict_migration = Math.max(existing.governance_conflict_migration, parseScore(row['Governance, Conflict, & Migration']));
          existing.energy = Math.max(existing.energy, parseScore(row['Energy']));
          existing.food = Math.max(existing.food, parseScore(row['Food']));
          existing.health_wellbeing = Math.max(existing.health_wellbeing, parseScore(row['Health & Wellbeing']));
          existing.infrastructure = Math.max(existing.infrastructure, parseScore(row['Infrastructure']));
          existing.land = Math.max(existing.land, parseScore(row['Land']));
          existing.poverty_disparity_injustice = Math.max(existing.poverty_disparity_injustice, parseScore(row['Poverty, Disparity, and Injustice']));
          existing.urban_built_environment = Math.max(existing.urban_built_environment, parseScore(row['Urban Built Environment']));
          existing.water = Math.max(existing.water, parseScore(row['Water']));
          existing.activism = Math.max(existing.activism, parseScore(row['Activism']));
          existing.arts_humanities = Math.max(existing.arts_humanities, parseScore(row['Arts & Humanities']));
          existing.business_management = Math.max(existing.business_management, parseScore(row['Business & Management']));
          existing.communication_behavior_awareness = Math.max(existing.communication_behavior_awareness, parseScore(row['Communication, Behavior, Awareness']));
          existing.design = Math.max(existing.design, parseScore(row['Design']));
          existing.faith_morality_ethics = Math.max(existing.faith_morality_ethics, parseScore(row['Faith, Morality, Ethics']));
          existing.international_relations = Math.max(existing.international_relations, parseScore(row['International Relations']));
          existing.law_policy = Math.max(existing.law_policy, parseScore(row['Law & Policy']));
          existing.tech_innovation_entrepreneurship = Math.max(existing.tech_innovation_entrepreneurship, parseScore(row['Tech, Innovation, & Entrepreneurship']));
          
          // Update other fields if they're better/more complete
          if (!existing.website && row.Website) existing.website = row.Website;
          if (!existing.academic_rank && row.Academic_Rank) existing.academic_rank = row.Academic_Rank;
          if (!existing.school && row.AcadUnitSchool) existing.school = row.AcadUnitSchool;
          if (!existing.department && row.Account_Name) existing.department = row.Account_Name;
          if (!existing.job_title && row.Job_Title) existing.job_title = row.Job_Title;
          
        } else {
          // New record
          emailMap.set(email, {
            first_name: row.FirstName,
            last_name: row.LastName,
            email: email,
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
          });
        }
      });
    
    // Convert map to array
    const records = Array.from(emailMap.values());
    
    console.log(`📊 Prepared ${records.length} faculty records for migration`);
    
    // Test permissions
    console.log('\n🔐 Testing database permissions...');
    const testRecord = {
      email: 'test-migration@yale.edu',
      first_name: 'Test',
      last_name: 'Migration',
      climate: 1
    };
    
    const { error: testError } = await supabase
      .from('faculty')
      .upsert(testRecord, { onConflict: 'email' });
    
    if (testError) {
      console.error('\n❌ Permission test failed:', testError.message);
      if (testError.message.includes('row-level security')) {
        console.error('\n⚠️  Row Level Security is blocking inserts!');
        console.error('\nTo fix this, you have two options:');
        console.error('\n1. Get the service key from Supabase:');
        console.error('   - Go to https://app.supabase.com/project/gefrieuzuosbewltdbzq/settings/api');
        console.error('   - Copy the "service_role" key (starts with eyJ...)');
        console.error('   - Run: SUPABASE_SERVICE_KEY=your-service-key node scripts/migrate-data-simple.js');
        console.error('\n2. Temporarily disable RLS:');
        console.error('   - Go to https://app.supabase.com/project/gefrieuzuosbewltdbzq/editor');
        console.error('   - Find the "faculty" table');
        console.error('   - Click on RLS and disable it temporarily');
        console.error('   - Run the migration again');
        console.error('   - Re-enable RLS after migration completes');
        process.exit(1);
      }
    } else {
      console.log('✅ Permission test passed!');
      // Clean up test record
      await supabase.from('faculty').delete().eq('email', 'test-migration@yale.edu');
    }
    
    // Clear existing data (optional - comment out if you want to preserve existing records)
    console.log('\n🗑️  Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('faculty')
      .delete()
      .neq('email', ''); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing data:', deleteError.message);
    }
    
    // Insert records in batches
    console.log('\n📤 Starting data migration...');
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const progress = Math.round((i / records.length) * 100);
      
      process.stdout.write(`\rProgress: ${progress}% (${i}/${records.length} records)`);
      
      const { error } = await supabase
        .from('faculty')
        .upsert(batch, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`\n❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
    }
    
    process.stdout.write(`\rProgress: 100% (${records.length}/${records.length} records)\n`);
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Success: ${successCount} records`);
    console.log(`❌ Errors: ${errorCount} records`);
    
    // Verify data
    console.log('\n🔍 Verifying migrated data...');
    
    const { count } = await supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total faculty records in database: ${count}`);
    
    // Check topic counts
    const topicChecks = [
      { field: 'climate', name: 'Climate' },
      { field: 'health_wellbeing', name: 'Health & Wellbeing' },
      { field: 'governance_conflict_migration', name: 'Governance' },
      { field: 'energy', name: 'Energy' }
    ];
    
    for (const topic of topicChecks) {
      const { data } = await supabase
        .from('faculty')
        .select(`first_name, last_name, ${topic.field}`)
        .gt(topic.field, 0)
        .limit(100);
      
      console.log(`✅ ${topic.name}: ${data?.length || 0} faculty with expertise`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
console.log('🚀 Yale Knowledge Graph Data Migration\n');
migrateFacultyData();