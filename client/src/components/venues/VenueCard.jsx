import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Star,
    Users,
    Clock,
    ArrowRight,
    CheckCircle,
    Heart,
    Wifi,
    Car,
    Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const VenueCard = ({ venue, variant = "grid" }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Early return if venue is not provided
    if (!venue) return null;

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        setIsFavorite(!isFavorite);
        setIsLoading(false);
    };

    // Get top amenities
    const getAmenityIcon = (name) => {
        const lowerName = name?.toLowerCase() || '';
        if (lowerName.includes('wifi')) return Wifi;
        if (lowerName.includes('parking')) return Car;
        if (lowerName.includes('gym') || lowerName.includes('equipment')) return Dumbbell;
        return null;
    };

    const availableAmenities = venue.amenities?.filter(a => a?.available).slice(0, 3) || [];
    const venueImage = venue.images?.length > 0 ? venue.images[0]?.url : '/venues/default-venue.png';
    const venueName = venue.name || 'Unnamed Venue';
    const venueCity = venue.location?.city || 'Unknown City';
    const venueCountry = venue.location?.country || '';
    const venueSports = venue.sports || [];
    const venueCapacity = venue.capacity || 'N/A';
    const venueOpenTime = venue.availability?.[0]?.openTime || '9:00';
    const venueCloseTime = venue.availability?.[0]?.closeTime || '22:00';
    const venuePrice = venue.pricing?.hourlyRate || 0;
    const venueRating = venue.averageRating ? Number(venue.averageRating) : null;
    const venueDescription = venue.description || 'No description available.';

    // List View
    if (variant === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
            >
                <Card className="overflow-hidden border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">
                        {/* Image Section */}
                        <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
                            <img
                                src={venueImage}
                                alt={venueName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent sm:bg-gradient-to-t" />

                            {/* Badges */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                {venue.isVerified && (
                                    <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                    </Badge>
                                )}
                            </div>

                            {/* Favorite Button - Primary themed */}
                            <button
                                onClick={handleFavoriteClick}
                                disabled={isLoading}
                                className={cn(
                                    "absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-md",
                                    isFavorite
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card/90 text-primary hover:bg-primary/10"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                            </button>

                            {/* Rating - Primary themed */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md">
                                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                    {venueRating?.toFixed(1) || 'New'}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-5">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                {venueName}
                                            </h3>
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <MapPin className="w-4 h-4 mr-1 text-primary" />
                                                <span className="truncate">{venueCity}{venueCountry && `, ${venueCountry}`}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-2xl font-bold text-primary">₹{venuePrice}</p>
                                            <p className="text-xs text-muted-foreground">/hour</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {venueDescription}
                                    </p>

                                    {/* Sports Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {venueSports.slice(0, 4).map((sport, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-0">
                                                {sport}
                                            </Badge>
                                        ))}
                                        {venueSports.length > 4 && (
                                            <Badge variant="outline" className="border-border">+{venueSports.length - 4}</Badge>
                                        )}
                                    </div>

                                    {/* Quick Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span>Capacity: {venueCapacity}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{venueOpenTime} - {venueCloseTime}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    {/* Amenities */}
                                    <div className="flex items-center gap-3">
                                        {availableAmenities.map((amenity, idx) => {
                                            const Icon = getAmenityIcon(amenity?.name);
                                            return Icon ? (
                                                <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Icon className="w-4 h-4 text-primary" />
                                                </div>
                                            ) : null;
                                        })}
                                    </div>

                                    <Link to={`/venues/${venue._id}`}>
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl group/btn">
                                            Book Now
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    }

    // Grid View (Default)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group h-full"
        >
            <Card className="h-full overflow-hidden border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col">
                {/* Image Section */}
                <div className="relative h-52 overflow-hidden">
                    <img
                        src={venueImage}
                        alt={venueName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges Row - Primary themed */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {/* Left side - Favorite & Rating */}
                        <div className="flex items-center gap-2">
                            {/* Favorite Button - Primary themed */}
                            <button
                                onClick={handleFavoriteClick}
                                disabled={isLoading}
                                className={cn(
                                    "p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg",
                                    isFavorite
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card/90 text-primary hover:bg-primary/10"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                            </button>

                            {/* Rating Badge - Primary themed */}
                            <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg">
                                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                    {venueRating?.toFixed(1) || 'New'}
                                </span>
                            </div>
                        </div>

                        {/* Right side - Verified Badge */}
                        {venue.isVerified && (
                            <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
                                <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-bold text-white mb-1 truncate drop-shadow-lg">{venueName}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{venueCity}{venueCountry && `, ${venueCountry}`}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-5 flex-grow space-y-4">
                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-2">
                        {venueSports.slice(0, 3).map((sport, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-0">
                                {sport}
                            </Badge>
                        ))}
                        {venueSports.length > 3 && (
                            <Badge variant="outline" className="border-border">+{venueSports.length - 3}</Badge>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {venueDescription}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span>Cap: {venueCapacity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{venueOpenTime} - {venueCloseTime}</span>
                        </div>
                    </div>

                    {/* Amenities */}
                    {availableAmenities.length > 0 && (
                        <div className="flex items-center gap-3 pt-2 border-t border-border">
                            {availableAmenities.map((amenity, idx) => {
                                const Icon = getAmenityIcon(amenity?.name);
                                return Icon ? (
                                    <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Icon className="w-4 h-4 text-primary" />
                                        <span className="hidden sm:inline">{amenity?.name}</span>
                                    </div>
                                ) : (
                                    <Badge key={idx} variant="secondary" className="text-xs bg-muted/50">
                                        {amenity?.name || 'Amenity'}
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <CardFooter className="p-5 pt-0 border-t border-border mt-auto">
                    <div className="flex items-center justify-between w-full mt-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium">Starting from</p>
                            <p className="text-xl font-bold text-primary">
                                ₹{venuePrice}
                                <span className="text-sm font-normal text-muted-foreground">/hr</span>
                            </p>
                        </div>
                        <Link to={`/venues/${venue._id}`}>
                            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group/btn">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default VenueCard;
