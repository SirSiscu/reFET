import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Activity } from '../types';
import { useStore } from '../store/useStore';
import { stringToColor } from '../utils/colors';

interface CardProps {
    activity: Activity;
    isSidebar?: boolean;
    conflictMessage?: string;
    styleOverride?: React.CSSProperties;
    useVerticalText?: boolean;
    isDragging?: boolean;
    isOverlay?: boolean;
    dragListeners?: any;
    dragAttributes?: any;
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: React.CSSProperties;
    onToggleZ?: () => void;
    isSentToBack?: boolean;
}

export const ActivityCard: React.FC<CardProps> = ({
    activity,
    isSidebar,
    conflictMessage,
    styleOverride,
    useVerticalText,
    isDragging,
    isOverlay,
    dragListeners,
    dragAttributes,
    setNodeRef,
    style,
    onToggleZ,
    isSentToBack
}) => {
    const { data } = useStore();
    const colors = stringToColor(activity.subjectId);

    // Height calculation
    const heightStyle = !isSidebar ? {
        height: `calc(var(--row-height) * ${activity.duration} - 2px)`,
        position: 'absolute' as 'absolute',
        top: '2px',
        left: '2px',
        right: '2px',
    } : {};

    const baseZ = isSidebar ? 10 : (isSentToBack ? 1 : 20);
    const finalBorder = conflictMessage ? '#ef4444' : (isSentToBack ? '#d1d5db' : colors.border);
    const finalBg = conflictMessage ? '#fef2f2' : (isSentToBack ? '#f3f4f6' : colors.bg);

    const mergedStyle = {
        zIndex: isOverlay ? 999 : (isDragging ? 100 : baseZ),
        backgroundColor: finalBg,
        borderColor: finalBorder,
        borderWidth: conflictMessage ? '2px' : '1px',
        opacity: isDragging && !isOverlay ? 0.3 : 1, // Dim original when dragging
        '--duration': activity.duration, // Pass for CSS
        ...heightStyle,
        ...styleOverride,
        ...style,
    } as any;

    const subjectName = data?.subjects.find(s => s.id === activity.subjectId)?.name || activity.subjectId;
    const teacherName = activity.teacherIds
        .map(tid => data?.teachers.find(t => t.id === tid)?.name || tid)
        .join(' / ');
    const groups = activity.groupIds.join(', ');

    return (
        <div
            ref={setNodeRef}
            style={mergedStyle}
            {...dragListeners}
            {...dragAttributes}
            onClick={onToggleZ}
            title={`${subjectName}\n${teacherName}\n${groups}\n${conflictMessage || ""}`}
            className={`activity-card p-1 rounded shadow-sm border cursor-grab active:cursor-grabbing transition-all overflow-hidden ${isDragging || isOverlay
                ? 'shadow-xl scale-105'
                : 'hover:opacity-90 hover:shadow-md'
                } ${useVerticalText ? 'flex items-center justify-center text-center' : ''}`}
        >
            {useVerticalText ? (
                <div style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="text-[10px] leading-tight whitespace-nowrap flex items-center justify-start h-full w-full p-1 gap-2">
                    <span className="font-bold text-gray-800 shrink-0">{subjectName}</span>
                    <span className="text-gray-600 text-[9px] truncate">{teacherName}</span>
                </div>
            ) : (
                <>
                    <div className="font-bold text-gray-800 truncate text-xs" title={subjectName}>
                        {subjectName}
                    </div>
                    <div className="text-gray-600 truncate text-[10px]" title={teacherName}>
                        {teacherName}
                    </div>
                    <div className="text-gray-500 truncate text-[9px]" title={groups}>
                        {groups}
                    </div>
                </>
            )}
        </div>
    );
};

interface Props {
    activity: Activity;
    isSidebar?: boolean;
    conflictMessage?: string;
    styleOverride?: React.CSSProperties;
    useVerticalText?: boolean;
}

export const DraggableActivity: React.FC<Props> = (props) => {
    const { activity } = props;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: activity.id,
        data: { activity }
    });

    const [isSentToBack, setIsSentToBack] = React.useState(false);

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <ActivityCard
            {...props}
            isDragging={isDragging}
            setNodeRef={setNodeRef}
            dragListeners={listeners}
            dragAttributes={attributes}
            style={style}
            isSentToBack={isSentToBack}
            onToggleZ={() => setIsSentToBack(!isSentToBack)}
        />
    );
};
