const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gxjfzgdlvkfhlxvzphgg.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amZ6Z2RsdmtmaGx4dnpwaGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzYzMDMsImV4cCI6MjA1MjQ1MjMwM30.1gPUWBXBFsZyN7eHBzaGTLwWOCPWYvhYr2GQjJYwGCM';

const supabase = createClient(supabaseUrl, supabaseKey);

const topicKeys = [
  'air_pollution', 'biodiversity_loss', 'climate', 'governance_conflict_migration',
  'energy', 'food', 'health_wellbeing', 'infrastructure', 'land',
  'poverty_disparity_injustice', 'urban_built_environment', 'water',
  'activism', 'arts_humanities', 'business_management', 'communication_behavior_awareness',
  'design', 'faith_morality_ethics', 'international_relations', 'law_policy',
  'tech_innovation_entrepreneurship'
];

async function analyzeConnections() {
  try {
    console.log('🔍 Analyzing faculty-topic connections...\n');
    
    // Get all faculty data
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select('*');
    
    if (error) throw error;
    
    console.log(`📊 Total faculty: ${faculty.length}\n`);
    
    // Analyze score distributions for each topic
    console.log('📈 Score distributions by topic:');
    console.log('='.repeat(50));
    
    const topicStats = {};
    
    topicKeys.forEach(topic => {
      const scores = faculty.map(f => f[topic] || 0);
      const nonZeroScores = scores.filter(s => s > 0);
      const highScores = scores.filter(s => s >= 5);
      const veryHighScores = scores.filter(s => s >= 10);
      
      topicStats[topic] = {
        total: scores.length,
        nonZero: nonZeroScores.length,
        high: highScores.length,
        veryHigh: veryHighScores.length,
        avg: nonZeroScores.length > 0 ? (nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(2) : 0,
        max: Math.max(...scores)
      };
      
      console.log(`${topic.padEnd(35)}: ${nonZeroScores.length.toString().padStart(3)} faculty (${(nonZeroScores.length/faculty.length*100).toFixed(1)}%), avg: ${topicStats[topic].avg}, max: ${topicStats[topic].max}`);
    });
    
    // Analyze current connection logic
    console.log('\n🔗 Current connection analysis:');
    console.log('='.repeat(50));
    
    const connections = [];
    
    for (let i = 0; i < topicKeys.length; i++) {
      for (let j = i + 1; j < topicKeys.length; j++) {
        const topic1 = topicKeys[i];
        const topic2 = topicKeys[j];
        
        // Count faculty with scores > 0 in both topics
        const sharedFaculty = faculty.filter(f => {
          const score1 = f[topic1] || 0;
          const score2 = f[topic2] || 0;
          return score1 > 0 && score2 > 0;
        }).length;
        
        // Count faculty with high scores in both topics
        const highSharedFaculty = faculty.filter(f => {
          const score1 = f[topic1] || 0;
          const score2 = f[topic2] || 0;
          return score1 >= 5 && score2 >= 5;
        }).length;
        
        connections.push({
          topic1,
          topic2,
          sharedFaculty,
          highSharedFaculty
        });
      }
    }
    
    // Sort by shared faculty count
    connections.sort((a, b) => b.sharedFaculty - a.sharedFaculty);
    
    console.log('\nTop 20 connections (current logic: score > 0):');
    connections.slice(0, 20).forEach(conn => {
      console.log(`${conn.topic1.padEnd(25)} ↔ ${conn.topic2.padEnd(25)}: ${conn.sharedFaculty.toString().padStart(2)} faculty (${conn.highSharedFaculty} high-score)`);
    });
    
    // Count connections at different thresholds
    const thresholds = [1, 2, 3, 5, 8, 10, 15];
    console.log('\n📊 Connection counts at different thresholds:');
    thresholds.forEach(threshold => {
      const count = connections.filter(c => c.sharedFaculty >= threshold).length;
      console.log(`Threshold ${threshold.toString().padStart(2)}: ${count.toString().padStart(3)} connections`);
    });
    
    // Analyze high-score connections
    console.log('\n🎯 High-score connections (score >= 5):');
    const highScoreConnections = connections.filter(c => c.highSharedFaculty >= 1);
    console.log(`Total high-score connections: ${highScoreConnections.length}`);
    
    console.log('\nTop 15 high-score connections:');
    highScoreConnections.slice(0, 15).forEach(conn => {
      console.log(`${conn.topic1.padEnd(25)} ↔ ${conn.topic2.padEnd(25)}: ${conn.highSharedFaculty.toString().padStart(2)} faculty`);
    });
    
  } catch (error) {
    console.error('Error analyzing connections:', error);
  }
}

analyzeConnections();