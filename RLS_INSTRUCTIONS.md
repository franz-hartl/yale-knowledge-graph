# Data Migration Instructions

The Yale Knowledge Graph data migration is ready to run, but requires database permissions to insert data.

## The Issue
Row Level Security (RLS) is blocking data insertion with the current permissions.

## Solution Options

### Option 1: Get Service Key (Recommended)
1. Go to [Supabase API Settings](https://app.supabase.com/project/gefrieuzuosbewltdbzq/settings/api)
2. Copy the **service_role** key (it starts with `eyJ...`)
3. Run the migration with the service key:
   ```bash
   SUPABASE_SERVICE_KEY=your-service-key npm run migrate
   ```

### Option 2: Temporarily Disable RLS
1. Go to [Supabase Table Editor](https://app.supabase.com/project/gefrieuzuosbewltdbzq/editor)
2. Find the `faculty` table
3. Click on the RLS toggle to disable it temporarily
4. Run the migration:
   ```bash
   npm run migrate
   ```
5. **Important**: Re-enable RLS after migration completes

## What the Migration Will Do
- Parse 4,665 faculty records from CSV
- Insert real expertise data:
  - 167 faculty with climate expertise
  - 310 faculty with health & wellbeing expertise
  - Plus hundreds more across all 21 topic areas
- Verify the data was inserted correctly
- Show progress and summary statistics

## After Migration
Once the data is migrated, refresh the Yale Knowledge Graph Explorer to see the real expertise landscape with faculty counts across all topics!

## Current Status
- ✅ CSV data is ready (4,665 records)
- ✅ Migration script is prepared
- ✅ Database schema is correct
- ⚠️  Waiting for RLS permissions to complete migration