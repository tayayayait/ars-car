import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { Simulator } from './components/Simulator';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Account } from './components/Account';
import { AdminUsers } from './components/AdminUsers';

function App() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Home onRegisterSuccess={() => navigate('/dashboard')} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminUsers />} />
        <Route path="/simulation" element={<Simulator />} />
      </Routes>
    </Layout>
  );
}

export default App;
