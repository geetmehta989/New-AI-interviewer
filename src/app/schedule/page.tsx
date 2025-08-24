"use client";
import React, { useState } from 'react';

export default function ScheduleInterview() {
  const [candidate, setCandidate] = useState('');
  const [link, setLink] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLink('');
    try {
      const res = await fetch('/api/gmeet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, platform: 'Google Meet' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.link || 'Error creating meeting.');
      setLink(data.link);
      setScheduled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Schedule Interview</h2>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSchedule}>
          <label className="text-gray-700 font-medium">
            Candidate Name
            <input type="text" className="border p-2 w-full rounded mt-1" value={candidate} onChange={e => setCandidate(e.target.value)} required />
          </label>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Google Meet Interview'}
          </button>
        </form>
        {scheduled && link && (
          <div className="mt-6 p-4 border rounded bg-blue-50 w-full text-center">
            <p className="mb-2 text-blue-700">Interview scheduled for <strong>{candidate}</strong> on <strong>Google Meet</strong>.</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Join Interview</a>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 border rounded bg-red-100 text-red-700 w-full text-center">
            <p>{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
