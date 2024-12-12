import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        tags: body.tags,
        isMeeting: body.isMeeting,
        meetingType: body.meetingType,
        location: body.location,
        virtualLink: body.virtualLink,
        userId: body.userId, 
      },
    })
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
  
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
  
    try {
      const body = await request.json()
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          startTime: new Date(body.startTime),
          endTime: body.endTime ? new Date(body.endTime) : null,
          tags: body.tags,
          isMeeting: body.isMeeting,
          meetingType: body.meetingType,
          location: body.location,
          virtualLink: body.virtualLink,
        },
      })
      return NextResponse.json(updatedEvent)
    } catch (error) {
      return NextResponse.json({ error: 'Error updating event' }, { status: 500 })
    }
  }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')


  if (userId) {
    try {
      const event = await prisma.event.findMany({
        where: { userId:userId },
        include:{
          reminders:{
            select:{
              id:true,
            }
          }
        }
      })
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json(event)
    } catch (error) {
      return NextResponse.json({ error: 'Error fetching event' }, { status: 500 })
    }
  } else {
    try {
      const events = await prisma.event.findMany()
      return NextResponse.json(events)
    } catch (error) {
      return NextResponse.json({ error: 'Error fetching events' }, { status: 500 })
    }
  }
}



export async function DELETE(request: Request) {
  console.log("Starting DELETE operation")
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  console.log("Received ID:", id)

  if (!id) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
  }

  try {
    // First, find the event and its associated reminders
    const targetEvent = await prisma.event.findUnique({
      where: { id: id },
      include: {
        reminders: {
          select: { id: true }
        }
      }
    })

    if (!targetEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete associated reminders first
    if (targetEvent.reminders.length > 0) {
      await prisma.reminder.deleteMany({
        where: {
          id: {
            in: targetEvent.reminders.map(reminder => reminder.id)
          }
        }
      })
      console.log("Associated reminders deleted")
    }

    // Now delete the event
    const deletedEvent = await prisma.event.delete({
      where: { id: id },
    })

    console.log("Deleted event:", deletedEvent)
    return NextResponse.json({ message: 'Event and associated reminders deleted successfully' })
  } catch (error) {
    console.error("Error during delete operation:", error)
    return NextResponse.json({ error: 'Error deleting event and reminders' }, { status: 500 })
  }
}
