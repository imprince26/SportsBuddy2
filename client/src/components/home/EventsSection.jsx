


import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter } from "lucide-react";
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,

} from '@/components/ui/card';
import {Button} from '@/components/ui/button'
import { cn } from '@/lib/utils';
import { useAuth } from "@/context/AuthContext";


  
  const EventsSection = () => {
  
  const [sportFilter, setSportFilter] = useState('all');
  const { user } = useAuth();

  const events = [
    {
      id: 1,
      title: 'City Basketball Tournament',
      sport: 'Basketball',
      date: '2025-05-10',
      location: 'Downtown Arena',
      image: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7',
    },
    {
      id: 2,
      title: 'Beach Volleyball Open',
      sport: 'Volleyball',
      date: '2025-06-15',
      location: 'Coastal Beach',
      image: 'https://images.unsplash.com/photo-1595437178050-7c1577ad1570',
    },
    {
      id: 3,
      title: 'Marathon Run',
      sport: 'Running',
      date: '2025-07-20',
      location: 'City Park',
      image: 'https://images.unsplash.com/photo-1517433367423-1d9659072050',
    },
  ];
  
  const filteredEvents =
  sportFilter === 'all'
    ? events
    : events.filter((event) => event.sport === sportFilter);
    return (
      <section
               className={cn(
                 'py-16',
                 'bg-background-light dark:bg-background-dark'
               )}
             >
               <div className="container mx-auto px-6">
                 <motion.h2
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   viewport={{ once: true }}
                   className={cn(
                     'text-3xl md:text-4xl font-bold text-center mb-12',
                     'text-foreground-light dark:text-foreground-dark'
                   )}
                 >
                   Upcoming Events
                 </motion.h2>
                 <div className="flex justify-center mb-8">
                   <div className="flex space-x-4">
                     {['all', 'Basketball', 'Volleyball', 'Running'].map((sport) => (
                       <Button
                         key={sport}
                         variant={sportFilter === sport ? 'default' : 'outline'}
                         onClick={() => setSportFilter(sport)}
                         className={cn(
                           sportFilter === sport
                             ? 'bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light'
                             : 'border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark'
                         )}
                       >
                         <Filter className="h-4 w-4 mr-2" />
                         {sport.charAt(0).toUpperCase() + sport.slice(1)}
                       </Button>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                   {filteredEvents.map((event, index) => (
                     <motion.div
                       key={event.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.5, delay: index * 0.1 }}
                       viewport={{ once: true }}
                     >
                       <Card
                         className={cn(
                           'border overflow-hidden',
                           'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark hover:shadow-xl transition-shadow'
                         )}
                       >
                         <img
                           src={event.image}
                           alt={event.title}
                           className="w-full h-48 object-cover"
                           loading="lazy"
                         />
                         <CardContent className="p-6">
                           <h3
                             className={cn(
                               'text-xl font-semibold mb-2',
                               'text-foreground-light dark:text-foreground-dark'
                             )}
                           >
                             {event.title}
                           </h3>
                           <p
                             className={cn(
                               'text-sm mb-4',
                               'text-muted-foreground-light dark:text-muted-foreground-dark'
                             )}
                           >
                             {event.date} | {event.location}
                           </p>
                           <Button
                             asChild
                             className={cn(
                               'w-full',
                               'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                               'text-foreground-dark dark:text-foreground-light'
                             )}
                           >
                             <Link to={user ? `/events/${event.id}` : '/login'}>
                               {user ? 'Join Event' : 'Sign In to Join'}
                             </Link>
                           </Button>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </div>
               </div>
             </section>
   );
  }
  
  export default EventsSection
  