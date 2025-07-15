const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function parseScore(value) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 5);
}

async function analyzeCsvData() {
  try {
    const csvFilePath = path.join(__dirname, '../src/data/faculty_data_cleaned.csv');
    
    console.log('📊 Yale Knowledge Graph - CSV Data Analysis\n');
    console.log('📖 Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const csvRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`✅ Parsed ${csvRecords.length} total records from CSV\n`);
    
    // Analysis 1: Records with missing essential fields
    console.log('🔍 Analysis 1: Essential Field Validation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let missingFirstName = 0;
    let missingLastName = 0;
    let missingEmail = 0;
    let validRecords = 0;
    
    csvRecords.forEach(row => {
      const hasFirstName = row.FirstName && row.FirstName.trim() !== '';
      const hasLastName = row.LastName && row.LastName.trim() !== '';
      const hasEmail = row.Email && row.Email.trim() !== '';
      
      if (!hasFirstName) missingFirstName++;
      if (!hasLastName) missingLastName++;
      if (!hasEmail) missingEmail++;
      
      if (hasFirstName && hasLastName && hasEmail) {
        validRecords++;
      }
    });
    
    console.log(`Records missing FirstName: ${missingFirstName}`);
    console.log(`Records missing LastName: ${missingLastName}`);
    console.log(`Records missing Email: ${missingEmail}`);
    console.log(`Records with all essential fields: ${validRecords}`);
    console.log(`Records filtered out: ${csvRecords.length - validRecords}\n`);
    
    // Analysis 2: Duplicate email analysis
    console.log('🔍 Analysis 2: Duplicate Email Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const emailCounts = new Map();
    const validRecordsOnly = csvRecords.filter(row => 
      row.FirstName && row.LastName && row.Email
    );
    
    validRecordsOnly.forEach(row => {
      const email = row.Email.toLowerCase();
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    });
    
    const duplicateEmails = Array.from(emailCounts.entries())
      .filter(([email, count]) => count > 1)
      .sort(([, a], [, b]) => b - a);
    
    console.log(`Total unique emails: ${emailCounts.size}`);
    console.log(`Emails with duplicates: ${duplicateEmails.length}`);
    console.log(`Total duplicate records: ${duplicateEmails.reduce((sum, [, count]) => sum + count, 0) - duplicateEmails.length}`);
    
    if (duplicateEmails.length > 0) {
      console.log('\nTop 10 most duplicated emails:');
      duplicateEmails.slice(0, 10).forEach(([email, count]) => {
        console.log(`  ${email}: ${count} records`);
      });
    }
    
    console.log('\n📋 Summary:');
    console.log(`- CSV contains ${csvRecords.length} total records`);
    console.log(`- ${validRecords} records have all essential fields`);
    console.log(`- ${emailCounts.size} unique email addresses`);
    console.log(`- ${duplicateEmails.length} emails have duplicates`);
    console.log(`- Expected ${emailCounts.size} unique faculty after deduplication`);
    console.log(`- Actually migrated 3,424 records`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeCsvData();