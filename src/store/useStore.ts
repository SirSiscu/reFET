import { create } from 'zustand';
import type { FetData } from '../types';
import { parseAndMergeFetData } from '../utils/fetParser';

interface StoreState {
    data: FetData | null;
    isLoading: boolean;
    error: string | null;
    selectedGroupId: string | null;
    settings: {
        startTime: string;
        minPerSlot: number;
    };
    isSettingsOpen: boolean;
    loadFetData: (fetXml: string, activitiesXml: string) => void;
    moveActivity: (activityId: string, day: string | undefined, hour: string | undefined, roomId: string | undefined) => void;
    setSelectedGroupId: (id: string | null) => void;
    updateSettings: (startTime: string, minPerSlot: number) => void;
    setSettingsOpen: (isOpen: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
    data: null,
    isLoading: false,
    error: null,
    selectedGroupId: null,
    settings: {
        startTime: '08:00',
        minPerSlot: 30
    },
    isSettingsOpen: false,

    loadFetData: (fetXml: string, activitiesXml: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = parseAndMergeFetData(fetXml, activitiesXml);
            set({ data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to parse FET files', isLoading: false });
        }
    },

    moveActivity: (activityId, day, hour, roomId) => {
        set((state) => {
            if (!state.data) return state;

            const updatedActivities = state.data.activities.map((act) => {
                if (act.id === activityId) {
                    return { ...act, day, hour, roomId: roomId ?? act.roomId };
                }
                return act;
            });

            return {
                data: {
                    ...state.data,
                    activities: updatedActivities,
                },
            };
        });
    },

    setSelectedGroupId: (id) => set({ selectedGroupId: id }),
    updateSettings: (startTime, minPerSlot) => set({ settings: { startTime, minPerSlot } }),
    setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
}));
