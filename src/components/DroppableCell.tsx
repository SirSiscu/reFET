import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface Props {
    day: string;
    hour: string;
    children: React.ReactNode;
    hasConflict?: boolean;
    isTeacherBusy?: boolean;
}

export const DroppableCell: React.FC<Props> = ({ day, hour, children, hasConflict, isTeacherBusy }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `${day}::${hour}`,
        data: { day, hour }
    });

    const conflictStyle = hasConflict ? 'ring-2 ring-inset ring-red-500 bg-red-50/30' : '';
    // Warning style (orange) for teacher busy, but conflict (red) takes precedence
    const warningStyle = !hasConflict && isTeacherBusy ? 'bg-orange-100 ring-2 ring-inset ring-orange-300' : '';
    const hoverStyle = isOver ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-200' : 'bg-transparent';

    return (
        <div
            ref={setNodeRef}
            className={`h-24 p-1 border-r border-b border-gray-100 relative transition-colors ${conflictStyle || warningStyle || hoverStyle}`}
        >
            {children}
        </div>
    );
};
