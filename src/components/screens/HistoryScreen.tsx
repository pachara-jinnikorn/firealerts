import { useState, useEffect } from 'react';
import { AppBar } from '../AppBar';
import { Search, Filter, Calendar, MapPin, Trash2, Eye, ChevronRight, Save, Download, CheckSquare, Square, CloudUpload } from 'lucide-react';
import { storage, SavedRecord } from '../../utils/storage';
import { RecordDetailModal } from '../RecordDetailModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { syncToCloud } from '../../utils/supabaseService';

export function HistoryScreen() {
  const { t, language } = useLanguage();
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SavedRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rice' | 'sugarcane'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'saved'>('all');
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, filterType, filterStatus]);

  const loadRecords = () => {
    const allRecords = storage.getRecords();
    setRecords(allRecords);
  };

  const filterRecords = () => {
    let filtered = records;

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.date.includes(searchQuery) ||
        r.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.includes(searchQuery)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const result = await syncToCloud();
      alert(`✅ ${t('syncSuccess')} (${result.count} ${t('records')})`);
      loadRecords(); // Refresh to show synced status
    } catch (error) {
      alert(`❌ ${t('syncFailed')}: ${(error as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      storage.deleteRecord(id);
      loadRecords();
    }
  };

  const handleView = (record: SavedRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleSaveDraft = (id: string) => {
    storage.updateRecordStatus(id, 'saved');
    loadRecords();
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedForExport(new Set());
    }
  };

  const selectAll = () => {
    const allIds = new Set(filteredRecords.map(r => r.id));
    setSelectedForExport(allIds);
  };

  const deselectAll = () => {
    setSelectedForExport(new Set());
  };

  const exportToExcel = async () => {
    if (selectedForExport.size === 0) {
      alert(t('pleaseSelectRecords'));
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const recordsToExport = records.filter(r => selectedForExport.has(r.id));
      
      const excelData = recordsToExport.map(record => {
        const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;
        const burnArea = record.polygons.filter(p => p.type === 'burn').reduce((sum, p) => sum + p.area, 0) / 1600;
        const noBurnArea = record.polygons.filter(p => p.type === 'non-burn').reduce((sum, p) => sum + p.area, 0) / 1600;

        return {
          [t('date')]: record.date,
          [t('time')]: record.time,
          [t('excelType')]: record.type === 'rice' ? t('rice') : t('sugarcane'),
          [t('excelStatus')]: record.status === 'draft' ? t('draftStatus') : t('savedStatus'),
          [t('excelTotalArea')]: totalArea.toFixed(2),
          [t('excelBurnArea')]: burnArea.toFixed(2),
          [t('excelNoBurnArea')]: noBurnArea.toFixed(2),
          [t('excelPolygonCount')]: record.polygons.length,
          [t('excelLatitude')]: record.location.lat.toFixed(6),
          [t('excelLongitude')]: record.location.lng.toFixed(6),
          [t('excelAccuracy')]: record.location.accuracy || '-',
          [t('excelRiceFieldType')]: record.riceFieldType === 'dry' ? t('dryField') : record.riceFieldType === 'wet' ? t('rainyField') : '-',
          [t('excelRiceVariety')]: record.riceVariety || '-',
          [t('excelBurnType')]: record.burnType === 'before' ? t('burnBefore') : record.burnType === 'after' ? t('burnAfter') : '-',
          [t('excelPlowing')]: record.activities?.plowing ? t('yes') : t('no'),
          [t('excelCollecting')]: record.activities?.collecting ? t('yes') : t('no'),
          [t('excelOtherActivities')]: record.activities?.otherText || '-',
          [t('excelRemarks')]: record.remarks || '-',
          [t('excelPhotoCount')]: record.photos?.length || 0,
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, language === 'th' ? 'ข้อมูลพื้นที่เผา' : 'Burn Area Data');

      ws['!cols'] = Array(19).fill({ wch: 15 });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = language === 'th' ? `ข้อมูลพื้นที่เผา_${timestamp}.xlsx` : `BurnAreaData_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setIsSelectMode(false);
      setSelectedForExport(new Set());
      
      alert(`${t('exportSuccess')} ${selectedForExport.size} ${t('exportSuccessSuffix')}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('exportError'));
    }
  };

  const stats = storage.getStats();

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <AppBar 
        title={t('appTitle')}
        subtitle={t('appSubtitle')}
        bgColor="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-4 border-b border-white/10"
      />

      {/* Stats Cards */}
      <div className="px-4 py-2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-xl">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg hover:scale-105 transition-transform">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.total}</div>
            <div className="text-[9px] text-white/90 font-medium">{t('totalRecords')}</div>
          </div>
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg hover:scale-105 transition-transform">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.rice}</div>
            <div className="text-[9px] text-white/90 font-medium">🌾 {t('rice')}</div>
          </div>
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg hover:scale-105 transition-transform">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.sugarcane}</div>
            <div className="text-[9px] text-white/90 font-medium">🌿 {t('sugarcane')}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/70 space-y-2 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-medium shadow-sm ${
                filterType === 'all'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilterType('rice')}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-medium shadow-sm ${
                filterType === 'rice'
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-300/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🌾 {t('rice')}
            </button>
            <button
              onClick={() => setFilterType('sugarcane')}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-medium shadow-sm ${
                filterType === 'sugarcane'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-300/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🌿 {t('sugarcane')}
            </button>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilterStatus(filterStatus === 'draft' ? 'all' : 'draft')}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-medium shadow-sm ${
                filterStatus === 'draft'
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-300/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              📝 {t('draft')}
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'saved' ? 'all' : 'saved')}
              className={`px-3 py-2 text-sm rounded-xl transition-all font-medium shadow-sm ${
                filterStatus === 'saved'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-300/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              ✓ {t('saved')}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-3 py-2 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-sm"
            />
          </div>
          
          {filteredRecords.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 font-medium text-sm ${
                isSelectMode
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-300/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('download')}</span>
            </button>
          )}

          {filteredRecords.some(r => r.status === 'saved' && !r.synced) && (
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className={`px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 font-medium text-sm ${
                isSyncing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-300/50'
              }`}
            >
              <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? t('syncing') : t('sync')}</span>
            </button>
          )}
        </div>

        <div className="text-xs text-gray-600 text-center pt-1">
          {t('found')} {filteredRecords.length} {t('records')}
          {filteredRecords.some(r => r.status === 'draft') && (
            <span className="ml-2 text-orange-600">
              ({filteredRecords.filter(r => r.status === 'draft').length} {t('draft').toLowerCase()})
            </span>
          )}
        </div>

        {isSelectMode && filteredRecords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <span className="text-sm font-medium text-gray-700">
                {t('selected')}: {selectedForExport.size} {t('records').toLowerCase()}
              </span>
              <button
                onClick={selectedForExport.size === filteredRecords.length ? deselectAll : selectAll}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {selectedForExport.size === filteredRecords.length ? t('deselectAll') : t('selectAll')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToExcel}
                disabled={selectedForExport.size === 0}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 active:scale-98 transition-all shadow-lg shadow-green-300/50 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>{t('download')}</span>
              </button>
              <button
                onClick={toggleSelectMode}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 active:scale-98 transition-all font-medium"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-lg">{t('noData')}</div>
            <div className="text-sm">{t('startRecording')}</div>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onView={() => handleView(record)}
                onDelete={() => handleDelete(record.id)}
                onSave={() => handleSaveDraft(record.id)}
                selectedForExport={selectedForExport}
                isSelectMode={isSelectMode}
                setSelectedForExport={setSelectedForExport}
              />
            ))}
          </div>
        )}
      </div>

      {showDetail && selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => {
            setShowDetail(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}

interface RecordCardProps {
  record: SavedRecord;
  onView: () => void;
  onDelete: () => void;
  onSave: () => void;
  selectedForExport: Set<string>;
  isSelectMode: boolean;
  setSelectedForExport: (set: Set<string>) => void;
}

function RecordCard({ record, onView, onDelete, onSave, selectedForExport, isSelectMode, setSelectedForExport }: RecordCardProps) {
  const { t, language } = useLanguage();
  
  const typeColor = record.type === 'rice' 
    ? 'from-amber-500 to-yellow-600' 
    : 'from-emerald-500 to-green-600';
  
  const typeIcon = record.type === 'rice' ? '🌾' : '🌿';
  const typeName = record.type === 'rice' ? t('rice') : t('sugarcane');
  
  const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;
  const isSelected = selectedForExport.has(record.id);

  const handleToggleSelect = () => {
    const newSelected = new Set(selectedForExport);
    if (isSelected) {
      newSelected.delete(record.id);
    } else {
      newSelected.add(record.id);
    }
    setSelectedForExport(newSelected);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all ${
        isSelectMode && isSelected ? 'border-green-500 border-2 ring-2 ring-green-200' : 'border-gray-200/50'
      }`}
      onClick={isSelectMode ? handleToggleSelect : undefined}
    >
      <div className={`bg-gradient-to-r ${typeColor} px-4 py-4 flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-3">
          {isSelectMode && (
            <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30">
              {isSelected ? <CheckSquare className="w-6 h-6 text-white" /> : <Square className="w-6 h-6 text-white" />}
            </div>
          )}
          <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
            <span className="text-2xl">{typeIcon}</span>
          </div>
          <div>
            <div className="text-white font-bold drop-shadow-md">{typeName}</div>
            <div className="text-white/90 text-xs flex items-center gap-1.5 mt-1">
              {record.status === 'draft' ? (
                <span className="bg-orange-500/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-orange-300/50 font-medium shadow-sm">
                  📝 {t('draftStatus')}
                </span>
              ) : (
                <span className="bg-green-500/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-300/50 font-medium shadow-sm">
                  ✓ {t('savedStatus')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-white text-right">
          <div className="text-2xl font-bold drop-shadow-md">{totalArea.toFixed(2)}</div>
          <div className="text-xs text-white/90 font-medium">{t('rai')} ({record.polygons.length} {t('polygon')})</div>
        </div>
      </div>

      <div className="p-5 space-y-3 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 px-3 py-2 rounded-xl shadow-sm">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="font-medium">{record.date} {record.time}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 px-3 py-2 rounded-xl shadow-sm">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="font-mono text-xs">
            {record.location.lat.toFixed(4)}°, {record.location.lng.toFixed(4)}°
          </span>
        </div>

        {record.remarks && (
          <div className="text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl line-clamp-2 border border-blue-100 shadow-sm">
            💬 {record.remarks}
          </div>
        )}

        {record.photos && record.photos.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 shadow-sm">
            <span className="text-lg">📷</span>
            <span className="font-medium">{record.photos.length} {t('photos').toLowerCase()}</span>
          </div>
        )}

        {!isSelectMode && (
          <div className="flex gap-2 pt-3">
            <button
              onClick={onView}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-300/50 font-medium"
            >
              <Eye className="w-5 h-5" />
              <span>{t('viewDetails')}</span>
            </button>
            {record.status === 'draft' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(t('confirmSaveDraft'))) {
                    onSave();
                  }
                }}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 active:scale-98 transition-all shadow-lg shadow-green-300/50"
                title={t('saveAsFinal')}
              >
                <Save className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 active:scale-98 transition-all border border-red-200 shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
