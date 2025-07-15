import { Faculty, ResearchTopic } from '../types';

export interface NetworkNode {
  id: string;
  type: 'faculty' | 'topic';
  name: string;
  size: number;
  color: string;
  data: Faculty | ResearchTopic;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  type: 'faculty-topic' | 'faculty-faculty' | 'topic-topic';
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface CollaborationScore {
  faculty1: Faculty;
  faculty2: Faculty;
  score: number;
  sharedTopics: string[];
}

export interface TopicConnection {
  topic1: string;
  topic2: string;
  sharedFaculty: number;
  strength: number;
}

export class NetworkDataProcessor {
  private faculty: Faculty[] = [];
  private topics: ResearchTopic[] = [];
  private expertiseThreshold = 2; // Minimum expertise level to consider

  constructor(faculty: Faculty[], topics: ResearchTopic[]) {
    this.faculty = faculty;
    this.topics = topics;
  }

  setExpertiseThreshold(threshold: number): void {
    this.expertiseThreshold = threshold;
  }

  /**
   * Get all topic keys from the research topics
   */
  private getTopicKeys(): string[] {
    return this.topics.map(topic => topic.topic_key);
  }

  /**
   * Get faculty expertise in a specific topic
   */
  private getFacultyExpertise(faculty: Faculty, topicKey: string): number {
    return (faculty as any)[topicKey] || 0;
  }

  /**
   * Calculate collaboration potential between two faculty members
   */
  calculateCollaborationScore(faculty1: Faculty, faculty2: Faculty): CollaborationScore {
    const topicKeys = this.getTopicKeys();
    let totalScore = 0;
    const sharedTopics: string[] = [];

    topicKeys.forEach(topicKey => {
      const expertise1 = this.getFacultyExpertise(faculty1, topicKey);
      const expertise2 = this.getFacultyExpertise(faculty2, topicKey);

      // Both have expertise in this topic
      if (expertise1 >= this.expertiseThreshold && expertise2 >= this.expertiseThreshold) {
        // Score is higher for complementary expertise levels
        const score = Math.min(expertise1, expertise2) + Math.abs(expertise1 - expertise2) * 0.5;
        totalScore += score;
        sharedTopics.push(topicKey);
      }
    });

    return {
      faculty1,
      faculty2,
      score: Math.round(totalScore * 100) / 100,
      sharedTopics
    };
  }

