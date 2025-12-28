import type { FetData } from '../types';

export const generateXML = (data: FetData): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Activities_Timetable>\n';

    const { activities, teachers, subjects, rooms, dayIdMap } = data;

    activities.forEach(act => {
        // Skip inactive? Or export all? Export all, active usually implies filtered? 
        // Our 'active' flag in types isn't strictly used yet, assuming all in data are real.

        xml += '\t<Activity>\n';
        xml += `\t\t<Id>${act.id}</Id>\n`;

        // Day
        if (act.day) {
            // Use ID if available (D4), else name (Dijous)
            const dayVal = dayIdMap ? (dayIdMap[act.day] || act.day) : act.day;
            xml += `\t\t<Day>${dayVal}</Day>\n`;
        } else {
            xml += `\t\t<Day></Day>\n`;
        }

        if (act.hour) xml += `\t\t<Hour>${act.hour}</Hour>\n`;
        else xml += `\t\t<Hour></Hour>\n`;

        // Room
        if (act.roomId) {
            const r = rooms.find(r => r.id === act.roomId);
            const rName = r ? r.name : act.roomId;
            xml += `\t\t<Room>${rName}</Room>\n`;
        } else {
            xml += `\t\t<Room></Room>\n`;
        }

        // Subject
        const sub = subjects.find(s => s.id === act.subjectId);
        const subName = sub ? sub.name : act.subjectId;
        xml += `\t\t<Subject>${subName}</Subject>\n`;

        // Teachers
        act.teacherIds.forEach(tid => {
            const t = teachers.find(tr => tr.id === tid);
            const tName = t ? t.name : tid;
            xml += `\t\t<Teacher>${tName}</Teacher>\n`;
        });

        // Students Groups
        act.groupIds.forEach(gid => {
            xml += `\t\t<Students>${gid}</Students>\n`;
        });

        // Duration
        xml += `\t\t<Duration>${act.duration}</Duration>\n`;
        xml += `\t\t<Total_Duration>${act.totalDuration}</Total_Duration>\n`;

        // Comments
        if (act.comments) {
            xml += `\t\t<Comments>${act.comments}</Comments>\n`;
        }

        xml += '\t</Activity>\n';
    });

    xml += '</Activities_Timetable>\n';
    return xml;
};

export const downloadXML = (data: FetData, filename = 'activities.xml') => {
    const xmlContent = generateXML(data);
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
