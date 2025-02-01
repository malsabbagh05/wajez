import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'

// Translations object
const translations = {
  en: {
    home: 'Home',
    jiz: 'Jiz',
    title: 'Extract the texts from the files and summarize',
    subtitle: 'Wajez saves you time and effort by easily extracting text from files and images, summarizing it, and organizing it with high quality.',
    yallaJiz: 'Yalla jiz',
    whyWajez: 'Why Wajez',
    saveTime: 'Save Time',
    saveTimeDesc: 'Extract and analyze text from any document instantly. No more manual copying or tedious formatting. Let Wajez handle the heavy lifting while you focus on what matters.',
    boostProductivity: 'Boost Productivity',
    boostProductivityDesc: 'Transform raw text into structured, actionable insights. Get organized summaries and downloadable JSON data. Make better decisions faster with AI-powered analysis.',
    whatWajezCanDo: 'What Wajez Can Do',
    structuredTables: 'Structured Tables',
    structuredTablesDesc: 'Transform unstructured text into well-organized, readable tables. Get clear insights with properly formatted data presentation.',
    jsonExport: 'JSON Export',
    jsonExportDesc: 'Download your analyzed data in JSON format for easy integration with your applications and workflows.',
    smartAnalysis: 'Smart Analysis',
    smartAnalysisDesc: 'Leverage AI to extract key information, patterns, and insights from your documents automatically.',
    multiFormat: 'Multi-Format Support',
    multiFormatDesc: 'Process various file types including PDFs and images with built-in OCR capabilities.',
    company: 'Company',
    privacyPolicy: 'Privacy policy',
    terms: 'Terms',
    support: 'Support & Help',
    contact: 'Contact us',
    faq: 'FAQ',
    footerDesc: 'Extract and analyze text from any document instantly with AI-powered capabilities.',
    copyright: '© 2024 Wajez. All rights reserved.'
  },
  ar: {
    home: 'الرئيسية',
    jiz: 'جز',
    title: 'استخرج النصوص من الملفات ولخصها',
    subtitle: 'واجز يوفر لك الوقت والجهد من خلال استخراج النصوص من الملفات والصور وتلخيصها وتنظيمها بجودة عالية',
    yallaJiz: 'يلا جز',
    whyWajez: 'لماذا واجز',
    saveTime: 'وفر وقتك',
    saveTimeDesc: 'استخرج وحلل النصوص من أي مستند فوراً. لا مزيد من النسخ اليدوي أو التنسيق المتعب. دع واجز يقوم بالعمل الشاق بينما تركز على ما يهم.',
    boostProductivity: 'عزز إنتاجيتك',
    boostProductivityDesc: 'حول النص الخام إلى رؤى منظمة وقابلة للتنفيذ. احصل على ملخصات منظمة وبيانات JSON قابلة للتحميل. اتخذ قرارات أفضل بشكل أسرع مع التحليل المدعوم بالذكاء الاصطناعي.',
    whatWajezCanDo: 'ماذا يمكن لواجز أن يفعل',
    structuredTables: 'جداول منظمة',
    structuredTablesDesc: 'حول النص غير المنظم إلى جداول منظمة وقابلة للقراءة. احصل على رؤى واضحة مع عرض البيانات المنسقة بشكل صحيح.',
    jsonExport: 'تصدير JSON',
    jsonExportDesc: 'قم بتحميل بياناتك المحللة بتنسيق JSON للتكامل السهل مع تطبيقاتك وسير عملك.',
    smartAnalysis: 'تحليل ذكي',
    smartAnalysisDesc: 'استفد من الذكاء الاصطناعي لاستخراج المعلومات والأنماط والرؤى الرئيسية من مستنداتك تلقائياً.',
    multiFormat: 'دعم متعدد التنسيقات',
    multiFormatDesc: 'معالجة أنواع مختلفة من الملفات بما في ذلك PDF والصور مع قدرات OCR المدمجة.',
    company: 'الشركة',
    privacyPolicy: 'سياسة الخصوصية',
    terms: 'الشروط',
    support: 'الدعم والمساعدة',
    contact: 'اتصل بنا',
    faq: 'الأسئلة الشائعة',
    footerDesc: 'استخرج وحلل النصوص من أي مستند فوراً باستخدام قدرات الذكاء الاصطناعي.',
    copyright: '© 2024 واجز. جميع الحقوق محفوظة.'
  }
}

function Home() {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const t = translations[language]

  return (
    <div className="app" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="header">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="W" className="logo-image" />
          <span className="logo-text">ajez</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">{t.home}</Link>
          <Link to="/jiz" className="nav-link">{t.jiz}</Link>
        </nav>
        <button onClick={() => setLanguage(lang => lang === 'en' ? 'ar' : 'en')} className="lang-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="sr-only">Toggle Language</span>
        </button>
      </header>

      <main className="main-content">
        <div className="hero">
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
          <Link to="/jiz" className="action-button primary-button yalla-button">
            {t.yallaJiz}
          </Link>
        </div>

        <section className="why-wajez">
          <h2>{t.whyWajez}</h2>
          
          <div className="feature-row">
            <div className="feature-content">
              <h3>{t.saveTime}</h3>
              <p>{t.saveTimeDesc}</p>
            </div>
            <div className="feature-image">
              <img src="/save-time.svg" alt="Save Time Illustration" />
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-image">
              <img src="/productivity.svg" alt="Boost Productivity Illustration" />
            </div>
            <div className="feature-content">
              <h3>{t.boostProductivity}</h3>
              <p>{t.boostProductivityDesc}</p>
            </div>
          </div>
        </section>

        <section className="features">
          <h2>{t.whatWajezCanDo}</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </div>
              <h3>{t.structuredTables}</h3>
              <p>{t.structuredTablesDesc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="12" x2="14.5" y2="14.5"/>
                </svg>
              </div>
              <h3>{t.jsonExport}</h3>
              <p>{t.jsonExportDesc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h3>{t.smartAnalysis}</h3>
              <p>{t.smartAnalysisDesc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                  <rect x="9" y="9" width="6" height="6"/>
                  <line x1="9" y1="1" x2="9" y2="4"/>
                  <line x1="15" y1="1" x2="15" y2="4"/>
                  <line x1="9" y1="20" x2="9" y2="23"/>
                  <line x1="15" y1="20" x2="15" y2="23"/>
                  <line x1="20" y1="9" x2="23" y2="9"/>
                  <line x1="20" y1="14" x2="23" y2="14"/>
                  <line x1="1" y1="9" x2="4" y2="9"/>
                  <line x1="1" y1="14" x2="4" y2="14"/>
                </svg>
              </div>
              <h3>{t.multiFormat}</h3>
              <p>{t.multiFormatDesc}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <img src="/logo.svg" alt="W" className="logo-image" />
              <span className="logo-text">ajez</span>
            </div>
            <p className="footer-description">{t.footerDesc}</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>{t.company}</h4>
              <span className="footer-link">{t.privacyPolicy}</span>
              <span className="footer-link">{t.terms}</span>
            </div>
            
            <div className="footer-section">
              <h4>{t.support}</h4>
              <span className="footer-link">{t.contact}</span>
              <span className="footer-link">{t.faq}</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{t.copyright}</p>
        </div>
      </footer>
    </div>
  )
}

export default Home 