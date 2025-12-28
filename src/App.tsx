import { useStore } from './store/useStore';
import { FileUpload } from './components/FileUpload';
import { TimetableGrid } from './components/TimetableGrid';
import { StudentGroupSelector } from './components/StudentGroupSelector';
import { SettingsModal } from './components/SettingsModal';
import { Calendar, Download, Printer, Settings, FileSpreadsheet, Users } from 'lucide-react';
import { generateExcel } from './utils/excelExport';
import { downloadXML } from './utils/xmlExport';

function App() {
  const { data, settings, isSettingsOpen, setSettingsOpen } = useStore();

  const handlePrint = () => window.print();

  const handleExportExcel = async () => {
    if (data) {
      await generateExcel(data, settings, 'groups');
    }
  };

  const handleExportExcelTeachers = async () => {
    if (data) {
      await generateExcel(data, settings, 'teachers');
    }
  };

  const handleDownloadXML = () => {
    if (data) {
      downloadXML(data, 'activities_modified.xml');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 print:block print:h-auto print:bg-white">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-none">
                reFET
              </h1>
              <p className="text-xs text-gray-500 font-medium -mt-0.5">Per refer el que ha fet FET</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center space-x-4">
              <StudentGroupSelector />

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrint} title="Imprimir a PDF" className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors">
                  <Printer size={20} />
                </button>
                <button onClick={handleExportExcel} title="Exportar a Excel (Grups)" className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors">
                  <FileSpreadsheet size={20} />
                </button>
                <button onClick={handleExportExcelTeachers} title="Exportar a Excel (Professors)" className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                  <Users size={20} />
                </button>
                <button onClick={handleDownloadXML} title="Descarregar XML (Activities)" className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors">
                  <Download size={20} />
                </button>
                <button onClick={() => setSettingsOpen(true)} title="Configuració" className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col print:block print:h-auto print:overflow-visible">
        {!data ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <FileUpload />
          </div>
        ) : (
          <TimetableGrid />
        )}
      </main>

      {/* Credits Footer */}
      <div className="fixed bottom-2 right-2 text-[10px] text-gray-400 pointer-events-none select-none z-50 print:text-gray-600 print:bottom-0 print:right-0">
        Fet per: Francesc Sala Carbó
      </div>
    </div>
  );
}

export default App;
