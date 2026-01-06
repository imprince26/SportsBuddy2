import {
    Search,
    X,
    SlidersHorizontal,
    MapPin
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SPORTS_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'Football', label: 'Football' },
    { value: 'Basketball', label: 'Basketball' },
    { value: 'Tennis', label: 'Tennis' },
    { value: 'Running', label: 'Running' },
    { value: 'Cycling', label: 'Cycling' },
    { value: 'Swimming', label: 'Swimming' },
    { value: 'Volleyball', label: 'Volleyball' },
    { value: 'Cricket', label: 'Cricket' },
    { value: 'General', label: 'General' },
    { value: 'Other', label: 'Other' }
]

const SORT_OPTIONS = [
    { value: 'members:desc', label: 'Most Members' },
    { value: 'members:asc', label: 'Least Members' },
    { value: 'createdAt:desc', label: 'Newest First' },
    { value: 'createdAt:asc', label: 'Oldest First' },
    { value: 'activity:desc', label: 'Most Active' },
    { value: 'name:asc', label: 'Name (A-Z)' },
    { value: 'name:desc', label: 'Name (Z-A)' }
]

const PRIVACY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'false', label: 'Public Only' },
    { value: 'true', label: 'Private Only' }
]

const CommunityFilters = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    location,
    setLocation,
    privacy,
    setPrivacy,
    onClearFilters,
    isFiltersActive
}) => {
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search communities by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card border-border rounded-xl text-base focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                {/* Category Select */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px] bg-card border-border rounded-lg h-10">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {SPORTS_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Location Input */}
                <div className="relative w-[180px]">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-9 h-10 bg-card border-border rounded-lg"
                    />
                </div>

                {/* Privacy Select */}
                <Select value={privacy} onValueChange={setPrivacy}>
                    <SelectTrigger className="w-[130px] bg-card border-border rounded-lg h-10">
                        <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRIVACY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] bg-card border-border rounded-lg h-10">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Clear Filters */}
                {isFiltersActive && (
                    <Button
                        onClick={onClearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {isFiltersActive && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1.5">
                            Search: {searchQuery}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-foreground"
                                onClick={() => setSearchQuery('')}
                            />
                        </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="gap-1.5">
                            {SPORTS_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-foreground"
                                onClick={() => setSelectedCategory('all')}
                            />
                        </Badge>
                    )}
                    {location && (
                        <Badge variant="secondary" className="gap-1.5">
                            Location: {location}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-foreground"
                                onClick={() => setLocation('')}
                            />
                        </Badge>
                    )}
                    {privacy !== 'all' && (
                        <Badge variant="secondary" className="gap-1.5">
                            {privacy === 'true' ? 'Private' : 'Public'}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-foreground"
                                onClick={() => setPrivacy('all')}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}

export default CommunityFilters
