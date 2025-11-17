"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Pin, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { BoardWithColumns, Profile } from "@/lib/types/database";

interface BoardCardProps {
  board: BoardWithColumns & {
    created_by_profile?: Profile;
  };
  currentUserId: string;
  onEdit: (board: BoardWithColumns) => void;
  onDelete: (board: BoardWithColumns) => void;
  onTogglePin: (board: BoardWithColumns) => void;
}

const categoryConfig: Record<string, { color: string; bg: string; border: string }> = {
  Dev: { color: "#3B82F6", bg: "bg-blue-100", border: "border-blue-200" },
  UI: { color: "#8B5CF6", bg: "bg-purple-100", border: "border-purple-200" },
  Media: { color: "#10B981", bg: "bg-green-100", border: "border-green-200" },
  Debug: { color: "#EF4444", bg: "bg-red-100", border: "border-red-200" },
  General: { color: "#A86F5C", bg: "bg-orange-100", border: "border-orange-200" },
};

export function BoardCard({
  board,
  currentUserId,
  onEdit,
  onDelete,
  onTogglePin,
}: BoardCardProps) {
  const isOwner = board.created_by === currentUserId;
  const category = board.category || "General";
  const config = categoryConfig[category];
  
  const getInitials = () => {
    if (board.created_by_profile?.username) {
      return board.created_by_profile.username.substring(0, 2).toUpperCase();
    }
    return board.created_by_profile?.initials || "??";
  };

  const getUsername = () => {
    return board.created_by_profile?.username || "Unknown";
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white border-2 hover:shadow-lg transition-all"
      style={{ borderColor: config.color }}
    >
      {/* Pin Icon and Three Dot Menu */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        {board.is_pinned && (
          <div className="h-8 w-8 flex items-center justify-center">
            <Pin className="h-4 w-4 text-[hsl(var(--primary))] fill-current" />
          </div>
        )}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[hsl(var(--accent))]"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onEdit(board);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit board
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onTogglePin(board);
              }}
            >
              <Pin className="h-4 w-4 mr-2" />
              {board.is_pinned ? "Unpin board" : "Pin board"}
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(board);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete board
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/boards/${board.id}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-16">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-bold truncate mb-1.5"
              style={{ color: config.color }}
            >
              {board.title}
            </h3>
            {board.description && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                {board.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-bold px-2 py-1",
              `${config.bg} ${config.border}`,
            )}
            style={{ color: config.color }}
          >
            {category}
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold px-2 py-1">
            {board.task_count || 0} tasks
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-[hsl(var(--border))]">
              <AvatarFallback className="bg-[hsl(var(--muted))] text-[10px] font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              Created by {getUsername()}
            </span>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
            {formatDistanceToNow(new Date(board.updated_at), { addSuffix: true })}
          </span>
        </div>
      </Link>
    </Card>
  );
}