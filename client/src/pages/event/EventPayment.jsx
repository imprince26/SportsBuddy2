import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, CheckCircle2, ArrowLeft, Calendar, MapPin, Users, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEvent } from '@/hooks/useEvent';
import { format } from 'date-fns';

const EventPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getEventById, confirmPayment } = useEvent();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('cash');

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const response = await getEventById(id);
            if (response.success) {
                setEvent(response.data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load event details',
                variant: 'destructive'
            });
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        try {
            setProcessing(true);
            const response = await confirmPayment(id, selectedMethod);

            if (response.success) {
                toast({
                    title: 'Payment Confirmed!',
                    description: 'You have successfully joined the event. Please pay at the venue.',
                    variant: 'success'
                });
                navigate(`/events/${id}`);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to confirm payment',
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/events/${id}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Event
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">Complete Payment</h1>
                    <p className="text-muted-foreground mt-2">Choose your payment method to join this event</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Event Summary */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Event Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground line-clamp-2">{event.name}</h3>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{format(new Date(event.date), 'PPP')}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span className="line-clamp-1">{event.location?.city}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{event.participants?.length || 0} / {event.maxParticipants} participants</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Registration Fee</span>
                                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                                    <IndianRupee className="w-5 h-5" />
                                    {event.registrationFee}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Select Payment Method</CardTitle>
                            <CardDescription>Choose how you'd like to pay for this event</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Cash Payment Option */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedMethod('cash')}
                                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${selectedMethod === 'cash'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${selectedMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                        }`}>
                                        <Banknote className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg">Cash at Location</h3>
                                            {selectedMethod === 'cash' && (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Pay the registration fee in cash when you arrive at the event venue.
                                            Please bring exact change if possible.
                                        </p>
                                        <Badge variant="secondary" className="mt-3">
                                            Recommended
                                        </Badge>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Online Payment Option (Coming Soon) */}
                            <motion.div
                                className="relative rounded-lg border-2 border-dashed border-border p-6 opacity-60 cursor-not-allowed"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-secondary">
                                        <CreditCard className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg">Online Payment</h3>
                                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                Coming Soon
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Pay securely online using UPI, Credit/Debit Card, or Net Banking.
                                            This feature will be available soon!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <Separator className="my-6" />

                            {/* Important Notes */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                    Important Information
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                                    <li>Your spot will be reserved after confirmation</li>
                                    <li>Payment must be made at the venue before the event starts</li>
                                    <li>Bring valid ID for verification</li>
                                    <li>Refunds are subject to event cancellation policy</li>
                                </ul>
                            </div>

                            {/* Confirm Button */}
                            <Button
                                onClick={handleConfirmPayment}
                                disabled={processing || selectedMethod !== 'cash'}
                                className="w-full h-12 text-base"
                                size="lg"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Join Event
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By confirming, you agree to pay ₹{event.registrationFee} at the event venue
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EventPayment;
