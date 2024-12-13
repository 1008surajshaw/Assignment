import { authOptions } from '@/lib/authOptions';
import Calender from '@/view/contactpov/Calender'
import { getServerSession } from 'next-auth';

const page = async() => {
  const session = await getServerSession(authOptions);
  console.log(session,"session")

  if(session == null){
   return( <div>
       Signup first to add events.
    </div>
  )}
  return (
    <div>
      <Calender/>
    </div>
  )
}

export default page