  /**
   * Calculate all collaboration scores above a threshold
   */
  calculateAllCollaborationScores(minScore: number = 1): CollaborationScore[] {
    const scores: CollaborationScore[] = [];
    
    for (let i = 0; i < this.faculty.length; i++) {
      for (let j = i + 1; j < this.faculty.length; j++) {
        const score = this.calculateCollaborationScore(this.faculty[i], this.faculty[j]);
        if (score.score >= minScore) {
          scores.push(score);
        }
      }
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate connections between topics based on shared faculty
   */
  calculateTopicConnections(): TopicConnection[] {
    const connections: TopicConnection[] = [];
    const topicKeys = this.getTopicKeys();

    for (let i = 0; i < topicKeys.length; i++) {
      for (let j = i + 1; j < topicKeys.length; j++) {
        const topic1 = topicKeys[i];
        const topic2 = topicKeys[j];

        const sharedFaculty = this.faculty.filter(faculty => {
          const expertise1 = this.getFacultyExpertise(faculty, topic1);
          const expertise2 = this.getFacultyExpertise(faculty, topic2);
          return expertise1 >= this.expertiseThreshold && expertise2 >= this.expertiseThreshold;
        });

        if (sharedFaculty.length > 0) {
          // Calculate strength based on number of shared faculty and their expertise levels
          const strength = sharedFaculty.reduce((sum, faculty) => {
            const expertise1 = this.getFacultyExpertise(faculty, topic1);
            const expertise2 = this.getFacultyExpertise(faculty, topic2);
            return sum + Math.min(expertise1, expertise2);
          }, 0);

          connections.push({
            topic1,
            topic2,
            sharedFaculty: sharedFaculty.length,
            strength: Math.round(strength * 100) / 100
          });
        }
      }
    }

    return connections.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Get faculty count for each topic
   */
  getTopicFacultyCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    const topicKeys = this.getTopicKeys();

    topicKeys.forEach(topicKey => {
      const facultyCount = this.faculty.filter(faculty => {
        const expertise = this.getFacultyExpertise(faculty, topicKey);
        return expertise >= this.expertiseThreshold;
      }).length;

      counts.set(topicKey, facultyCount);
    });

    return counts;
  }

  /**
   * Generate Level 1 network data (Topic Network)
   */
  generateTopicNetwork(): NetworkData {
    console.log('🔍 Starting topic network generation...');
    console.log('📊 Available topics:', this.topics.length);
    console.log('👥 Available faculty:', this.faculty.length);
    console.log('🎯 Expertise threshold:', this.expertiseThreshold);
    
    const topicConnections = this.calculateTopicConnections();
    const topicCounts = this.getTopicFacultyCounts();
    
    console.log('🔗 Topic connections calculated:', topicConnections.length);
    console.log('📈 Topic counts:', Array.from(topicCounts.entries()));
    
    // Create topic nodes
    const nodes: NetworkNode[] = this.topics.map(topic => ({
      id: topic.topic_key,
      type: 'topic' as const,
      name: topic.display_name,
      size: topicCounts.get(topic.topic_key) || 0,
      color: this.getTopicColor(topic.category),
      data: topic
    }));

    // Create topic-topic edges
    const edges: NetworkEdge[] = topicConnections
      .filter(connection => connection.sharedFaculty >= 1) // Show all connections with at least 1 shared faculty
      .map(connection => ({
        source: connection.topic1,
        target: connection.topic2,
        weight: connection.strength,
        type: 'topic-topic' as const
      }));

    console.log('✅ Topic network generated:', { 
      nodeCount: nodes.length, 
      edgeCount: edges.length,
      totalFacultyAcrossTopics: Array.from(topicCounts.values()).reduce((a, b) => a + b, 0)
    });

    return { nodes, edges };
  }

  /**
   * Generate Level 2 network data (Faculty Clusters for a topic)
   */
  generateFacultyClusterNetwork(selectedTopicKey: string): NetworkData {
    // Get faculty with expertise in the selected topic
    const relevantFaculty = this.faculty.filter(faculty => {
      const expertise = this.getFacultyExpertise(faculty, selectedTopicKey);
      return expertise >= this.expertiseThreshold;
    });

    // Create faculty nodes
    const nodes: NetworkNode[] = relevantFaculty.map(faculty => ({
      id: faculty.email,
      type: 'faculty' as const,
      name: `${faculty.first_name} ${faculty.last_name}`,
      size: this.getFacultyExpertise(faculty, selectedTopicKey),
      color: this.getFacultyColor(faculty.school),
      data: faculty
    }));

    // Calculate collaboration edges between faculty
    const edges: NetworkEdge[] = [];
    for (let i = 0; i < relevantFaculty.length; i++) {
      for (let j = i + 1; j < relevantFaculty.length; j++) {
        const collaboration = this.calculateCollaborationScore(relevantFaculty[i], relevantFaculty[j]);
        if (collaboration.score >= 2) { // Only show significant collaborations
          edges.push({
            source: relevantFaculty[i].email,
            target: relevantFaculty[j].email,
            weight: collaboration.score,
            type: 'faculty-faculty' as const
          });
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Generate Level 3 network data (Ego network for a faculty member)
   */
  generateFacultyEgoNetwork(facultyEmail: string): NetworkData {
    const centralFaculty = this.faculty.find(f => f.email === facultyEmail);
    if (!centralFaculty) {
      return { nodes: [], edges: [] };
    }

    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];

    // Add central faculty node
    nodes.push({
      id: centralFaculty.email,
      type: 'faculty' as const,
      name: `${centralFaculty.first_name} ${centralFaculty.last_name}`,
      size: 10, // Central node is larger
      color: '#1f2937',
      data: centralFaculty
    });

    // Add topic nodes for faculty's expertise
    const topicKeys = this.getTopicKeys();
    const facultyTopics = topicKeys.filter(topicKey => {
      const expertise = this.getFacultyExpertise(centralFaculty, topicKey);
      return expertise >= this.expertiseThreshold;
    });

    facultyTopics.forEach(topicKey => {
      const topic = this.topics.find(t => t.topic_key === topicKey);
      if (topic) {
        nodes.push({
          id: topicKey,
          type: 'topic' as const,
          name: topic.display_name,
          size: this.getFacultyExpertise(centralFaculty, topicKey),
          color: this.getTopicColor(topic.category),
          data: topic
        });

        // Add edge from faculty to topic
        edges.push({
          source: centralFaculty.email,
          target: topicKey,
          weight: this.getFacultyExpertise(centralFaculty, topicKey),
          type: 'faculty-topic' as const
        });
      }
    });

    // Add collaborating faculty
    const collaborations = this.faculty
      .filter(f => f.email !== facultyEmail)
      .map(f => this.calculateCollaborationScore(centralFaculty, f))
      .filter(c => c.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 collaborators

    collaborations.forEach(collaboration => {
      const faculty = collaboration.faculty2;
      nodes.push({
        id: faculty.email,
        type: 'faculty' as const,
        name: `${faculty.first_name} ${faculty.last_name}`,
        size: collaboration.score,
        color: this.getFacultyColor(faculty.school),
        data: faculty
      });

      edges.push({
        source: centralFaculty.email,
        target: faculty.email,
        weight: collaboration.score,
        type: 'faculty-faculty' as const
      });
    });

    return { nodes, edges };
  }

  /**
   * Get color for topic based on category
   */
  private getTopicColor(category: string): string {
    const colors: Record<string, string> = {
      'Environmental Challenges': '#10b981',
      'Social Challenges': '#f59e0b',
      'Solutions & Approaches': '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  }

  /**
   * Get color for faculty based on school
   */
  private getFacultyColor(school: string | null | undefined): string {
    if (!school) return '#6b7280';
    
    const schoolColors: Record<string, string> = {
      'School of Medicine': '#dc2626',
      'School of Law': '#2563eb',
      'School of Engineering and Applied Science': '#059669',
      'School of Management': '#7c3aed',
      'School of Public Health': '#ea580c',
      'School of Art': '#db2777',
      'School of Music': '#0891b2',
      'School of Nursing': '#65a30d',
      'School of Environment': '#16a34a'
    };

    return schoolColors[school] || '#6b7280';
  }
}