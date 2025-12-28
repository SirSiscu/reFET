# reFET
**Per refer el que ha fet FET**

[🇨🇦 Català](#català) · [🇪🇸 Castellano](#castellano) · [🇬🇧 English](#english)

---

## <a name="català"></a> Català

reFET és una eina web intuïtiva per **visualitzar, revisar i ajustar horaris escolars** que han estat prèviament generats amb el programari lliure **FET (Free Evolutionary Timetable)**.

### Per a què serveix?
Moltes vegades, un cop generat l'horari amb el FET, cal fer petits canvis d'última hora o ajustos puntuals que no requereixen tornar a calcular tot l'horari. reFET permet fer aquests retocs de manera visual, sense haver de dominar la complexitat del programa original.

### Característiques principals
*   **Edició visual (Drag & Drop):** Mou les classes entre franges horàries simplement arrossegant-les.
*   **Detecció de conflictes:** El sistema t'avisa si un professor ja té una altra classe o si hi ha incompatibilitats de grup.
*   **Visualització clara:** Colors pastís per assignatures i filtres per grups d'alumnes o vista general ("All Groups").
*   **Exportació de dades:**
    *   **Excel (.xlsx):** Genera rellotges d'horari amb colors, a punt per imprimir o compartir.
    *   **XML:** Descarrega els canvis per tornar-los a carregar al FET si cal.
    *   **PDF:** Impressió directa des del navegador (optimitat per a format horitzontal).

### Com funciona? (Pas a pas)
1.  Genera el teu horari amb el programa **FET**.
2.  Carrega els fitxers `.fet` i `_activities.xml` (o el resultat modificat) a reFET.
3.  Revisa i mou les activitats que vulguis canviar al quadrant o a la zona de reserva.
4.  Descarrega el resultat final en el format que prefereixis.

---

## <a name="castellano"></a> Castellano

reFET es una herramienta web intuitiva para **visualizar, revisar y ajustar horarios escolares** generados previamente con el software libre **FET (Free Evolutionary Timetable)**.

### ¿Para qué sirve?
A menudo, una vez generado el horario con el FET, es necesario realizar pequeños cambios de última hora o ajustes puntuales. reFET permite realizar estos retoques de forma visual, sin necesidad de recalcular todo el horario ni dominar la complejidad técnica del programa original.

### Características principales
*   **Edición visual (Drag & Drop):** Mueve las clases entre franjas horarias simplemente arrastrándolas.
*   **Detección de conflictos:** El sistema te avisa si un docente ya tiene otra clase o si hay incompatibilidades de grupo.
*   **Visualización clara:** Colores pastel por asignaturas y filtros por grupos de alumnos.
*   **Exportación de datos:**
    *   **Excel (.xlsx):** Genera cuadrantes de horario con colores, listos para imprimir.
    *   **XML:** Descarga los cambios para volver a procesarlos en el FET si es necesario.
    *   **PDF:** Impresión directa desde el navegador.

### ¿Cómo funciona? (Paso a paso)
1.  Genera tu horario con el programa **FET**.
2.  Carga los archivos `.fet` y `_activities.xml` (o el resultado modificado) en reFET.
3.  Revisa y mueve las actividades que quieras cambiar al cuadrante o a la zona de reserva.
4.  Descarga el resultado final en el formato que prefieras.

---

## <a name="english"></a> English

reFET is an intuitive web tool to **visualize, review, and fine-tune school timetables** previously generated with the open-source software **FET (Free Evolutionary Timetable)**.

### What is it for?
Often, after generating a timetable with FET, small last-minute changes or manual adjustments are needed. reFET allows you to make these tweaks visually, avoiding the need to recalculate the entire timetable and bypassing the complexity of the original software.

### Main Features
*   **Visual Editing (Drag & Drop):** Move classes between time slots easily.
*   **Conflict Detection:** Automatically warns you if a teacher is double-booked or if there are group conflicts.
*   **Clear Visualization:** Color-coded subjects and filters by student group.
*   **Data Export:**
    *   **Excel (.xlsx):** Clean, color-formatted schedules ready for distribution.
    *   **XML:** Export changes back to a FET-compatible format.
    *   **PDF:** Direct printing from the browser.

### How it works (Step by step)
1.  Generate your timetable using the **FET** software.
2.  Load the `.fet` and `_activities.xml` files (or the modified result) into reFET.
3.  Review and move the activities you want to change to the grid or the buffer zone.
4.  Download the final result in your preferred format.

---

## Informació Tècnica / Technical Information

reFET is a **100% client-side application**. It doesn't need a database or a backend server. All processing happens in your browser, keeping your data private.

### Desenvolupament / Development
*   **Tech Stack:** React, Vite, Tailwind CSS, Zustand (state management).
*   **Local Setup:**
    ```bash
    npm install
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
    This generates a `dist/` folder that can be hosted on any static web server (GitHub Pages, Netlify, etc.).

### Llicència / License
Aquest projecte es publica sota la **GNU Affero General Public License v3 (AGPL-3.0)**.

### Autoria / Credits
Creat per: **Francesc Sala Carbó**
