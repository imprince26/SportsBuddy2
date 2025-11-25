"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Building2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export function VenueSelector({
    venues,
    selectedVenue,
    onSelect,
}) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-3 px-4 bg-transparent"
                >
                    {selectedVenue ? (
                        <div className="flex items-center gap-3 text-left overflow-hidden">
                            {selectedVenue.images?.[0]?.url || selectedVenue.images?.[0] ? (
                                <img
                                    src={selectedVenue.images[0]?.url || selectedVenue.images[0]}
                                    alt={selectedVenue.name}
                                    className="w-8 h-8 rounded object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-medium truncate">{selectedVenue.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{selectedVenue.location?.city}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>Select a venue...</span>
                        </div>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search venues..." />
                    <CommandList className="max-h-none overflow-visible">
                        <ScrollArea className="h-72">
                            <CommandEmpty>No venue found.</CommandEmpty>
                            <CommandGroup>
                                {venues.map((venue) => (
                                    <CommandItem
                                        key={venue._id}
                                        value={venue.name}
                                        onSelect={() => {
                                            onSelect(venue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn("mr-2 h-4 w-4", selectedVenue?._id === venue._id ? "opacity-100" : "opacity-0")}
                                        />
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            {venue.images?.[0]?.url || venue.images?.[0] ? (
                                                <img
                                                    src={venue.images[0]?.url || venue.images[0]}
                                                    alt={venue.name}
                                                    className="w-8 h-8 rounded object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{venue.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {venue.location?.city}
                                                </div>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
