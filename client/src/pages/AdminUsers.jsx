import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, UserPlus, Check, X, Search } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: 'user' });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
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
            await api.post('/admin/users', { 
                ...newUser, 
                isAdmin: newUser.role === 'admin',
                authMethod: 'local', 
                isApproved: true 
            });
            setNewUser({ username: '', password: '', email: '', role: 'user' });
            loadUsers();
        } catch (err) {
            alert('Fehler beim Erstellen');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Benutzer wirklich löschen?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            loadUsers();
        } catch (err) {
            alert('Fehler beim Löschen: ' + (err.response?.data?.error || 'Unbekannt'));
        }
    };

    const handleRoleChange = async (user, newRole) => {
        try {
            await api.put(`/admin/users/${user.id}`, { 
                role: newRole, 
                isAdmin: newRole === 'admin' 
            });
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

    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const effectiveRole = user.isAdmin ? 'admin' : (user.role || 'user');
        const usernameMatch = user.username?.toLowerCase().includes(term);
        const displayNameMatch = user.displayName?.toLowerCase().includes(term);
        const emailMatch = user.email?.toLowerCase().includes(term);
        const roleMatch = effectiveRole.toLowerCase().includes(term);
        return usernameMatch || displayNameMatch || emailMatch || roleMatch;
    });

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rolle</label>
                        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-slate-700 p-2 text-sm">
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 mb-0.5"><UserPlus size={16} /> Anlegen</button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow sm:rounded-md overflow-hidden">
                {/* Search Bar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Benutzer suchen (Name, Username, E-Mail, Rolle)..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'Benutzer' : 'Benutzer'}
                    </div>
                </div>

                <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredUsers.length === 0 ? (
                        <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Keine Benutzer gefunden.
                        </li>
                    ) : (
                        filteredUsers.map(user => {
                            const currentRole = user.isAdmin ? 'admin' : (user.role || 'user');
                            return (
                                <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div>
                                        <div className="text-sm font-medium text-primary dark:text-blue-400">
                                            {user.displayName ? `${user.displayName} (${user.username})` : user.username}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.email || 'Keine E-Mail'} | Auth: <span className="uppercase">{user.authMethod}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select 
                                            value={currentRole} 
                                            onChange={(e) => handleRoleChange(user, e.target.value)}
                                            className={`text-xs px-2.5 py-1 rounded-md font-semibold border cursor-pointer ${
                                                currentRole === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800' 
                                                    : currentRole === 'manager'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                                            }`}
                                        >
                                            <option value="user">User</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <button onClick={() => toggleApproved(user)} className={`text-xs px-2.5 py-1 rounded-md font-medium border ${user.isApproved ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
                                            {user.isApproved ? 'Aktiv' : 'Gesperrt'}
                                        </button>
                                        
                                        <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors" title="Benutzer löschen"><Trash2 size={18} /></button>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminUsers;
