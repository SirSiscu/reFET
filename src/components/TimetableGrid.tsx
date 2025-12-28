import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    defaultDropAnimationSideEffects,
    pointerWithin,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DropAnimation } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { DroppableSidebar } from './DroppableSidebar';
import { DroppableCell } from './DroppableCell';
import { DraggableActivity, ActivityCard } from './DraggableActivity';
import type { Activity } from '../types';

export const TimetableGrid: React.FC = () => {
    const { data, moveActivity, selectedGroupId, settings, setSettingsOpen } = useStore();
    const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    if (!data) return null;

    const { days, hours, activities } = data;

    // Helper to calculate time label
    const getTimeLabel = (index: number) => {
        const [startH, startM] = settings.startTime.split(':').map(Number);
        const totalStartMins = startH * 60 + startM;
        const currentMins = totalStartMins + (index * settings.minPerSlot);

        const h = Math.floor(currentMins / 60);
        const m = currentMins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activityC = activities.find(a => a.id === active.id);
        if (activityC) setActiveActivity(activityC);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveActivity(null);

        if (over) {
            if (over.id === 'sidebar-unplaced') {
                moveActivity(active.id as string, undefined, undefined, undefined);
                return;
            }

            // over.id is formatted as "Day::Hour"
            const [day, hour] = (over.id as string).split('::');
            if (day && hour) {
                moveActivity(active.id as string, day, hour, undefined);
            }
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // Helper to get activities for a cell
    const getActivitiesForCell = (day: string, hour: string) => {
        return activities.filter(a => {
            const timeMatch = a.day === day && a.hour === hour;
            if (!timeMatch) return false;

            // Filter by selected group if one is active
            if (selectedGroupId) {
                if (selectedGroupId === '__NO_GROUP__') {
                    // Show activities with NO group assigned
                    return a.groupIds.length === 0;
                }
                return a.groupIds.includes(selectedGroupId);
            }

            // "All Groups" View: Exclude activities with NO group
            return a.groupIds.length > 0;
        });
    };

    // Helper: Calculate greedy column assignment for a set of activities in a Day
    // Returns Map<ActivityId, {col: number, totalCols: number}>
    // Used for "No Group" view dynamic layout
    const calculateGreedyColumns = (day: string) => {
        // 1. Get all activities for this day (filtered by current view context)
        const dayActivities = activities.filter(a => {
            if (a.day !== day) return false;
            if (selectedGroupId === '__NO_GROUP__') return a.groupIds.length === 0;
            return false; // Only used for NO_GROUP view currently
        });

        // 2. Sort by start hour (and duration desc)
        dayActivities.sort((a, b) => {
            const hA = hours.indexOf(a.hour || '');
            const hB = hours.indexOf(b.hour || '');
            if (hA !== hB) return hA - hB;
            return b.duration - a.duration;
        });

        const columns: Activity[][] = [];
        const assignment = new Map<string, { col: number, totalCols: number }>();

        dayActivities.forEach(act => {
            const actStart = hours.indexOf(act.hour || '');
            const actEnd = actStart + act.duration;

            // Find first column where it fits
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                // Check intersection with all in column
                const hasOverlap = columns[i].some(existing => {
                    const eStart = hours.indexOf(existing.hour || '');
                    const eEnd = eStart + existing.duration;
                    return actStart < eEnd && actEnd > eStart;
                });

                if (!hasOverlap) {
                    columns[i].push(act);
                    assignment.set(act.id, { col: i, totalCols: 0 }); // totalCols updated later
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                columns.push([act]);
                assignment.set(act.id, { col: columns.length - 1, totalCols: 0 });
            }
        });

        // Update totalCols
        const total = columns.length;
        dayActivities.forEach(a => {
            const entry = assignment.get(a.id);
            if (entry) {
                entry.totalCols = total;
                assignment.set(a.id, entry);
            }
        });

        return assignment;
    };

    const noGroupColumnMap = React.useMemo(() => {
        if (selectedGroupId !== '__NO_GROUP__') return new Map();
        const map = new Map<string, { col: number, totalCols: number }>();
        days.forEach(day => {
            const dayAssignment = calculateGreedyColumns(day);
            dayAssignment.forEach((val, key) => map.set(key, val));
        });
        return map;
    }, [activities, selectedGroupId, days, hours]);

    // Calculate conflicts
    // We need to know if a specific slot (day, hour) is occupied by COMPETING activities.
    // Competing = Same Student Group.
    // Parallel classes (Group A vs Group B) are NOT conflicts.
    // We reuse slotUsageMap logic but for all activities.

    const conflictMap = new Map<string, number>(); // <SlotKey, count> -> Actually strict boolean map would be better but we keep 'count' > 1 triggers red.


    // First: Populate activities per slot (Global)
    const activitiesInSlot = new Map<string, Activity[]>();

    activities.forEach(act => {
        if (!act.day || !act.hour) return;

        const startHourIndex = hours.indexOf(act.hour);
        if (startHourIndex === -1) return;

        for (let i = 0; i < act.duration; i++) {
            const currentHour = hours[startHourIndex + i];
            if (currentHour) {
                const key = `${act.day}::${currentHour}`;
                const list = activitiesInSlot.get(key) || [];
                list.push(act);
                activitiesInSlot.set(key, list);
            }
        }
    });

    // Second: Check for collisions in each slot
    activitiesInSlot.forEach((acts, key) => {
        if (acts.length <= 1) return;

        // Check pairwise
        let hasCollision = false;
        for (let i = 0; i < acts.length; i++) {
            for (let j = i + 1; j < acts.length; j++) {
                const actA = acts[i];
                const actB = acts[j];

                // Intersection of groupIds
                const hasSharedGroup = actA.groupIds.some(g => actB.groupIds.includes(g));
                if (hasSharedGroup) {
                    hasCollision = true;
                    break;
                }
            }
            if (hasCollision) break;
        }

        if (hasCollision) {
            // We use '2' to trigger the existing logic '> 1'
            conflictMap.set(key, 2);
        }
    });

    // Calculate teacher busy slots for the CURRENTLY DRAGGING activity
    const teacherBusySlots = React.useMemo(() => {
        if (!activeActivity) return new Set<string>();

        const busy = new Set<string>();
        const activeTeachers = activeActivity.teacherIds; // Array
        if (!activeTeachers || activeTeachers.length === 0) return busy;

        activities.forEach(act => {
            // Skip the activity itself
            if (act.id === activeActivity.id) return;
            // Skip unplaced
            if (!act.day || !act.hour) return;

            // Check if any teacher overlaps
            const hasCommonTeacher = act.teacherIds.some(t => activeTeachers.includes(t));
            if (!hasCommonTeacher) return;

            // Mark slots
            const startHourIndex = hours.indexOf(act.hour);
            if (startHourIndex === -1) return;

            for (let i = 0; i < act.duration; i++) {
                const currentHour = hours[startHourIndex + i];
                if (currentHour) {
                    busy.add(`${act.day}::${currentHour}`);
                }
            }
        });

        return busy;
    }, [activeActivity, activities, hours]);

    // Calculate Teacher Conflicts (Persistent)
    const teacherConflictMap = new Map<string, string>(); // ActivityId -> Conflict Message
    // We need to map Slot -> [Activity] to check for teacher overlaps
    const slotUsageMap = new Map<string, Activity[]>();

    activities.forEach(act => {
        if (!act.day || !act.hour || act.teacherIds.length === 0) return;

        const startHourIndex = hours.indexOf(act.hour);
        if (startHourIndex === -1) return;

        for (let i = 0; i < act.duration; i++) {
            const currentHour = hours[startHourIndex + i];
            if (currentHour) {
                const key = `${act.day}::${currentHour}`;
                const currentList = slotUsageMap.get(key) || [];
                currentList.push(act);
                slotUsageMap.set(key, currentList);
            }
        }
    });

    // Now check each slot for multiple activities with SAME teacher
    slotUsageMap.forEach((actsInSlot, slotKey) => {
        const teacherGroups = new Map<string, Activity[]>();

        // For each activity in the slot, explode by teacher
        actsInSlot.forEach(a => {
            a.teacherIds.forEach(tid => {
                const list = teacherGroups.get(tid) || [];
                list.push(a);
                teacherGroups.set(tid, list);
            });
        });

        teacherGroups.forEach((teacherActs, teacherId) => {
            if (teacherActs.length > 1) {
                // Conflict found for this teacher
                teacherActs.forEach(act => {
                    const others = teacherActs.filter(other => other.id !== act.id);
                    if (others.length === 0) return; // Should not happen if length > 1

                    // Localized message
                    const otherNames = others.map(o => o.groupIds.join(', ')).join(' & ');
                    const msg = `Incompatibilitat: El docent ${teacherId} també imparteix ${otherNames} a ${slotKey.replace('::', ' ')}`;
                    teacherConflictMap.set(act.id, msg);
                });
            }
        });
    });

    // Unplaced activities
    const unplacedActivities = activities.filter(a => (!a.day || !a.hour) && (!selectedGroupId || a.groupIds.includes(selectedGroupId)));

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                {/* Unplaced Activities Sidebar */}
                <DroppableSidebar>
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-800">Activitats Pendents</h2>
                        <div className="text-xs text-gray-500">{unplacedActivities.length} ítems</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {unplacedActivities.map(activity => (
                            <DraggableActivity key={activity.id} activity={activity} isSidebar={true} />
                        ))}
                    </div>
                </DroppableSidebar>

                {/* Main Grid */}
                <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
                    <div className="inline-block min-w-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden print:shadow-none print:border-none">
                        <div className="grid" style={{ gridTemplateColumns: `auto repeat(${days.length}, minmax(150px, 1fr))` }}>
                            {/* Header Row */}
                            <div className="p-4 bg-gray-50 border-b border-r border-gray-200 font-semibold text-gray-400 text-xs uppercase tracking-wider sticky top-0 left-0 z-20">
                                <span>Hora</span>
                            </div>
                            {days.map(day => (
                                <div key={day} className="p-4 bg-gray-50 border-b border-r-2 border-r-gray-300 font-bold text-gray-700 text-center sticky top-0 z-10">
                                    {day}
                                </div>
                            ))}

                            {/* Rows */}
                            {hours.map((hour, index) => (
                                <React.Fragment key={hour}>
                                    {/* Hour Label */}
                                    <div
                                        onClick={() => setSettingsOpen(true)}
                                        className="p-4 border-b border-r border-gray-200 bg-gray-50 font-semibold text-gray-600 text-sm sticky left-0 z-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                        title="Configurar horaris"
                                    >
                                        <span>{getTimeLabel(index)}</span>
                                        <span className="text-[10px] text-gray-400 font-normal">{hour}</span>
                                    </div>
                                    {/* Cells */}
                                    {days.map(day => {
                                        const slotKey = `${day}::${hour}`;
                                        const isConflict = (conflictMap.get(slotKey) || 0) > 1;
                                        const isBusy = teacherBusySlots.has(slotKey);

                                        const cellActivities = getActivitiesForCell(day, hour);
                                        const isAllGroupsView = !selectedGroupId; // View mode where we want columns

                                        // All Groups View: Stable Columns Logic
                                        let dayGroupIds: string[] = [];
                                        if (isAllGroupsView) {
                                            const activeGroupsInDay = new Set<string>();
                                            activities.forEach(a => {
                                                if (a.day === day && a.groupIds.length > 0) {
                                                    activeGroupsInDay.add(a.groupIds[0]);
                                                }
                                            });
                                            dayGroupIds = Array.from(activeGroupsInDay).sort();
                                        }

                                        return (
                                            <div key={slotKey} className="border-b border-gray-200 border-r-2 border-r-gray-300 relative" style={{ height: 'var(--row-height)' }}>
                                                <DroppableCell
                                                    day={day}
                                                    hour={hour}
                                                    hasConflict={isConflict}
                                                    isTeacherBusy={isBusy}
                                                >
                                                    {cellActivities.map((activity, index) => {
                                                        let styleOverride: React.CSSProperties | undefined = undefined;
                                                        let useVerticalText = false;

                                                        if (isAllGroupsView && dayGroupIds.length > 0) {
                                                            const totalCols = dayGroupIds.length;
                                                            let colIndex = 0;
                                                            if (activity.groupIds.length > 0) {
                                                                colIndex = dayGroupIds.indexOf(activity.groupIds[0]);
                                                            }
                                                            if (colIndex === -1) colIndex = 0;

                                                            const widthPct = 100 / totalCols;
                                                            const leftPct = colIndex * widthPct;

                                                            styleOverride = {
                                                                width: `${widthPct}%`,
                                                                left: `${leftPct}%`,
                                                            };
                                                            if (totalCols >= 4) useVerticalText = true;
                                                        } else if (selectedGroupId === '__NO_GROUP__') {
                                                            const layout = noGroupColumnMap.get(activity.id);
                                                            if (layout && layout.totalCols > 0) {
                                                                const widthPct = 100 / layout.totalCols;
                                                                const leftPct = layout.col * widthPct;
                                                                styleOverride = {
                                                                    width: `${widthPct}%`,
                                                                    left: `${leftPct}%`,
                                                                };
                                                                if (layout.totalCols >= 4) useVerticalText = true;
                                                            }
                                                        } else if (isAllGroupsView && cellActivities.length > 1) {
                                                            const widthPct = 100 / cellActivities.length;
                                                            const leftPct = index * widthPct;
                                                            styleOverride = {
                                                                width: `${widthPct}%`,
                                                                left: `${leftPct}%`,
                                                            };
                                                        }

                                                        return (
                                                            <DraggableActivity
                                                                key={activity.id}
                                                                activity={activity}
                                                                conflictMessage={teacherConflictMap.get(activity.id)}
                                                                styleOverride={styleOverride}
                                                                useVerticalText={useVerticalText}
                                                            />
                                                        );
                                                    })}
                                                </DroppableCell>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeActivity ? <ActivityCard activity={activeActivity} isOverlay={true} /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </div>
        </DndContext>
    );
};
