# AI Video Interview and Evaluation

This project is a Next.js application for conducting and evaluating AI-powered video interviews. It features:
- Automated interview workflow with webcam and voice transcription
- Editable transcript and reanswer option for candidates
- Admin dashboard for reviewing, scoring, and evaluating interviews
- Supabase integration for storing candidate responses

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Add your Supabase credentials to `.env.local`
4. Create the `interviews` table in Supabase with columns: `id`, `candidate`, `candidateId`, `answers`
5. Run the app: `npm run dev`

## Security
- Do not commit `.env.local` or any secrets to the repository
- Enable Row Level Security in Supabase and add appropriate policies

## License
MIT
