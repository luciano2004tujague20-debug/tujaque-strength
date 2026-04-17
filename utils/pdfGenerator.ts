import { PDFDocument, rgb } from 'pdf-lib';

// Extraemos la lógica de limpieza de texto
const cleanText = (str: string | undefined | null) => {
    if (!str) return "";
    let s = str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[\u2026]/g, "...");
    return s.replace(/[^\x20-\x7E\xA0-\xFF]/g, ""); 
};

// 1. Función para generar PDF dinámico (1 semana) - INTACTA
export const generateAndDownloadPDF = async (order: any, checkin: any, viewingBiiProgram: any) => {
    const response = await fetch('/plantilla-blanco.pdf');
    if (!response.ok) throw new Error("No se pudo cargar la plantilla PDF del servidor.");
    const existingPdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 

    const macro = order?.macrocycle || '1';
    const meso = viewingBiiProgram?.mesocycle || order?.mesocycle || '1';
    const week = viewingBiiProgram?.week || order?.microcycle || '1';

    // ─── HOJA 1: PORTADA ───
    const nameText = cleanText(order?.customer_name) || 'ATLETA TUJAGUE';
    firstPage.drawText(nameText.toUpperCase(), { x: 120, y: 665, size: 10, color: rgb(0, 0, 0) });
    
    const weightText = cleanText(checkin?.weight || order?.body_weight) || '-';
    firstPage.drawText(weightText, { x: 420, y: 665, size: 10, color: rgb(0, 0, 0) });

    const goalText = cleanText(order?.goal) || 'FUERZA / HIPERTROFIA';
    firstPage.drawText(goalText.toUpperCase(), { x: 120, y: 635, size: 10, color: rgb(0, 0, 0) });
    
    firstPage.drawText(`Macro: ${macro} | Meso: ${meso} | Semana: ${week}`, { x: 380, y: 635, size: 10, color: rgb(0, 0, 0) });

    // ─── HOJAS DE RUTINA (2 a 8) ───
    const drawDayData = (pageIdx: number, dayIndex: number) => {
        const page = pages[pageIdx];
        if (!page) return;

        const dayData = viewingBiiProgram?.days?.[dayIndex];

        if (!dayData || dayData.isRestDay || !dayData.exercises || dayData.exercises.length === 0) {
            page.drawText("DESCANSO / RECUPERACION", { x: 65, y: 720, size: 12, color: rgb(0, 0, 0) });
            return;
        }

        let summaryY = 720; 
        page.drawText(`FOCO DEL DÍA: ${cleanText(dayData.title?.toUpperCase() || 'ENTRENAMIENTO')}`, { x: 60, y: summaryY, size: 11, color: rgb(0, 0, 0) });
        summaryY -= 25; 

        dayData.exercises.forEach((ex: any, i: number) => {
            const exName = cleanText(ex.name?.toUpperCase() || 'EJERCICIO');
            const setsCount = Array.isArray(ex?.sets) ? ex.sets.length : (ex?.sets || '-');
            const targetReps = Array.isArray(ex?.sets) ? (ex.sets[0]?.targetReps || '-') : '-';
            
            page.drawText(`${i + 1}. ${exName}`, { x: 60, y: summaryY, size: 10, color: rgb(0, 0, 0) });
            summaryY -= 14;
            
            page.drawText(`    > Series: ${setsCount}  |  Reps Obj: ${targetReps}  |  RPE: ${ex?.rpe || '-'}  |  Descanso: ${ex?.rest || '-'}`, { x: 60, y: summaryY, size: 9, color: rgb(0.2, 0.2, 0.2) });
            summaryY -= 14;

            if (ex.notes || ex.technique) {
                page.drawText(`    - Notas: ${cleanText(ex.notes || ex.technique)}`, { x: 60, y: summaryY, size: 8, color: rgb(0.4, 0.4, 0.4) });
                summaryY -= 14;
            }
            summaryY -= 10; 
        });

        let tableStartY = 398; 
        const rowHeight = 22.5; 
        
        dayData.exercises.forEach((ex: any, i: number) => {
            if (i > 7) return; 
            const exName = cleanText(ex.name?.toUpperCase() || 'EJERCICIO');
            page.drawText(`${i+1}. ${exName}`, { x: 65, y: tableStartY, size: 8, color: rgb(0, 0, 0) });
            tableStartY -= rowHeight; 
        });
    };

    drawDayData(2, 0); 
    drawDayData(3, 1);
    drawDayData(4, 2); 
    drawDayData(5, 3); 
    drawDayData(6, 4); 
    drawDayData(7, 5); 
    drawDayData(8, 6); 

    // Guardar y descargar
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    
    const safeName = cleanText(order?.customer_name)?.replace(/\s+/g, '_') || 'Plan';
    link.download = `Tujague_Strength_${safeName}_Semana_${week}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 🔥 2. NUEVA FUNCIÓN BLINDADA: Une los 3 PDFs desde Supabase Storage Privado 🔥
export const mergeAndDownload12WeekPDF = async (supabase: any, customerName: string | undefined | null) => {
    try {
        // Creamos un documento PDF en blanco que será nuestro "Maestro"
        const mergedPdf = await PDFDocument.create();

        // ⚠️ ATENCIÓN 1: Nombres exactos de tus archivos en el bucket de Supabase
        const pdfFiles = [
            'mesociclo_fuerza.pdf', 
            'mesociclo_hipertrofia.pdf', 
            'mesociclo_definicion.pdf'
        ];

        // ⚠️ ATENCIÓN 2: Cambia 'boveda_pdfs' por el nombre real de tu Bucket en Supabase
        const BUCKET_NAME = 'boveda_pdfs';

        // Recorremos los 3 PDFs pidiéndoselos a Supabase de forma segura
        for (const fileName of pdfFiles) {
            const { data, error } = await supabase.storage.from(BUCKET_NAME).download(fileName);
            
            if (error || !data) {
                throw new Error(`Acceso denegado o archivo no encontrado (${fileName}): ${error?.message || 'Sin datos'}`);
            }
            
            // Transformamos el archivo protegido en memoria para procesarlo
            const pdfBytes = await data.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes);
            
            // Copiamos todas las páginas de este mesociclo
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // Las pegamos en el documento Maestro
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Generamos el archivo final unificado
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        
        // Le ponemos el nombre del atleta
        const safeName = cleanText(customerName)?.replace(/\s+/g, '_') || 'Atleta';
        link.download = `Tujague_Strength_${safeName}_Plan_12_Semanas.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error crítico al unificar los PDFs desde Supabase:", error);
        throw error;
    }
};