"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { supabase } from '@/utils/supabaseClient';

const QUESTIONS = [
  "Please introduce yourself.",
  "Why are you interested in this position?",
  "Describe a time you solved a problem.",
  "What is your greatest strength?",
  "Where do you see yourself in 5 years?",
];

// Removed unused type declarations and variables

export default function Interview() {
  // ...existing code...
  // Start/stop recording handlers for transcript
  const startRecording = () => {
    setTranscript("");
    setRecording(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop(); // Stop any previous session
      } catch {}
        setTranscript('');
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch {}
        }, 200);
    }
  };
  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    // No need to re-initialize recognition for next question
    }
  };
  // Speech recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
      };
      recognitionRef.current.onerror = () => {
        // Optionally handle error
      };
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Start/stop recording handlers
  // Scorecard state
  const [scorecard, setScorecard] = useState<string | null>(null);
  // Interview state variables
  // Only AI interview mode
  const [jd, setJD] = useState('');
  const [resume, setResume] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>(QUESTIONS);
  // Removed unused meetLink state
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [allTranscripts, setAllTranscripts] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Automatically speak question when it changes
  useEffect(() => {
    if (started && generatedQuestions[step]) {
      speak(generatedQuestions[step]);
    }
  }, [step, generatedQuestions, started]);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          videoRef.current!.srcObject = stream;
        })
        .catch(() => {
          // Optionally handle camera error
        });
    }
  }, []);
  // AI voice
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  // Handler stubs
  const reanswer = () => {
    setTranscript('');
    setRecording(false);
  };
  const nextQuestion = () => {
    if (step < generatedQuestions.length - 1) {
      setAllTranscripts(prev => {
        const updated = [...prev];
        updated[step] = transcript;
        return updated;
      });
      setStep(step + 1);
      setTranscript('');
      setRecording(false);
    } else {
      setAllTranscripts(prev => {
        const updated = [...prev];
        updated[step] = transcript;
        return updated;
      });
      setFinished(true);
      setSubmitStatus('Interview submitted!');
      // Call evaluation API and save everything to Supabase
      (async () => {
        try {
          const answers = [...allTranscripts.slice(0, step), transcript];
          const questions = generatedQuestions;
          const evalRes = await axios.post('/api/evaluate-azure', {
            jd,
            resume,
            questions,
            answers,
          });
          const scorecard = evalRes.data.scorecard || '';
          setScorecard(scorecard);
          // Save interview to Supabase
          const { error } = await supabase
            .from('interviews')
            .insert([
              {
                candidate: candidateName,
                candidateId,
                jd,
                resume,
                questions,
                answers,
                scorecard,
              }
            ]);
          if (error) {
            setSubmitStatus('Interview submitted, but failed to save to Supabase.');
          }
        } catch {
          setScorecard('Evaluation failed.');
        }
      })();
    }
  };
  // Only one return statement below
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-purple-100 p-8 text-black">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col items-center text-black">
        <h2 className="text-2xl font-bold mb-4 text-black">AI Video Interview</h2>
  {/* Only AI Interview Mode - no selection */}
        {/* JD/Resume input and Candidate info - hide after interview starts */}
        {!started && (
          <>
            <div className="mb-4 w-full">
              <label className="block font-semibold mb-1">Job Description (JD):</label>
              <textarea value={jd} onChange={e => setJD(e.target.value)} className="border p-2 rounded w-full mb-2" rows={3} placeholder="Paste job description here..." />
              <label className="block font-semibold mb-1">Candidate Resume:</label>
              <textarea value={resume} onChange={e => setResume(e.target.value)} className="border p-2 rounded w-full" rows={3} placeholder="Paste candidate resume here..." />
            </div>
            <div className="mb-4 w-full">
              <input type="text" placeholder="Candidate Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} className="border p-2 rounded w-full mb-2" />
              <input type="text" placeholder="Candidate ID" value={candidateId} onChange={e => setCandidateId(e.target.value)} className="border p-2 rounded w-full" />
            </div>
          </>
        )}
  {/* Human Interview Mode removed */}
        {/* Camera is always visible */}
        <div className="w-full mb-4 flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="mb-4 w-80 h-60 rounded-lg border bg-black"
            style={{ backgroundColor: 'black' }}
          />
        </div>
        {/* AI Interview Mode (existing workflow, but use generatedQuestions) */}
  {!started && (
          <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={async e => {
            e.preventDefault();
            // Fetch questions from Azure GPT
            try {
              console.log('Sending JD:', jd);
              console.log('Sending Resume:', resume);
              const res = await axios.post('/api/generate-questions-azure', { jd, resume });
              console.log('Questions received from API:', res.data.questions);
              if (res.data.questions && res.data.questions.length > 0) {
                setGeneratedQuestions(res.data.questions);
              }
            } catch {
              setGeneratedQuestions(QUESTIONS);
            }
            setStarted(true);
          }}>
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition">Start Interview</button>
          </form>
        )}
  {started && (
          <div className="w-full">
            {!finished ? (
              <div>
                <div className="mb-4 text-lg text-gray-700 font-medium">
                  {generatedQuestions[step]}
                  <button
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                    type="button"
                    onClick={() => speak(generatedQuestions[step])}
                  >🔊 Repeat Question</button>
                </div>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={recording ? "bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition" : "bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition"}
                  >
                    {recording ? "Stop Answer" : "Start Answer"}
                  </button>
                </div>
                {/* Always show transcript and controls after recording stops */}
                {!recording && (
                  <>
                    <div className="mb-4 w-full">
                      <label className="block text-gray-700 mb-1">Transcript (edit if needed):</label>
                      <textarea
                        className="border p-2 rounded w-full text-gray-900 bg-gray-100"
                        rows={4}
                        value={transcript}
                        onChange={e => setTranscript(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4 mb-4">
                      <button onClick={reanswer} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 transition">Reanswer</button>
                      <button 
                        onClick={nextQuestion} 
                        className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition${!transcript ? ' opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!transcript}
                      >Next Question</button>
                    </div>
                  </>
                )}
                {!speechSupported && (
                  <div className="text-sm text-red-600 mt-2">
                    Speech-to-text is not supported in this browser.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-green-700 font-bold text-lg mt-4">Interview finished! {submitStatus}</div>
                {scorecard && (
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
                    <h3 className="text-xl font-bold mb-2 text-purple-700">AI Evaluation</h3>
                    <div className="text-lg font-bold text-green-700">Score: {typeof scorecard === 'object' ? scorecard.score : JSON.parse(scorecard || '{}').score}/10</div>
                    <div className="text-gray-800 mt-2">Feedback: {typeof scorecard === 'object' ? scorecard.feedback : JSON.parse(scorecard || '{}').feedback}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
