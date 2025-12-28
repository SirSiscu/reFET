import { XMLParser } from 'fast-xml-parser';
import type { FetData, Activity, Teacher, Subject, Room, StudentGroup } from '../types';

export const parseAndMergeFetData = (fetXml: string, activitiesXml: string): FetData => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });

    const fetObj = parser.parse(fetXml);
    const activitiesObj = parser.parse(activitiesXml);

    // Helper to ensure array
    const toArray = (item: any) => Array.isArray(item) ? item : (item ? [item] : []);

    // Parse Basic Data from .fet
    const fetRoot = fetObj.fet;

    const teachers: Teacher[] = toArray(fetRoot.Teachers_List?.Teacher).map((t: any) => ({
        id: t.Name, // distinct name as ID in FET
        name: t.Name
    }));

    const subjects: Subject[] = toArray(fetRoot.Subjects_List?.Subject).map((s: any) => ({
        id: s.Name,
        name: s.Name
    }));

    const rooms: Room[] = toArray(fetRoot.Rooms_List?.Room).map((r: any) => ({
        id: r.Name,
        name: r.Name,
        capacity: r.Capacity
    }));

    // Recursive function to flatten groups
    const studentGroups: StudentGroup[] = [];

    const processGroup = (group: any) => {
        if (!group) return;

        // Add current group
        if (group.Name) {
            studentGroups.push({
                id: group.Name,
                name: group.Name
            });
        }

        // Process children (Years have Groups, Groups have Subgroups)
        const subgroups = toArray(group.Group || group.Subgroup);
        subgroups.forEach(processGroup);
    };

    const years = toArray(fetRoot.Students_List?.Year);
    years.forEach(processGroup);

    const daysRaw = toArray(fetRoot.Days_List?.Day);
    const days: string[] = daysRaw.map((d: any) => d.Long_Name || d.Name);
    const dayMap = new Map<string, string>();
    const dayIdMap: Record<string, string> = {};

    daysRaw.forEach((d: any) => {
        const name = d.Long_Name || d.Name;
        dayMap.set(d.Name, name);
        dayIdMap[name] = d.Name;
    });

    const hours: string[] = toArray(fetRoot.Hours_List?.Hour).map((h: any) => h.Name);

    // Parse Activities from .fet
    const rawActivities = toArray(fetRoot.Activities_List?.Activity);
    const activitiesMap = new Map<string, Activity>();

    rawActivities.forEach((act: any) => {
        activitiesMap.set(act.Id, {
            id: act.Id,
            teacherIds: toArray(act.Teacher),
            subjectId: act.Subject,
            groupIds: toArray(act.Students),
            duration: parseInt(act.Duration, 10),
            totalDuration: parseInt(act.Total_Duration, 10),
            active: act.Active === 'true',
            comments: act.Comments
        });
    });

    // Merge with _activities.xml data
    const timetableActivities = toArray(activitiesObj.Activities_Timetable?.Activity);

    timetableActivities.forEach((ta: any) => {
        const existing = activitiesMap.get(ta.Id);
        if (existing) {
            existing.day = dayMap.get(ta.Day) || ta.Day; // Resolve Name (D1) to Long_Name (Dilluns)
            existing.hour = ta.Hour;
            existing.roomId = ta.Room;
        }
    });

    return {
        teachers,
        subjects,
        studentGroups,
        rooms,
        activities: Array.from(activitiesMap.values()),
        days,
        hours,
        dayIdMap
    };
};
