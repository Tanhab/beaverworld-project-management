"use client";

import {
  Bug,
  Grid2X2Check,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import VersionTrackerCard from "@/components/dashboard/VersionTrackerCard";
import UpcomingEventsCard from "@/components/dashboard/UpcomingEventsCard";
import { useIssues, useMyIssues } from "@/lib/hooks/useIssues";


// Dummy Data
// Base config for dashboard stat cards (styling + links)
const baseStats = [
  {
    key: "totalIssues" as const,
    title: "Total Issues",
    icon: Bug,
    color: "text-[hsl(var(--primary))]",
    bgColor: "bg-[hsl(var(--primary))]/10",
    link: "/issues",
    linkText: "View all issues",
  },
  {
    key: "myIssues" as const,
    title: "Your Pending Issues",
    icon: ListChecks,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    link: "/issues?filter=assigned-to-me&status=open",
    linkText: "View your issues",
  },
  {
    key: "totalScenarios" as const,
    title: "Total Scenarios",
    icon: Grid2X2Check,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    link: "/scenarios",
    linkText: "View all scenarios",
  },
  {
    key: "myScenarios" as const,
    title: "Your Pending Scenarios",
    icon: ListChecks,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    link: "/scenarios?filter=assigned-to-me&status=pending",
    linkText: "View your scenarios",
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
  const { data: allIssues } = useIssues();
  const { data: myIssues } = useMyIssues();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const totalIssues = allIssues?.length ?? 0;

  const issuesThisWeek =
    allIssues?.filter((issue: any) => {
      if (!issue.created_at) return false;
      const created = new Date(issue.created_at);
      return created >= weekAgo;
    }).length ?? 0;

  const myPendingIssues =
    myIssues?.filter(
      (issue: any) =>
        issue.status !== "closed" && !issue.is_archived,
    ) ?? [];

  const myHighOrUrgent =
    myPendingIssues.filter(
      (issue: any) =>
        issue.priority === "high" || issue.priority === "urgent",
    ).length ?? 0;

  const stats = baseStats.map((stat) => {
    switch (stat.key) {
      case "totalIssues":
        return {
          ...stat,
          value: totalIssues,
          change: `+${issuesThisWeek} this week`,
        };
      case "myIssues":
        return {
          ...stat,
          value: myPendingIssues.length,
          change: `${myHighOrUrgent} high / urgent`,
        };
      case "totalScenarios":
        // still dummy
        return {
          ...stat,
          value: 12,
          change: "4 in progress",
        };
      case "myScenarios":
        // still dummy
        return {
          ...stat,
          value: 5,
          change: "2 urgent",
        };
      default:
        return stat;
    }
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] font-medium text-base">
            Welcome back! Here&apos;s what&apos;s happening with our projects.
          </p>
        </div>

        {/* Top Section: Stats + Upcoming Events */}
        <div className="grid gap-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2">
          {/* Stats Grid */}
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
                        {stat.change && (
                          <p className="text-base font-medium text-[hsl(var(--muted-foreground))]">
                            {stat.change}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl shrink-0",
                        stat.bgColor,
                      )}
                    >
                      <stat.icon className={cn("h-7 w-7", stat.color)} />
                    </div>
                  </div>
                  <Link
                    href={stat.link}
                    className="inline-flex items-center gap-1.5 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors group"
                  >
                    {stat.linkText}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Events column */}
          <UpcomingEventsCard className="lg:col-span-2 md:col-span-1 sm:col-span-2" />
        </div>

        {/* Rest of your dashboard (recent activity, version tracker, etc.) stays the same */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentActivityFeed
            daysBack={30}
            limit={50}
            showLoadMore={true}
            className="lg:col-span-2"
          />
          <VersionTrackerCard />
        </div>

        {/* existing commented-out charts etc. */}
      </div>
    </div>
  );
}


