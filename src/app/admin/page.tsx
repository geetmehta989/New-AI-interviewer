"use client";
import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? <AdminDashboard /> : <AdminLogin onLogin={() => setLoggedIn(true)} />;
}
