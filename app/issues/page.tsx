// app/issues/page.tsx
// UPDATED VERSION - Key changes:
// 1. Changed default sort to 'created-desc' (newest first, status-aware)
// 2. Added "Created Date" sort options
// 3. Pass hasActiveFilters to sortIssues function
// 4. When no filters active: open/pending issues appear first, closed last

'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Bug,
    Plus,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Calendar as CalendarIcon,
    X,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    getPriorityColor,
    getStatusConfig,
    sortIssues,
} from '@/lib/issues/utils'
import { useIssues } from '@/lib/hooks/useIssues'
import { useUsers } from '@/lib/hooks/useUser'
import IssueCard from '@/components/issue/IssueCard'
import CreateIssueModal from '@/components/issue/IssueCreateModal'
import { useDebounce } from '@/lib/hooks/useDebounce'

// Skeleton component
const IssueCardSkeleton = () => (
    <div className="animate-pulse space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
                <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]"></div>
                <div className="h-6 w-3/4 rounded bg-[hsl(var(--muted))]"></div>
            </div>
            <div className="h-6 w-16 rounded-full bg-[hsl(var(--muted))]"></div>
        </div>
        <div className="h-4 w-full rounded bg-[hsl(var(--muted))]"></div>
        <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded bg-[hsl(var(--muted))]"></div>
            <div className="h-8 w-20 rounded bg-[hsl(var(--muted))]"></div>
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))]"></div>
        </div>
    </div>
)

