const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabaseUrl = 'https://gefrieuzuosbewltdbzq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnJpZXV6dW9zYmV3bHRkYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzI1MzcsImV4cCI6MjA2ODE0ODUzN30.ltvNOVqHrrPEPlFqUCGzs5IdjIWw_OqhTYAIC5XG4r0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function bulkImport() {
  try {
    // Read CSV
    const csvPath = path.join(__dirname, '../src/data/faculty_data_cleaned.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    
    console.log(`📊 Found ${records.length} records in CSV`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await supabase.from('faculty').delete().neq('id', 0);
    
    // Transform and insert all records at once
    const faculty = records
      .filter(r => r.FirstName && r.LastName && r.Email)
      .map(r => ({
        first_name: r.FirstName,
        last_name: r.LastName,
        email: r.Email.toLowerCase(),
        job_title: r.Job_Title || null,
        academic_rank: r.Academic_Rank || null,
        school: r.AcadUnitSchool || null,
        department: r.Account_Name || null,
        track_type: r.Track_type || null,
        track_type_category: r.Track_type_category || null,
        tenure_status: r.Academic_Tenure_status || null,
        hire_date: r.Hiredate ? new Date(r.Hiredate).toISOString().split('T')[0] : null,
        website: r.Website || null,
        net_id: r.NetId || null,
        air_pollution: Math.max(0, Math.min(5, parseInt(r['Air/Pollution, chemicals, waste']) || 0)),
        biodiversity_loss: Math.max(0, Math.min(5, parseInt(r['Biodiversity Loss']) || 0)),
        climate: Math.max(0, Math.min(5, parseInt(r['Climate']) || 0)),
        governance_conflict_migration: Math.max(0, Math.min(5, parseInt(r['Governance, Conflict, & Migration']) || 0)),
        energy: Math.max(0, Math.min(5, parseInt(r['Energy']) || 0)),
        food: Math.max(0, Math.min(5, parseInt(r['Food']) || 0)),
        health_wellbeing: Math.max(0, Math.min(5, parseInt(r['Health & Wellbeing']) || 0)),
        infrastructure: Math.max(0, Math.min(5, parseInt(r['Infrastructure']) || 0)),
        land: Math.max(0, Math.min(5, parseInt(r['Land']) || 0)),
        poverty_disparity_injustice: Math.max(0, Math.min(5, parseInt(r['Poverty, Disparity, and Injustice']) || 0)),
        urban_built_environment: Math.max(0, Math.min(5, parseInt(r['Urban Built Environment']) || 0)),
        water: Math.max(0, Math.min(5, parseInt(r['Water']) || 0)),
        activism: Math.max(0, Math.min(5, parseInt(r['Activism']) || 0)),
        arts_humanities: Math.max(0, Math.min(5, parseInt(r['Arts & Humanities']) || 0)),
        business_management: Math.max(0, Math.min(5, parseInt(r['Business & Management']) || 0)),
        communication_behavior_awareness: Math.max(0, Math.min(5, parseInt(r['Communication, Behavior, Awareness']) || 0)),
        design: Math.max(0, Math.min(5, parseInt(r['Design']) || 0)),
        faith_morality_ethics: Math.max(0, Math.min(5, parseInt(r['Faith, Morality, Ethics']) || 0)),
        international_relations: Math.max(0, Math.min(5, parseInt(r['International Relations']) || 0)),
        law_policy: Math.max(0, Math.min(5, parseInt(r['Law & Policy']) || 0)),
        tech_innovation_entrepreneurship: Math.max(0, Math.min(5, parseInt(r['Tech, Innovation, & Entrepreneurship']) || 0))
      }));
    
    console.log(`🚀 Inserting ${faculty.length} faculty records...`);
    
    // Insert in one big batch - let the database handle duplicates
    const { data, error } = await supabase
      .from('faculty')
      .insert(faculty);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Bulk import completed!');
    
    // Verify
    const { count } = await supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total records in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

bulkImport();