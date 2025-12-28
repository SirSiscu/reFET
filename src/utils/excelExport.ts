import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { FetData, Activity } from '../types';
import { stringToColor } from './colors';

interface ExportSettings {
    startTime: string;
    minPerSlot: number;
}

type ExportMode = 'groups' | 'teachers';

export const generateExcel = async (data: FetData, settings: ExportSettings, mode: ExportMode = 'groups') => {
    const workbook = new ExcelJS.Workbook();
    const { days, hours, activities, subjects, teachers } = data;

    // Helper to calculate time label
    const getTimeLabel = (index: number) => {
        const [startH, startM] = settings.startTime.split(':').map(Number);
        const totalStartMins = startH * 60 + startM;
        const currentMins = totalStartMins + (index * settings.minPerSlot);

        const h = Math.floor(currentMins / 60);
        const m = currentMins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const createSheet = (sheetName: string, sheetActivities: Activity[], subtitleMode: 'teacher' | 'group' | 'room') => {
        // Sheet name limited to 31 chars in Excel
        const safeName = sheetName.replace(/[*?:\/[\]]/g, '').substring(0, 31);
        const worksheet = workbook.addWorksheet(safeName);

        // Columns: "Hora" + Days
        const cols = [
            { header: 'Hora', key: 'time', width: 15 },
            ...days.map(d => ({ header: d, key: d, width: 25 }))
        ];
        worksheet.columns = cols as any;

        // Header Style
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' } // Light gray
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;

        // Pre-fill Rows with Time Labels
        hours.forEach((_, index) => {
            const rowIndex = index + 2; // 1-based, +1 for header
            const row = worksheet.getRow(rowIndex);
            const timeStr = getTimeLabel(index);
            const cell = row.getCell(1);
            cell.value = timeStr;
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { right: { style: 'thin' } };
        });

        // Place Activities
        sheetActivities.forEach(act => {
            if (!act.day || !act.hour) return;

            const dayIndex = days.indexOf(act.day);
            const hourIndex = hours.indexOf(act.hour);
            // NOTE: This relies on exact string match. If using IDs, we must resolve. 
            // Current app uses IDs for logic but 'day' field on activity might be ID or Name depending on parse.
            // Earlier I made xmlExport map BACK to ID. Internally 'act.day' is Name (Dilluns) or ID?
            // Parse logic: `existing.day = dayMap.get(ta.Day) || ta.Day`. 'dayMap' is ID -> LongName.
            // So internal state has LongName ("Dilluns").
            // 'days' array has LongNames. So indexOf matches.

            if (dayIndex === -1 || hourIndex === -1) return;

            const startRow = hourIndex + 2;
            const col = dayIndex + 2;

            const subjectName = subjects.find(s => s.id === act.subjectId)?.name || act.subjectId;

            // Determine Subtitle (Line 2)
            let secondLine = '';
            if (subtitleMode === 'teacher') {
                // Show Teacher Names
                secondLine = act.teacherIds.map(t => teachers.find(tr => tr.id === t)?.name || t).join(', ');
            } else {
                // Show Group Names (for Teacher View)
                secondLine = act.groupIds.join(', ');
            }
            // Add Room if available? User didn't explicitly ask, but it's useful.
            // Let's stick to user request: "Subject" (Color) + "Group/Teacher"

            const { bg } = stringToColor(act.subjectId);
            const argbColor = 'FF' + bg.replace('#', '').toUpperCase();

            const cell = worksheet.getCell(startRow, col);

            const richValue = {
                richText: [
                    { text: subjectName, font: { bold: true, size: 11, name: 'Calibri' } },
                    { text: '\n' },
                    { text: secondLine, font: { italic: true, size: 9, name: 'Calibri' } }
                ]
            };

            cell.value = richValue;
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: argbColor }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Merge Vertical
            if (act.duration > 1) {
                const endRow = startRow + act.duration - 1;
                try {
                    worksheet.mergeCells(startRow, col, endRow, col);
                } catch (e) {
                    // Overlaps logic
                }
            }
        });
    }

    if (mode === 'groups') {
        const allGroups = Array.from(new Set(activities.flatMap(a => a.groupIds))).sort();
        for (const group of allGroups) {
            const groupActivities = activities.filter(a => a.groupIds.includes(group));
            createSheet(group, groupActivities, 'teacher');
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'horari_per_grups.xlsx');
    } else {
        // Teacher Mode
        for (const teacher of teachers) {
            const teacherActivities = activities.filter(a => a.teacherIds.includes(teacher.id));
            if (teacherActivities.length > 0) {
                createSheet(teacher.name, teacherActivities, 'group');
            }
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'horari_per_professors.xlsx');
    }
};
