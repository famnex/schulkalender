import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, UserPlus, Check, X } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', email: '', isAdmin: false });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', { ...newUser, authMethod: 'local', isApproved: true });
            setNewUser({ username: '', password: '', email: '', isAdmin: false });
            loadUsers();
        } catch (err) {
            alert('Fehler beim Erstellen');
        }
    };

    const handleDelete = async (id) => {
        // Prevent self-delete
        // We need current user ID. 
        // Ideally we get it from auth context or decode token here, but api request to /me is safer or check list.
        // Let's rely on backend check or simple frontend check if we had current user.
        // For now, let's look at the list logic or backend.
        // Backend is safer. But frontend UX is good too.
        if (!window.confirm('Benutzer wirklich löschen?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            loadUsers();
        } catch (err) {
            alert('Fehler beim Löschen: ' + (err.response?.data?.error || 'Unbekannt'));
        }
    };

    const toggleAdmin = async (user) => {
        try {
            await api.put(`/admin/users/${user.id}`, { isAdmin: !user.isAdmin });
            loadUsers();
        } catch (err) {
            alert('Fehler beim Update: ' + (err.response?.data?.error || 'Unbekannt'));
        }
    };

    const toggleApproved = async (user) => {
        try {
            await api.put(`/admin/users/${user.id}`, { isApproved: !user.isApproved });
            loadUsers();
        } catch (err) {
            alert('Fehler beim Update');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow sm:overflow-hidden">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Neuen Benutzer anlegen</h3>
                <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Benutzername</label>
                        <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                        <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passwort</label>
                        <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 p-2" />
                    </div>
                    <div className="flex items-center mb-2">
                        <input type="checkbox" id="isAdmin" checked={newUser.isAdmin} onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                        <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Admin?</label>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 mb-0.5"><UserPlus size={16} /> Anlegen</button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                    {users.map(user => (
                        <li key={user.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-primary dark:text-blue-400">{user.username}</div>
                                <div className="text-xs text-gray-500">{user.email} | Auth: {user.authMethod}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleAdmin(user)} className={`text-xs px-2 py-1 rounded border ${user.isAdmin ? 'bg-purple-100 text-purple-800 border-purple-200' : 'text-gray-500 border-gray-200'}`}>
                                    {user.isAdmin ? 'Admin' : 'User'}
                                </button>
                                <button onClick={() => toggleApproved(user)} className={`text-xs px-2 py-1 rounded border ${user.isApproved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                    {user.isApproved ? 'Aktiv' : 'Gesperrt'}
                                </button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminUsers;
