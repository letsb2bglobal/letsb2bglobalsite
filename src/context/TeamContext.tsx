"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMyContexts, UserProfile } from "@/lib/profile";
import { getMyPermissions, MyPermissions } from "@/lib/team";
import { useAuth } from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export interface Workspace {
  label: string;
  type: 'OWNER' | 'MEMBER';
  role: string;
  data: UserProfile;
}

interface TeamContextType {
  permissions: MyPermissions | null;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  // New Workspace features
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const user = useAuth();
  const router = useRouter();
  const [permissions, setPermissions] = useState<MyPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Workspace states
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const fetchPermissions = async () => {
    if (!user) {
      setPermissions(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Workspaces (GET /api/user-profiles/me)
      const contextData = await getMyContexts();
      
      if (!contextData.exists) {
        // 4. THE FLOW FOR NEW USERS - Redirect to complete profile
        router.push("/complete-profile");
        return;
      }

      const availableWorkspaces: Workspace[] = [];
      
      if (contextData.ownProfile) {
        availableWorkspaces.push({
          label: contextData.ownProfile.company_name,
          type: 'OWNER',
          role: 'Owner',
          data: contextData.ownProfile
        });
      }

      if (contextData.memberships && contextData.memberships.length > 0) {
        contextData.memberships.forEach(m => {
          availableWorkspaces.push({
            label: m.company_profile.company_name,
            type: 'MEMBER',
            role: m.role,
            data: m.company_profile
          });
        });
      }

      setWorkspaces(availableWorkspaces);

      // Default logic: ownProfile first, else first membership
      if (!activeWorkspace || !availableWorkspaces.find(w => w.data.documentId === activeWorkspace.data.documentId)) {
         setActiveWorkspace(availableWorkspaces[0] || null);
      }

      // 2. Fetch Permissions for backward compatibility (Optional, but keeping for now)
      // Note: In a full V3 flow, permissions would be derived from activeWorkspace.role
      const data = await getMyPermissions();
      setPermissions(data);

    } catch (error) {
      console.error("Error fetching workspaces/permissions:", error);
      setPermissions({ role: "Viewer", permissions: [], isOwner: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const switchWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    // Update permissions based on the new workspace role
    // For V3 compatibility, we might want to manually set permissions here 
    // or trigger an API call if permissions are still backend-managed per workspace
  };

  const refreshPermissions = async () => {
    setIsLoading(true);
    await fetchPermissions();
  };

  const refreshWorkspaces = async () => {
    setIsLoading(true);
    await fetchPermissions();
  };

  const hasPermission = (permission: string) => {
    // Priority 1: Check active workspace role (V3 logic)
    if (activeWorkspace) {
      if (activeWorkspace.type === 'OWNER' || activeWorkspace.role === 'Admin') return true;
      // You can add more role-based mappings here
    }

    // Priority 2: Legacy permissions check
    if (!permissions) return false;
    if (permissions.isOwner) return true;
    return permissions.permissions.includes(permission);
  };

  return (
    <TeamContext.Provider value={{ 
      permissions, 
      isLoading, 
      refreshPermissions, 
      hasPermission,
      activeWorkspace,
      workspaces,
      switchWorkspace,
      refreshWorkspaces
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
