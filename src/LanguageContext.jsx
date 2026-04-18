import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Bilingual string table — ported from app_strings.dart ────────────────────
const strings = {
  // App-wide
  appName:            { en: 'SACH Portal',           ur: 'ساچ پورٹل' },
  home:               { en: 'Home',                  ur: 'ہوم' },
  myFirs:             { en: 'My FIRs',               ur: 'میری ایف آئی آر' },
  alerts:             { en: 'Alerts',                ur: 'اطلاعات' },
  profile:            { en: 'Profile',               ur: 'پروفائل' },
  signOut:            { en: 'Sign Out',              ur: 'لاگ آؤٹ' },
  changeLanguage:     { en: 'Change Language',       ur: 'زبان تبدیل کریں' },
  switchLang:         { en: 'اردو میں تبدیل کریں',        ur: 'Switch to English' },
  pending:            { en: 'Pending',               ur: 'زیر التواء' },
  resolved:           { en: 'Resolved',              ur: 'حل شدہ' },
  investigating:      { en: 'Investigating',         ur: 'تفتیش جاری' },
  closed:             { en: 'Closed',                ur: 'بند' },
  underReview:        { en: 'Under Review',          ur: 'جائزہ' },
  verified:           { en: 'VERIFIED',              ur: 'تصدیق شدہ' },
  nadraVerified:      { en: 'NADRA Verified',        ur: 'نادرا تصدیق شدہ' },
  logout:             { en: 'Logout',                ur: 'لاگ آؤٹ' },
  search:             { en: 'Search…',               ur: 'تلاش کریں…' },

  // Menu / Nav
  goToDashboard:      { en: 'Dashboard',             ur: 'ڈیش بورڈ' },
  goToMyFirs:         { en: 'My FIRs',               ur: 'میری ایف آئی آر' },
  goToAlerts:         { en: 'Alerts',                ur: 'اطلاعات' },
  goToProfile:        { en: 'Profile',               ur: 'پروفائل' },
  fileNewFir:         { en: 'File New e-FIR',        ur: 'نئی ایف آئی آر' },

  // Dashboard
  lodgeFir:           { en: 'Lodge a New e-FIR',     ur: 'نئی ای-ایف آئی آر داخل کریں' },
  fileSecurely:       { en: 'File your complaint securely online', ur: 'آن لائن محفوظ طریقے سے شکایت درج کریں' },
  startNewComplaint:  { en: 'Start New Complaint',   ur: 'نئی شکایت شروع کریں' },
  recentComplaints:   { en: 'Recent Complaints',     ur: 'حالیہ شکایات' },
  viewAll:            { en: 'View All',              ur: 'سب دیکھیں' },
  totalFirs:          { en: 'Total FIRs',            ur: 'کل ایف آئی آر' },
  noComplaintsYet:    { en: 'No complaints filed yet', ur: 'ابھی تک کوئی شکایت نہیں' },
  noComplaintsHint:   { en: 'Use "Start New Complaint" above to file your first e-FIR securely.', ur: 'اوپر "نئی شکایت شروع کریں" دبائیں۔' },
  latestAlerts:       { en: 'Latest Alerts',         ur: 'تازہ ترین اطلاعات' },
  viewAllAlerts:      { en: 'View all alerts',       ur: 'سب اطلاعات دیکھیں' },
  noAlertsYet:        { en: 'No alerts yet',         ur: 'کوئی اطلاع نہیں' },

  // My FIRs
  myComplaints:       { en: 'My Complaints',         ur: 'میری شکایات' },
  allComplaints:      { en: 'All Complaints',        ur: 'تمام شکایات' },
  filterByStatus:     { en: 'Filter by status',      ur: 'حیثیت سے فلٹر کریں' },
  noComplaintsFilter: { en: 'No complaints',         ur: 'کوئی شکایت نہیں' },
  tapToFileFir:       { en: 'Click + to file a new e-FIR securely', ur: 'نئی ای-ایف آئی آر کے لیے + دبائیں' },

  // Alerts
  alertsTitle:        { en: 'Alerts & Updates',      ur: 'اطلاعات اور اپڈیٹس' },
  unread:             { en: 'unread',                ur: 'غیر پڑھی' },
  markAllRead:        { en: 'Mark all read',         ur: 'سب پڑھا نشان کریں' },
  clearAllAlerts:     { en: 'Clear all alerts',      ur: 'تمام اطلاعات حذف کریں' },
  noAlertsHint:       { en: "You'll be notified of FIR status updates here", ur: 'ایف آئی آر اپڈیٹس یہاں آئیں گی' },

  // Profile
  profileTitle:       { en: 'Profile',               ur: 'پروفائل' },
  editProfile:        { en: 'Edit Profile',          ur: 'پروفائل ترمیم کریں' },
  contactInfo:        { en: 'Contact Information',   ur: 'رابطہ معلومات' },
  phoneNumber:        { en: 'Phone Number',          ur: 'فون نمبر' },
  emailAddress:       { en: 'Email Address',         ur: 'ای میل پتہ' },
  residentialInfo:    { en: 'Residential Information', ur: 'رہائشی معلومات' },
  district:           { en: 'District',              ur: 'ضلع' },
  province:           { en: 'Province',              ur: 'صوبہ' },
  permanentAddress:   { en: 'Permanent Address',     ur: 'مستقل پتہ' },
  accountSettings:    { en: 'Account Settings',      ur: 'اکاؤنٹ سیٹنگز' },
  privacySettings:    { en: 'Privacy Settings',      ur: 'رازداری سیٹنگز' },
  notifSettings:      { en: 'Notification Settings', ur: 'اطلاع سیٹنگز' },
  verifiedCitizen:    { en: 'Verified Citizen',      ur: 'تصدیق شدہ شہری' },
  cnicNumber:         { en: 'CNIC Number',           ur: 'شناختی کارڈ نمبر' },
  idStatus:           { en: 'ID Status',             ur: 'شناخت کی حیثیت' },

  // Edit Profile
  epPersonalInfo:     { en: 'Personal Information',  ur: 'ذاتی معلومات' },
  epFullName:         { en: 'Full Name',             ur: 'پورا نام' },
  epAltPhone:         { en: 'Alternate Phone Number', ur: 'متبادل فون نمبر' },
  epPhoneHint:        { en: 'Enter phone number',    ur: 'فون نمبر درج کریں' },
  epEmailHint:        { en: 'Enter email address',   ur: 'ای میل پتہ درج کریں' },
  epAddressDetails:   { en: 'Address Details',       ur: 'پتہ کی تفصیلات' },
  epAddressHint:      { en: 'Enter your permanent address', ur: 'اپنا مستقل پتہ درج کریں' },
  epCity:             { en: 'City',                  ur: 'شہر' },
  epCityHint:         { en: 'Enter city name',       ur: 'شہر کا نام' },
  epSaveChanges:      { en: 'Save Changes',          ur: 'تبدیلیاں محفوظ کریں' },
  epCancel:           { en: 'Cancel',                ur: 'منسوخ' },
  epNadraNotice:      { en: 'Verified Account: Your Name and CNIC are locked via NADRA e-KYC and cannot be altered.', ur: 'تصدیق شدہ اکاؤنٹ: آپ کا نام اور شناختی کارڈ نادرا ای-کے وائی سی سے مقفل ہیں اور تبدیل نہیں کیے جا سکتے۔' },

  // File FIR
  fileFir:            { en: 'File e-FIR',            ur: 'ای-ایف آئی آر داخل کریں' },
  stepLocation:       { en: 'Location',              ur: 'مقام' },
  stepDetails:        { en: 'Details',               ur: 'تفصیلات' },
  stepEvidence:       { en: 'Evidence',              ur: 'ثبوت' },
  streetAddress:      { en: 'Street Address',        ur: 'گلی کا پتہ' },
  cityArea:           { en: 'City / Area',           ur: 'شہر / علاقہ' },
  useCurrentLocation: { en: 'Use Current Location',  ur: 'موجودہ مقام استعمال کریں' },
  usingCurrentLocation:{ en: 'Using Current Location', ur: 'موجودہ مقام استعمال ہو رہا ہے' },
  incidentDateTime:   { en: 'Incident Date / Time',  ur: 'واقعہ کی تاریخ / وقت' },
  selectDateTime:     { en: 'Select date and time',  ur: 'تاریخ اور وقت منتخب کریں' },
  incidentCategory:   { en: 'Incident Category',     ur: 'واقعہ کی قسم' },
  selectCategory:     { en: 'Select incident type',  ur: 'واقعہ کی قسم منتخب کریں' },
  selectDistrict:     { en: 'Select district',       ur: 'ضلع منتخب کریں' },
  incidentDescription:{ en: 'Incident Description',  ur: 'واقعہ کی تفصیل' },
  descHint:           { en: 'Describe the incident in detail…', ur: 'واقعہ تفصیل سے بیان کریں…' },
  uploadEvidence:     { en: 'Upload Evidence',       ur: 'ثبوت اپلوڈ کریں' },
  uploadHint:         { en: 'Add photos or videos to support your complaint', ur: 'شکایت کی تائید کے لیے تصاویر یا ویڈیو شامل کریں' },
  tapToUpload:        { en: 'Click to upload photo/video evidence', ur: 'تصویر/ویڈیو اپلوڈ کریں' },
  evidenceAdded:      { en: 'Evidence Added ✓',      ur: 'ثبوت شامل ✓' },
  evidenceOptional:   { en: 'Evidence is optional. You can attach it later from My FIRs.', ur: 'ثبوت اختیاری ہے۔ بعد میں بھی شامل کر سکتے ہیں۔' },
  nextDetails:        { en: 'Next: Incident Details', ur: 'اگلا: واقعہ کی تفصیل' },
  nextEvidence:       { en: 'Next: Upload Evidence',  ur: 'اگلا: ثبوت اپلوڈ کریں' },
  submitFir:          { en: 'Submit Secure e-FIR',    ur: 'محفوظ ای-ایف آئی آر جمع کریں' },
  firSubmitted:       { en: 'e-FIR Submitted!',       ur: 'ای-ایف آئی آر جمع ہو گئی!' },
  firConfirmMsg:      { en: 'Your complaint has been securely lodged.', ur: 'آپ کی ایف آئی آر محفوظ طریقے سے جمع کر دی گئی ہے۔' },
  viewDashboard:      { en: 'View My Dashboard',      ur: 'ڈیش بورڈ دیکھیں' },
  urduToggle:         { en: 'اردو میں تبدیل کریں',        ur: 'Switch to English' },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [isUrdu, setIsUrdu] = useState(false);

  const toggleLang = useCallback(() => setIsUrdu(prev => !prev), []);

  const t = useCallback((key) => {
    const entry = strings[key];
    if (!entry) return key;
    return isUrdu ? entry.ur : entry.en;
  }, [isUrdu]);

  const dir = isUrdu ? 'rtl' : 'ltr';
  const fontFamily = "'Roboto', sans-serif";

  return (
    <LanguageContext.Provider value={{ t, isUrdu, toggleLang, dir, fontFamily }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
