"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoardCard } from "@/components/board/BoardCard";
import { BoardFilters } from "@/components/board/BoardFilters";
import { CreateBoardDialog } from "@/components/board/CreateBoardDialog";
import { useBoards, useCreateBoardWithColumns, useDeleteBoard, useToggleBoardPin, useUpdateBoard } from "@/lib/hooks/useBoards";
import type { BoardCategory, BoardSortField, SortDirection, CreateBoardInput, BoardWithColumns } from "@/lib/types/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrentUser } from "@/lib/hooks/useUser";

export default function BoardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [sortField, setSortField] = useState<BoardSortField>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardWithColumns | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<BoardWithColumns | null>(null);

  // Get current user
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || "";

  // Fetch boards with filters
  const { data: boards, isLoading } = useBoards(
    {
      search: searchQuery,
      category: selectedCategory || undefined,
      pinned_only: showPinnedOnly,
    },
    {
      field: sortField,
      direction: sortDirection,
    }
  );

  // Mutations
  const createBoardMutation = useCreateBoardWithColumns(currentUserId);
  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();
  const togglePinMutation = useToggleBoardPin();

  const handleCreateBoard = async (data: CreateBoardInput) => {
    await createBoardMutation.mutateAsync(data);
  };

  const handleUpdateBoard = async (data: CreateBoardInput) => {
    if (editingBoard) {
      await updateBoardMutation.mutateAsync({
        boardId: editingBoard.id,
        input: data,
      });
      setEditingBoard(null);
    }
  };

  const handleDeleteBoard = async () => {
    if (boardToDelete) {
      await deleteBoardMutation.mutateAsync(boardToDelete.id);
      setBoardToDelete(null);
    }
  };

  const handleTogglePin = async (board: BoardWithColumns) => {
    await togglePinMutation.mutateAsync({
      boardId: board.id,
      isPinned: !board.is_pinned,
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Task Boards
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1 font-medium">
              Organize and track your team's work
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            className="gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 font-semibold"
          >
            <Plus className="h-5 w-5" />
            New Board
          </Button>
        </div>

        {/* Filters */}
        <BoardFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showPinnedOnly={showPinnedOnly}
          onShowPinnedOnlyChange={setShowPinnedOnly}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, direction) => {
            setSortField(field);
            setSortDirection(direction);
          }}
        />

        {/* Boards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-[hsl(var(--muted))] animate-pulse"
              />
            ))}
          </div>
        ) : boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                currentUserId={currentUserId}
                onEdit={setEditingBoard}
                onDelete={setBoardToDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-[hsl(var(--muted))] p-6 mb-4">
              <Plus className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
              No boards found
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
              {searchQuery || selectedCategory || showPinnedOnly
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by creating your first task board."}
            </p>
            {!searchQuery && !selectedCategory && !showPinnedOnly && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-5 w-5" />
                Create Board
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen || !!editingBoard}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingBoard(null);
          }
        }}
        onSubmit={editingBoard ? handleUpdateBoard : handleCreateBoard}
        initialData={editingBoard ? {
          title: editingBoard.title,
          description: editingBoard.description || undefined,
          category: editingBoard.category || "General",
        } : undefined}
        isEditing={!!editingBoard}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
        <AlertDialogContent className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(var(--foreground))]">Delete Board?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--muted-foreground))]">
              Are you sure you want to delete "{boardToDelete?.title}"? This will
              permanently delete the board along with all its columns and tasks. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--border))]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}