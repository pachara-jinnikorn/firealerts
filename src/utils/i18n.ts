export type Language = 'th' | 'en';

export const translations = {
  th: {
    // Common
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    close: 'ปิด',
    confirm: 'ยืนยัน',
    back: 'กลับ',
    search: 'ค้นหา',
    filter: 'กรอง',
    all: 'ทั้งหมด',
    language: 'th',
    
    // App Header
    appTitle: 'ระบบบันทึกข้อมูลการเผาไหม้',
    appSubtitle: 'ข้อมูลภาคสนาม',
    
    // Navigation
    navRice: 'เผา-ข้าว',
    navSugarcane: 'เผา-อ้อย',
    navHistory: 'ประวัติ',
    
    // Rice Screen
    riceTitle: 'บันทึกพื้นที่เผา',
    riceSubtitle: 'นาข้าว',
    riceFieldType: 'ชนิดนาข้าว',
    dryField: 'นาปี',
    rainyField: 'นาปรัง',
    riceVariety: 'พันธุ์ข้าว',
    riceVarietyPlaceholder: 'ระบุพันธุ์ข้าว',
    
    // Sugarcane Screen
    sugarcaneTitle: 'บันทึกพื้นที่เผา',
    sugarcaneSubtitle: 'ไร่อ้อย',
    burnType: 'ประเภทการเผา',
    burnBefore: 'เผาก่อนตัด',
    burnAfter: 'เผาหลังตัด',
    activitiesAfterBurn: 'กิจกรรมหลังเผา',
    plowing: 'มีการไถหลังเผา',
    collecting: 'มีการเก็บเศษใบอ้อย/ตอซัง',
    other: 'อื่นๆ',
    otherPlaceholder: 'ระบุกิจกรรมอื่นๆ',
    
    // Map
    mapTitle: 'แผนที่',
    drawBurnArea: 'วาดพื้นที่เผา',
    drawNoBurnArea: 'วาดพื้นที่ไม่เผา',
    burnArea: 'พื้นที่เผา',
    noBurnArea: 'พื้นที่ไม่เผา',
    totalArea: 'พื้นที่รวม',
    rai: 'ไร่',
    sqm: 'ตร.ม.',
    polygon: 'polygon',
    
    // Form
    location: 'ตำแหน่ง',
    gpsLocation: 'ตำแหน่ง GPS',
    accuracy: 'ความแม่นยำ',
    gettingLocation: 'กำลังหาตำแหน่ง...',
    locationError: 'ไม่สามารถหาตำแหน่งได้',
    photos: 'รูปภาพ',
    addPhoto: 'เพิ่มรูปภาพ',
    remarks: 'หมายเหตุ',
    remarksPlaceholder: 'ระบุหมายเหตุเพิ่มเติม...',
    loading: 'กำลังโหลด...',
    saving: 'กำลังบันทึก...',
    updateGps: 'อัปเดต GPS',
    selectFromMap: 'เลือกจากแผนที่',
    noLocationData: 'ไม่มีข้อมูลตำแหน่ง',
    latitude: 'ละติจูด',
    longitude: 'ลองจิจูด',
    
    // Buttons
    saveDraft: 'บันทึกฉบับร่าง',
    saveData: 'บันทึกข้อมูล',
    clearForm: 'ล้างฟอร์ม',
    download: 'ดาวน์โหลด',
    viewDetails: 'ดูรายละเอียด',
    
    // History Screen
    historyTitle: 'ประวัติการบันทึก',
    totalRecords: 'รายการทั้งหมด',
    rice: 'ข้าว',
    sugarcane: 'อ้อย',
    draft: 'ฉบับร่าง',
    saved: 'บันทึกแล้ว',
    searchPlaceholder: 'ค้นหาวันที่, หมายเหตุ...',
    found: 'พบ',
    records: 'รายการ',
    noData: 'ไม่มีข้อมูล',
    startRecording: 'เริ่มบันทึกข้อมูลเพื่อดูประวัติ',
    
    // Export
    selectForExport: 'เลือกรายการที่ต้องการดาวน์โหลด',
    selected: 'เลือกแล้ว',
    selectAll: 'เลือกทั้งหมด',
    deselectAll: 'ยกเลิกทั้งหมด',
    downloadExcel: 'ดาวน์โหลด Excel',
    exportSuccess: 'ดาวน์โหลดข้อมูล',
    exportSuccessSuffix: 'รายการสำเร็จ!',
    exportError: 'เกิดข้อผิดพลาดในการดาวน์โหลด',
    pleaseSelectRecords: 'กรุณาเลือกรายการที่ต้องการดาวน์โหลด',
    
    // Detail Modal
    details: 'รายละเอียด',
    polygonList: 'รายการ Polygon',
    recordedAt: 'บันทึกเมื่อ',
    saveAsFinal: 'บันทึกเป็นฉบับจริง',
    confirmSaveDraft: 'ต้องการบันทึกฉบับร่างนี้เป็นฉบับจริงใช่หรือไม่?',
    confirmDelete: 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
    
    // Status
    status: 'สถานะ',
    draftStatus: 'ฉบับร่าง',
    savedStatus: 'บันทึกแล้ว',
    
    // Date & Time
    date: 'วันที่',
    time: 'เวลา',
    
    // Excel Columns
    excelType: 'ประเภท',
    excelStatus: 'สถานะ',
    excelTotalArea: 'พื้นที่รวม (ไร่)',
    excelBurnArea: 'พื้นที่เผา (ไร่)',
    excelNoBurnArea: 'พื้นที่ไม่เผา (ไร่)',
    excelPolygonCount: 'จำนวน Polygon',
    excelLatitude: 'ละติจูด',
    excelLongitude: 'ลองจิจูด',
    excelAccuracy: 'ความแม่นยำ GPS (m)',
    excelRiceFieldType: 'ชนิดนาข้าว',
    excelRiceVariety: 'พันธุ์ข้าว',
    excelBurnType: 'ประเภทการเผา',
    excelPlowing: 'มีการไถหลังเผา',
    excelCollecting: 'มีการเก็บเศษ',
    excelOtherActivities: 'กิจกรรมอื่นๆ',
    excelRemarks: 'หมายเหตุ',
    excelPhotoCount: 'จำนวนรูปภาพ',
    yes: 'ใช่',
    no: 'ไม่',

    // Sync
    sync: 'ซิงค์',
    syncing: 'กำลังซิงค์...',
    syncSuccess: 'ซิงค์ข้อมูลสำเร็จ',
    syncFailed: 'ซิงค์ข้อมูลล้มเหลว',
  },
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    language: 'en',
    
    // App Header
    appTitle: 'Burn Area Recording System',
    appSubtitle: 'Field Data Collection',
    
    // Navigation
    navRice: 'Rice Field',
    navSugarcane: 'Sugarcane',
    navHistory: 'History',
    
    // Rice Screen
    riceTitle: 'Record Burn Area',
    riceSubtitle: 'Rice Field',
    riceFieldType: 'Rice Field Type',
    dryField: 'Dry Season',
    rainyField: 'Rainy Season',
    riceVariety: 'Rice Variety',
    riceVarietyPlaceholder: 'Enter rice variety',
    
    // Sugarcane Screen
    sugarcaneTitle: 'Record Burn Area',
    sugarcaneSubtitle: 'Sugarcane Field',
    burnType: 'Burn Type',
    burnBefore: 'Pre-harvest Burn',
    burnAfter: 'Post-harvest Burn',
    activitiesAfterBurn: 'Post-burn Activities',
    plowing: 'Plowing after burning',
    collecting: 'Collecting sugarcane leaves/stubble',
    other: 'Other',
    otherPlaceholder: 'Specify other activities',
    
    // Map
    mapTitle: 'Map',
    drawBurnArea: 'Draw Burn Area',
    drawNoBurnArea: 'Draw No-burn Area',
    burnArea: 'Burn Area',
    noBurnArea: 'No-burn Area',
    totalArea: 'Total Area',
    rai: 'rai',
    sqm: 'sq.m.',
    polygon: 'polygon',
    
    // Form
    location: 'Location',
    gpsLocation: 'GPS Location',
    accuracy: 'Accuracy',
    gettingLocation: 'Getting location...',
    locationError: 'Cannot get location',
    photos: 'Photos',
    addPhoto: 'Add Photo',
    remarks: 'Remarks',
    remarksPlaceholder: 'Enter additional remarks...',
    loading: 'Loading...',
    saving: 'Saving...',
    updateGps: 'Update GPS',
    selectFromMap: 'Select from map',
    noLocationData: 'No location data',
    latitude: 'Latitude',
    longitude: 'Longitude',
    
    // Buttons
    saveDraft: 'Save as Draft',
    saveData: 'Save Data',
    clearForm: 'Clear Form',
    download: 'Download',
    viewDetails: 'View Details',
    
    // History Screen
    historyTitle: 'Recording History',
    totalRecords: 'Total Records',
    rice: 'Rice',
    sugarcane: 'Sugarcane',
    draft: 'Draft',
    saved: 'Saved',
    searchPlaceholder: 'Search date, remarks...',
    found: 'Found',
    records: 'records',
    noData: 'No Data',
    startRecording: 'Start recording to view history',
    
    // Export
    selectForExport: 'Select records to download',
    selected: 'Selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    downloadExcel: 'Download Excel',
    exportSuccess: 'Downloaded',
    exportSuccessSuffix: 'records successfully!',
    exportError: 'Error downloading data',
    pleaseSelectRecords: 'Please select records to download',
    
    // Detail Modal
    details: 'Details',
    polygonList: 'Polygon List',
    recordedAt: 'Recorded at',
    saveAsFinal: 'Save as Final',
    confirmSaveDraft: 'Do you want to save this draft as final?',
    confirmDelete: 'Do you want to delete this record?',
    
    // Status
    status: 'Status',
    draftStatus: 'Draft',
    savedStatus: 'Saved',
    
    // Date & Time
    date: 'Date',
    time: 'Time',
    
    // Excel Columns
    excelType: 'Type',
    excelStatus: 'Status',
    excelTotalArea: 'Total Area (rai)',
    excelBurnArea: 'Burn Area (rai)',
    excelNoBurnArea: 'No-burn Area (rai)',
    excelPolygonCount: 'Polygon Count',
    excelLatitude: 'Latitude',
    excelLongitude: 'Longitude',
    excelAccuracy: 'GPS Accuracy (m)',
    excelRiceFieldType: 'Rice Field Type',
    excelRiceVariety: 'Rice Variety',
    excelBurnType: 'Burn Type',
    excelPlowing: 'Plowing',
    excelCollecting: 'Collecting Residue',
    excelOtherActivities: 'Other Activities',
    excelRemarks: 'Remarks',
    excelPhotoCount: 'Photo Count',
    yes: 'Yes',
    no: 'No',

    // Sync
    sync: 'Sync',
    syncing: 'Syncing...',
    syncSuccess: 'Sync successful',
    syncFailed: 'Sync failed',
  },
};

export type TranslationKey = keyof typeof translations.th;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}
