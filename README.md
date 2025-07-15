# Yale Knowledge Graph Explorer

A React application that helps Yale faculty discover potential collaborators through topic-based search. Built with TypeScript, Tailwind CSS, and Supabase.

## Features

- **Topic-based Faculty Search**: Select 1-3 research topics to find relevant faculty
- **Smart Relevance Scoring**: Rank faculty by topic overlap and expertise breadth
- **Faculty Profiles**: Detailed views with research interests and contact information
- **Bridge Connectors**: Identify faculty with diverse expertise across multiple domains
- **Search Expansion**: Discover related topics based on faculty research patterns
- **Analytics Tracking**: Monitor popular topic combinations and search patterns

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Visualization**: Recharts for data visualization
- **Deployment**: Vercel

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
│   ├── TopicSelector.tsx
│   ├── FacultyResults.tsx
│   └── FacultyProfile.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # Static data files
└── App.tsx             # Main application component

supabase/
└── schema.sql          # Database schema

scripts/
└── migrate-data.ts     # Data migration script
```

## Data Model

The application uses three main tables:

### Faculty Table
- Personal information (name, email, title, department)
- Research interest scores (0-5 scale) across 21 topics
- Calculated fields for expertise breadth and bridge connector status

### Research Topics Table
- Topic definitions with categories and descriptions
- Color coding for UI visualization

### User Searches Table
- Analytics tracking for topic combinations and search patterns

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

## Support

For questions or issues, please contact the Yale Planetary Solutions team or create an issue in this repository.
