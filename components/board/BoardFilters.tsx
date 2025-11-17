"use client";

import React, { useState } from "react";
import { Search, Filter, SortAsc, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BoardCategory, BoardSortField, SortDirection } from "@/lib/types/database";

interface BoardFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: BoardCategory | null;
  onCategoryChange: (category: BoardCategory | null) => void;
  showPinnedOnly: boolean;
  onShowPinnedOnlyChange: (show: boolean) => void;
  sortField: BoardSortField;
  sortDirection: SortDirection;
  onSortChange: (field: BoardSortField, direction: SortDirection) => void;
}

const categories: BoardCategory[] = ["Dev", "UI", "Media", "Debug", "General"];

const sortOptions: Array<{ label: string; field: BoardSortField }> = [
  { label: "Title", field: "title" },
  { label: "Created Date", field: "created_at" },
  { label: "Updated Date", field: "updated_at" },
];

export function BoardFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showPinnedOnly,
  onShowPinnedOnlyChange,
  sortField,
  sortDirection,
  onSortChange,
}: BoardFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const hasActiveFilters = selectedCategory || showPinnedOnly;

  const clearFilters = () => {
    onCategoryChange(null);
    onShowPinnedOnlyChange(false);
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, Sort Bar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`relative transition-all ${isSearchFocused ? 'flex-1' : 'w-80'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 h-11 border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Spacer */}
        {!isSearchFocused && <div className="flex-1" />}

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className={cn(
                "h-11 gap-2 border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] font-semibold relative hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--card))]",
                hasActiveFilters && "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
              )}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                  {(selectedCategory ? 1 : 0) + (showPinnedOnly ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <DropdownMenuLabel className="text-lg font-bold p-0">Filters</DropdownMenuLabel>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="p-2">
              <DropdownMenuLabel className="text-xs font-bold px-2">Category</DropdownMenuLabel>
              {categories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={selectedCategory === cat}
                  onCheckedChange={(checked) =>
                    onCategoryChange(checked ? cat : null)
                  }
                  className="font-semibold"
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showPinnedOnly}
                onCheckedChange={onShowPinnedOnlyChange}
                className="font-semibold"
              >
                Pinned only
              </DropdownMenuCheckboxItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="h-11 gap-2 border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] font-semibold hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--card))]"
            >
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0"
          >
            <div className="p-2">
              <DropdownMenuLabel className="text-xs font-bold px-2">Sort by</DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.field}
                  checked={sortField === option.field}
                  onCheckedChange={() => onSortChange(option.field, sortDirection)}
                  className="font-semibold"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-bold px-2">Direction</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={sortDirection === "asc"}
                onCheckedChange={() => onSortChange(sortField, "asc")}
                className="font-semibold"
              >
                Ascending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortDirection === "desc"}
                onCheckedChange={() => onSortChange(sortField, "desc")}
                className="font-semibold"
              >
                Descending
              </DropdownMenuCheckboxItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
            Active filters:
          </span>
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1"
            >
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange(null)}
                className="ml-1 rounded-full hover:bg-[hsl(var(--background))]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {showPinnedOnly && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1"
            >
              Pinned only
              <button
                onClick={() => onShowPinnedOnlyChange(false)}
                className="ml-1 rounded-full hover:bg-[hsl(var(--background))]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}