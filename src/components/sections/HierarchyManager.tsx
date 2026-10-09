'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProvinceHierarchy, DistrictHierarchy, ParishBranch, UserSession } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import {
  Building,
  Church,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  Search,
  RefreshCw,
  Layers,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface HierarchyManagerProps {
  session: UserSession;
  onHierarchyUpdated?: () => void;
}

export const HierarchyManager: React.FC<HierarchyManagerProps> = ({
  session,
  onHierarchyUpdated,
}) => {
  const [hierarchy, setHierarchy] = useState<ProvinceHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected paths
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Modals / Input states for additions
  const [showAddProvince, setShowAddProvince] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState('');
  const [newProvinceCode, setNewProvinceCode] = useState('');

  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');

  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const [showAddHouse, setShowAddHouse] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<{
    type: 'province' | 'district' | 'branch';
    id: string;
    currentName: string;
  } | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Fetch live hierarchy from backend API
  const loadHierarchy = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHierarchy();
      if (res && Array.isArray(res.hierarchy)) {
        setHierarchy(res.hierarchy);
        if (res.hierarchy.length > 0 && !selectedProvinceId) {
          setSelectedProvinceId(res.hierarchy[0].id || res.hierarchy[0].name);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load ecclesiastical hierarchy' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, []);

  // Compute selected province object
  const currentProvince = useMemo(() => {
    return hierarchy.find((p) => p.id === selectedProvinceId || p.name === selectedProvinceId) || hierarchy[0] || null;
  }, [hierarchy, selectedProvinceId]);

  // Compute selected district object
  const currentDistrict = useMemo(() => {
    if (!currentProvince) return null;
    return (
      currentProvince.districts.find((d) => d.id === selectedDistrictId || d.name === selectedDistrictId) ||
      currentProvince.districts[0] ||
      null
    );
  }, [currentProvince, selectedDistrictId]);

  // Compute selected branch object
  const currentBranch = useMemo(() => {
    if (!currentDistrict) return null;
    return (
      currentDistrict.branches.find((b) => b.id === selectedBranchId || b.name === selectedBranchId) ||
      currentDistrict.branches[0] ||
      null
    );
  }, [currentDistrict, selectedBranchId]);

  // Hierarchy statistics
  const stats = useMemo(() => {
    let totalDistricts = 0;
    let totalBranches = 0;
    let totalSanctuaries = 0;

    hierarchy.forEach((p) => {
      totalDistricts += p.districts.length;
      p.districts.forEach((d) => {
        totalBranches += d.branches.length;
        d.branches.forEach((b) => {
          totalSanctuaries += (b.housesOfPrayer || []).length;
        });
      });
    });

    return {
      totalProvinces: hierarchy.length,
      totalDistricts,
      totalBranches,
      totalSanctuaries,
    };
  }, [hierarchy]);

  // Handlers for Additions
  const handleAddProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvinceName.trim()) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'add_province',
        province: {
          name: newProvinceName.trim(),
          shortCode: newProvinceCode.trim().toUpperCase() || newProvinceName.substring(0, 3).toUpperCase(),
          districts: [
            {
              id: `dist_${Date.now()}`,
              name: `${newProvinceName.trim()} Central District`,
              branches: [
                {
                  id: `br_${Date.now()}`,
                  name: `${newProvinceName.trim()} Cathedral Branch`,
                  housesOfPrayer: ['Main House of Prayer', 'Sanctuary of Grace'],
                },
              ],
            },
          ],
        },
        performedBy: session.name,
      });

      setHierarchy(res.hierarchy);
      setSelectedProvinceId(res.province.id);
      setShowAddProvince(false);
      setNewProvinceName('');
      setNewProvinceCode('');
      setFeedback({ type: 'success', message: `Province "${newProvinceName}" created successfully!` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add province' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim() || !currentProvince) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'add_district',
        provinceId: currentProvince.id,
        district: {
          name: newDistrictName.trim(),
          branches: [
            {
              id: `br_${Date.now()}`,
              name: `${newDistrictName.trim()} Headquarters Branch`,
              housesOfPrayer: ['Main House of Prayer'],
            },
          ],
        },
        performedBy: session.name,
      });

      setHierarchy(res.hierarchy);
      setSelectedDistrictId(res.district.id);
      setShowAddDistrict(false);
      setNewDistrictName('');
      setFeedback({ type: 'success', message: `District "${newDistrictName}" added to ${currentProvince.name}!` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add district' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !currentProvince || !currentDistrict) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'add_branch',
        provinceId: currentProvince.id,
        districtId: currentDistrict.id,
        branch: {
          name: newBranchName.trim(),
          housesOfPrayer: ['Main House of Prayer', 'Altar of Intercession'],
        },
        performedBy: session.name,
      });

      setHierarchy(res.hierarchy);
      setSelectedBranchId(res.branch.id);
      setShowAddBranch(false);
      setNewBranchName('');
      setFeedback({ type: 'success', message: `Branch "${newBranchName}" added to ${currentDistrict.name}!` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add branch' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHouseOfPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseName.trim() || !currentProvince || !currentDistrict || !currentBranch) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'add_house_of_prayer',
        provinceId: currentProvince.id,
        districtId: currentDistrict.id,
        branchId: currentBranch.id,
        houseOfPrayer: newHouseName.trim(),
        performedBy: session.name,
      });

      setHierarchy(res.hierarchy);
      setShowAddHouse(false);
      setNewHouseName('');
      setFeedback({ type: 'success', message: `Sanctuary "${newHouseName}" added to ${currentBranch.name}!` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add sanctuary' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handlers
  const handleDeleteProvince = async (provId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the Province "${name}" and all associated districts and branches?`)) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'delete_province',
        provinceId: provId,
        performedBy: session.name,
      });
      setHierarchy(res.hierarchy);
      if (selectedProvinceId === provId) {
        setSelectedProvinceId(res.hierarchy[0]?.id || '');
      }
      setFeedback({ type: 'success', message: `Province "${name}" deleted.` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete province' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDistrict = async (distId: string, name: string) => {
    if (!currentProvince) return;
    if (!confirm(`Are you sure you want to delete the District "${name}"?`)) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'delete_district',
        provinceId: currentProvince.id,
        districtId: distId,
        performedBy: session.name,
      });
      setHierarchy(res.hierarchy);
      setFeedback({ type: 'success', message: `District "${name}" deleted.` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete district' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async (branchId: string, name: string) => {
    if (!currentProvince || !currentDistrict) return;
    if (!confirm(`Are you sure you want to delete Parish Branch "${name}"?`)) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.saveHierarchy({
        action: 'delete_branch',
        provinceId: currentProvince.id,
        districtId: currentDistrict.id,
        branchId,
        performedBy: session.name,
      });
      setHierarchy(res.hierarchy);
      setFeedback({ type: 'success', message: `Parish Branch "${name}" deleted.` });
      onHierarchyUpdated?.();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete branch' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action Controls */}
      <div className="bg-gradient-to-r from-church-950 via-slate-900 to-church-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gold-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm" className="bg-gold-500/20 text-gold-300 border-gold-400/30">
              Live Backend Registry
            </Badge>
            <span className="text-xs font-mono text-church-300">Autonomous Canonical Jurisdiction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
            Ecclesiastical Structure & Hierarchy Manager
          </h2>
          <p className="text-xs sm:text-sm text-church-200">
            Real-time management of Provinces, Dioceses, Districts, Parish Branches, and Houses of Prayer across Nigeria & Diaspora.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadHierarchy}
            disabled={isLoading || isSaving}
            className="text-white border-church-700 hover:bg-church-850"
          >
            Sync Database
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddProvince(true)}
          >
            Add New Province
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Provinces / Dioceses</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalProvinces}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Global Canonical Seats</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Building className="w-3.5 h-3.5 text-church-500" />
            <span>District Councils</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalDistricts}
          </p>
          <span className="text-[11px] text-church-600 dark:text-gold-400 font-medium">Zonal Administrations</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Church className="w-3.5 h-3.5 text-emerald-500" />
            <span>Parishes & Cathedrals</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalBranches}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Active Parish Altars</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Sanctuaries of Prayer</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.totalSanctuaries}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Prayer Houses</span>
        </div>
      </div>

      {/* 3-Column Cascading Tree Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Provinces & Dioceses */}
        <Card className="flex flex-col h-[640px]">
          <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Provinces ({hierarchy.length})
              </h3>
            </div>
            <button
              onClick={() => setShowAddProvince(true)}
              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </CardHeader>

          <CardBody className="p-2 overflow-y-auto flex-1 space-y-1">
            {hierarchy.map((prov) => {
              const isSelected = prov.id === currentProvince?.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => {
                    setSelectedProvinceId(prov.id);
                    setSelectedDistrictId(prov.districts[0]?.id || '');
                    setSelectedBranchId(prov.districts[0]?.branches[0]?.id || '');
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-semibold shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-semibold">{prov.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {prov.shortCode}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {prov.districts.length} District Councils
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProvince(prov.id, prov.name);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Province"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-amber-500' : ''}`} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* COLUMN 2: Districts under Selected Province */}
        <Card className="flex flex-col h-[640px]">
          <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-church-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                2. Districts ({currentProvince?.districts.length || 0})
              </h3>
            </div>
            {currentProvince && (
              <button
                onClick={() => setShowAddDistrict(true)}
                className="p-1.5 rounded-lg bg-church-500/10 text-church-600 dark:text-church-300 hover:bg-church-500/20 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </CardHeader>

          <CardBody className="p-2 overflow-y-auto flex-1 space-y-1">
            {!currentProvince || currentProvince.districts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No districts under this province yet. Click &quot;Add&quot; to create one.
              </div>
            ) : (
              currentProvince.districts.map((dist) => {
                const isSelected = dist.id === currentDistrict?.id;
                return (
                  <div
                    key={dist.id}
                    onClick={() => {
                      setSelectedDistrictId(dist.id);
                      setSelectedBranchId(dist.branches[0]?.id || '');
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-church-500/15 border border-church-500/40 text-church-700 dark:text-church-200 font-semibold shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="truncate text-xs font-semibold block">{dist.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {dist.branches.length} Parish Branches
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDistrict(dist.id, dist.name);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete District"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-church-500' : ''}`} />
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* COLUMN 3: Local Parish Branches & Sanctuaries */}
        <Card className="flex flex-col h-[640px]">
          <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Church className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                3. Parishes & Sanctuaries
              </h3>
            </div>
            {currentDistrict && (
              <button
                onClick={() => setShowAddBranch(true)}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            )}
          </CardHeader>

          <CardBody className="p-3 overflow-y-auto flex-1 space-y-4">
            {!currentDistrict || currentDistrict.branches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No parish branches under this district yet. Click &quot;Add Branch&quot; to create one.
              </div>
            ) : (
              currentDistrict.branches.map((br) => {
                const isSelected = br.id === currentBranch?.id;
                return (
                  <div
                    key={br.id}
                    onClick={() => setSelectedBranchId(br.id)}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Church className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {br.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBranch(br.id, br.name);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Houses of Prayer List */}
                    <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Sanctuaries / Altars:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBranchId(br.id);
                            setShowAddHouse(true);
                          }}
                          className="text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Altar
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(br.housesOfPrayer || []).map((h, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal: Add Province */}
      {showAddProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Add Ecclesiastical Province / Diocese
              </h3>
              <button onClick={() => setShowAddProvince(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProvince} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Province / Diocese Full Name *</label>
                <input
                  type="text"
                  required
                  value={newProvinceName}
                  onChange={(e) => setNewProvinceName(e.target.value)}
                  placeholder="e.g. Niger Delta Central Province"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Short Code (Optional)</label>
                <input
                  type="text"
                  value={newProvinceCode}
                  onChange={(e) => setNewProvinceCode(e.target.value)}
                  placeholder="e.g. NDCP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddProvince(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" loading={isSaving}>
                  Create Province
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add District */}
      {showAddDistrict && currentProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-church-400" /> Add District to {currentProvince.name}
              </h3>
              <button onClick={() => setShowAddDistrict(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDistrict} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">District Council Name *</label>
                <input
                  type="text"
                  required
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  placeholder="e.g. Warri Central District"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDistrict(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" loading={isSaving}>
                  Add District
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Branch */}
      {showAddBranch && currentDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Church className="w-4 h-4 text-emerald-400" /> Add Parish Branch to {currentDistrict.name}
              </h3>
              <button onClick={() => setShowAddBranch(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Parish / Cathedral Branch Name *</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Mount Zion Cathedral, Effurun Branch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddBranch(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" loading={isSaving}>
                  Create Parish Branch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add House of Prayer */}
      {showAddHouse && currentBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Add Sanctuary to {currentBranch.name}
              </h3>
              <button onClick={() => setShowAddHouse(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHouseOfPrayer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sanctuary / House of Prayer Name *</label>
                <input
                  type="text"
                  required
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="e.g. Mount Horeb Sanctuary of Deliverance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddHouse(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" loading={isSaving}>
                  Add Sanctuary
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

