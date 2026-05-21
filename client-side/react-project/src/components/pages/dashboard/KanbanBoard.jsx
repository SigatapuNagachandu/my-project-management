import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from '../../../context/TasksContext';
import { FaPlus } from 'react-icons/fa';

function SortableItem({ task, isOverlay }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50"
            >
                <div className="h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50" />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 ${isOverlay ? 'cursor-grabbing shadow-xl ring-2 ring-primary rotate-2' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</h4>
                <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide font-bold ${task.priority === 'high'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                        : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}
                >
                    {task.priority}
                </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{task.project || 'No Project'}</span>
                {task.due && <span>{task.due}</span>}
            </div>
        </div>
    );
}

function KanbanColumn({ id, title, tasks, count }) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
            title,
        },
    });

    return (
        <div className="flex h-full w-80 shrink-0 flex-col rounded-xl bg-slate-100/50 p-2 dark:bg-slate-900/40">
            <div className="mb-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {count}
                    </span>
                </div>
            </div>
            <div ref={setNodeRef} className="flex-1 space-y-3 overflow-y-auto p-1 min-h-[100px]">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableItem key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}

export default function KanbanBoard() {
    const { tasks, updateTask } = useTasks();
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const columns = {
        todo: tasks.filter((t) => t.status === 'todo'),
        'in-progress': tasks.filter((t) => t.status === 'in-progress'),
        done: tasks.filter((t) => t.status === 'done'),
    };

    const handleDragStart = (event) => {
        setActiveTask(event.active.data.current?.task);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const task = tasks.find((t) => t.id === activeId);
        if (!task) return;

        let newStatus = task.status;

        if (over.data.current?.type === 'Column' || ['todo', 'in-progress', 'done'].includes(over.id)) {
            newStatus = over.id;
        }
        else if (over.data.current?.task) {
            newStatus = over.data.current.task.status;
        }

        if (newStatus !== task.status) {
            updateTask(task.id, { status: newStatus });
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6 overflow-x-auto pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <KanbanColumn id="todo" title="To Do" tasks={columns.todo} count={columns.todo.length} />
                <KanbanColumn id="in-progress" title="In Progress" tasks={columns['in-progress']} count={columns['in-progress'].length} />
                <KanbanColumn id="done" title="Done" tasks={columns.done} count={columns.done.length} />

                <DragOverlay>
                    {activeTask ? <SortableItem task={activeTask} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
