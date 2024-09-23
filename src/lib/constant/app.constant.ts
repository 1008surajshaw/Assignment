import APP_PATHS from '@/config/path.config';
import { Home, Calendar, Settings, HelpCircle ,MessageSquareDot} from 'lucide-react';

export const navbar = [
  
    {id:1, label: 'Home', path:APP_PATHS.HOME,icon: Home },
    {id: 2,  label: 'Calendar', path:APP_PATHS.CALENDER,icon: Calendar },
    { id: 3, label: 'Settings', path:APP_PATHS.SETTINGS, icon: Settings   },
    {id:4,label:'Notification',path:APP_PATHS.NOTIFICATION,icon:MessageSquareDot},
    {id: 5,  label: 'Help',  path:APP_PATHS.HELP,icon: HelpCircle},
  
  
];
