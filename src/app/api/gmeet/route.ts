import { NextRequest } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export async function POST(req: NextRequest) {
  const { candidate, platform } = await req.json();
  if (platform !== 'Google Meet') {
    return Response.json({ link: 'Platform not supported for auto-generation.' }, { status: 400 });
  }
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !GOOGLE_REFRESH_TOKEN) {
    return Response.json({ link: 'Google API credentials not configured.' }, { status: 500 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
      summary: `Interview with ${candidate}`,
      start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      end: { dateTime: new Date(Date.now() + 7200000).toISOString() },
      conferenceData: {
        createRequest: { requestId: `${Date.now()}` },
      },
    };
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });
    const meetLink = res.data.conferenceData?.entryPoints?.find((ep: { entryPointType: string; uri: string }) => ep.entryPointType === 'video')?.uri;
    return Response.json({ link: meetLink || 'No Meet link generated.' });
  } catch {
    return Response.json({ link: 'Error creating Google Meet link.' }, { status: 500 });
  }
}
