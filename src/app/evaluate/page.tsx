"use client";
import React, { useState } from 'react';

export default function EvaluateResponses() {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    setError('');
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.feedback || 'Error evaluating response.');
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-green-100 p-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Evaluate Candidate Response</h2>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleEvaluate}>
          <label className="text-gray-700 font-medium">
            Candidate Response
            <textarea className="border p-2 w-full rounded mt-1" rows={6} value={response} onChange={e => setResponse(e.target.value)} required />
          </label>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition" disabled={loading}>
            {loading ? 'Evaluating...' : 'Evaluate'}
          </button>
        </form>
        {feedback && (
          <div className="mt-6 p-4 border rounded bg-green-50 w-full text-center">
            <p className="text-green-700">{feedback}</p>
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
