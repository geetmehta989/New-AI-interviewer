"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminDashboard() {
  const [responses, setResponses] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function fetchResponses() {
      const { data, error } = await supabase.from('interviews').select('*');
      if (!error && data) setResponses(data);
    }
    fetchResponses();
  }, []);

  const handleEvaluate = () => {
    setFeedback('AI Feedback: Candidate shows strong problem-solving skills.');
    setScore('8/10');
  };

  const handleSaveScore = () => {
    if (selected !== null) {
      setResponses(responses.map(r => r.id === selected ? { ...r, score, feedback } : r));
      setSelected(null);
      setScore('');
      setFeedback('');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Admin Dashboard</h2>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Candidate Interviews</h3>
        <ul className="divide-y">
          {responses.map(r => (
            <li key={r.id} className="py-2 flex justify-between items-center">
              <span>{r.candidate} ({r.candidateId})</span>
              <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => setSelected(r.id)}>Evaluate</button>
              {r.score && <span className="ml-4 text-green-700 font-bold">Score: {r.score}</span>}
            </li>
          ))}
        </ul>
      </div>
      {selected !== null && (
        <div className="bg-gray-50 p-4 rounded mb-8">
          <h4 className="font-bold mb-2 text-gray-900 bg-gray-100 rounded px-2 py-1">Answers</h4>
          <ul className="mb-4">
            {Array.isArray(responses.find(r => r.id === selected)?.answers) && responses.find(r => r.id === selected)?.answers.map((a: string, i: number) => (
              <li key={i} className="mb-1 text-gray-800 bg-gray-100 rounded px-2 py-1">Q{i+1}: {a}</li>
            ))}
          </ul>
          {/* Show AI scorecard if available */}
          {responses.find(r => r.id === selected)?.scorecard && (
            (() => {
              let score = null;
              let feedback = '';
              const raw = responses.find(r => r.id === selected)?.scorecard;
              if (typeof raw === 'object' && raw !== null) {
                score = raw.score;
                feedback = raw.feedback;
              } else {
                try {
                  const parsed = JSON.parse(raw);
                  score = parsed.score;
                  feedback = parsed.feedback;
                } catch {
                  // fallback: try to extract score and feedback from plain text
                  const scoreMatch = /score\s*[:=]\s*(\d+)/i.exec(raw);
                  score = scoreMatch ? scoreMatch[1] : '';
                  feedback = raw;
                }
              }
              return (
                <div className="mb-4 p-3 bg-gray-100 rounded border">
                  <div className="font-bold text-purple-700">AI Scorecard</div>
                  <div className="text-lg font-bold text-green-700">Score: {score}/10</div>
                  <div className="text-gray-800 mt-2">Feedback: {feedback}</div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
