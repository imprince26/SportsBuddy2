import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Users,
    UserPlus,
    UserMinus,
    Shield,
    ShieldCheck,
    Crown,
    Search,
    Check,
    X,
    MoreVertical,
    Clock,
    MessageSquare,
    Loader2,
    AlertTriangle,
    Settings,
    Bell,
    Ban,
    Mail,
    Calendar,
    TrendingUp,
    Activity,
    Eye,
    Edit3,
    UserCheck,
    RefreshCw
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ManageCommunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        currentCommunity,
        fetchCommunity,
        getJoinRequests,
        handleJoinRequest,
        getCommunityMembers,
        updateMemberRole,
        removeMemberFromCommunity,
        loading
    } = useCommunity();

    const [activeTab, setActiveTab] = useState('overview');
    const [joinRequests, setJoinRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [creator, setCreator] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await fetchCommunity(id);
            setInitializing(false);
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (currentCommunity && !initializing) {
            loadJoinRequests();
            loadMembers();
        }
    }, [currentCommunity, initializing]);

    useEffect(() => {
        if (currentCommunity && !initializing) {
            loadMembers();
        }
    }, [roleFilter]);

    const loadJoinRequests = async () => {
        if (!currentCommunity?.isPrivate) return;
        setLoadingRequests(true);
        const result = await getJoinRequests(id);
        if (result?.success) {
            setJoinRequests(result.data || []);
        }
        setLoadingRequests(false);
    };

    const loadMembers = async () => {
        setLoadingMembers(true);
        const result = await getCommunityMembers(id, { role: roleFilter, search: searchQuery });
        if (result?.success) {
            setMembers(result.data || []);
            setCreator(result.creator);
        }
        setLoadingMembers(false);
    };

    const handleSearch = useCallback(() => {
        loadMembers();
    }, [searchQuery]);

    const handleProcessRequest = async (requestId, action) => {
        setProcessingId(requestId);
        const result = await handleJoinRequest(id, requestId, action);
        if (result?.success) {
            setJoinRequests(prev => prev.filter(r => r._id !== requestId));
            if (action === 'approve') {
                loadMembers();
            }
        }
        setProcessingId(null);
    };

    const handleRoleChange = async (memberId, newRole) => {
        setProcessingId(memberId);
        const result = await updateMemberRole(id, memberId, newRole);
        if (result?.success) {
            setMembers(prev => prev.map(m =>
                m.user._id === memberId ? { ...m, role: newRole } : m
            ));
        }
        setProcessingId(null);
    };

    const handleRemoveMember = async () => {
        if (!confirmDialog.data) return;
        setProcessingId(confirmDialog.data._id);
        const result = await removeMemberFromCommunity(id, confirmDialog.data._id);
        if (result?.success) {
            setMembers(prev => prev.filter(m => m.user._id !== confirmDialog.data._id));
        }
        setProcessingId(null);
        setConfirmDialog({ open: false, type: '', data: null });
    };

    const isCreator = currentCommunity?.creator?._id === user?.id;
    const isAdmin = currentCommunity?.admins?.some(a => a._id === user?.id || a === user?.id);
    const isModerator = currentCommunity?.moderators?.some(m => m._id === user?.id || m === user?.id);
    const canManage = isCreator || isAdmin || isModerator;

    const getRoleBadge = (role, isCreatorUser) => {
        if (isCreatorUser) {
            return (
                <Badge className="bg-gradient-to-r from-primary to-blue-700 text-white border-0 shadow-lg shadow-primary/20">
                    <Crown className="w-3 h-3 mr-1" />
                    Creator
                </Badge>
            );
        }
        switch (role) {
            case 'admin':
                return (
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                );
            case 'moderator':
                return (
                    <Badge className="bg-gradient-to-r from-primary/80 to-blue-500 text-white border-0 shadow-lg shadow-primary/20">
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Member
                    </Badge>
                );
        }
    };

    const filteredMembers = members.filter(m => {
        if (!searchQuery) return true;
        const name = m.user?.name?.toLowerCase() || '';
        const username = m.user?.username?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || username.includes(query);
    });

    if (initializing || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <div className="border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-12 w-full mb-6 rounded-xl" />
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full mb-3 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!currentCommunity || !canManage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
                        <CardContent className="text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                            <p className="text-muted-foreground mb-6">
                                You don't have permission to manage this community.
                            </p>
                            <Button
                                onClick={() => navigate(`/community/${id}`)}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
                            >
                                Back to Community
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Members',
            value: currentCommunity.memberCount || 0,
            icon: Users,
            color: 'from-primary to-blue-600',
            bgColor: 'bg-primary/10'
        },
        {
            label: 'Admins',
            value: currentCommunity.admins?.length || 0,
            icon: ShieldCheck,
            color: 'from-primary to-blue-500',
            bgColor: 'bg-primary/10'
        },
        {
            label: 'Moderators',
            value: currentCommunity.moderators?.length || 0,
            icon: Shield,
            color: 'from-primary to-blue-400',
            bgColor: 'bg-primary/10'
        },
        {
            label: 'Pending Requests',
            value: joinRequests.length,
            icon: Clock,
            color: 'from-primary to-blue-700',
            bgColor: 'bg-primary/10',
            hidden: !currentCommunity.isPrivate
        }
    ].filter(s => !s.hidden);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="border-b border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/community/${id}`)}
                                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                {currentCommunity.image?.url ? (
                                    <img
                                        src={currentCommunity.image.url}
                                        alt={currentCommunity.name}
                                        className="w-12 h-12 rounded-xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Community Management
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {currentCommunity.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/community/${id}/edit`)}
                                className="hidden sm:flex gap-2 rounded-xl"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Community
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => { loadJoinRequests(); loadMembers(); }}
                                className="rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bgColor)}>
                                            <stat.icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                                {stat.value}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-border/50 p-1.5 rounded-2xl shadow-lg mb-6">
                        <TabsTrigger
                            value="overview"
                            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </TabsTrigger>
                        {currentCommunity.isPrivate && (
                            <TabsTrigger
                                value="requests"
                                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg relative"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Requests
                                {joinRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                        {joinRequests.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quick Actions */}
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>Manage your community settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30"
                                        onClick={() => navigate(`/community/${id}/edit`)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Edit3 className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Edit Community</p>
                                            <p className="text-xs text-muted-foreground">Update details & settings</p>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30"
                                        onClick={() => setActiveTab('members')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Manage Members</p>
                                            <p className="text-xs text-muted-foreground">Roles & permissions</p>
                                        </div>
                                    </Button>
                                    {currentCommunity.isPrivate && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/5 hover:border-primary/30"
                                            onClick={() => setActiveTab('requests')}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <UserPlus className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="text-left flex-1 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Join Requests</p>
                                                    <p className="text-xs text-muted-foreground">Review pending requests</p>
                                                </div>
                                                {joinRequests.length > 0 && (
                                                    <Badge className="bg-primary text-white">{joinRequests.length}</Badge>
                                                )}
                                            </div>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Community Info */}
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-primary" />
                                        Community Details
                                    </CardTitle>
                                    <CardDescription>Basic information about your community</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge className={currentCommunity.isPrivate ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"}>
                                            {currentCommunity.isPrivate ? 'Private' : 'Public'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Category</span>
                                        <Badge variant="secondary">{currentCommunity.category}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Created</span>
                                        <span className="text-sm">{format(new Date(currentCommunity.createdAt), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Allow Member Posts</span>
                                        <Badge className={currentCommunity.settings?.allowMemberPosts ? "bg-primary/10 text-primary" : "bg-gray-500/10 text-gray-600"}>
                                            {currentCommunity.settings?.allowMemberPosts ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-muted-foreground">Total Posts</span>
                                        <span className="font-medium">{currentCommunity.posts?.length || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Members */}
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl lg:col-span-2">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <UserCheck className="w-5 h-5 text-primary" />
                                                Recent Members
                                            </CardTitle>
                                            <CardDescription>Latest members who joined your community</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setActiveTab('members')}
                                            className="text-primary"
                                        >
                                            View All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {members.slice(0, 6).map((member) => {
                                            const memberUser = member.user;
                                            const isCreatorUser = memberUser?._id === creator?._id;
                                            return (
                                                <div key={memberUser?._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                    <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-800 shadow">
                                                        <AvatarImage src={memberUser?.avatar?.url} />
                                                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                                            {memberUser?.name?.charAt(0) || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{memberUser?.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            {getRoleBadge(member.role, isCreatorUser)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="mt-0">
                        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                            <CardHeader className="border-b border-border/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg">Community Members</CardTitle>
                                        <CardDescription>Manage members, assign roles, and remove users</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="w-fit">{members.length} members</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search members..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9 rounded-xl border-border/50"
                                        />
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-full sm:w-44 rounded-xl border-border/50">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="admin">Admins</SelectItem>
                                            <SelectItem value="moderator">Moderators</SelectItem>
                                            <SelectItem value="member">Members</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Members List */}
                                <div className="space-y-2">
                                    {loadingMembers ? (
                                        [...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <Skeleton className="w-12 h-12 rounded-full" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-32 mb-2" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        ))
                                    ) : filteredMembers.length === 0 ? (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            <p className="text-lg font-medium mb-1">No members found</p>
                                            <p className="text-sm">Try adjusting your search or filter</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {filteredMembers.map((member, index) => {
                                                const memberUser = member.user;
                                                const isCreatorUser = memberUser?._id === creator?._id;
                                                const canModify = !isCreatorUser && (isCreator || (isAdmin && member.role !== 'admin'));

                                                return (
                                                    <motion.div
                                                        key={memberUser?._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                                    >
                                                        <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-gray-700 shadow-lg">
                                                            <AvatarImage src={memberUser?.avatar?.url} />
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                                                                {memberUser?.name?.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold truncate">{memberUser?.name}</p>
                                                                {getRoleBadge(member.role, isCreatorUser)}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                <span>@{memberUser?.username}</span>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="hidden sm:flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {canModify && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        disabled={processingId === memberUser?._id}
                                                                        className="rounded-xl"
                                                                    >
                                                                        {processingId === memberUser?._id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <MoreVertical className="w-4 h-4" />
                                                                        )}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                                                                    {isCreator && member.role !== 'admin' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRoleChange(memberUser?._id, 'admin')}
                                                                            className="gap-2"
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                                                            Promote to Admin
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {(isCreator || isAdmin) && member.role !== 'moderator' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRoleChange(memberUser?._id, 'moderator')}
                                                                            className="gap-2"
                                                                        >
                                                                            <Shield className="w-4 h-4 text-primary" />
                                                                            Make Moderator
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {member.role !== 'member' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRoleChange(memberUser?._id, 'member')}
                                                                            className="gap-2"
                                                                        >
                                                                            <Users className="w-4 h-4" />
                                                                            Demote to Member
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => setConfirmDialog({
                                                                            open: true,
                                                                            type: 'remove',
                                                                            data: memberUser
                                                                        })}
                                                                        className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                                    >
                                                                        <UserMinus className="w-4 h-4" />
                                                                        Remove Member
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Join Requests Tab */}
                    {currentCommunity.isPrivate && (
                        <TabsContent value="requests" className="mt-0">
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                                <CardHeader className="border-b border-border/50">
                                    <CardTitle className="text-lg">Pending Join Requests</CardTitle>
                                    <CardDescription>Review and approve or reject membership requests</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {loadingRequests ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-3">
                                                <Skeleton className="w-14 h-14 rounded-full" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-32 mb-2" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        ))
                                    ) : joinRequests.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                                                <UserPlus className="w-10 h-10 opacity-30" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                                            <p className="text-sm max-w-sm mx-auto">All caught up! There are no join requests waiting for your review.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {joinRequests.map((request, index) => (
                                                    <motion.div
                                                        key={request._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -100 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border border-border/50"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                            <Avatar className="w-14 h-14 ring-2 ring-white dark:ring-gray-700 shadow-lg">
                                                                <AvatarImage src={request.user?.avatar?.url} />
                                                                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg">
                                                                    {request.user?.name?.charAt(0) || '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-semibold text-lg">{request.user?.name}</p>
                                                                    <span className="text-sm text-muted-foreground">@{request.user?.username}</span>
                                                                </div>
                                                                {request.message && (
                                                                    <div className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-white dark:bg-gray-900 border border-border/50">
                                                                        <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                                        <p className="text-sm text-muted-foreground">{request.message}</p>
                                                                    </div>
                                                                )}
                                                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2 flex-shrink-0">
                                                                <Button
                                                                    onClick={() => handleProcessRequest(request._id, 'approve')}
                                                                    disabled={processingId === request._id}
                                                                    className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg shadow-primary/20 rounded-xl"
                                                                >
                                                                    {processingId === request._id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Check className="w-4 h-4 mr-1" />
                                                                            Approve
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleProcessRequest(request._id, 'reject')}
                                                                    disabled={processingId === request._id}
                                                                    className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl"
                                                                >
                                                                    <X className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Confirm Remove Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: '', data: null })}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <UserMinus className="w-6 h-6 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-center">Remove Member</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Are you sure you want to remove <strong>{confirmDialog.data?.name}</strong> from this community?
                            They will need to request to join again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3">
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-red-500 hover:bg-red-600 rounded-xl"
                        >
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageCommunity;
