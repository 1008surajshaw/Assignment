'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import EventForm from './event-form'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { ScrollArea } from '@/components/ui/scroll-area'

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
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

   
  useEffect(() => {
    fetchEvents()
  }, [])
  
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

  const handleEventCreated = () => {
    setIsDialogOpen(false)
    fetchEvents()
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
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
  }

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