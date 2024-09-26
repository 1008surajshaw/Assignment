"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

interface EventFormProps {
  selectedDate?: Date;
  onEventCreated: (event: any) => void;
  editingEvent?: any;
}

export default function EventForm({ selectedDate, onEventCreated, editingEvent }: EventFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    tags: [] as string[],
    isMeeting: false,
    meetingType: null as string | null,
    location: "",
    virtualLink: "",
  });

  useEffect(() => {
    if (userId) {
      setFormData(prev => ({ ...prev, userId }));
    }
  }, [userId]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        ...editingEvent,
        startTime: formatDateTimeForInput(editingEvent.startTime),
        endTime: editingEvent.endTime ? formatDateTimeForInput(editingEvent.endTime) : "",
        meetingType: editingEvent.meetingType || null,
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        startTime: formatDateTimeForInput(selectedDate.toISOString()),
        endTime: formatDateTimeForInput(new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString()),
      }));
    }
  }, [editingEvent, selectedDate]);

  function formatDateTimeForInput(dateTimeString: string) {
    return new Date(dateTimeString).toISOString().slice(0, 16);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isMeeting: checked,
      meetingType: checked ? prev.meetingType : null,
      location: checked ? prev.location : "",
      virtualLink: checked ? prev.virtualLink : "",
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with values:", formData);

    try {
      const url = editingEvent ? `/api/events?id=${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      console.log(`Sending ${method} request to ${url}`);

      const eventData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
      };

      // Remove meetingType, location, and virtualLink if it's not a meeting
      

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(`Failed to save event: ${responseData.message || response.statusText}`);
      }

      toast({
        title: editingEvent ? "Event updated" : "Event created",
        description: editingEvent ? "Your event has been successfully updated." : "Your event has been successfully created.",
      });
      onEventCreated(responseData);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex justify-between">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
          <Input
            id="endTime"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {["WORK", "PERSONAL", "FAMILY", "HEALTH", "SOCIAL", "EDUCATION", "OTHER", "MEETING"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagChange(tag)}
              className={`px-2 py-1 text-sm rounded ${
                formData.tags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="isMeeting" className="text-sm font-medium text-gray-700">Is this a meeting?</label>
        <Switch
          id="isMeeting"
          checked={formData.isMeeting}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {formData.isMeeting && (
        <>
          <div>
            <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700">Meeting Type</label>
            <select
              id="meetingType"
              name="meetingType"
              value={formData.meetingType || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select meeting type</option>
              <option value="IN_PERSON">In Person</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          {formData.meetingType === "IN_PERSON" && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
          )}

          {formData.meetingType === "VIRTUAL" && (
            <div>
              <label htmlFor="virtualLink" className="block text-sm font-medium text-gray-700">Virtual Meeting Link</label>
              <Input
                id="virtualLink"
                name="virtualLink"
                value={formData.virtualLink}
                onChange={handleInputChange}
              />
            </div>
          )}
        </>
      )}
      <Button type="submit">
        {editingEvent ? "Update Event" : "Create Event"}
      </Button>
    </form>
  );
}