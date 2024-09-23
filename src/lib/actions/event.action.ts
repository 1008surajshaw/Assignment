'use server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

// export const getAllEventsStatus = (async (data:any) =>{
//     const gvents = prisma.event.findMany({
//       where:{
//         id:id,
//         status:status
//       },select:{
//         startTime:true,
//         endTime:true,
//         status:true,
//         tags:true,
//         createdAt:true,
//       }
//     })
//    try{

//    }
//    catch(error){
    
//    }
// })



export async function getEvents(userId: string) {
  return prisma.event.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' },
    include: { reminders: true },
  });
}