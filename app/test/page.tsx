'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
    Bug,
    Plus,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Calendar as CalendarIcon,
    X,
    ChevronDown,
    ChevronRight,
    User,
    Clock,
    AlertCircle,
    CheckCircle2,
    Paperclip,
    MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { Calendar } from '@/components/ui/calendar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    formatDate,
    getCategoryColor,
    getPriorityColor,
    getStatusConfig,
} from '@/lib/issues/utils'
import { allUsers, dummyIssues } from '@/lib/dummy-data'
import IssueCard from '@/components/issue/IssueCard'

// Dummy data

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
    const [isLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)

    // Filter states
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

    // Sort state
    const [sortBy, setSortBy] = useState<string>('updated-desc')

    // Form states (for create dialog)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: [] as string[],
        deadline: undefined as Date | undefined,
        category: 'default',
        solvedCommit: '',
        buildVersion: '',
    })

    const hasActiveFilters =
        selectedPriorities.length > 0 ||
        selectedAssignees.length > 0 ||
        dateRange.from ||
        dateRange.to

    const clearFilters = () => {
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
                    <Dialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90">
                                <Plus className="h-5 w-5" />
                                Create New Issue
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 sm:max-w-[700px]">
                            <DialogHeader className="border-b border-[hsl(var(--border))] px-6 pt-6 pb-4">
                                <DialogTitle className="text-2xl font-bold">
                                    Create New Issue
                                </DialogTitle>
                                <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                                    Fill in the details to create a new issue
                                </DialogDescription>
                            </DialogHeader>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <form className="space-y-5 px-6 py-4">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="title"
                                            className="text-base font-semibold"
                                        >
                                            Title{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Brief description of the issue"
                                            className="border-[hsl(var(--border))]"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    title: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Description (Tiptap placeholder) */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="description"
                                            className="text-base font-semibold"
                                        >
                                            Description{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <div className="min-h-[150px] rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                                            <Textarea
                                                id="description"
                                                placeholder="Detailed description of the issue... (Tiptap editor will go here)"
                                                className="min-h-[120px] resize-none border-0 focus-visible:ring-0"
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Rich text editor (Tiptap) will be
                                            integrated here
                                        </p>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">
                                            Priority{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <ToggleGroup
                                            type="single"
                                            value={formData.priority}
                                            onValueChange={(value) =>
                                                value &&
                                                setFormData({
                                                    ...formData,
                                                    priority: value,
                                                })
                                            }
                                            className="justify-start gap-2"
                                        >
                                            <ToggleGroupItem
                                                value="low"
                                                className={cn(
                                                    'border-2 px-4 py-2 font-semibold data-[state=on]:border-green-200 data-[state=on]:bg-green-50 data-[state=on]:text-green-600',
                                                )}
                                            >
                                                Low
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="medium"
                                                className="border-2 px-4 py-2 font-semibold data-[state=on]:border-blue-200 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
                                            >
                                                Medium
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="high"
                                                className="border-2 px-4 py-2 font-semibold data-[state=on]:border-orange-200 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-600"
                                            >
                                                High
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="urgent"
                                                className="border-2 px-4 py-2 font-semibold data-[state=on]:border-red-200 data-[state=on]:bg-red-50 data-[state=on]:text-red-600"
                                            >
                                                Urgent
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>

                                    {/* Assigned To */}
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">
                                            Assigned To{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <ToggleGroup
                                            type="multiple"
                                            value={formData.assignedTo}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    assignedTo: value,
                                                })
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
                                                            {user.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {user.name}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </div>

                                    {/* Additional Info Toggle */}
                                    <div>
                                        <button
                                            type="button"
                                            aria-expanded={showAdditionalInfo}
                                            onClick={() =>
                                                setShowAdditionalInfo(
                                                    !showAdditionalInfo,
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg px-1 py-1 font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                                        >
                                            <ChevronRight
                                                className={cn(
                                                    'h-4 w-4 text-[hsl(var(--muted-foreground))] transition-transform duration-200',
                                                    showAdditionalInfo &&
                                                        'rotate-90 text-[hsl(var(--accent))]',
                                                )}
                                            />
                                            <span className="text-sm">
                                                {showAdditionalInfo
                                                    ? 'Hide Additional Information'
                                                    : 'Show Additional Information'}
                                            </span>
                                        </button>

                                        {showAdditionalInfo && (
                                            <div className="mt-4 space-y-5 border-l-2 border-[hsl(var(--border))] pl-6">
                                                {/* Deadline */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="deadline"
                                                        className="font-semibold"
                                                    >
                                                        Deadline
                                                    </Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'w-full justify-start border-[hsl(var(--border))] text-left font-normal',
                                                                    !formData.deadline &&
                                                                        'text-[hsl(var(--muted-foreground))]',
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {formData.deadline
                                                                    ? formData.deadline.toLocaleDateString()
                                                                    : 'Pick a date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto bg-[hsl(var(--card))] p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    formData.deadline
                                                                }
                                                                onSelect={(
                                                                    date,
                                                                ) =>
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            deadline:
                                                                                date,
                                                                        },
                                                                    )
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {/* Category */}
                                                <div className="space-y-2">
                                                    <Label className="font-semibold">
                                                        Category
                                                    </Label>
                                                    <ToggleGroup
                                                        type="single"
                                                        value={
                                                            formData.category
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            value &&
                                                            setFormData({
                                                                ...formData,
                                                                category: value,
                                                            })
                                                        }
                                                        className="justify-start gap-2"
                                                    >
                                                        <ToggleGroupItem
                                                            value="ui"
                                                            className="border-2 px-4 py-2 font-semibold data-[state=on]:border-purple-200 data-[state=on]:bg-purple-50 data-[state=on]:text-purple-600"
                                                        >
                                                            UI
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="dev"
                                                            className="border-2 px-4 py-2 font-semibold data-[state=on]:border-blue-200 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600"
                                                        >
                                                            Dev
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="media"
                                                            className="border-2 px-4 py-2 font-semibold data-[state=on]:border-pink-200 data-[state=on]:bg-pink-50 data-[state=on]:text-pink-600"
                                                        >
                                                            Media
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="default"
                                                            className="border-2 px-4 py-2 font-semibold data-[state=on]:border-[hsl(var(--border))] data-[state=on]:bg-[hsl(var(--muted))] data-[state=on]:text-[hsl(var(--foreground))]"
                                                        >
                                                            Default
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                </div>

                                                {/* Solved Commit Number */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="commit"
                                                        className="font-semibold"
                                                    >
                                                        Solved Commit Number
                                                    </Label>
                                                    <Input
                                                        id="commit"
                                                        placeholder="e.g., abc123"
                                                        className="border-[hsl(var(--border))]"
                                                        value={
                                                            formData.solvedCommit
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                solvedCommit:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>

                                                {/* Build Version */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="buildVersion"
                                                        className="font-semibold"
                                                    >
                                                        Build Version
                                                    </Label>
                                                    <Input
                                                        id="buildVersion"
                                                        placeholder="e.g., v1.2.3"
                                                        className="border-[hsl(var(--border))]"
                                                        value={
                                                            formData.buildVersion
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                buildVersion:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[hsl(var(--border))] px-6 py-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                    className="border-[hsl(var(--border))]"
                                >
                                    Cancel
                                </Button>
                                <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                                    Create Issue
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
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
                                            {selectedPriorities.length +
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
                                                                {user.initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {user.name}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
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
                                        {user?.name}
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
                    {isLoading ? (
                        // Skeleton loading state
                        <>
                            <IssueCardSkeleton />
                            <IssueCardSkeleton />
                            <IssueCardSkeleton />
                        </>
                    ) : (
                        // Actual issues
                        dummyIssues.map((issue) => {
                            const statusConfig = getStatusConfig(issue.status)
                            const StatusIcon = statusConfig.icon

                            return <IssueCard key={issue.id} issue={issue} />
                        })
                    )}
                </div>

                {/* Empty state (when no issues match filters) */}
                {!isLoading && dummyIssues.length === 0 && (
                    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
                        <Bug className="mx-auto mb-4 h-16 w-16 text-[hsl(var(--muted-foreground))]" />
                        <h3 className="mb-2 text-xl font-bold text-[hsl(var(--foreground))]">
                            No issues found
                        </h3>
                        <p className="mb-6 text-[hsl(var(--muted-foreground))]">
                            Try adjusting your filters or create a new issue
                        </p>
                        <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                            <Plus className="mr-2 h-5 w-5" />
                            Create Issue
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
