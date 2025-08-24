import { supabase } from '@/utils/supabaseClient';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { candidate, answers } = await req.json();
  const { data, error } = await supabase.from('interviews').insert([{ candidate, answers }]);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ success: true, data });
}

export async function GET() {
  const { data, error } = await supabase.from('interviews').select('*');
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ data });
}
