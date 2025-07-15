# Yale Knowledge Graph Explorer

A modern React application that helps Yale faculty, students, and external collaborators discover expertise and potential collaborators through an intuitive topic-based search interface. Built with TypeScript, Tailwind CSS, and Supabase.

## Features

- **Split-Screen Dashboard**: Streamlined interface with topic selection and live results
- **Topic-based Faculty Search**: Select 1-3 research topics to find relevant faculty
- **Smart Relevance Scoring**: Rank faculty by topic overlap and research diversity
- **Professional Faculty Cards**: Enhanced design with clear research area visualization
- **Detailed Faculty Profiles**: Comprehensive views with research interests and contact information
- **Interdisciplinary Identification**: Highlight faculty with diverse expertise across multiple domains
- **Responsive Design**: Optimized for desktop and mobile devices
- **Contemporary UI**: Series A-quality design with modern interactions and animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Database**: 1,669+ faculty records with 21 research topic dimensions
- **Styling**: Modern gradient designs, responsive grid layouts, contemporary animations
- **Deployment**: Vercel with automatic GitHub deployments

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/franz-hartl/yale-knowledge-graph.git
cd yale-knowledge-graph
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database credentials:
```
REACT_APP_DB_ENDPOINT=your-database-endpoint
REACT_APP_API_TOKEN=your-api-token
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the schema SQL in your Supabase SQL editor:
```sql
-- Copy and paste the contents of supabase/schema.sql
```

3. Import faculty data:
```bash
# Set your Supabase service key
export SUPABASE_SERVICE_KEY=your-service-key

# Run the migration script
npx ts-node scripts/migrate-data.ts
```

### Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # React components
│   ├── TopicSelector.tsx    # Hierarchical topic selection interface
│   ├── FacultyResults.tsx   # Results grid with professional card layout
│   ├── FacultyCard.tsx      # Individual faculty cards with enhanced design
│   └── FacultyProfile.tsx   # Detailed faculty profile modal
├── hooks/              # Custom React hooks
│   ├── useFacultySearch.ts  # Faculty search with relevance scoring
│   └── useResearchTopics.ts # Research topics data fetching
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Faculty and research topic interfaces
└── App.tsx             # Main split-screen dashboard layout

supabase/
└── schema.sql          # Database schema with faculty and topics tables

scripts/
└── migrate-data.ts     # CSV data migration script
```

## Data Model

The application uses three main tables:

### Faculty Table
- **Personal Information**: Name, email, title, department, school, hire date
- **Research Interest Scores**: 0-5 scale across 21 research topics including:
  - Environmental: Climate, biodiversity, energy, water, etc.
  - Social: Health, governance, poverty, urban environment
  - Solutions: Arts, business, law, technology, communication
- **Calculated Fields**: Expertise breadth and interdisciplinary status

### Research Topics Table
- **Topic Definitions**: Structured categories (environmental, social, solutions)
- **Descriptions**: Detailed explanations for each research area
- **UI Configuration**: Color coding and display names for interface

### User Searches Table
- **Analytics Tracking**: Topic combinations and search patterns
- **Usage Insights**: Popular faculty and research area trends

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

## Deployment

### Vercel Deployment (Recommended)

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `yale-knowledge-graph` repository

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Add environment variables:
     - `REACT_APP_DB_ENDPOINT`: Your database endpoint URL
     - `REACT_APP_API_TOKEN`: Your API access token

3. **Deploy:**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

### Auto-Deployment Setup

Vercel automatically deploys on every push to the main branch. No additional configuration needed!

### Manual Deployment Commands

```bash
# Build and deploy to Vercel
npm run build
npx vercel --prod

# Or install Vercel CLI globally
npm install -g vercel
vercel --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## User Personas

This application serves multiple user types:

- **Yale Faculty**: Find collaborators and understand research breadth across the university
- **Faculty Recruits**: Explore Yale's research landscape and identify potential colleagues
- **Students**: Discover advisors and research opportunities aligned with their interests
- **External Researchers**: Identify Yale experts for collaboration and partnership
- **Journalists & Media**: Quickly find subject matter experts for stories and interviews
- **Donors & Alumni**: Understand the scope of research and impact at Yale

## Support

For questions or issues, please contact the Yale Planetary Solutions team or create an issue in this repository.

## Recent Updates

- **Enhanced UI Design**: Professional Series A-quality interface with modern card layouts
- **Split-Screen Dashboard**: Improved user experience with dedicated topic selection panel
- **Responsive Design**: Optimized for all device sizes with contemporary styling
- **Performance Optimization**: Efficient data loading and smooth interactions
