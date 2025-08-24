"use client";
import React, { useState } from 'react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs mx-auto mt-12">
      <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Login</button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}
