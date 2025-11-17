// "use client";

// import React, { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { ArrowLeft, Plus, Settings } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { TaskColumn } from "@/components/board/task-column";
// import { TaskSheet } from "@/components/board/task-sheet";
// import { BoardHeader } from "@/components/board/board-header";
// import { CreateTaskDialog } from "@/components/board/";
// import { CreateColumnDialog } from "@/components/board/create-column-dialog";
// import { useBoardWithDetails } from "@/lib/hooks/use-boards";
// import {
//   DndContext,
//   DragOverlay,
//   closestCorners,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragStartEvent,
//   DragOverEvent,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   horizontalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import type { Task } from "@/lib/types/database";

// const CURRENT_USER_ID = "temp-user-id";

// export default function BoardDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const boardId = params.board_id as string;

//   const [activeTask, setActiveTask] = useState<Task | null>(null);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
//   const [createTaskColumnId, setCreateTaskColumnId] = useState<string>("");
//   const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);

//   const { data: board, isLoading } = useBoardWithDetails(boardId);

//   // Set up drag and drop sensors
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   const handleDragStart = (event: DragStartEvent) => {
//     const { active } = event;
//     const task = board?.columns
//       .flatMap((col) => col.tasks)
//       .find((t) => t.id === active.id);
//     if (task) {
//       setActiveTask(task);
//     }
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     setActiveTask(null);
//     // TODO: Implement actual task moving logic with API call
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
//         <div className="text-center">
//           <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin mx-auto mb-4" />
//           <p className="text-[hsl(var(--muted-foreground))] font-medium">
//             Loading board...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!board) {
//     return (
//       <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-2">Board not found</h2>
//           <Button onClick={() => router.push("/boards")}>Back to Boards</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[hsl(var(--background))]">
//       {/* Board Header */}
//       <BoardHeader board={board} currentUserId={CURRENT_USER_ID} />

//       {/* Kanban Board */}
//       <div className="px-5 py-6 overflow-x-auto">
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCorners}
//           onDragStart={handleDragStart}
//           onDragEnd={handleDragEnd}
//         >
//           <div className="flex gap-4 min-w-fit">
//             <SortableContext
//               items={board.columns.map((col) => col.id)}
//               strategy={horizontalListSortingStrategy}
//             >
//               {board.columns.map((column) => (
//                 <TaskColumn
//                   key={column.id}
//                   column={column}
//                   boardId={boardId}
//                   onTaskClick={setSelectedTaskId}
//                   onCreateTask={() => {
//                     setCreateTaskColumnId(column.id);
//                     setCreateTaskDialogOpen(true);
//                   }}
//                 />
//               ))}
//             </SortableContext>

//             {/* Add Column Button */}
//             {board.columns.length < 5 && (
//               <div className="w-80 shrink-0">
//                 <Button
//                   variant="outline"
//                   className="w-full h-12 border-dashed"
//                   onClick={() => setCreateColumnDialogOpen(true)}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Column
//                 </Button>
//               </div>
//             )}
//           </div>

//           <DragOverlay>
//             {activeTask ? (
//               <div className="opacity-50">
//                 {/* TaskCard component goes here */}
//               </div>
//             ) : null}
//           </DragOverlay>
//         </DndContext>
//       </div>

//       {/* Task Detail Sheet */}
//       {selectedTaskId && (
//         <TaskSheet
//           taskId={selectedTaskId}
//           boardId={boardId}
//           open={!!selectedTaskId}
//           onOpenChange={(open) => !open && setSelectedTaskId(null)}
//         />
//       )}

//       {/* Create Task Dialog */}
//       <CreateTaskDialog
//         open={createTaskDialogOpen}
//         onOpenChange={setCreateTaskDialogOpen}
//         boardId={boardId}
//         columnId={createTaskColumnId}
//       />

//       {/* Create Column Dialog */}
//       <CreateColumnDialog
//         open={createColumnDialogOpen}
//         onOpenChange={setCreateColumnDialogOpen}
//         boardId={boardId}
//       />
//     </div>
//   );
// }