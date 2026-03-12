"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  UserPlus,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import TrendingCard from "@/components/home/TrendingCard";
import SuggestionsCard from "@/components/home/SuggestionsCard";
import { useTeam } from "@/context/TeamContext";
import {
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  getMutualConnections,
  type Connection as ApiConnection,
} from "@/lib/connections";

type TabType = "connections" | "invitations" | "suggestions";
const VALID_TABS: TabType[] = ["connections", "invitations", "suggestions"];

// Mock data for suggestions
interface Suggestion {
  id: string;
  name: string;
  location: string;
  mutualConnections: number;
  logo?: string;
  logoColor?: string;
}

const mockSuggestions: Suggestion[] = [
 
  {
    id: "1",
    name: "JW Marriott",
    location: "Kochi, Kerala, India",
    mutualConnections: 13,
    logoColor: "#8b4513",
  },
  {
    id: "2",
    name: "The Leela Palace",
    location: "Kochi, Kerala, India",
    mutualConnections: 2,
    logoColor: "#1a1a2e",
  },
  {
    id: "3",
    name: "The Oberoi",
    location: "Kochi, Kerala, India",
    mutualConnections: 2,
    logoColor: "#daa520",
  },
  {
    id: "4",
    name: "Golden Palms Resort",
    location: "Bangalore, Karnataka, India",
    mutualConnections: 5,
    logoColor: "#2e8b57",
  },
  {
    id: "5",
    name: "ITC Grand Chola",
    location: "Chennai, Tamil Nadu, India",
    mutualConnections: 8,
    logoColor: "#4a0e4e",
  },
];

function NetworkPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL or default to "connections"
  const getInitialTab = (): TabType => {
    const tabParam = searchParams.get("tab");
    if (tabParam && VALID_TABS.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return "connections";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently_added");
  
  // Connections state
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  
  // Invitations state
  const [invitations, setInvitations] = useState<ApiConnection[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const { activeWorkspace } = useTeam();
  const userProfileId = activeWorkspace?.data?.id;

  const tabs: { id: TabType; label: string }[] = [
    { id: "connections", label: "Connections" },
    { id: "invitations", label: "Invitations" },
    { id: "suggestions", label: "Suggestions" },
  ];

  // Filter connections based on search query
  const filteredConnections = connections.filter((conn) => {
    const name = conn.following?.full_name || conn.following?.company_name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle tab change and update URL
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/network?tab=${tab}`, { scroll: false });
  };

  // Sync tab state with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && VALID_TABS.includes(tabParam as TabType)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Fetch connections when tab becomes active
  useEffect(() => {
    if (activeTab === "connections" && userProfileId) {
      fetchConnections();
    }
  }, [activeTab, userProfileId]);

  // Fetch invitations when tab becomes active
  useEffect(() => {
    if (activeTab === "invitations" && userProfileId) {
      fetchInvitations();
    }
  }, [activeTab, userProfileId]);

  const fetchConnections = async () => {
    if (!userProfileId) return;
    
    setConnectionsLoading(true);
    setConnectionsError(null);
    
    try {
      const data = await getMutualConnections(userProfileId);
      setConnections(data);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setConnectionsError("Failed to load connections");
    } finally {
      setConnectionsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!userProfileId) return;
    
    setInvitationsLoading(true);
    setInvitationsError(null);
    
    try {
      const data = await getPendingInvitations(userProfileId);
      setInvitations(data);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      setInvitationsError("Failed to load invitations");
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleAcceptInvitation = async (connectionDocumentId: string) => {
    await acceptInvitation(connectionDocumentId);
    // Remove from list after accepting
    setInvitations((prev) => 
      prev.filter((inv) => inv.documentId !== connectionDocumentId)
    );
  };

  const handleRejectInvitation = async (connectionDocumentId: string) => {
    await rejectInvitation(connectionDocumentId);
    // Remove from list after ignoring
    setInvitations((prev) => 
      prev.filter((inv) => inv.documentId !== connectionDocumentId)
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f2f8] pt-[72px]">
      <main className="mx-auto px-4 md:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-12 gap-6 max-w-[1350px] mx-auto">
          {/* Left Sidebar Spacer - visible from lg and up */}
          {/* <div className="hidden lg:block lg:col-span-3" /> */}

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-6 py-4 text-[16px] font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? "text-[#6B3FA0]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-5 right-5 h-[2px] bg-[#6B3FA0] mb-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
              {/* Connections Tab Content */}
              {activeTab === "connections" && (
                <>
                  {/* Search and Sort Bar */}
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-semibold text-[#000000]">
                        {connections.length} connection{connections.length !== 1 ? 's' : ''}
                      </span>
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search by name"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0] w-[200px] sm:w-[240px] md:w-[280px] lg:w-[330px] xl:w-[370px]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sort by:</span>
                      <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#6B3FA0]">
                        Recently added
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {connectionsLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 size={32} className="text-[#6B3FA0] animate-spin" />
                      <p className="mt-3 text-sm text-gray-500">Loading connections...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {!connectionsLoading && connectionsError && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <p className="text-sm text-red-500">{connectionsError}</p>
                      <button 
                        onClick={fetchConnections}
                        className="mt-3 text-sm text-[#6B3FA0] hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Empty State */}
                  {!connectionsLoading && !connectionsError && connections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 rounded-full bg-[#f6f2f8] flex items-center justify-center mb-4">
                        <UserPlus size={28} className="text-[#6B3FA0]" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                        No connections yet
                      </h4>
                      <p className="text-sm text-gray-500 text-center max-w-xs">
                        Start connecting with other businesses to grow your network
                      </p>
                    </div>
                  )}

                  {/* Connections List */}
                  {!connectionsLoading && !connectionsError && filteredConnections.length > 0 && (
                    <div className="divide-y divide-gray-50">
                      {filteredConnections.map((connection) => (
                        <ConnectionCard key={connection.id} connection={connection} />
                      ))}
                    </div>
                  )}

                  {/* No Search Results */}
                  {!connectionsLoading && !connectionsError && connections.length > 0 && filteredConnections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <p className="text-sm text-gray-500">No connections found matching "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}

              {/* Invitations Tab Content */}
              {activeTab === "invitations" && (
                <>
                  {/* Header Bar */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <span className="text-[14px] font-semibold text-[#000000]">
                      Invitations ({invitations.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sort by:</span>
                      <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#6B3FA0]">
                        Newest
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {invitationsLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 size={32} className="text-[#6B3FA0] animate-spin" />
                      <p className="mt-3 text-sm text-gray-500">Loading invitations...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {!invitationsLoading && invitationsError && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <p className="text-sm text-red-500">{invitationsError}</p>
                      <button 
                        onClick={fetchInvitations}
                        className="mt-3 text-sm text-[#6B3FA0] hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Empty State */}
                  {!invitationsLoading && !invitationsError && invitations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 rounded-full bg-[#f6f2f8] flex items-center justify-center mb-4">
                        <UserPlus size={28} className="text-[#6B3FA0]" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                        No pending invitations
                      </h4>
                      <p className="text-sm text-gray-500 text-center max-w-xs">
                        When someone sends you a connection request, it will appear here
                      </p>
                    </div>
                  )}

                  {/* Invitations List */}
                  {!invitationsLoading && !invitationsError && invitations.length > 0 && (
                    <div className="divide-y divide-gray-50">
                      {invitations.map((invitation) => (
                        <InvitationCard 
                          key={invitation.id} 
                          invitation={invitation}
                          onAccept={() => handleAcceptInvitation(invitation.documentId)}
                          onReject={() => handleRejectInvitation(invitation.documentId)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Suggestions Tab Content */}
              {activeTab === "suggestions" && (
                <>
                  {/* Header Bar */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <span className="text-[14px] font-semibold text-[#000000]">
                      Suggestions
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sort by:</span>
                      <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#6B3FA0]">
                        Newest
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div className="divide-y divide-gray-50">
                    {mockSuggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cards below main content - visible below lg (two columns) */}
            <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
              <TrendingCard />
              <SuggestionsCard />
            </div>
          </div>

          {/* Right Sidebar - visible from lg and up */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <TrendingCard />
            <SuggestionsCard />
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function NetworkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f6f2f8] pt-[72px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-[#6B3FA0] animate-spin" />
          <p className="text-sm text-gray-500">Loading network...</p>
        </div>
      </div>
    }>
      <NetworkPageContent />
    </Suspense>
  );
}

function ConnectionCard({ connection }: { connection: ApiConnection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Get the connected user's info from the 'following' relation
  const connectedUser = connection.following;
  const displayName = connectedUser?.full_name || connectedUser?.company_name || "Unknown User";
  
  // Build location string from available fields
  const locationParts = [connectedUser?.city, connectedUser?.state, connectedUser?.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not available";

  // Generate a consistent color based on the name
  const getAvatarColor = (name: string) => {
    const colors = ['#f5e6d3', '#e8d5f0', '#d5e8f0', '#f0e8d5', '#d5f0e8', '#f0d5e8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="w-14 h-14 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
          {connectedUser?.profileImageUrl ? (
            <Image
              src={connectedUser.profileImageUrl}
              alt={displayName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm"
              style={{ backgroundColor: getAvatarColor(displayName) }}
            >
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[15px] font-bold text-gray-900 hover:text-[#6B3FA0] cursor-pointer transition-colors">
            {displayName}
          </h4>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="text-[13px]">{location}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2 bg-[#6B3FA0] text-white text-sm font-semibold rounded-lg hover:bg-[#5a3590] transition-colors">
          <MessageSquare size={16} />
          Message
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  View Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Remove Connection
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50">
                  Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface InvitationCardProps {
  invitation: ApiConnection;
    onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

function InvitationCard({ invitation, onAccept, onReject }: InvitationCardProps) {
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  const follower = invitation.follower;
  const displayName = follower?.full_name || follower?.company_name || "Unknown User";
  
  // Build location string from available fields
  const locationParts = [follower?.city, follower?.state, follower?.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not available";

  // Generate a consistent color based on the name
  const getAvatarColor = (name: string) => {
    const colors = ['#f5e6d3', '#e8d5f0', '#d5e8f0', '#f0e8d5', '#d5f0e8', '#f0d5e8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      await onAccept();
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await onReject();
    } finally {
      setRejectLoading(false);
    }
  };

  const isProcessing = acceptLoading || rejectLoading;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
          {follower?.profileImageUrl ? (
            <Image
              src={follower.profileImageUrl}
              alt={displayName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm"
              style={{ backgroundColor: getAvatarColor(displayName) }}
            >
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[15px] font-bold text-gray-900">
            {displayName}
          </h4>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="text-[13px]">{location}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleReject}
          disabled={isProcessing}
          className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {rejectLoading && <Loader2 size={14} className="animate-spin" />}
          {rejectLoading ? "Ignoring..." : "Ignore"}
        </button>
        <button 
          onClick={handleAccept}
          disabled={isProcessing}
          className="px-6 py-2 bg-[#6B3FA0] text-white text-sm font-semibold rounded-lg hover:bg-[#5a3590] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {acceptLoading && <Loader2 size={14} className="animate-spin" />}
          {acceptLoading ? "Accepting..." : "Accept"}
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate a consistent color based on the name
  const getAvatarColor = (name: string) => {
    const colors = ['#f5e6d3', '#e8d5f0', '#d5e8f0', '#f0e8d5', '#d5f0e8', '#f0d5e8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleFollow = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsFollowing(true);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/50 transition-colors gap-4">
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
          {suggestion.logo ? (
            <Image
              src={suggestion.logo}
              alt={suggestion.name}
              width={48}
              height={48}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: suggestion.logoColor || getAvatarColor(suggestion.name) }}
            >
              {suggestion.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="text-[18px] font-medium text-[#000000] truncate">
            {suggestion.name}
          </h4>
          <div className="flex items-center gap-1 text-[#000000]">
            <MapPin size={18} className="shrink-0" />
            <span className="text-[16px] font-medium  truncate">{suggestion.location}</span>
          </div>
        </div>
      </div>

      {/* Follow Button & Mutual Connections */}
      <div className="flex flex-col items-end gap-1 pl-[66px] sm:pl-0">
        {isFollowing ? (
          <button 
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled
          >
            <span className="text-green-500">✓</span>
            Following
          </button>
        ) : (
          <button 
            onClick={handleFollow}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-0.5 border border-[#E0E0E0] text-[#006DCB] text-[18px] font-medium rounded-lg cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span className="text-2xl leading-none mb-1">+</span>
            )}
            {isLoading ? "Following..." : "Follow"}
          </button>
        )}
        <span className="text-[14px] text-[#676767]">
          {suggestion.mutualConnections} Mutual Connection{suggestion.mutualConnections !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
