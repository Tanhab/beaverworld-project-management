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

    // Sort state
    const [sortBy, setSortBy] = useState<string>('updated-desc')

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

    // using memo to sort with better cache
    const sortedIssues = useMemo(
        () => sortIssues(issues, sortBy),
        [issues, sortBy],
    )

    const hasActiveFilters =
        selectedStatuses.length > 0 ||
        selectedPriorities.length > 0 ||
        selectedAssignees.length > 0 ||
        dateRange.from ||
        dateRange.to

    const clearFilters = () => {
        setSelectedStatuses([])
        setSelectedPriorities([])
        setSelectedAssignees([])
        setDateRange({})
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
                                placeholder="Search issues by title, description, or IS-number..."
                                className="border-[hsl(var(--border))] pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter */}
                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'relative border-[hsl(var(--border))] font-semibold',
                                        hasActiveFilters &&
                                            'border-[hsl(var(--primary))] text-[hsl(var(--primary))]',
                                    )}
                                >
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Filter
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
                                            {selectedStatuses.length +
                                                selectedPriorities.length +
                                                selectedAssignees.length +
                                                (dateRange.from || dateRange.to
                                                    ? 1
                                                    : 0)}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-96 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0"
                                align="end"
                            >
                                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
                                    <h3 className="text-lg font-bold">
                                        Filters
                                    </h3>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80"
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </div>

                                <ScrollArea className="max-h-[500px]">
                                    <div className="space-y-5 p-4">
                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <Label className="font-semibold">
                                                Status
                                            </Label>
                                            <ToggleGroup
                                                type="multiple"
                                                value={selectedStatuses}
                                                onValueChange={
                                                    setSelectedStatuses
                                                }
                                                className="flex-wrap justify-start gap-2"
                                            >
                                                <ToggleGroupItem
                                                    value="open"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-orange-200 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-600"
                                                >
                                                    Open
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="pending_approval"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-blue-200 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
                                                >
                                                    Pending Approval
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="closed"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-green-200 data-[state=on]:bg-green-50 data-[state=on]:text-green-600"
                                                >
                                                    Closed
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>

                                        <Separator className="bg-[hsl(var(--border))]" />

                                        {/* Priority Filter */}
                                        <div className="space-y-2">
                                            <Label className="font-semibold">
                                                Priority
                                            </Label>
                                            <ToggleGroup
                                                type="multiple"
                                                value={selectedPriorities}
                                                onValueChange={
                                                    setSelectedPriorities
                                                }
                                                className="flex-wrap justify-start gap-2"
                                            >
                                                <ToggleGroupItem
                                                    value="low"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-green-200 data-[state=on]:bg-green-50 data-[state=on]:text-green-600"
                                                >
                                                    Low
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="medium"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-blue-200 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
                                                >
                                                    Medium
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="high"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-orange-200 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-600"
                                                >
                                                    High
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="urgent"
                                                    className="border-2 px-3 py-2 font-semibold data-[state=on]:border-red-200 data-[state=on]:bg-red-50 data-[state=on]:text-red-600"
                                                >
                                                    Urgent
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>

                                        <Separator className="bg-[hsl(var(--border))]" />

                                        {/* Assigned To Filter */}
                                        <div className="space-y-2">
                                            <Label className="font-semibold">
                                                Assigned To
                                            </Label>
                                            {usersLoading ? (
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    Loading users...
                                                </p>
                                            ) : (
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={selectedAssignees}
                                                    onValueChange={
                                                        setSelectedAssignees
                                                    }
                                                    className="flex-wrap justify-start gap-2"
                                                >
                                                    {allUsers.map((user) => (
                                                        <ToggleGroupItem
                                                            key={user.id}
                                                            value={user.id}
                                                            className="border-2 px-3 py-2 font-semibold data-[state=on]:border-[hsl(var(--primary))] data-[state=on]:bg-[hsl(var(--primary))]/10 data-[state=on]:text-[hsl(var(--primary))]"
                                                        >
                                                            <Avatar className="mr-2 h-5 w-5">
                                                                <AvatarFallback className="bg-[hsl(var(--muted))] text-xs">
                                                                    {
                                                                        user.initials
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.username}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            )}
                                        </div>

                                        <Separator className="bg-[hsl(var(--border))]" />

                                        {/* Date Range Filter */}
                                        <div className="space-y-2">
                                            <Label className="font-semibold">
                                                Updated Date Range
                                            </Label>
                                            <div className="flex gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'flex-1 justify-start border-[hsl(var(--border))] text-left font-normal',
                                                                !dateRange.from &&
                                                                    'text-[hsl(var(--muted-foreground))]',
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dateRange.from
                                                                ? dateRange.from.toLocaleDateString()
                                                                : 'From'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto bg-[hsl(var(--card))] p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                dateRange.from
                                                            }
                                                            onSelect={(date) =>
                                                                setDateRange({
                                                                    ...dateRange,
                                                                    from: date,
                                                                })
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'flex-1 justify-start border-[hsl(var(--border))] text-left font-normal',
                                                                !dateRange.to &&
                                                                    'text-[hsl(var(--muted-foreground))]',
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dateRange.to
                                                                ? dateRange.to.toLocaleDateString()
                                                                : 'To'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto bg-[hsl(var(--card))] p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                dateRange.to
                                                            }
                                                            onSelect={(date) =>
                                                                setDateRange({
                                                                    ...dateRange,
                                                                    to: date,
                                                                })
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            {(dateRange.from ||
                                                dateRange.to) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDateRange({})
                                                    }
                                                    className="w-full text-xs text-[hsl(var(--muted-foreground))]"
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Clear date range
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>

                        {/* Sort */}
                        <DropdownMenu
                            open={sortOpen}
                            onOpenChange={setSortOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-[hsl(var(--border))] font-semibold"
                                >
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                                align="end"
                            >
                                <div className="space-y-1 p-2">
                                    <button
                                        onClick={() =>
                                            setSortBy('updated-desc')
                                        }
                                        className={cn(
                                            'w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors',
                                            sortBy === 'updated-desc'
                                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                                : 'hover:bg-[hsl(var(--hover-light))]',
                                        )}
                                    >
                                        Updated: Newest First
                                    </button>
                                    <button
                                        onClick={() => setSortBy('updated-asc')}
                                        className={cn(
                                            'w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors',
                                            sortBy === 'updated-asc'
                                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                                : 'hover:bg-[hsl(var(--hover-light))]',
                                        )}
                                    >
                                        Updated: Oldest First
                                    </button>
                                    <Separator className="my-2 bg-[hsl(var(--border))]" />
                                    <button
                                        onClick={() =>
                                            setSortBy('priority-high')
                                        }
                                        className={cn(
                                            'w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors',
                                            sortBy === 'priority-high'
                                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                                : 'hover:bg-[hsl(var(--hover-light))]',
                                        )}
                                    >
                                        Priority: High to Low
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSortBy('priority-low')
                                        }
                                        className={cn(
                                            'w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors',
                                            sortBy === 'priority-low'
                                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                                : 'hover:bg-[hsl(var(--hover-light))]',
                                        )}
                                    >
                                        Priority: Low to High
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
                    {/* // Show skeleton only on initial load */}
                    {isLoading && <IssueCardSkeleton />}

                    {/* // Show inline loading indicator when refetching (changing filters) */}
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
