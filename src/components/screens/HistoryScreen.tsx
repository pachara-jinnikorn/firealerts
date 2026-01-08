import { useState, useEffect } from 'react';
import { AppBar } from '../AppBar';
import { Search, Filter, Calendar, MapPin, Trash2, Eye, ChevronRight, Save, Download, CheckSquare, Square, CloudUpload, FileText } from 'lucide-react';
import { storage, SavedRecord } from '../../utils/storage';
import { RecordDetailModal } from '../RecordDetailModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { syncToCloud } from '../../utils/supabaseService';
import { DatabaseService } from '../../service/database.service';

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
    if (filterType !== 'all') filtered = filtered.filter(r => r.type === filterType);
    if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus);
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
      loadRecords();
    } catch (error) {
      alert(`❌ ${t('syncFailed')}: ${(error as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    const record = records.find(r => r.id === id);
    try {
      if (record?.supabaseId) {
        const ok = await DatabaseService.deleteRecord(record.supabaseId);
        if (!ok) {
          alert(language === 'th' ? 'ลบข้อมูลบนคลาวด์ไม่สำเร็จ' : 'Failed to delete on cloud');
        }
      }
    } catch (e) {
      alert(language === 'th' ? 'เกิดข้อผิดพลาดในการลบบนคลาวด์' : 'Error deleting on cloud');
    } finally {
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
    if (isSelectMode) setSelectedForExport(new Set());
  };

  const selectAll = () => {
    const allIds = new Set(filteredRecords.map(r => r.id));
    setSelectedForExport(allIds);
  };

  const deselectAll = () => setSelectedForExport(new Set());

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
          [t('excelRiceFieldType')]: record.riceFieldType === 'dry' ? t('dryField') : record.riceFieldType === 'wet' ? t('rainyField') : record.riceFieldType === 'unspecified' ? t('unspecifiedField') : '-',
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

  const exportToPDF = async () => {
    if (selectedForExport.size === 0) {
      alert(t('pleaseSelectRecords'));
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const recordsToExport = records.filter(r => selectedForExport.has(r.id));
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < recordsToExport.length; i++) {
        const record = recordsToExport[i];
        const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;
        const burnArea = record.polygons.filter(p => p.type === 'burn').reduce((sum, p) => sum + p.area, 0) / 1600;
        const noBurnArea = record.polygons.filter(p => p.type === 'non-burn').reduce((sum, p) => sum + p.area, 0) / 1600;

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-10000px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.background = '#ffffff';
        container.style.color = '#111827';
        container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans Thai, TH Sarabun New, Arial, sans-serif';
        container.style.padding = '24px';
        container.style.border = '1px solid #e5e7eb';
        container.style.borderRadius = '12px';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';

        const headerTitle = language === 'th' ? 'รายงานข้อมูลพื้นที่เผา' : 'Burn Area Report';
        const typeText = record.type === 'rice' ? (language === 'th' ? 'ข้าว' : 'Rice') : (language === 'th' ? 'อ้อย' : 'Sugarcane');
        const riceFieldText = record.riceFieldType
          ? (record.riceFieldType === 'dry' ? t('dryField') : record.riceFieldType === 'wet' ? t('rainyField') : t('unspecifiedField'))
          : '-';

        container.innerHTML = `
          <div style="text-align:center; font-weight:700; font-size:20px; margin-bottom:16px;">${headerTitle}</div>
          <div style="display:flex; gap:12px; margin-bottom:12px; font-size:14px;">
            <div><strong>${t('records')}:</strong> ${i + 1}</div>
            <div><strong>${t('excelType')}:</strong> ${typeText}</div>
            <div><strong>${t('status')}:</strong> ${record.status === 'draft' ? t('draftStatus') : t('savedStatus')}</div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:13px; margin-bottom:12px;">
            <div><strong>${t('date')}:</strong> ${record.date} ${record.time}</div>
            <div><strong>${t('location')}:</strong> ${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)}</div>
            <div><strong>${t('totalArea')}:</strong> ${totalArea.toFixed(2)} ${t('rai')}</div>
            <div><strong>${t('burnArea')}:</strong> ${burnArea.toFixed(2)} ${t('rai')}</div>
            <div><strong>${t('noBurnArea')}:</strong> ${noBurnArea.toFixed(2)} ${t('rai')}</div>
            ${record.riceFieldType ? `<div><strong>${t('riceFieldType')}:</strong> ${riceFieldText}</div>` : ''}
            ${record.riceVariety ? `<div><strong>${t('riceVariety')}:</strong> ${record.riceVariety}</div>` : ''}
            ${record.burnType ? `<div><strong>${t('burnType')}:</strong> ${record.burnType === 'before' ? t('burnBefore') : t('burnAfter')}</div>` : ''}
            ${record.remarks ? `<div style="grid-column:1 / -1;"><strong>${t('remarks')}:</strong> ${record.remarks}</div>` : ''}
          </div>
          ${record.photos && record.photos.length > 0 ? `
            <div style="margin-top:8px;">
              <div style="font-weight:700; font-size:14px; margin-bottom:6px;">${t('photos')}:</div>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                ${record.photos.map((src, idx) => `
                  <div style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                    <img src="${src}" style="width:100%; height:120px; object-fit:cover;" crossorigin="anonymous" />
                    <div style="font-size:11px; color:#6b7280; padding:4px 6px;">${t('photos')} ${idx + 1}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `;

        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = canvas.height * (imgWidth / canvas.width);
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
        document.body.removeChild(container);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = language === 'th' ? `ข้อมูลพื้นที่เผา_${timestamp}.pdf` : `BurnAreaData_${timestamp}.pdf`;
      doc.save(filename);
      setIsSelectMode(false);
      setSelectedForExport(new Set());
      alert(`${t('exportSuccess')} ${selectedForExport.size} ${t('exportSuccessSuffix')}`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(t('exportError'));
    }
  };

  const stats = storage.getStats();

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <AppBar title={t('appTitle')} subtitle={t('appSubtitle')} bgColor="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-4 border-b border-white/10" />

      {/* Stats Summary */}
      <div className="px-4 py-2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-xl">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.total}</div>
            <div className="text-[9px] text-white/90 font-medium">{t('totalRecords')}</div>
          </div>
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.rice}</div>
            <div className="text-[9px] text-white/90 font-medium">🌾 {t('rice')}</div>
          </div>
          <div className="bg-white/25 backdrop-blur-lg rounded-lg p-2 text-center border border-white/30 shadow-lg">
            <div className="text-xl font-bold text-white drop-shadow-lg">{stats.sugarcane}</div>
            <div className="text-[9px] text-white/90 font-medium">🌿 {t('sugarcane')}</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/70 space-y-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="flex-1 bg-transparent border-none outline-none text-sm" 
            />
          </div>
          
          {filteredRecords.length > 0 && (
            <button 
              onClick={toggleSelectMode} 
              className={`px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 font-medium text-sm ${isSelectMode ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white'}`}
            >
              <Download className="w-4 h-4" />
              <span>{isSelectMode ? t('cancel') : t('download')}</span>
            </button>
          )}
          
          <button 
            onClick={handleSyncToCloud} 
            disabled={isSyncing}
            className="px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 font-medium text-sm bg-blue-600 text-white disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isSyncing ? t('syncing') : t('sync')}</span>
          </button>
        </div>

        {/* Selection Mode Controls */}
        {isSelectMode && filteredRecords.length > 0 && (
          <div className="space-y-2 pt-2 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border-2 border-green-200">
              <span className="text-sm font-medium text-gray-700">
                {t('selected')}: {selectedForExport.size} {t('records').toLowerCase()}
              </span>
              <button 
                onClick={selectedForExport.size === filteredRecords.length ? deselectAll : selectAll} 
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedForExport.size === filteredRecords.length ? t('deselectAll') : t('selectAll')}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={exportToExcel} 
                disabled={selectedForExport.size === 0} 
                className="px-4 py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                <Download className="w-5 h-5" /> 
                <span>Excel</span>
              </button>
              <button 
                onClick={exportToPDF} 
                disabled={selectedForExport.size === 0} 
                className="px-4 py-3 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                <FileText className="w-5 h-5" /> 
                <span>PDF (+{t('photos')})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record List */}
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
        <RecordDetailModal record={selectedRecord} onClose={() => { setShowDetail(false); setSelectedRecord(null); }} />
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
  const { t } = useLanguage();
  const typeColor = record.type === 'rice' ? 'from-amber-500 to-yellow-600' : 'from-emerald-500 to-green-600';
  const typeIcon = record.type === 'rice' ? '🌾' : '🌿';
  const typeName = record.type === 'rice' ? t('rice') : t('sugarcane');
  const totalArea = record.polygons.reduce((sum, p) => sum + p.area, 0) / 1600;
  const isSelected = selectedForExport.has(record.id);

  const handleToggleSelect = () => {
    const newSelected = new Set(selectedForExport);
    if (isSelected) newSelected.delete(record.id);
    else newSelected.add(record.id);
    setSelectedForExport(newSelected);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border overflow-hidden transition-all ${isSelectMode && isSelected ? 'border-green-500 border-2 ring-2 ring-green-200' : 'border-gray-200/50'}`} 
      onClick={isSelectMode ? handleToggleSelect : undefined}
    >
      <div className={`bg-gradient-to-r ${typeColor} px-4 py-4 flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-3">
          {isSelectMode && (
            <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              {isSelected ? <CheckSquare className="w-6 h-6 text-white" /> : <Square className="w-6 h-6 text-white" />}
            </div>
          )}
          <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <span className="text-2xl">{typeIcon}</span>
          </div>
          <div>
            <div className="text-white font-bold">{typeName}</div>
            <div className="text-white/90 text-xs mt-1">
              <span className="bg-white/20 px-2 py-1 rounded-full font-medium">
                {record.status === 'draft' ? t('draftStatus') : t('savedStatus')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-white text-right">
          <div className="text-2xl font-bold">{totalArea.toFixed(2)}</div>
          <div className="text-xs text-white/90">{t('rai')} ({record.polygons.length} {t('polygon')})</div>
        </div>
      </div>
      <div className="p-5 space-y-3 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center gap-3 text-sm text-gray-700 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="font-medium">{record.date} {record.time}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="font-mono text-xs">{record.location.lat.toFixed(4)}°, {record.location.lng.toFixed(4)}°</span>
        </div>
        {record.remarks && <div className="text-sm text-gray-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">💬 {record.remarks}</div>}
        {record.photos && record.photos.length > 0 && <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50/50 px-3 py-2 rounded-xl border border-purple-100/50">📷 <span className="font-medium">{record.photos.length} {t('photos').toLowerCase()}</span></div>}
        {!isSelectMode && (
          <div className="flex gap-2 pt-3">
            <button onClick={onView} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition-colors"><Eye className="w-5 h-5" /><span>{t('viewDetails')}</span></button>
            {record.status === 'draft' && (
              <button onClick={(e) => { e.stopPropagation(); if (confirm(t('confirmSaveDraft'))) onSave(); }} className="px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-colors"><Save className="w-5 h-5" /></button>
            )}
            <button onClick={onDelete} className="px-4 py-3 bg-red-100 text-red-600 rounded-xl border border-red-200 hover:bg-red-200 transition-colors"><Trash2 className="w-5 h-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
