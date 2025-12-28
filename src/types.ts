export interface Teacher {
    id: string;
    name: string;
}

export interface Subject {
    id: string;
    name: string;
}

export interface StudentGroup {
    id: string;
    name: string;
}

export interface Room {
    id: string;
    name: string;
    capacity?: number;
}

export interface Activity {
    id: string;
    teacherIds: string[];
    subjectId: string;
    groupIds: string[];
    duration: number;
    totalDuration: number;
    active: boolean;
    comments?: string;
    // Fields from activities.xml
    day?: string;
    hour?: string;
    roomId?: string;
}

export interface TimeSlot {
    day: string;
    hour: string;
}

export interface FetData {
    teachers: Teacher[];
    subjects: Subject[];
    studentGroups: StudentGroup[];
    rooms: Room[];
    activities: Activity[];
    days: string[];
    hours: string[];
    // Extended Metadata for Export
    dayIdMap?: Record<string, string>; // Maps Display Name (Dijous) -> ID (D4)
}
