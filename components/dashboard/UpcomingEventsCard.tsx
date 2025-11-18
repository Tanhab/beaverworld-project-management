'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCreateEvent, useDeleteEvent, useEvents } from '@/lib/hooks/useEvents';
import type { EventPriority } from '@/lib/api/events';
import { Loader2 } from 'lucide-react';

interface UpcomingEventsCardProps {
  className?: string;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]';
  }
}

function getDaysLeft(dateStr: string): number {
  const today = new Date();
  const eventDate = new Date(dateStr);
  const diffMs = eventDate.getTime() - today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function UpcomingEventsCard({ className }: UpcomingEventsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<EventPriority | ''>('');
  const [location, setLocation] = useState('');

  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!title || !date || !priority) return;

    await createEvent.mutateAsync({
      title,
      description: description || undefined,
      date,
      location: location || undefined,
      priority,
    });

    setTitle('');
    setDescription('');
    setDate('');
    setPriority('');
    setLocation('');
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id);
  };

  return (
    <Card className={cn('border-[hsl(var(--border))] bg-[hsl(var(--card))]', className)}>
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
                <DialogTitle className="text-xl font-bold">Add New Event</DialogTitle>
                <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                  Create a new event for your team&apos;s calendar.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="event-title" className="font-semibold">
                    Event Title
                  </Label>
                  <Input
                    id="event-title"
                    placeholder="Enter event title"
                    className="border-[hsl(var(--border))]"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description" className="font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="event-description"
                    placeholder="Enter event description"
                    rows={3}
                    className="border-[hsl(var(--border))] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-priority" className="font-semibold">
                      Priority
                    </Label>
                    <Select
                      value={priority}
                      onValueChange={(v) => setPriority(v as EventPriority)}
                    >
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
                  <Label htmlFor="event-location" className="font-semibold">
                    Location
                  </Label>
                  <Input
                    id="event-location"
                    placeholder="Enter location"
                    className="border-[hsl(var(--border))]"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                    disabled={createEvent.isPending}
                  >
                    {createEvent.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
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
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-[hsl(var(--muted-foreground))] gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading events…</span>
              </div>
            )}

            {!isLoading && (!events || events.length === 0) && (
              <div className="py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                No upcoming events. Add one to get started.
              </div>
            )}

            {events?.map((event) => {
              const daysLeft = getDaysLeft(event.date);

              return (
                <div
                  key={event.id}
                  className="p-4 hover:bg-[hsl(var(--hover-light))] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-[hsl(var(--foreground))] line-clamp-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-semibold shrink-0',
                            getPriorityColor(event.priority),
                          )}
                        >
                          {event.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-red-600"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleteEvent.isPending}
                          aria-label="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          {new Date(event.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[hsl(var(--muted-foreground))]">
                          • {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                          <span className="font-medium text-[hsl(var(--muted-foreground))]">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
