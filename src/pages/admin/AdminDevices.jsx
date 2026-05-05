import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import AuraCard from '../../components/AuraCard';
import { Zap, Shield, Activity, Clock, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDevices = async () => {
        try {
            const { data } = await api.get('/admin/devices');
            setDevices(data || []);
        } catch (err) {
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDeviceEvents = async (id) => {
        setLoadingEvents(true);
        try {
            const { data } = await api.get(`/admin/devices/${id}/events`);
            setEvents(data || []);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/devices/${id}/status`, { status });
            toast.success(`Device marked as ${status}`);
            fetchDevices();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleSync = async (id) => {
        try {
            await api.post(`/admin/devices/${id}/sync`);
            toast.success('Sync command queued');
        } catch (err) {
            toast.error('Failed to queue sync command');
        }
    };

    const filteredDevices = devices.filter(d =>
        d.deviceUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.table?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout title="Device Management">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Hardware Infrastructure">
            <div className="space-y-8 max-w-7xl mx-auto pb-20">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <AuraCard className="p-6 bg-emerald-50/50 border-emerald-100">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-emerald-500 text-base3 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Zap size={20} />
                            </div>
                            <span className="text-2xl font-black text-emerald-600">{devices.filter(d => d.status === 'online').length}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-emerald-600/60 tracking-widest mt-4">Online Devices</p>
                    </AuraCard>
                    <AuraCard className="p-6 bg-red-50/50 border-red-100">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-red-500 text-base3 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Activity size={20} />
                            </div>
                            <span className="text-2xl font-black text-red-600">{devices.filter(d => d.status === 'fault').length}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-red-600/60 tracking-widest mt-4">Faulty Devices</p>
                    </AuraCard>
                    <AuraCard className="p-6 bg-amber-50/50 border-amber-100">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-amber-500 text-base3 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Shield size={20} />
                            </div>
                            <span className="text-2xl font-black text-amber-600">{devices.filter(d => d.status === 'maintenance').length}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest mt-4">Maintenance</p>
                    </AuraCard>
                    <AuraCard className="p-6 bg-blue-50/50 border-blue-100">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-blue-500 text-base3 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <RefreshCw size={20} />
                            </div>
                            <span className="text-2xl font-black text-blue-600">{devices.length}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-blue-600/60 tracking-widest mt-4">Total Fleet</p>
                    </AuraCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Device List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-4 bg-base3/50 p-2 rounded-2xl border border-base2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by UID, Serial, or Table..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent pl-10 pr-4 py-2 outline-none font-bold text-sm"
                                />
                            </div>
                            <button className="p-2 bg-base2 rounded-xl text-text/60 hover:text-primary transition-colors">
                                <Filter size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filteredDevices.map(device => (
                                <AuraCard
                                    key={device.id}
                                    onClick={() => { setSelectedDevice(device); fetchDeviceEvents(device.id); }}
                                    className={`p-4 cursor-pointer transition-all hover:scale-[1.01] border-2 ${selectedDevice?.id === device.id ? 'border-primary bg-primary/5' : 'border-base2 bg-base3/10'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${device.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <Zap size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-text-emphasis leading-none mb-1">{device.deviceUid}</h4>
                                                <p className="text-[10px] font-bold text-text/40 uppercase tracking-tight">SN: {device.serialNumber} • {device.table?.name || 'Unassigned'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border mb-1 inline-block ${device.status === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    device.status === 'fault' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {device.status}
                                            </div>
                                            <p className="text-[9px] font-bold text-text/30 flex items-center justify-end gap-1">
                                                <Clock size={10} /> {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                </AuraCard>
                            ))}
                        </div>
                    </div>

                    {/* Device Details & Logs */}
                    <div className="space-y-6">
                        {selectedDevice ? (
                            <AuraCard className="p-6 border-2 border-primary/20 bg-base3/40 sticky top-24">
                                <h3 className="text-lg font-black text-text-emphasis uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <Activity size={20} className="text-primary" /> Device Intelligence
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center p-3 bg-base2/30 rounded-xl">
                                        <span className="text-[10px] font-black text-text/40 uppercase">Firmware</span>
                                        <span className="text-xs font-bold text-text-emphasis">{selectedDevice.firmwareVersion || 'v1.0.0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-base2/30 rounded-xl">
                                        <span className="text-[10px] font-black text-text/40 uppercase">IP Address</span>
                                        <span className="text-xs font-bold text-text-emphasis">{selectedDevice.ipAddress || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-base2/30 rounded-xl">
                                        <span className="text-[10px] font-black text-text/40 uppercase">SIM Number</span>
                                        <span className="text-xs font-bold text-text-emphasis">{selectedDevice.simNumber || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <button
                                        onClick={() => handleSync(selectedDevice.id)}
                                        className="aura-btn bg-blue text-base3 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={14} /> Sync Config
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedDevice.id, selectedDevice.status === 'maintenance' ? 'online' : 'maintenance')}
                                        className="aura-btn bg-amber-500 text-base3 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                                    >
                                        <Shield size={14} /> {selectedDevice.status === 'maintenance' ? 'Enable' : 'Maintain'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text/40 uppercase tracking-widest flex items-center justify-between">
                                        Live Event Stream
                                        {loadingEvents && <Loader2 size={12} className="animate-spin" />}
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 thin-scrollbar">
                                        {events.length === 0 ? (
                                            <p className="text-[10px] text-text/30 italic text-center py-8">No recent events recorded</p>
                                        ) : (
                                            events.map(event => (
                                                <div key={event.id} className="p-3 bg-base2/20 rounded-lg border border-base2/50">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-black text-primary uppercase">{event.eventType.replace(/_/g, ' ')}</span>
                                                        <span className="text-[8px] font-bold text-text/30">{new Date(event.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                    <pre className="text-[9px] text-text/60 font-mono overflow-x-auto">
                                                        {JSON.stringify(event.payloadJson, null, 2)}
                                                    </pre>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </AuraCard>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-base3/10 rounded-[32px] border-2 border-dashed border-base2">
                                <Zap size={48} className="text-text/10 mb-4" />
                                <p className="text-sm font-bold text-text/40">Select a device to view detailed intelligence and event streams</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDevices;
