'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import EventForm from './event-form'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, subMinutes, addMinutes, parseISO } from 'date-fns'

interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  tags: string[]
  status: string
  isMeeting: boolean
  meetingType?: string
  location?: string
  virtualLink?: string
  reminders: { id: string; time: string }[]
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [reminderTimes, setReminderTimes] = useState<{ [key: string]: number }>({})

  const { data: session } = useSession()
  const userId = session?.user?.id 

  useEffect(() => {
    if (userId) {
      fetchEvents()
    }
  }, [userId])

  const fetchEvents = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/events?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json();
      console.log(data, "data is this ")
      setEvents(data)
      
      // Initialize reminder times
      const initialReminderTimes: { [key: string]: number } = {}
      data.forEach((event: Event) => {
        if (event.reminders.length > 0) {
          const reminderTime = parseISO(event.reminders[0].time)
          const eventTime = parseISO(event.startTime)
          const diffInMinutes = Math.round((eventTime.getTime() - reminderTime.getTime()) / (1000 * 60))
          initialReminderTimes[event.id] = diffInMinutes
        } else {
          initialReminderTimes[event.id] = 30 // Default to 30 minutes
        }
      })
      setReminderTimes(initialReminderTimes)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setIsDialogOpen(true)
    setEditingEvent(null)
  }

  const handleEventCreated = (savedEvent: Event) => {
    setIsDialogOpen(false)
    if (editingEvent) {
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === savedEvent.id ? savedEvent : event
      ))
    } else {
      setEvents(prevEvents => [...prevEvents, savedEvent])
    }
    setEditingEvent(null)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete event')
      }
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleNotification = async (eventId: string, hasNotification: boolean) => {
    try {
      const method = hasNotification ? 'DELETE' : 'POST';
      const event = events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const reminderTime = subMinutes(new Date(event.startTime), reminderTimes[eventId] || 30).toISOString();

      const response = await fetch(`/api/reminders?eventId=${eventId}&reminderTime=${reminderTime}`, { method });
      if (!response.ok) {
        throw new Error('Failed to toggle notification');
      }
      
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === eventId
          ? {
              ...event,
              reminders: hasNotification 
                ? [] 
                : [{ id: 'temp-id', time: reminderTime }]
            }
          : event
      ));

      toast({
        title: hasNotification ? "Notification removed" : "Notification set",
        description: `Notification for "${event.title}" has been ${hasNotification ? 'removed' : 'set'}.`,
      });
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast({
        title: "Error",
        description: "Failed to toggle notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReminderTimeChange = async (eventId: string, minutes: number) => {
    setReminderTimes(prev => ({ ...prev, [eventId]: minutes }))
    
    const event = events.find(e => e.id === eventId);
    if (!event || event.reminders.length === 0) return;

    try {
      const reminderTime = subMinutes(new Date(event.startTime), minutes).toISOString();
      const response = await fetch(`/api/reminders?eventId=${eventId}&reminderTime=${reminderTime}`, { 
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error('Failed to update reminder time');
      }
      
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === eventId
          ? {
              ...event,
              reminders: [{ ...event.reminders[0], time: reminderTime }]
            }
          : event
      ));

      toast({
        title: "Reminder updated",
        description: `Reminder for "${event.title}" has been updated to ${minutes} minutes before the event.`,
      });
    } catch (error) {
      console.error('Error updating reminder time:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder time. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div className="flex justify-center mb-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border"
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <ScrollArea className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : `Create Event for ${date && format(date, 'MMMM d, yyyy')}`}
              </DialogTitle>
              <DialogDescription>
                {editingEvent 
                  ? 'Make changes to your event here. Click save when you done.'
                  : 'Add a new event to your calendar. Fill out the details below.'
                }
              </DialogDescription>
            </DialogHeader>
            <EventForm
              selectedDate={date}
              onEventCreated={handleEventCreated}
              editingEvent={editingEvent}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <h2 className="text-xl font-bold mb-4">Your Events</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Notification</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>{format(new Date(event.startTime), 'PPp')}</TableCell>
              <TableCell>{event.endTime ? format(new Date(event.endTime), 'PPp') : 'N/A'}</TableCell>
              <TableCell>{event.tags.join(', ')}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start space-y-2">
                  <Switch
                    checked={event.reminders.length > 0}
                    onCheckedChange={(checked) => toggleNotification(event.id, !checked)}
                    className={event.reminders.length > 0 ? "bg-green-500" : ""}
                  />
                  {event.reminders.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={30}
                        className="w-16"
                      />
                      <span className="text-sm">minutes before</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleEditEvent(event)} className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}