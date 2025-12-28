import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useStore();
    const [localStart, setLocalStart] = useState(settings.startTime);
    const [localDuration, setLocalDuration] = useState(settings.minPerSlot);

    useEffect(() => {
        if (isOpen) {
            setLocalStart(settings.startTime);
            setLocalDuration(settings.minPerSlot);
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        updateSettings(localStart, Number(localDuration));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">Configuració Horària</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora d'inici</label>
                        <input
                            type="time"
                            value={localStart}
                            onChange={(e) => setLocalStart(e.target.value)}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">L'hora de la primera franja (H1).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durada franja (minuts)</label>
                        <input
                            type="number"
                            value={localDuration}
                            onChange={(e) => setLocalDuration(Number(e.target.value))}
                            className="w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minuts per cada bloc horari.</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                        Cancel·lar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                    >
                        Guardar canvis
                    </button>
                </div>
            </div>
        </div>
    );
};
