"use client";
import React, { useState, useRef, useEffect } from "react";

const QUESTIONS = [
  "Please introduce yourself.",
  "Why are you interested in this position?",
  "Describe a time you solved a problem.",
  "What is your greatest strength?",
  "Where do you see yourself in 5 years?",
];

// Removed unused type declarations and variables

export default function Interview() {
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<null | unknown>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  // Store all answers for the interview
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  // Store candidate info
  const [candidateName, setCandidateName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (started) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setVideoStream(stream);
        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(() => {});
    }
    setSpeechSupported(!!(window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || !!(window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [started]);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const startRecording = async () => {
    setTranscript('');
    setRecording(true);
    if (speechSupported) {
      const win = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;
      let fullTranscript = '';
      recognition.onresult = (event: { resultIndex: number; results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullTranscript.trim());
      };
      recognition.onerror = () => {
        setTranscript('Could not transcribe audio.');
      };
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
  };

  const reanswer = () => {
    setTranscript('');
    setRecording(false);
  };

  const nextQuestion = async () => {
    if (step < QUESTIONS.length - 1) {
      setAllAnswers([...allAnswers, transcript]);
      setStep((prev) => prev + 1);
      setTranscript('');
      setRecording(false);
    } else {
      // Interview finished, save answers to Supabase
      const finalAnswers = [...allAnswers, transcript];
      setFinished(true);
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
      // Save candidate info and answers
      if (candidateName && candidateId) {
        setSubmitStatus('Submitting interview...');
        try {
          const res = await fetch('/api/interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate: candidateName, candidateId, answers: finalAnswers })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setSubmitStatus('Interview submitted successfully!');
          } else {
            setSubmitStatus('Submission failed: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          setSubmitStatus('Submission failed: ' + ((err as Error).message || 'Unknown error'));
        }
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-purple-100 p-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">AI Video Interview</h2>
        {!started ? (
          <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={e => { e.preventDefault(); setStarted(true); }}>
            <label className="text-gray-700 font-medium">
              Candidate Name
              <input type="text" className="border p-2 w-full rounded mt-1" value={candidateName} onChange={e => setCandidateName(e.target.value)} required />
            </label>
            <label className="text-gray-700 font-medium">
              Candidate ID
              <input type="text" className="border p-2 w-full rounded mt-1" value={candidateId} onChange={e => setCandidateId(e.target.value)} required />
            </label>
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition">Start Interview</button>
          </form>
        ) : (
          <>
            {started && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="mb-4 w-80 h-60 rounded-lg border bg-black"
                style={{ backgroundColor: 'black' }}
              />
            )}
            {!finished ? (
              <>
                <div className="mb-4 text-lg text-gray-700 font-medium">
                  {QUESTIONS[step]}
                </div>
                <div className="flex gap-4 mb-4">
                  {!recording && (
                    <button
                      onClick={startRecording}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition"
                    >
                      Start Answer
                    </button>
                  )}
                  {recording && (
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition"
                    >
                      Stop Answer
                    </button>
                  )}
                </div>
                {loading && (
                  <div className="mb-4 text-gray-500">Processing...</div>
                )}
                {transcript && (
                  <div className="mb-4 w-full">
                    <label className="block text-gray-700 mb-1">Transcript (edit if needed):</label>
                    <textarea
                      className="border p-2 rounded w-full text-gray-900 bg-gray-100"
                      rows={4}
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                    />
                  </div>
                )}
                {transcript && (
                  <div className="flex gap-4 mb-4">
                    <button onClick={reanswer} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 transition">Reanswer</button>
                    <button onClick={nextQuestion} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Next Question</button>
                  </div>
                )}
                {!speechSupported && (
                  <div className="text-sm text-red-600 mt-2">
                    Speech-to-text is not supported in this browser.
                  </div>
                )}
              </>
            ) : (
              <div className="text-lg text-purple-700 font-bold">
                Thank you! Your interview is complete.<br />
                We appreciate your time and responses.<br />
                <span className="block mt-4 text-base text-gray-700">{submitStatus}</span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
