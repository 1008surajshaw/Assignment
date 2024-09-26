'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  userId: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  tags: z.array(z.string()),
  isMeeting: z.boolean().default(false),
  meetingType: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']).optional(),
  location: z.string().optional(),
  virtualLink: z.string().optional(),
})

//@ts-ignore
export default function EventForm({ selectedDate, onEventCreated, editingEvent }) {

  const [isMeeting, setIsMeeting] = useState(editingEvent?.isMeeting || false)
  const { data: session } = useSession()
  const userId = session?.user?.id 
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId:'',
      title: editingEvent?.title || "",
      description: editingEvent?.description || "",
      startTime: editingEvent?.startTime || `${(selectedDate || new Date()).toISOString().split('T')[0]}T09:00`,
      endTime: editingEvent?.endTime || `${(selectedDate || new Date()).toISOString().split('T')[0]}T10:00`,
      tags: editingEvent?.tags || [],
      isMeeting: editingEvent?.isMeeting || false,
      meetingType: editingEvent?.meetingType || undefined,
      location: editingEvent?.location || "",
      virtualLink: editingEvent?.virtualLink || "",
    },
  })

  useEffect(() => {
    if (userId) {
      form.setValue('userId', userId)
    }
  }, [userId, form])

  useEffect(() => {
    if (editingEvent) {
      form.reset({
        title: editingEvent.title,
        description: editingEvent.description,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        tags: editingEvent.tags,
        isMeeting: editingEvent.isMeeting,
        meetingType: editingEvent.meetingType,
        location: editingEvent.location,
        virtualLink: editingEvent.virtualLink,
      })
      setIsMeeting(editingEvent.isMeeting)
    }
  }, [editingEvent, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const url = editingEvent ? `/api/events?id=${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
       
      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      toast({
        title: editingEvent ? "Event updated" : "Event created",
        description: editingEvent ? "Your event has been successfully updated." : "Your event has been successfully created.",
      })
      onEventCreated()
    } catch (error) {
      console.error('Error saving event:', error)
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-between'>
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        
        <FormField
  control={form.control}
  name="tags"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <FormControl>
        <Select
          onValueChange={(value) => {
            // Add selected tag to the array if not already present
            if (!field.value.includes(value)) {
              field.onChange([...field.value, value]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tags" />
          </SelectTrigger>
          <SelectContent>
            {['WORK', 'PERSONAL', 'FAMILY', 'HEALTH', 'SOCIAL', 'EDUCATION', 'OTHER', 'MEETING'].map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>

      {/* Render selected tags */}
      <div className="mt-2">
        {field.value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {field.value.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded"
              >
                {tag}
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => {
                    // Remove the tag from the array when clicking the 'x'
                    field.onChange(field.value.filter((t) => t !== tag));
                  }}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <FormMessage />
    </FormItem>
  )}
/>


        <FormField
          control={form.control}
          name="isMeeting"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Is this a meeting?</FormLabel>
                <FormDescription>
                  Toggle if this event is a meeting
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    setIsMeeting(checked)
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isMeeting && (
          <>
            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                      <SelectItem value="VIRTUAL">Virtual</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="virtualLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Virtual Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Virtual meeting link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit">{editingEvent ? 'Update Event' : 'Create Event'}</Button>
      </form>
    </Form>
  )
}
