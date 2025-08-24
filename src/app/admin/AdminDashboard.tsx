"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminDashboard() {
  const [responses, setResponses] = useState<{ id: number; candidate: string; candidateId: string; answers: string[]; score?: string; feedback?: string }[]>([]);
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
          <button className="bg-green-600 text-white px-4 py-1 rounded mb-2" onClick={handleEvaluate}>Get AI Feedback</button>
          {feedback && <div className="mb-2 text-green-700">{feedback}</div>}
          <input type="text" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="border p-2 rounded mb-2 text-gray-900 bg-gray-100" />
          <button className="bg-purple-600 text-white px-4 py-1 rounded" onClick={handleSaveScore}>Save Score</button>
        </div>
      )}
    </div>
  );
}
