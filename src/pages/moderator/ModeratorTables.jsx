import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import AuraCard from '../../components/AuraCard';
import { MapPin, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, QrCode, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ModeratorTables = () => {
   const [tables, setTables] = useState([]);
   const [loading, setLoading] = useState(true);
   const [adding, setAdding] = useState(false);
   const [newTable, setNewTable] = useState({ location: '', number: '' });

   const fetchTables = async () => {
      try {
         const { data } = await api.get('/users/me/tables');
         setTables(data || []);
      } catch (err) {
         toast.error('Failed to load tables');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTables();
   }, []);

   const handleAddTable = async (e) => {
      e.preventDefault();
      if (!newTable.location || !newTable.number) return toast.error('Please fill all fields');

      setAdding(true);
      try {
         // We need a backend endpoint to CREATE a table
         // I'll assume POST /api/users/me/tables
         await api.post('/users/me/tables', {
            tableId: `${newTable.location}/${newTable.number}`,
            location: newTable.location
         });
         toast.success('Table registered successfully!');
         setNewTable({ location: '', number: '' });
         fetchTables();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to register table');
      } finally {
         setAdding(false);
      }
   };

   const handleDeleteTable = async (id) => {
      if (!window.confirm('Are you sure you want to remove this table?')) return;
      try {
         await api.delete(`/users/me/tables/${id}`);
         toast.success('Table removed');
         fetchTables();
      } catch (err) {
         toast.error('Failed to delete table');
      }
   };

   const handleToggleMaintenance = async (id) => {
      try {
         await api.put(`/users/me/tables/${id}/maintenance`);
         toast.success('Maintenance status updated');
         fetchTables();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to update maintenance status');
      }
   };

   if (loading) {
      return (
         <DashboardLayout title="Manage Pool Tables">
            <div className="flex items-center justify-center h-64">
               <Loader2 className="animate-spin text-primary" size={32} />
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout title="Tables">
         <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <AuraCard className="p-8 border-none perspective-1000">
               <h3 className="text-xl font-bold flex items-center gap-2 border-b border-base2 pb-4 text-text-emphasis mb-6">
                  <Plus size={20} className="text-primary" />
                  Register New Physical Table
               </h3>
               <form onSubmit={handleAddTable} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-text/60 mb-1.5 ml-1">Location / Venue</label>
                     <input
                        type="text"
                        placeholder="e.g. Westlands"
                        value={newTable.location}
                        onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                        className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-text/60 mb-1.5 ml-1">Table Number</label>
                     <input
                        type="text"
                        placeholder="e.g. 01"
                        value={newTable.number}
                        onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                        className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                     />
                  </div>
                  <div className="flex items-end">
                     <button
                        disabled={adding}
                        className="aura-btn w-full bg-primary text-base3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                     >
                        {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        Add Table
                     </button>
                  </div>
               </form>
               <p className="mt-4 text-[10px] text-text/40 font-bold italic">
                  * Unique ID will be generated as: {newTable.location || 'Location'}/{newTable.number || '00'}
               </p>
            </AuraCard>

            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary ml-2">Your Physical Infrastructure</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tables.length === 0 ? (
                     <div className="col-span-full py-12 text-center aura-card border-dashed border-2 text-text/40 italic">
                        No tables registered yet. Add your hardware above to enable automated unlocking.
                     </div>
                  ) : (
                     tables.map(table => (
                        <div key={table._id} className="aura-card p-5 flex items-center justify-between group border-none transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                                 <MapPin size={24} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-black text-text-emphasis leading-none mb-1">{table.tableId}</h4>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-text/40 uppercase tracking-tight">{table.location}</span>
                                    <span className="w-1 h-1 rounded-full bg-base2"></span>
                                    {table.status === 'busy' ? (
                                       <span className="text-[10px] font-bold text-orange uppercase flex items-center gap-1 bg-orange/10 px-2 py-0.5 rounded-full border border-orange/20">
                                          <Clock size={10} /> Busy (In Game)
                                       </span>
                                    ) : table.status === 'maintenance' ? (
                                       <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                          <AlertCircle size={10} /> Maintenance
                                       </span>
                                    ) : (
                                       <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                          <CheckCircle2 size={10} /> {new Date() - new Date(table.lastPulse) < 600000 ? 'IoT Online' : 'IoT Idle'}
                                       </span>
                                    )}
                                 </div>
                                 <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[9px] text-text/30 font-bold uppercase">Health: </span>
                                    <div className={`w-2 h-2 rounded-full ${new Date() - new Date(table.lastPulse) < 300000 ? 'bg-green animate-pulse' : 'bg-red/50'}`}></div>
                                    <span className="text-[9px] text-text/40">{table.lastPulse ? `Seen ${new Date(table.lastPulse).toLocaleTimeString()}` : 'Never seen'}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                 onClick={() => handleToggleMaintenance(table._id)}
                                 className={`p-2 rounded-lg transition-all active:scale-95 ${
                                    table.status === 'maintenance' ? 'bg-red text-white shadow-sm' : 'text-text/40 hover:text-red hover:bg-red/5'
                                 }`}
                                 title={table.status === 'maintenance' ? 'Restore Table' : 'Mark for Maintenance'}
                              >
                                 <AlertCircle size={18} />
                              </button>
                              <button
                                 className="p-2 text-text/40 hover:text-primary transition-colors active:scale-95"
                                 title="View QR Code/Config"
                              >
                                 <QrCode size={18} />
                              </button>
                              <button
                                 onClick={() => handleDeleteTable(table._id)}
                                 className="p-2 text-text/40 hover:text-red transition-colors active:scale-95"
                                 title="Remove Table"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
               <AlertCircle className="text-amber-600 shrink-0" size={24} />
               <div>
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Hardware Setup Required</h4>
                  <p className="text-xs text-amber-800/80 leading-relaxed">
                     To enable physical ball release, ensure your ESP32/GSM hardware is configured with the Table IDs listed above. The system sends a pulse to the <code>cue-masters/iot/unlock/[TableID]</code> MQTT topic upon fee distribution.
                  </p>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
};

export default ModeratorTables;
