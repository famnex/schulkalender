import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

const AdminCalendars = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null); // { id, title, shortName, icsUrl, color }
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item || {});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            if (editingItem.id) await api.put(`/admin/categories/${editingItem.id}`, editingItem);
            else await api.post('/admin/categories', editingItem);
            closeModal();
            loadData();
        } catch (err) {
            alert('Fehler: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Wirklich löschen?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            loadData();
        } catch (err) {
            alert('Fehler beim Löschen');
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Kalender / Kategorien</h3>
                <button onClick={() => openModal()} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    <PlusIcon className="h-4 w-4" /> Neu
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kürzel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICS URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farbe</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cat.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.shortName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{cat.icsUrl}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                    {cat.color}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSaveItem} className="p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Kategorie bearbeiten/erstellen
                                </h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel</label>
                                        <input type="text" required value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kürzel (Short Name)</label>
                                        <input type="text" value={editingItem.shortName || ''} onChange={e => setEditingItem({ ...editingItem, shortName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ICS URL</label>
                                        <input type="text" required value={editingItem.icsUrl || ''} onChange={e => setEditingItem({ ...editingItem, icsUrl: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Farbe</label>
                                        <input type="color" value={editingItem.color || '#000000'} onChange={e => setEditingItem({ ...editingItem, color: e.target.value })} className="mt-1 block h-10 w-full border-gray-300 rounded-md shadow-sm p-1" />
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm">
                                        Speichern
                                    </button>
                                    <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                                        Abbrechen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendars;
