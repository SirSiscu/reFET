import React from 'react';
import { useStore } from '../store/useStore';

export const StudentGroupSelector: React.FC = () => {
    const { data, selectedGroupId, setSelectedGroupId } = useStore();

    if (!data) return null;

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="group-select" className="text-sm font-medium text-gray-700">
                Curs:
            </label>
            <select
                id="group-select"
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                <option value="">Tots els grups</option>
                <option value="__NO_GROUP__">Activitats sense grup</option>
                {data.studentGroups
                    .filter(group => data.activities.some(a => a.groupIds.includes(group.id)))
                    .map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
            </select>
        </div>
    );
};
