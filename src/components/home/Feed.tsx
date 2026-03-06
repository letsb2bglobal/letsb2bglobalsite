"use client";

import React from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { ChevronDown } from 'lucide-react';
import { Post } from '@/lib/posts';

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

// Extend Post interface to handle dynamic fields from TradeWall feed items
interface TradeWallPost extends Post {
  destinationCity?: string;
  start_date?: string;
  end_date?: string;
  guests?: string;
}

interface FeedProps {
  posts: Post[];
  isLoading: boolean;
}

const Feed: React.FC<FeedProps> = ({ posts, isLoading }) => {
  return (
    <div className="flex flex-col gap-5">
      <CreatePost />
      
      {/* Filter Row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
           <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Sort By</span>
           <button className="flex items-center gap-1 text-gray-800 text-xs font-bold hover:text-[#6B3FA0] transition-colors">
             Recent <ChevronDown size={14} />
           </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading && posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-24 text-center shadow-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-50 border-t-[#6B3FA0] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#6B3FA0] rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[#6B3FA0] font-black text-sm uppercase tracking-[0.2em] animate-pulse">Syncing Feed...</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">Fetching latest B2B opportunities</p>
              </div>
            </div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const twPost = post as TradeWallPost;
            const details = post.enquiry_details?.[0] || {};
            
            return (
              <PostCard 
                key={post.id} 
                author={{
                  name: post.user_profile?.company_name || post.title || "B2B Partner",
                  avatar: "",
                  isFollowing: false
                }}
                time={formatTime(post.createdAt)}
                title={post.title || "B2B Opportunity"}
                description={post.description || details.description || (typeof post.content === 'string' ? post.content : "")}
                type={post.type}
                details={details}
                location={post.destination || details.destination || details.location || details.city || twPost.destinationCity || ""}
                date={
                  (details.checkIn && details.checkOut) 
                    ? `${details.checkIn} - ${details.checkOut}` 
                    : details.dateTime ? new Date(details.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : details.timeline ? `Timeline: ${details.timeline.charAt(0).toUpperCase() + details.timeline.slice(1)}`
                    : (twPost.start_date && twPost.end_date ? `${twPost.start_date} - ${twPost.end_date}` : "")
                }
                guests={(() => {
                  if (details.adults || details.children) {
                    const parts = [];
                    if (details.adults) parts.push(`${details.adults} Adults`);
                    if (details.children && details.children > 0) parts.push(`${details.children} Kids`);
                    return parts.join(', ');
                  }
                  if (details.passengers) return `${details.passengers} Passengers`;
                  if (details.patients) {
                    const parts = [`${details.patients} Patient(s)`];
                    if (details.attendants) parts.push(`${details.attendants} Attendant(s)`);
                    return parts.join(', ');
                  }
                  return twPost.guests || "";
                })()}
                tags={post.tags || []}
                imageUrl={post.media_items?.[0]?.url || post.media?.[0]?.url || post.custom_attachments?.[0]?.url}
                budget={post.budget}
                mediaItems={post.media_items}
                authorProfileId={post.user_profile?.documentId}
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-[#6B3FA0] rounded-full animate-spin"></div>
                <p className="text-[#6B3FA0] font-black text-xs uppercase tracking-widest animate-pulse">Checking for new posts...</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-[#f6f2f8] rounded-full flex items-center justify-center mb-6 text-[#6B3FA0]">
                   <ChevronDown size={40} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">No posts available</h3>
                <p className="text-gray-400 text-sm font-bold italic">Be the first to share a B2B opportunity!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
