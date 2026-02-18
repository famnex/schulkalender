import React, { useState } from 'react';
import { Users, Settings, Database, Calendar, Tag, ShieldCheck, ArrowUpCircle } from 'lucide-react';
import AdminUsers from './AdminUsers';
import AdminGeneral from './AdminGeneral';
import AdminLdap from './AdminLdap';
import AdminCalendars from './AdminCalendars';
import AdminTags from './AdminTags';
import AdminSync from './AdminSync';
import AdminUpdate from './AdminUpdate';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('sync');

    const renderTab = () => {
        switch (activeTab) {
            case 'sync': return <AdminSync />;
            case 'users': return <AdminUsers />;
            case 'ldap': return <AdminLdap />;
            case 'calendars': return <AdminCalendars />;
            case 'tags': return <AdminTags />;
            case 'general': return <AdminGeneral />;
            case 'update': return <AdminUpdate />;
            default: return null;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Administration</h1>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-slate-700 pb-1 overflow-x-auto">
                <TabButton id="sync" label="Sync & Status" icon={<Database size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="users" label="Benutzer" icon={<Users size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="ldap" label="LDAP / AD" icon={<ShieldCheck size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="calendars" label="Kalender" icon={<Calendar size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="tags" label="Tags" icon={<Tag size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="general" label="Einstellungen" icon={<Settings size={18} />} active={activeTab} onClick={setActiveTab} />
                <TabButton id="update" label="Update" icon={<ArrowUpCircle size={18} />} active={activeTab} onClick={setActiveTab} />
            </div>

            <div className="min-h-[400px]">
                {renderTab()}
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${active === id
            ? 'border-primary text-primary bg-blue-50 dark:bg-slate-700 dark:text-blue-400 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default AdminDashboard;
