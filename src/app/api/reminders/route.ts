import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const reminderTime = searchParams.get('reminderTime');

  if (!eventId  || !reminderTime) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const notification = await prisma.reminder.create({
      data: {
        eventId,
        time: new Date(reminderTime),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const userId = searchParams.get('userId');

  if (!eventId || !userId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { reminders: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.reminder.deleteMany({
      where: { eventId },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}