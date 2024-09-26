'use server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();



export async function getEvents(userId: string) {
  return prisma.event.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' },
    include: { reminders: true },
  });
}