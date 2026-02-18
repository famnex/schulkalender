import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import PrintView from './pages/PrintView';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    if (loading) return null; // Or spinner
    if (!user) return <Navigate to="/login" replace />;
    if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/print" element={<PrintView />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login />} />

                        <Route path="admin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
