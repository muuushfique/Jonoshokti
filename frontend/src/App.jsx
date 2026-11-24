import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import ReportsPage from './pages/ReportsPage';
import CommunityServicePage from './pages/CommunityServicePage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/current-issues" element={<IssuesPage category="current" />} />
        <Route path="/govt-issues" element={<IssuesPage category="govt" />} />
        <Route path="/solved-issues" element={<IssuesPage category="solved" />} />
        <Route path="/issues/:source/:id" element={<IssueDetailsPage />} />
        <Route path="/govtissuedetails/:id" element={<IssueDetailsPage defaultSource="govt" />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/community-service" element={<CommunityServicePage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
