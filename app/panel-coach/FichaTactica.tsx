"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FichaTacticaProps {
    isOpen: boolean;
    onClose: () => void;
    client: any;
}

export default function FichaTactica({ isOpen, onClose, client }: FichaTacticaProps) {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("asignar");
    
    // 🔥 ESTADOS PARA RUTINAS 🔥
    const [clientRoutines, setClientRoutines] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
    const [routineName, setRoutineName] = useState("");
    const [routineDesc, setRoutineDesc] = useState("");
    const [saving, setSaving] = useState(false);

    // 🔥 ESTADOS PARA DÍAS (WORKOUTS) 🔥
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const [routineWorkouts, setRoutineWorkouts] = useState<any[]>([]);
    const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutWeek, setWorkoutWeek] = useState(1);
    const [workoutDay, setWorkoutDay] = useState(1);
    const [savingWorkout, setSavingWorkout] = useState(false);

    // 🔥 NUEVOS ESTADOS PARA EJERCICIOS (WORKOUT_EXERCISES) 🔥
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
    const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [editingExId, setEditingExId] = useState<string | null>(null);
    
    // Formulario de Ejercicio
    const [exName, setExName] = useState("");
    const [exSets, setExSets] = useState(4);
    const [exReps, setExReps] = useState("8-12");
    const [exRpe, setExRpe] = useState("8");
    const [exRir, setExRir] = useState(""); 
    const [exTempo, setExTempo] = useState("2010");
    const [exRest, setExRest] = useState(90);
    const [savingEx, setSavingEx] = useState(false);

    // 🚀 NUEVOS ESTADOS PARA AUDITORÍA 🚀
    const [clientSessions, setClientSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    // Efectos base
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && client) {
            fetchClientRoutines();
            fetchAuditoria(); 
            resetDrillDown();
        }
    }, [isOpen, client]);

    const resetDrillDown = () => {
        setIsCreating(false);
        setSelectedRoutine(null);
        setSelectedWorkout(null);
        setEditingRoutineId(null);
        setEditingWorkoutId(null);
        setEditingExId(null);
    };

    // --- FETCHERS ---
    async function fetchClientRoutines() {
        const { data } = await supabase.from('user_routines').select(`id, is_active, routines ( id, name, description )`).eq('user_id', client.user_id);
        if (data) setClientRoutines(data);
    }

    async function fetchWorkouts(routineId: string) {
        const { data } = await supabase.from('workouts').select('*').eq('routine_id', routineId).order('week_number', { ascending: true }).order('day_number', { ascending: true });
        setRoutineWorkouts(data || []); 
    }

    async function fetchWorkoutExercises(workoutId: string) {
        const { data } = await supabase
            .from('workout_exercises')
            .select(`*, exercises(name)`)
            .eq('workout_id', workoutId)
            .order('order_index', { ascending: true });
        if (data) setWorkoutExercises(data);
    }

    async function fetchAuditoria() {
        setLoadingSessions(true);
        try {
            const { data: sessions, error: sessionErr } = await supabase
                .from('workout_sessions')
                .select(`
                    id, completed_at, session_rpe, athlete_notes,
                    workouts ( name, week_number, day_number, routines (name) )
                `)
                .eq('user_id', client.user_id)
                .eq('status', 'completed')
                .order('completed_at', { ascending: false });

            if (sessionErr) throw sessionErr;

            if (sessions && sessions.length > 0) {
                const sessionIds = sessions.map(s => s.id);
                const { data: logs, error: logsErr } = await supabase
                    .from('logged_sets')
                    .select(`
                        session_id, set_number, weight, reps, rir, rpe,
                        workout_exercises ( exercises (name) )
                    `)
                    .in('session_id', sessionIds)
                    .order('set_number', { ascending: true });

                if (logsErr) throw logsErr;

                const sessionsWithLogs = sessions.map(session => ({
                    ...session,
                    logs: logs?.filter(log => log.session_id === session.id) || []
                }));

                setClientSessions(sessionsWithLogs);
            } else {
                setClientSessions([]);
            }
        } catch (error) {
            console.error("Error cargando auditoría", error);
        } finally {
            setLoadingSessions(false);
        }
    }

    // --- HANDLERS DE NAVEGACIÓN ---
    const handleEditRoutineDeeper = (routine: any) => {
        setSelectedRoutine(routine);
        fetchWorkouts(routine.id);
        setIsCreatingWorkout(false);
        setSelectedWorkout(null);
    };

    const handleEditWorkoutDeeper = (workout: any) => {
        setSelectedWorkout(workout);
        fetchWorkoutExercises(workout.id);
        setIsAddingExercise(false);
    };

    // --- LOGICA DE EDICIÓN NATIVA 🚀 ---
    const startEditRoutine = (routine: any) => {
        setEditingRoutineId(routine.id);
        setRoutineName(routine.name);
        setRoutineDesc(routine.description);
        setIsCreating(true); 
    };

    const cancelEditRoutine = () => {
        setEditingRoutineId(null);
        setRoutineName("");
        setRoutineDesc("");
        setIsCreating(false);
    };

    const startEditWorkout = (e: React.MouseEvent, workout: any) => {
        e.stopPropagation(); 
        setEditingWorkoutId(workout.id);
        setWorkoutName(workout.name);
        setWorkoutWeek(workout.week_number);
        setWorkoutDay(workout.day_number);
        setIsCreatingWorkout(true); 
    };

    const cancelEditWorkout = () => {
        setEditingWorkoutId(null);
        setWorkoutName("");
        setWorkoutWeek(1);
        setWorkoutDay(routineWorkouts.length + 1);
        setIsCreatingWorkout(false);
    };

    const startEditEx = (we: any, exName: string) => {
        setEditingExId(we.id);
        setExName(exName); 
        setExSets(we.target_sets);
        setExReps(we.target_reps);
        setExRpe(we.target_rpe ? we.target_rpe.toString() : ""); 
        setExRir(we.target_rir ? we.target_rir.toString() : ""); 
        setExTempo(we.tempo);
        setExRest(we.rest_seconds);
        setIsAddingExercise(true); 
    };

    const cancelEditEx = () => {
        setEditingExId(null);
        setExName("");
        setExSets(4);
        setExReps("8-12");
        setExRpe("8");
        setExRir(""); 
        setExTempo("2010");
        setExRest(90);
        setIsAddingExercise(false);
    };

    // --- LOGICA DE BORRADO MASIVA 🚀 ---
    const handleDeleteEx = async (weId: string, exName: string) => {
        if (!window.confirm(`¿Estás seguro de borrar la prescripción de "${exName}" de este día?`)) return;
        const { error } = await supabase.from('workout_exercises').delete().eq('id', weId);
        if (error) alert("❌ Error borrando: " + error.message);
        else fetchWorkoutExercises(selectedWorkout.id);
    };

    const handleDeleteWorkout = async (e: React.MouseEvent, workoutId: string, workoutName: string) => {
        e.stopPropagation(); 
        if (!window.confirm(`⚠️ PELIGRO: ¿Estás seguro de borrar el día "${workoutName}" entero? Se borrarán todos los ejercicios que tenga adentro.`)) return;
        
        try {
            await supabase.from('workout_exercises').delete().eq('workout_id', workoutId);
            const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
            
            if (error) throw error;
            alert("✅ Día borrado con éxito.");
            fetchWorkouts(selectedRoutine.id); 
        } catch (error: any) {
            alert("❌ Error borrando el día: " + error.message);
        }
    };

    const handleDeleteRoutine = async (routineId: string, routineName: string) => {
        if (!window.confirm(`⚠️ PELIGRO NUCLEAR: ¿Estás seguro de borrar el mesociclo "${routineName}"? Se borrarán todos sus días y ejercicios.`)) return;
        
        try {
            await supabase.from('user_routines').delete().eq('routine_id', routineId).eq('user_id', client.user_id);
            alert("✅ Mesociclo desasignado/borrado con éxito.");
            fetchClientRoutines(); 
        } catch (error: any) {
            alert("❌ Error borrando el mesociclo: " + error.message);
        }
    };

    const handleMoveExercise = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === workoutExercises.length - 1) return;

        const currentEx = workoutExercises[index];
        const swapEx = workoutExercises[direction === 'up' ? index - 1 : index + 1];

        try {
            const currentOrder = currentEx.order_index || index + 1;
            const swapOrder = swapEx.order_index || (direction === 'up' ? index : index + 2);

            await supabase.from('workout_exercises').update({ order_index: swapOrder }).eq('id', currentEx.id);
            await supabase.from('workout_exercises').update({ order_index: currentOrder }).eq('id', swapEx.id);
            
            fetchWorkoutExercises(selectedWorkout.id);
        } catch (error) {
            alert("Error reordenando ejercicios.");
        }
    };


    // --- HANDLERS DE GUARDADO ---
    const handleCreateOrUpdateRoutine = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editingRoutineId) {
                const { error: routineError } = await supabase
                    .from('routines')
                    .update({ name: routineName, description: routineDesc })
                    .eq('id', editingRoutineId);
                if (routineError) throw routineError;
                alert("✅ Mesociclo actualizado!");
                cancelEditRoutine();
            } else {
                const { data: newRoutine, error: routineError } = await supabase.from('routines').insert([{ name: routineName, description: routineDesc }]).select().single();
                if (routineError) throw routineError;
                const { error: assignError } = await supabase.from('user_routines').insert([{ user_id: client.user_id, routine_id: newRoutine.id, is_active: true }]);
                if (assignError) throw assignError;
                alert("✅ Mesociclo creado!"); 
                setIsCreating(false);
            }
            fetchClientRoutines();
        } catch (error: any) { alert("❌ Error: " + error.message); } finally { setSaving(false); }
    };

    const handleCreateOrUpdateWorkout = async (e: React.FormEvent) => {
        e.preventDefault(); setSavingWorkout(true);
        try {
            if (editingWorkoutId) {
                const { error } = await supabase
                    .from('workouts')
                    .update({ name: workoutName, week_number: workoutWeek, day_number: workoutDay })
                    .eq('id', editingWorkoutId);
                if (error) throw error;
                alert("✅ Día actualizado!");
                cancelEditWorkout();
            } else {
                const { error } = await supabase.from('workouts').insert([{ routine_id: selectedRoutine.id, name: workoutName, week_number: workoutWeek, day_number: workoutDay, block_type: 'normal' }]);
                if (error) throw error;
                alert("✅ Día creado!");
                setWorkoutName(""); setWorkoutDay(workoutDay + 1); setIsCreatingWorkout(false);
            }
            fetchWorkouts(selectedRoutine.id);
        } catch (error: any) { alert("❌ Error: " + error.message); } finally { setSavingWorkout(false); }
    };

    const handleCreateOrUpdatePrescriptionExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingEx(true);
        
        const parsedRpe = exRpe ? parseFloat(exRpe) : null;
        const parsedRir = exRir ? parseFloat(exRir) : null;

        try {
            if (editingExId) {
                const { error } = await supabase.from('workout_exercises').update({
                    target_sets: exSets,
                    target_reps: exReps,
                    target_rpe: parsedRpe,
                    target_rir: parsedRir, 
                    tempo: exTempo,
                    rest_seconds: exRest
                }).eq('id', editingExId);
                
                if (error) throw error;
                alert("✅ Prescripción actualizada!");
                cancelEditEx();
            } else {
                let exerciseId;
                const { data: exData } = await supabase.from('exercises').select('id').ilike('name', exName).maybeSingle();
                if (exData) { 
                    exerciseId = exData.id; 
                } else {
                    const { data: newEx, error: exErr } = await supabase.from('exercises').insert([{ name: exName, target_muscle: 'General' }]).select().single();
                    if (exErr) throw exErr; 
                    exerciseId = newEx.id;
                }
                
                const newOrderIndex = workoutExercises.length > 0 ? Math.max(...workoutExercises.map(e => e.order_index || 0)) + 1 : 1;

                const { error } = await supabase.from('workout_exercises').insert([{
                    workout_id: selectedWorkout.id, exercise_id: exerciseId, order_index: newOrderIndex,
                    target_sets: exSets, target_reps: exReps, target_rpe: parsedRpe, target_rir: parsedRir, tempo: exTempo, rest_seconds: exRest 
                }]);
                if (error) throw error;
                alert("✅ Ejercicio cargado!");
                setExName(""); setExRpe(""); setExRir(""); setIsAddingExercise(false); 
            }
            fetchWorkoutExercises(selectedWorkout.id);
        } catch (error: any) { alert("❌ Error: " + error.message); } finally { setSavingEx(false); }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-AR', options);
    };

    // 🚀 --- UTILS & MATH PARA EL GRÁFICO (CAPA 8) --- 🚀
    const chartData = clientSessions.map(session => {
        // Sumamos el Tonelaje (Peso x Reps) de todas las series de la sesión
        const totalTonnage = session.logs.reduce((sum: number, log: any) => {
            const w = parseFloat(log.weight) || 0;
            const r = parseInt(log.reps) || 0;
            return sum + (w * r);
        }, 0);
        return {
            date: new Date(session.completed_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
            tonnage: totalTonnage
        };
    }).reverse(); // Damos vuelta el array para que lo más viejo quede a la izquierda

    // Buscamos el máximoTonelaje para calcular la altura de las barras (100% = maxTonnage)
    const maxTonnage = chartData.length > 0 ? Math.max(...chartData.map(d => d.tonnage), 1) : 1;


    if (!client) return null;

    // --- UX HELPERS ---
    const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>);
    const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
    const UpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>);
    const DownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>);

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[110] shadow-[0_0_60px_rgba(0,0,0,0.15)] rounded-l-[3rem] p-8 md:p-12 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6 shrink-0">
                    <div>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Ficha Táctica</span>
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-black">{client.customer_name || client.customer_email}</h2>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors active:scale-95 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l18 18" /></svg>
                    </button>
                </div>

                {/* TABS */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-8 w-full overflow-x-auto custom-scrollbar shadow-inner shrink-0">
                    {[{ id: 'overview', name: 'Overview' }, { id: 'asignar', name: 'Planificación' }, { id: 'auditoria', name: 'Auditoría' }].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetDrillDown(); }} className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-black"}`}>
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-black pb-10">
                    {activeTab === 'asignar' && (
                        <div className="animate-in fade-in duration-300">
                            
                            {/* 🚀 NIVEL 3: EDITOR DE EJERCICIOS 🚀 */}
                            {selectedWorkout ? (
                                <div className="space-y-6">
                                    <button onClick={() => setSelectedWorkout(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1 mb-2">
                                        ← Volver a los días de entrenamiento
                                    </button>
                                    
                                    <div className="flex justify-between items-center bg-black text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500 rounded-full blur-2xl opacity-40"></div>
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Semana {selectedWorkout.week_number} | Día {selectedWorkout.day_number}</p>
                                            <h4 className="font-black italic text-2xl uppercase tracking-tight">{selectedWorkout.name}</h4>
                                        </div>
                                    </div>

                                    {/* LISTA DE EJERCICIOS */}
                                    <div className="space-y-3">
                                        {workoutExercises.length === 0 ? (
                                            <p className="text-xs font-medium text-gray-400 italic text-center py-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed p-6">No hay ejercicios cargados en este día.</p>
                                        ) : (
                                            workoutExercises.map((we, idx) => (
                                                <div key={we.id} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:border-black transition-colors group">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                                    <div className="flex-1">
                                                        <h5 className="font-black text-sm uppercase italic tracking-tight">{we.exercises?.name}</h5>
                                                        <div className="flex gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1 flex-wrap">
                                                            <span>{we.target_sets}x{we.target_reps}</span>
                                                            {we.target_rpe && <span className="text-blue-500">RPE {we.target_rpe}</span>}
                                                            {we.target_rir !== null && we.target_rir !== undefined && <span className="text-amber-500">RIR {we.target_rir}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                                                        <div className="flex flex-col gap-1 mr-1">
                                                            <button onClick={() => handleMoveExercise(idx, 'up')} disabled={idx === 0} className="w-5 h-5 bg-gray-100 text-gray-400 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 rounded flex items-center justify-center transition-colors"><UpIcon/></button>
                                                            <button onClick={() => handleMoveExercise(idx, 'down')} disabled={idx === workoutExercises.length - 1} className="w-5 h-5 bg-gray-100 text-gray-400 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 rounded flex items-center justify-center transition-colors"><DownIcon/></button>
                                                        </div>
                                                        <button onClick={() => startEditEx(we, we.exercises?.name || "")} className="w-7 h-7 bg-gray-100 text-gray-400 hover:bg-black hover:text-white rounded-lg flex items-center justify-center active:scale-95 transition-colors"><EditIcon/></button>
                                                        <button onClick={() => handleDeleteEx(we.id, we.exercises?.name || "")} className="w-7 h-7 bg-gray-100 text-red-300 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center active:scale-95 transition-colors"><DeleteIcon/></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* CREADOR DE EJERCICIOS */}
                                    {!isAddingExercise ? (
                                        <button onClick={() => setIsAddingExercise(true)} className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-inner border border-gray-200 border-dashed">
                                            + Agregar Ejercicio
                                        </button>
                                    ) : (
                                        <form onSubmit={handleCreateOrUpdatePrescriptionExercise} className="bg-white border border-gray-200 p-5 rounded-3xl shadow-lg space-y-4 mt-4 animate-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black">{editingExId ? 'Editar Prescripción' : 'Nuevo Ejercicio'}</p>
                                                <button type="button" onClick={cancelEditEx} className="text-gray-400 hover:text-red-500 text-xs font-bold bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">✕</button>
                                            </div>
                                            
                                            <div>
                                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Nombre del Movimiento</label>
                                                <input type="text" required value={exName} onChange={(e) => setExName(e.target.value)} placeholder="Ej: Press de Banca Plano" readOnly={!!editingExId} className={`w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none ${editingExId ? 'text-gray-400' : 'focus:bg-white focus:border-amber-500'}`} />
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                <div>
                                                    <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Series</label>
                                                    <input type="number" required value={exSets || ""} onChange={(e) => setExSets(parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs font-bold outline-none text-center focus:border-amber-500" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Reps</label>
                                                    <input type="text" required value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="8-12" className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs font-bold outline-none text-center focus:border-amber-500" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 block">RPE</label>
                                                    <input type="text" value={exRpe} onChange={(e) => setExRpe(e.target.value)} placeholder="Ej: 8" className="w-full bg-blue-50 text-blue-600 border border-blue-100 p-2.5 rounded-xl text-xs font-bold outline-none text-center focus:border-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 block">RIR</label>
                                                    <input type="text" value={exRir} onChange={(e) => setExRir(e.target.value)} placeholder="Ej: 2" className="w-full bg-amber-50 text-amber-700 border border-amber-100 p-2.5 rounded-xl text-xs font-bold outline-none text-center focus:border-amber-500" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pb-2">
                                                <div>
                                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Tempo</label>
                                                    <input type="text" value={exTempo} onChange={(e) => setExTempo(e.target.value)} placeholder="2010" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-amber-500" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Descanso (seg)</label>
                                                    <input type="number" value={exRest || ""} onChange={(e) => setExRest(parseInt(e.target.value) || 0)} placeholder="90" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-amber-500" />
                                                </div>
                                            </div>

                                            <button type="submit" disabled={savingEx} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md">
                                                {savingEx ? 'INYECTANDO...' : (editingExId ? 'ACTUALIZAR PRESCRIPCIÓN' : 'GUARDAR EJERCICIO')}
                                            </button>
                                        </form>
                                    )}
                                </div>

                            ) : selectedRoutine ? (
                                /* NIVEL 2: LISTA DE DÍAS (WORKOUTS) */
                                <div className="space-y-6">
                                    <button onClick={() => setSelectedRoutine(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1 mb-2">← Volver a mesociclos</button>
                                    <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl shadow-inner border border-gray-100">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Editando Programa</p>
                                            <h4 className="font-black italic text-xl uppercase tracking-tight">{selectedRoutine.name}</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {routineWorkouts.length === 0 ? (
                                            <p className="text-xs font-medium text-gray-400 italic text-center py-4">No hay días creados.</p>
                                        ) : (
                                            routineWorkouts.map(workout => (
                                                <div key={workout.id} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex justify-between items-center hover:border-black transition-colors group cursor-pointer" onClick={() => handleEditWorkoutDeeper(workout)}>
                                                    <div>
                                                        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest mr-2">Semana {workout.week_number} | Día {workout.day_number}</span>
                                                        <p className="font-bold text-sm mt-1 group-hover:text-amber-600 transition-colors">{workout.name}</p>
                                                    </div>
                                                    <div className="flex gap-1.5 items-center">
                                                        {/* 🚀 BOTÓN: BORRAR DÍA COMPLETO 🚀 */}
                                                        <button onClick={(e) => handleDeleteWorkout(e, workout.id, workout.name)} className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-gray-100 text-red-300 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all"><DeleteIcon /></button>
                                                        
                                                        <button onClick={(e) => startEditWorkout(e, workout)} className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-gray-100 text-gray-400 hover:bg-black hover:text-white rounded-xl flex items-center justify-center transition-all"><EditIcon /></button>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-2 rounded-lg transition-all group-hover:text-black group-hover:bg-gray-100">Ver Ejercicios →</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {!isCreatingWorkout ? (
                                        <button onClick={() => setIsCreatingWorkout(true)} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-inner border border-gray-200 border-dashed">+ Agregar Día de Entrenamiento</button>
                                    ) : (
                                        <form onSubmit={handleCreateOrUpdateWorkout} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4 mt-4 animate-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black">{editingWorkoutId ? 'Editar Día' : 'Nuevo Día'}</p>
                                                <button type="button" onClick={cancelEditWorkout} className="text-gray-400 hover:text-red-500 text-xs font-bold">✕</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Semana</label><input type="number" min="1" required value={workoutWeek || ""} onChange={(e) => setWorkoutWeek(parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-amber-500" /></div>
                                                <div><label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Día</label><input type="number" min="1" required value={workoutDay || ""} onChange={(e) => setWorkoutDay(parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-amber-500" /></div>
                                            </div>
                                            <div><label className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1 block">Nombre</label><input type="text" required value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} placeholder="Ej: Día 1: Torso Pesado" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-amber-500" /></div>
                                            <button type="submit" disabled={savingWorkout} className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">{savingWorkout ? 'GUARDANDO...' : (editingWorkoutId ? 'ACTUALIZAR DÍA' : 'CREAR DÍA')}</button>
                                        </form>
                                    )}
                                </div>
                            ) : !isCreating ? (
                                /* NIVEL 1: LISTA DE MESOCICLOS */
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center shrink-0">
                                        <h4 className="font-black italic text-lg uppercase tracking-tight">Mesociclos <span className="text-amber-500">Activos</span></h4>
                                        <button onClick={() => setIsCreating(true)} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-md active:scale-95">+ Nuevo Plan</button>
                                    </div>
                                    <div className="space-y-4">
                                        {clientRoutines.map((ur: any) => (
                                            <div key={ur.id} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-black transition-colors group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 group-hover:bg-amber-500"></div>
                                                
                                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    {/* 🚀 BOTÓN: BORRAR MESOCICLO COMPLETO 🚀 */}
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(ur.routine_id, ur.routines.name); }} className="w-8 h-8 bg-gray-50 text-red-300 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center active:scale-95 shadow-inner"><DeleteIcon /></button>
                                                    <button onClick={() => startEditRoutine(ur.routines)} className="w-8 h-8 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-full flex items-center justify-center active:scale-95 shadow-inner"><EditIcon /></button>
                                                </div>

                                                <div className="flex justify-between items-start mb-2 pr-20">
                                                    <h5 className="font-black text-black text-base uppercase italic tracking-tight">{ur.routines.name}</h5>
                                                    {ur.is_active && <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Activo</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium mb-4">{ur.routines.description || 'Sin descripción'}</p>
                                                <button onClick={() => handleEditRoutineDeeper(ur.routines)} className="text-[10px] font-black uppercase tracking-widest text-black bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-all active:scale-95">Editar Días y Ejercicios →</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* CREADOR/EDITOR DE MESOCICLOS */
                                <form onSubmit={handleCreateOrUpdateRoutine} className="space-y-6 bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner animate-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                        <h4 className="font-black italic text-lg uppercase tracking-tight">{editingRoutineId ? 'Editar Plan' : 'Forjar Plan'} <span className="text-amber-500">Mesociclo</span></h4>
                                        <button type="button" onClick={cancelEditRoutine} className="text-xs font-bold text-gray-400 hover:text-red-500 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">✕</button>
                                    </div>
                                    <div><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Nombre del Programa</label><input type="text" required value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-amber-500" /></div>
                                    <div><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Foco / Descripción</label><textarea value={routineDesc} onChange={(e) => setRoutineDesc(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none h-24 resize-none focus:border-amber-500 custom-scrollbar" /></div>
                                    <button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md active:scale-95">{saving ? 'FORJANDO...' : (editingRoutineId ? 'ACTUALIZAR MESOCICLO' : 'GUARDAR Y ASIGNAR')}</button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* --- PESTAÑA: OVERVIEW --- */}
                    {activeTab === 'overview' && ( 
                        <div className="animate-in fade-in duration-300 space-y-6">
                            <h4 className="font-black italic text-lg uppercase tracking-tight">Información <span className="text-amber-500">Básica</span></h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoCard label="Email" value={client.customer_email} />
                                <InfoCard label="ID" value={client.user_id.substring(0,8) + '...'} />
                            </div>
                        </div> 
                    )}

                    {/* 🚀 CAPA 8: AUDITORÍA + GRÁFICO DE BARRAS NATIVO 🚀 */}
                    {activeTab === 'auditoria' && (
                        <div className="animate-in fade-in duration-300 space-y-6">
                            
                            {/* 📊 TARJETA DE GRÁFICO DE PROGRESO 📊 */}
                            {chartData.length > 0 && (
                                <div className="bg-white border border-gray-200 p-6 rounded-[2rem] shadow-sm mb-8">
                                    <h4 className="font-black italic text-lg uppercase tracking-tight text-black mb-1">Evolución de <span className="text-amber-500">Carga</span></h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Tonelaje total (Kg x Reps) por sesión</p>
                                    
                                    <div className="flex items-end gap-2 h-32 mt-4 pt-4 border-b border-gray-100 overflow-x-auto custom-scrollbar pb-2">
                                        {chartData.map((data, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[30px]">
                                                {/* Tooltip on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[9px] font-bold px-2 py-1 rounded-lg transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md">
                                                    {data.tonnage} kg
                                                </div>
                                                {/* Barra Visual */}
                                                <div 
                                                    className="w-full bg-amber-200 rounded-t-md transition-all duration-300 group-hover:bg-amber-500 max-w-[40px]"
                                                    style={{ height: `${(data.tonnage / maxTonnage) * 100}%`, minHeight: '4px' }}
                                                ></div>
                                                <span className="text-[8px] font-black text-gray-400 uppercase mt-2 absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity">{data.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <h4 className="font-black italic text-xl uppercase tracking-tight">Historial de <span className="text-amber-500">Entrenamientos</span></h4>
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{clientSessions.length} Sesiones</span>
                            </div>

                            {loadingSessions ? (
                                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                            ) : clientSessions.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-200 p-12 rounded-3xl text-center text-gray-400 flex flex-col items-center">
                                    <span className="text-5xl mb-4">📭</span>
                                    <p className="text-sm font-black uppercase tracking-widest text-black mb-1">Sin Registros</p>
                                    <p className="text-xs font-medium">El atleta todavía no guardó ningún entrenamiento.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {clientSessions.map((session) => (
                                        <div key={session.id} className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm overflow-hidden transition-all">
                                            
                                            <div 
                                                className="p-5 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors"
                                                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                            >
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">
                                                        {formatDate(session.completed_at)}
                                                    </p>
                                                    <h5 className="font-black text-black text-lg uppercase italic leading-none">
                                                        {session.workouts?.name || 'Sesión Libre'}
                                                    </h5>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                                                        S{session.workouts?.week_number} • D{session.workouts?.day_number} | {session.workouts?.routines?.name}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {session.session_rpe && <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-purple-100">sRPE {session.session_rpe}/10</span>}
                                                    
                                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                        {session.logs.length} Sets Logueados
                                                    </span>
                                                    <span className={`text-gray-400 font-bold transition-transform ${expandedSessionId === session.id ? 'rotate-180' : ''}`}>▼</span>
                                                </div>
                                            </div>

                                            {/* Acordeón con el Detalle (Logs y Notas) */}
                                            {expandedSessionId === session.id && (
                                                <div className="bg-gray-50 border-t border-gray-100 p-4 animate-in slide-in-from-top-2">
                                                    
                                                    {session.athlete_notes && (
                                                        <div className="mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
                                                            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest block mb-1">Notas del Atleta:</span>
                                                            <p className="text-xs text-gray-600 italic">"{session.athlete_notes}"</p>
                                                        </div>
                                                    )}

                                                    {session.logs.length === 0 ? (
                                                        <p className="text-xs text-center text-gray-400 italic py-2">Guardó la sesión sin completar series.</p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {Array.from(new Set(session.logs.map((l:any) => l.workout_exercises?.exercises?.name))).map((exerciseName: any) => {
                                                                const exerciseLogs = session.logs.filter((l:any) => l.workout_exercises?.exercises?.name === exerciseName);
                                                                
                                                                return (
                                                                    <div key={exerciseName} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-black">{exerciseName}</span>
                                                                        </div>
                                                                        <div className="divide-y divide-gray-50">
                                                                            {exerciseLogs.map((log: any) => (
                                                                                <div key={log.set_number} className="flex justify-between items-center px-4 py-2">
                                                                                    <span className="w-6 h-6 bg-gray-50 text-gray-500 flex items-center justify-center rounded-md text-[9px] font-black">
                                                                                        {log.set_number}
                                                                                    </span>
                                                                                    <div className="flex gap-4 text-xs font-mono font-bold text-black flex-wrap items-center">
                                                                                        <span>{log.weight} kg</span>
                                                                                        <span className="text-gray-300">x</span>
                                                                                        <span>{log.reps} reps</span>
                                                                                        
                                                                                        {(log.rir !== null || log.rpe !== null) && (
                                                                                            <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                                                                                {log.rir !== null ? `${log.rir} RIR` : ''} {log.rir !== null && log.rpe !== null ? '|' : ''} {log.rpe !== null ? `RPE ${log.rpe}` : ''}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-emerald-500">✓</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl shadow-inner"><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p><p className="text-sm font-bold text-black truncate" title={value}>{value}</p></div>;
}