export default function IssuesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    // Filter states
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

    // Sort state - CHANGED: Default to 'created-desc' (newest first, with status priority)
    const [sortBy, setSortBy] = useState<string>('created-desc')

    // Fetch users for assignee filter
    const { data: allUsers = [], isLoading: usersLoading } = useUsers()

    const debouncedSearch = useDebounce(searchQuery, 300)

    // Build filters object for the query
    const filters = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            status:
                selectedStatuses.length > 0
                    ? (selectedStatuses as any)
                    : undefined,
            priority:
                selectedPriorities.length > 0
                    ? (selectedPriorities as any)
                    : undefined,
            assignedTo:
                selectedAssignees.length > 0 ? selectedAssignees : undefined,
            dateFrom: dateRange.from,
            dateTo: dateRange.to,
        }),
        [
            debouncedSearch,
            selectedStatuses,
            selectedPriorities,
            selectedAssignees,
            dateRange,
        ],
    )

    // Fetch issues with filters
    const {
        data: issues = [],
        isLoading,
        error,
        isFetching,
        refetch,
    } = useIssues(filters)

    // Check if filters are active
    const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedAssignees.length > 0 ||
    !!dateRange.from ||
    !!dateRange.to

    // UPDATED: Pass hasActiveFilters to sortIssues
    const sortedIssues = useMemo(
        () => sortIssues(issues, sortBy, hasActiveFilters),
        [issues, sortBy, hasActiveFilters],
    )

    const clearFilters = () => {
        setSelectedStatuses([])
        setSelectedPriorities([])
        setSelectedAssignees([])
        setDateRange({})
    }

    // Helper function to get sort label
    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'created-desc':
                return 'Newest First'
            case 'created-asc':
                return 'Oldest First'
            case 'updated-desc':
                return 'Recently Updated'
            case 'updated-asc':
                return 'Least Recently Updated'
            case 'priority-high':
                return 'High Priority First'
            case 'priority-low':
                return 'Low Priority First'
            default:
                return 'Newest First'
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] p-6">
            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-[hsl(var(--foreground))]">
                            <Bug className="h-8 w-8 text-[hsl(var(--primary))]" />
                            Issue Tracker
                        </h1>
                        <p className="mt-1 font-medium text-[hsl(var(--muted-foreground))]">
                            Manage and track all project issues
                        </p>
                    </div>

                    {/* Create Issue Button */}
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Issue
                    </Button>

                    <CreateIssueModal
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                    />
                </div>

                {/* Search, Filter, Sort Bar */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                type="text"
                                placeholder="Search issues by title, description, or ID..."
                                className="pl-10 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Button */}
                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'font-semibold',
                                        hasActiveFilters &&
                                            'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
                                    )}
                                >
                                    <SlidersHorizontal className="mr-2 h-5 w-5" />
                                    Filter
                                    {hasActiveFilters && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 bg-[hsl(var(--primary))] text-white"
                                        >
                                            {[
                                                selectedStatuses.length,
                                                selectedPriorities.length,
                                                selectedAssignees.length,
                                                dateRange.from || dateRange.to ? 1 : 0,
                                            ]
                                                .filter((n) => n > 0)
                                                .reduce((a, b) => a + b, 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[400px] p-0"
                                align="end"
                            >
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-6 p-4">
                                        {/* Status Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-bold">
                                                Status
                                            </Label>
                                            <ToggleGroup
                                                type="multiple"
                                                className="grid grid-cols-1 gap-2"
                                                value={selectedStatuses}
                                                onValueChange={
                                                    setSelectedStatuses
                                                }
                                            >
                                                {[
                                                    'open',
                                                    'pending_approval',
                                                    'closed',
                                                ].map((status) => {
                                                    const config =
                                                        getStatusConfig(status)
                                                    return (
                                                        <ToggleGroupItem
                                                            key={status}
                                                            value={status}
                                                            className={cn(
                                                                'justify-start font-semibold data-[state=on]:border-2',
                                                                config.color,
                                                                config.bg,
                                                            )}
                                                        >
                                                            <config.icon className="mr-2 h-4 w-4" />
                                                            {config.label}
                                                        </ToggleGroupItem>
                                                    )
                                                })}
                                            </ToggleGroup>
                                        </div>

                                        <Separator />

                                        {/* Priority Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-bold">
                                                Priority
                                            </Label>
                                            <ToggleGroup
                                                type="multiple"
                                                className="grid grid-cols-2 gap-2"
                                                value={selectedPriorities}
                                                onValueChange={
                                                    setSelectedPriorities
                                                }
                                            >
                                                {[
                                                    'urgent',
                                                    'high',
                                                    'medium',
                                                    'low',
                                                ].map((priority) => (
                                                    <ToggleGroupItem
                                                        key={priority}
                                                        value={priority}
                                                        className={cn(
                                                            'justify-start font-semibold capitalize data-[state=on]:border-2',
                                                            getPriorityColor(
                                                                priority,
                                                            ),
                                                        )}
                                                    >
                                                        {priority}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </div>

                                        <Separator />

                                        {/* Assignee Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-bold">
                                                Assignee
                                            </Label>
                                            {usersLoading ? (
                                                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    Loading users...
                                                </div>
                                            ) : (
                                                <ToggleGroup
                                                    type="multiple"
                                                    className="grid grid-cols-1 gap-2"
                                                    value={selectedAssignees}
                                                    onValueChange={
                                                        setSelectedAssignees
                                                    }
                                                >
                                                    {allUsers.map((user) => (
                                                        <ToggleGroupItem
                                                            key={user.id}
                                                            value={user.id}
                                                            className="justify-start font-semibold data-[state=on]:border-2 data-[state=on]:border-[hsl(var(--primary))]"
                                                        >
                                                            <Avatar className="mr-2 h-6 w-6">
                                                                <AvatarFallback className="text-xs">
                                                                    {user.username
                                                                        ?.substring(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.username}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Date Range Filter */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-bold">
                                                Created Date Range
                                            </Label>
                                            <div className="space-y-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start font-normal"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dateRange.from ? (
                                                                dateRange.to ? (
                                                                    <>
                                                                        {dateRange.from.toLocaleDateString()}{' '}
                                                                        -{' '}
                                                                        {dateRange.to.toLocaleDateString()}
                                                                    </>
                                                                ) : (
                                                                    dateRange.from.toLocaleDateString()
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                    range
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="range"
                                                            selected={{
                                                                from: dateRange.from,
                                                                to: dateRange.to,
                                                            }}
                                                            onSelect={(
                                                                range,
                                                            ) =>
                                                                setDateRange({
                                                                    from: range?.from,
                                                                    to: range?.to,
                                                                })
                                                            }
                                                            numberOfMonths={2}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {(dateRange.from ||
                                                    dateRange.to) && (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full text-red-600 hover:text-red-700"
                                                        onClick={() =>
                                                            setDateRange({})
                                                        }
                                                    >
                                                        Clear Date Range
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-[hsl(var(--border))] p-4">
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                    >
                                        Clear All
                                    </Button>
                                    <Button onClick={() => setFilterOpen(false)}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Sort Dropdown - UPDATED with Created Date options */}
                        <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="font-semibold"
                                >
                                    <ArrowUpDown className="mr-2 h-5 w-5" />
                                    Sort: {getSortLabel(sortBy)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[250px] p-2"
                            >
                                <div className="space-y-1">
                                    <div className="px-2 py-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                                        BY CREATED DATE
                                    </div>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'created-desc' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('created-desc')
                                            setSortOpen(false)
                                        }}
                                    >
                                        Newest First
                                        {!hasActiveFilters && (
                                            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                                                (Open/Pending first)
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'created-asc' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('created-asc')
                                            setSortOpen(false)
                                        }}
                                    >
                                        Oldest First
                                        {!hasActiveFilters && (
                                            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                                                (Open/Pending first)
                                            </span>
                                        )}
                                    </button>

                                    <Separator className="my-2" />

                                    <div className="px-2 py-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                                        BY UPDATED DATE
                                    </div>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'updated-desc' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('updated-desc')
                                            setSortOpen(false)
                                        }}
                                    >
                                        Recently Updated
                                    </button>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'updated-asc' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('updated-asc')
                                            setSortOpen(false)
                                        }}
                                    >
                                        Least Recently Updated
                                    </button>

                                    <Separator className="my-2" />

                                    <div className="px-2 py-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                                        BY PRIORITY
                                    </div>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'priority-high' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('priority-high')
                                            setSortOpen(false)
                                        }}
                                    >
                                        High Priority First
                                    </button>
                                    <button
                                        className={cn(
                                            'flex w-full items-center rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--accent))]',
                                            sortBy === 'priority-low' &&
                                                'bg-[hsl(var(--accent))]',
                                        )}
                                        onClick={() => {
                                            setSortBy('priority-low')
                                            setSortOpen(false)
                                        }}
                                    >
                                        Low Priority First
                                    </button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
                            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                                Active filters:
                            </span>
                            {selectedStatuses.map((status) => {
                                const statusConfig = getStatusConfig(status)
                                return (
                                    <Badge
                                        key={status}
                                        variant="outline"
                                        className={cn(
                                            'font-semibold',
                                            statusConfig.color,
                                            statusConfig.bg,
                                        )}
                                    >
                                        {statusConfig.label}
                                        <button
                                            onClick={() =>
                                                setSelectedStatuses(
                                                    selectedStatuses.filter(
                                                        (s) => s !== status,
                                                    ),
                                                )
                                            }
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                            {selectedPriorities.map((priority) => (
                                <Badge
                                    key={priority}
                                    variant="outline"
                                    className={cn(
                                        'font-semibold',
                                        getPriorityColor(priority),
                                    )}
                                >
                                    {priority}
                                    <button
                                        onClick={() =>
                                            setSelectedPriorities(
                                                selectedPriorities.filter(
                                                    (p) => p !== priority,
                                                ),
                                            )
                                        }
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {selectedAssignees.map((assigneeId) => {
                                const user = allUsers.find(
                                    (u) => u.id === assigneeId,
                                )
                                return (
                                    <Badge
                                        key={assigneeId}
                                        variant="outline"
                                        className="border-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary))]"
                                    >
                                        {user?.username}
                                        <button
                                            onClick={() =>
                                                setSelectedAssignees(
                                                    selectedAssignees.filter(
                                                        (a) => a !== assigneeId,
                                                    ),
                                                )
                                            }
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                            {(dateRange.from || dateRange.to) && (
                                <Badge
                                    variant="outline"
                                    className="border-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary))]"
                                >
                                    {dateRange.from?.toLocaleDateString()} -{' '}
                                    {dateRange.to?.toLocaleDateString()}
                                    <button
                                        onClick={() => setDateRange({})}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="ml-auto"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                    {/* Error State */}
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-600" />
                            <h3 className="mb-2 text-lg font-bold text-red-900">
                                {error.message.includes('Failed to fetch')
                                    ? 'Connection Error'
                                    : 'Error Loading Issues'}
                            </h3>
                            <p className="mb-4 text-red-700">
                                {error.message.includes('Failed to fetch')
                                    ? 'Please check your internet connection'
                                    : error.message}
                            </p>
                            <Button onClick={() => refetch()}>Try Again</Button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && <IssueCardSkeleton />}

                    {/* Inline loading indicator when refetching */}
                    {!isLoading && isFetching && (
                        <div className="fixed top-4 right-4 rounded bg-blue-500 px-4 py-2 text-white">
                            Updating...
                        </div>
                    )}

                    {/* Issues List */}
                    {!isLoading &&
                        !error &&
                        sortedIssues.length > 0 &&
                        sortedIssues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}

                    {/* Empty state */}
                    {!isLoading && !error && sortedIssues.length === 0 && (
                        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
                            <Bug className="mx-auto mb-4 h-16 w-16 text-[hsl(var(--muted-foreground))]" />
                            <h3 className="mb-2 text-xl font-bold text-[hsl(var(--foreground))]">
                                No issues found
                            </h3>
                            <p className="mb-6 text-[hsl(var(--muted-foreground))]">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters or search query'
                                    : 'Create your first issue to get started'}
                            </p>
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create Issue
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}