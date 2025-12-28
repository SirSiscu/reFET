import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';

export const FileUpload: React.FC = () => {
    const { loadFetData, isLoading, error } = useStore();
    const [fetFile, setFetFile] = useState<File | null>(null);
    const [activitiesFile, setActivitiesFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'fet' | 'activities') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'fet') setFetFile(e.target.files[0]);
            else setActivitiesFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!fetFile || !activitiesFile) return;

        const fetText = await fetFile.text();
        const activitiesText = await activitiesFile.text();
        loadFetData(fetText, activitiesText);
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Timetable Data</h2>
                <p className="text-gray-500 mt-2">Please upload both the .fet file and the activities.xml file</p>
            </div>

            <div className="space-y-6">
                {/* FET File Input */}
                <div className={`p-4 rounded-xl border-2 transition-colors ${fetFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-indigo-400'}`}>
                    <label className="flex items-center cursor-pointer">
                        <div className={`p-2 rounded-lg ${fetFile ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {fetFile ? <CheckCircle className="w-6 h-6 text-green-600" /> : <FileType className="w-6 h-6 text-gray-500" />}
                        </div>
                        <div className="ml-4 flex-1">
                            <span className="block font-medium text-gray-900">{fetFile ? fetFile.name : 'Select .fet file'}</span>
                            <span className="block text-sm text-gray-500">{fetFile ? 'Ready to upload' : 'School structure file'}</span>
                        </div>
                        <input type="file" accept=".fet,.xml" onChange={(e) => handleFileChange(e, 'fet')} className="hidden" />
                    </label>
                </div>

                {/* Activities File Input */}
                <div className={`p-4 rounded-xl border-2 transition-colors ${activitiesFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-indigo-400'}`}>
                    <label className="flex items-center cursor-pointer">
                        <div className={`p-2 rounded-lg ${activitiesFile ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {activitiesFile ? <CheckCircle className="w-6 h-6 text-green-600" /> : <FileType className="w-6 h-6 text-gray-500" />}
                        </div>
                        <div className="ml-4 flex-1">
                            <span className="block font-medium text-gray-900">{activitiesFile ? activitiesFile.name : 'Select activities.xml'}</span>
                            <span className="block text-sm text-gray-500">{activitiesFile ? 'Ready to upload' : 'Timetable activities file'}</span>
                        </div>
                        <input type="file" accept=".xml" onChange={(e) => handleFileChange(e, 'activities')} className="hidden" />
                    </label>
                </div>

                {error && (
                    <div className="flex items-center p-4 text-red-800 rounded-lg bg-red-50">
                        <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!fetFile || !activitiesFile || isLoading}
                    className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${!fetFile || !activitiesFile || isLoading
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                >
                    {isLoading ? 'Processing...' : 'Load Timetable'}
                </button>
            </div>
        </div>
    );
};
