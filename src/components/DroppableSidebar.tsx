import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface Props {
    children: React.ReactNode;
}

export const DroppableSidebar: React.FC<Props> = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'sidebar-unplaced',
    });

    return (
        <div
            ref={setNodeRef}
            className={`w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 transition-colors print:hidden ${isOver ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
        >
            {children}
        </div>
    );
};
