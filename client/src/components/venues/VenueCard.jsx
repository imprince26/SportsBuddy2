import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Star,
    Users,
    Clock,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const VenueCard = ({ venue }) => {
    console.log(venue.images.length);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group h-full"
        >
            <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl flex flex-col">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={venue.images.length > 0 ? venue.images[0].url : '/venues/default-venue.png'}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 right-3 flex gap-2">
                        {venue.isVerified && (
                            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground border-0 backdrop-blur-sm">
                                <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                        )}
                        <Badge className="bg-white/90 text-gray-900 hover:bg-white border-0 backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                            {venue.averageRating || 'New'}
                        </Badge>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{venue.name}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{venue.location?.city}, {venue.location?.country}</span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-5 flex-grow space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {venue.sports?.slice(0, 3).map((sport, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {sport}
                            </Badge>
                        ))}
                        {venue.sports?.length > 3 && (
                            <Badge variant="outline">+{venue.sports.length - 3}</Badge>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {venue.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>Cap: {venue.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>{venue.availability?.[0]?.openTime || '9:00'} - {venue.availability?.[0]?.closeTime || '22:00'}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <div className="flex items-center justify-between w-full mt-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Starting from</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                ₹{venue.pricing?.hourlyRate}<span className="text-sm font-normal text-gray-500">/hr</span>
                            </p>
                        </div>
                        <Link to={`/venues/${venue._id}`}>
                            <Button className="rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none">
                                View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default VenueCard;
