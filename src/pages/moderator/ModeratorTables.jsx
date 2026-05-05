import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import AuraCard from '../../components/AuraCard';
import { MapPin, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, QrCode, Clock, X, Zap, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const ModeratorTables = () => {
   const { socket } = useSocket();
   const [tables, setTables] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeActivities, setActiveActivities] = useState([]);
   const [showActivateModal, setShowActivateModal] = useState(false);
   const [selectedTable, setSelectedTable] = useState(null);
   const [activationData, setActivationData] = useState({ sessionType: 'direct_match', matchId: '', duration: 60 });

   const fetchTables = async () => {
      try {
         const { data } = await api.get('/tables');
         setTables(data || []);
      } catch (err) {
         toast.error('Failed to load tables');
      } finally {
         setLoading(false);
      }
   };

   const fetchActivities = async () => {
      try {
         const { data } = await api.get('/moderator/ongoing');
         setActiveActivities(data || []);
      } catch (err) {
         console.error('Failed to load activities');
      }
   };

   useEffect(() => {
      fetchTables();
      fetchActivities();

      if (socket) {
         socket.on('TABLE_UPDATE', (data) => {
            setTables(prev => prev.map(t => t.id === data.tableId ? { ...t, status: data.status } : t));
         });
      }

      return () => {
         if (socket) {
            socket.off('TABLE_UPDATE');
         }
      };
   }, [socket]);

   const handleActivateTable = async (e) => {
      e.preventDefault();
      if (!activationData.matchId) return toast.error('Please select a match');

      const tid = toast.loading('Sending activation command...');
      try {
         await api.post(`/tables/${selectedTable.id}/activate`, activationData);
         toast.success('Table activated!', { id: tid });
         setShowActivateModal(false);
         fetchTables();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to activate table', { id: tid });
      }
   };

   const handleLockTable = async (id) => {
      const tid = toast.loading('Sending lock command...');
      try {
         await api.post(`/tables/${id}/lock`);
         toast.success('Table locked', { id: tid });
         fetchTables();
      } catch (err) {
         toast.error('Failed to lock table', { id: tid });
      }
   };

   const handleSendMessage = async (id) => {
      const message = prompt('Enter message to display on table:');
      if (!message) return;

      try {
         await api.post(`/tables/${id}/display-message`, { message });
         toast.success('Message sent');
      } catch (err) {
         toast.error('Failed to send message');
      }
   };

   if (loading) {
      return (
         <DashboardLayout title="Table Management">
            <div className="flex items-center justify-center h-64">
               <Loader2 className="animate-spin text-primary" size={32} />
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout title="Physical Tables">
         <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tables.map(table => (
                  <AuraCard key={table.id} className={`p-6 border-2 transition-all ${table.status === 'occupied' ? 'border-primary/40 bg-primary/5' : 'border-base2 bg-base3/20'}`}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${table.status === 'occupied' ? 'bg-primary text-base3' : 'bg-base2 text-text/40'}`}>
                              <MapPin size={20} />
                           </div>
                           <div>
                              <h4 className="font-black text-text-emphasis leading-none">Table {table.tableNumber || table.id}</h4>
                              <p className="text-[10px] font-bold text-text/40 uppercase mt-1">{table.name}</p>
                           </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border ${table.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           table.status === 'occupied' ? 'bg-primary/10 text-primary border-primary/20' :
                              'bg-red-50 text-red-600 border-red-100'
                           }`}>
                           {table.status}
                        </div>
                     </div>

                     <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                           <span className="text-text/40 uppercase">Hardware Status</span>
                           <span className={`flex items-center gap-1 ${table.device?.status === 'online' ? 'text-emerald-500' : 'text-red-500'}`}>
                              <Zap size={10} fill="currentColor" />
                              {table.device?.status || 'offline'}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                           <span className="text-text/40 uppercase">Last Pulse</span>
                           <span className="text-text/60 italic">
                              {table.device?.lastSeenAt ? new Date(table.device.lastSeenAt).toLocaleTimeString() : 'Never'}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                        {table.status === 'available' ? (
                           <button
                              onClick={() => { setSelectedTable(table); setShowActivateModal(true); }}
                              className="aura-btn bg-primary text-base3 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5"
                           >
                              <Zap size={14} /> Activate
                           </button>
                        ) : (
                           <button
                              onClick={() => handleLockTable(table.id)}
                              className="aura-btn bg-red text-base3 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5"
                           >
                              <X size={14} /> Lock Table
                           </button>
                        )}
                        <button
                           onClick={() => handleSendMessage(table.id)}
                           className="aura-btn bg-base2 text-text-emphasis py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1.5"
                        >
                           <MessageSquare size={14} /> Message
                        </button>
                     </div>
                  </AuraCard>
               ))}
            </div>
         </div>

         {showActivateModal && (
            <div className="fixed inset-0 bg-base3/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <AuraCard className="w-full max-w-md p-8 relative">
                  <button onClick={() => setShowActivateModal(false)} className="absolute top-4 right-4 text-text/40 hover:text-text-emphasis">
                     <X size={24} />
                  </button>
                  <h3 className="text-xl font-black text-text-emphasis uppercase tracking-tight mb-6">Activate Table {selectedTable?.tableNumber}</h3>
                  <form onSubmit={handleActivateTable} className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-black uppercase text-text/40 mb-1.5 ml-1">Session Type</label>
                        <select
                           value={activationData.sessionType}
                           onChange={(e) => setActivationData({ ...activationData, sessionType: e.target.value })}
                           className="w-full bg-base2/20 border border-base2 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                        >
                           <option value="direct_match">Direct Match</option>
                           <option value="tournament">Tournament Match</option>
                           <option value="manual_test">Manual Test</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-text/40 mb-1.5 ml-1">Select Match/Activity</label>
                        <select
                           value={activationData.matchId}
                           onChange={(e) => {
                              const match = activeActivities.find(a => a.id === e.target.value);
                              setActivationData({
                                 ...activationData,
                                 matchId: e.target.value,
                                 playerName: match?.player1?.fullName || match?.player1Id?.fullName
                              });
                           }}
                           className="w-full bg-base2/20 border border-base2 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                        >
                           <option value="">-- Choose Activity --</option>
                           {activeActivities.map(act => (
                              <option key={act.id} value={act.id}>
                                 {act.type.toUpperCase()}: {act.player1?.fullName || act.player1Id?.fullName} vs {act.player2?.fullName || act.player2Id?.fullName}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-text/40 mb-1.5 ml-1">Duration (Minutes)</label>
                        <input
                           type="number"
                           value={activationData.duration}
                           onChange={(e) => setActivationData({ ...activationData, duration: e.target.value })}
                           className="w-full bg-base2/20 border border-base2 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                        />
                     </div>
                     <button type="submit" className="aura-btn w-full bg-primary text-base3 py-4 rounded-xl font-black uppercase tracking-widest mt-4">
                        Confirm & Unlock
                     </button>
                  </form>
               </AuraCard>
            </div>
         )}
      </DashboardLayout>
   );
};

export default ModeratorTables;
