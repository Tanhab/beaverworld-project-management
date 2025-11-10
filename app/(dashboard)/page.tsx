"use client";

import React, { useState } from "react";
import {
  Bug,
  Grid2X2Check,
  ListChecks,
  Clock,
  TrendingUp,
  GitBranch,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Calendar,
  Plus,
  MapPin,
  ArrowRight,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Dummy Data
const stats = [
  {
    title: "Total Issues",
    value: 47,
    change: "+5 this week",
    icon: Bug,
    color: "text-[hsl(var(--primary))]",
    bgColor: "bg-[hsl(var(--primary))]/10",
    link: "/issues",
    linkText: "View all issues",
  },
  {
    title: "Your Pending Issues",
    value: 8,
    change: "3 high priority",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    link: "/issues?filter=assigned-to-me&status=open",
    linkText: "View your issues",
  },
  {
    title: "Total Scenarios",
    value: 12,
    change: "4 in progress",
    icon: Grid2X2Check,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    link: "/scenarios",
    linkText: "View all scenarios",
  },
  {
    title: "Your Pending Scenarios",
    value: 5,
    change: "2 urgent",
    icon: ListChecks,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    link: "/scenarios?filter=assigned-to-me&status=pending",
    linkText: "View your scenarios",
  },
];

const recentActivity = [
  {
    id: 1,
    user: "Sarah Chen",
    initials: "SC",
    action: "created issue",
    target: "Login button not responsive",
    issueId: "#156",
    time: "5m ago",
    type: "issue_created",
    icon: Bug,
  },
  {
    id: 2,
    user: "Mike Johnson",
    initials: "MJ",
    action: "completed scenario",
    target: "Tutorial Testing",
    time: "12m ago",
    type: "scenario_completed",
    icon: CheckCircle2,
  },
  {
    id: 3,
    user: "Alex Kumar",
    initials: "AK",
    action: "commented on",
    target: "Character animation glitch",
    issueId: "#143",
    time: "28m ago",
    type: "comment",
    icon: MessageSquare,
  },
  {
    id: 4,
    user: "Emily Davis",
    initials: "ED",
    action: "closed issue",
    target: "UI scaling problem",
    issueId: "#152",
    time: "1h ago",
    type: "issue_closed",
    icon: CheckCircle2,
  },
  {
    id: 5,
    user: "John Doe",
    initials: "JD",
    action: "assigned",
    target: "Sound effects not playing",
    issueId: "#154",
    time: "2h ago",
    type: "assignment",
    icon: Users,
  },
  {
    id: 6,
    user: "Lisa Park",
    initials: "LP",
    action: "created scenario",
    target: "Combat System Test",
    time: "3h ago",
    type: "scenario_created",
    icon: Grid2X2Check,
  },
  {
    id: 7,
    user: "Tom Wilson",
    initials: "TW",
    action: "updated task",
    target: "Implement save system",
    time: "4h ago",
    type: "task_updated",
    icon: FileText,
  },
  {
    id: 8,
    user: "Sarah Chen",
    initials: "SC",
    action: "reopened issue",
    target: "Memory leak in menu",
    issueId: "#148",
    time: "5h ago",
    type: "issue_reopened",
    icon: AlertCircle,
  },
  {
    id: 9,
    user: "Mike Johnson",
    initials: "MJ",
    action: "commented on",
    target: "Performance optimization",
    issueId: "#140",
    time: "6h ago",
    type: "comment",
    icon: MessageSquare,
  },
  {
    id: 10,
    user: "Alex Kumar",
    initials: "AK",
    action: "closed issue",
    target: "Loading screen freeze",
    issueId: "#139",
    time: "7h ago",
    type: "issue_closed",
    icon: CheckCircle2,
  },
];

const versionHistory = [
  {
    version: "v1.2.3",
    branch: "main",
    author: "Mike Johnson",
    initials: "MJ",
    message: "Fixed login authentication flow",
    time: "2h ago",
    commits: 3,
  },
  {
    version: "v1.2.2",
    branch: "develop",
    author: "Sarah Chen",
    initials: "SC",
    message: "Added new character animations",
    time: "5h ago",
    commits: 7,
  },
  {
    version: "v1.2.1",
    branch: "main",
    author: "Alex Kumar",
    initials: "AK",
    message: "Improved performance in combat scenes",
    time: "1d ago",
    commits: 5,
  },
  {
    version: "v1.2.0",
    branch: "main",
    author: "Emily Davis",
    initials: "ED",
    message: "Major UI overhaul and bug fixes",
    time: "2d ago",
    commits: 12,
  },
  {
    version: "v1.1.9",
    branch: "hotfix",
    author: "Tom Wilson",
    initials: "TW",
    message: "Critical bug fix for save system",
    time: "3d ago",
    commits: 2,
  },
  {
    version: "v1.1.8",
    branch: "develop",
    author: "Lisa Park",
    initials: "LP",
    message: "New sound effects implementation",
    time: "4d ago",
    commits: 8,
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Sprint 3 Demo",
    description: "Showcase new features to stakeholders",
    date: "Nov 15, 2025",
    location: "Conference Room A",
    priority: "high",
    daysLeft: 2,
  },
  {
    id: 2,
    title: "UI Review Meeting",
    description: "Review latest UI/UX changes",
    date: "Nov 18, 2025",
    location: "Online - Zoom",
    priority: "medium",
    daysLeft: 5,
  },
  {
    id: 3,
    title: "Bug Bash Week",
    description: "Team-wide bug fixing sprint",
    date: "Nov 20, 2025",
    location: "Office",
    priority: "high",
    daysLeft: 7,
  },
  {
    id: 4,
    title: "Performance Testing",
    description: "Load testing and optimization review",
    date: "Nov 22, 2025",
    location: "Test Lab",
    priority: "medium",
    daysLeft: 9,
  },
  {
    id: 5,
    title: "Client Presentation",
    description: "Monthly progress update presentation",
    date: "Nov 25, 2025",
    location: "Client Office",
    priority: "high",
    daysLeft: 12,
  },
  {
    id: 6,
    title: "Team Retrospective",
    description: "Sprint retrospective and planning",
    date: "Nov 27, 2025",
    location: "Conference Room B",
    priority: "low",
    daysLeft: 14,
  },
];

// Commented out for later use
/*
const issuesByStatus = [
  { status: "Open", count: 23, color: "bg-orange-500" },
  { status: "In Progress", count: 15, color: "bg-blue-500" },
  { status: "Testing", count: 5, color: "bg-purple-500" },
  { status: "Closed", count: 4, color: "bg-green-500" },
];

const weeklyIssues = [
  { day: "Mon", created: 5, closed: 3 },
  { day: "Tue", created: 8, closed: 4 },
  { day: "Wed", created: 6, closed: 7 },
  { day: "Thu", created: 9, closed: 5 },
  { day: "Fri", created: 7, closed: 8 },
];
*/

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]";
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium text-base">
            Welcome back! Here's what's happening with our projects.
          </p>
        </div>

        {/* Top Section: Stats + Upcoming Events */}
        <div className="grid gap-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2">
          {/* Stats Grid - 2 columns on large screens */}
          <div className="lg:col-span-3 md:col-span-3 sm:col-span-2 grid gap-6 md:grid-cols-2 sm:grid-cols-2">

            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <p className="text-2xl font-bold text-[hsl(var(--muted-foreground))]">
                        {stat.title}
                      </p>
                      <div className="space-y-1">
                        <p className="text-4xl font-bold text-[hsl(var(--foreground))]">
                          {stat.value}
                        </p>
                        <p className="text-base font-medium text-[hsl(var(--muted-foreground))]">
                          {stat.change}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl shrink-0",
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn("h-7 w-7", stat.color)} />
                    </div>
                  </div>
                  <Link
                    href={stat.link}
                    className="inline-flex items-center gap-1.5 text-base font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors group"
                  >
                    {stat.linkText}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Events - 1 column on large screens */}
          <Card className="lg:col-span-2 md:col-span-1 sm:col-span-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Upcoming Events
                </CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Add New Event
                      </DialogTitle>
                      <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                        Create a new event for your team's calendar.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title" className="font-semibold">
                          Event Title
                        </Label>
                        <Input
                          id="event-title"
                          placeholder="Enter event title"
                          className="border-[hsl(var(--border))]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="event-description"
                          className="font-semibold"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="event-description"
                          placeholder="Enter event description"
                          rows={3}
                          className="border-[hsl(var(--border))] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date" className="font-semibold">
                            Date
                          </Label>
                          <Input
                            id="event-date"
                            type="date"
                            className="border-[hsl(var(--border))]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="event-priority"
                            className="font-semibold"
                          >
                            Priority
                          </Label>
                          <Select>
                            <SelectTrigger className="border-[hsl(var(--border))]">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="event-location"
                          className="font-semibold"
                        >
                          Location
                        </Label>
                        <Input
                          id="event-location"
                          placeholder="Enter location"
                          className="border-[hsl(var(--border))]"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="border-[hsl(var(--border))]"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        >
                          Create Event
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[420px]">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-[hsl(var(--hover-light))] transition-colors cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-[hsl(var(--foreground))] line-clamp-1">
                            {event.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold shrink-0",
                              getPriorityColor(event.priority)
                            )}
                          >
                            {event.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                            <span className="font-medium text-[hsl(var(--foreground))]">
                              {event.date}
                            </span>
                            <span className="text-[hsl(var(--muted-foreground))]">
                              • {event.daysLeft} days left
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Recent Activity
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
                >
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-[hsl(var(--hover-light))] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-[hsl(var(--border))] shrink-0">
                          <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm">
                            {activity.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm leading-relaxed">
                            <span className="font-semibold text-[hsl(var(--foreground))]">
                              {activity.user}
                            </span>{" "}
                            <span className="text-[hsl(var(--muted-foreground))]">
                              {activity.action}
                            </span>{" "}
                            <span className="font-semibold text-[hsl(var(--foreground))]">
                              {activity.target}
                            </span>
                            {activity.issueId && (
                              <span className="ml-1 text-[hsl(var(--primary))] font-semibold">
                                {activity.issueId}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                            {activity.time}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent))] shrink-0">
                          <activity.icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Version Tracker */}
          <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-[hsl(var(--primary))]" />
                Version Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {versionHistory.map((version) => (
                    <div
                      key={version.version}
                      className="p-4 hover:bg-[hsl(var(--hover-light))] transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                            >
                              {version.version}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                            >
                              {version.branch}
                            </Badge>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                            {version.time}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-2">
                          {version.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-[hsl(var(--border))]">
                              <AvatarFallback className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-semibold text-[10px]">
                                {version.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                              {version.author}
                            </span>
                          </div>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                            • {version.commits} commits
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Commented out charts for later use */}
        {/*
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
                Issue Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              // Chart content here
            </CardContent>
          </Card>

          <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              // Chart content here
            </CardContent>
          </Card>
        </div>
        */}
      </div>
    </div>
  );
}