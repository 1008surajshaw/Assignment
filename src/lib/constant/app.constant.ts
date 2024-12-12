import APP_PATHS from '@/config/path.config';
import { Home, Calendar,MessageSquareDot} from 'lucide-react';

export const navbar = [
  
    {id:1, label: 'Home', path:APP_PATHS.HOME,icon: Home },
    {id: 2,  label: 'Calendar', path:APP_PATHS.CALENDER,icon: Calendar },
    {id:4,label:'Notification',path:APP_PATHS.NOTIFICATION,icon:MessageSquareDot},
  
  
];
