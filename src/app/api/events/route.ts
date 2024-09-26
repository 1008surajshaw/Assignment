import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log(body,"body")
    
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
    console.error('Error creating event:', error)
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
      console.error('Error updating event:', error)
      return NextResponse.json({ error: 'Error updating event' }, { status: 500 })
    }
  }

export async function GET(request: Request) {
  console.log("one")
  const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    console.log(searchParams)


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
      console.error('Error fetching event:', error)
      return NextResponse.json({ error: 'Error fetching event' }, { status: 500 })
    }
  } else {
    try {
      const events = await prisma.event.findMany()
      return NextResponse.json(events)
    } catch (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Error fetching events' }, { status: 500 })
    }
  }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
  
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
  
    try {
      await prisma.event.delete({
        where: { id },
      })
      return NextResponse.json({ message: 'Event deleted successfully' })
    } catch (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json({ error: 'Error deleting event' }, { status: 500 })
    }
  }