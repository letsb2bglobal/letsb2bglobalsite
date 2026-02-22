"use client";

import React, { useState, useEffect } from "react";
import { getTeamMembers, addDirectMember, removeTeamMember, resendInvitation, TeamMember } from "@/lib/team";
import { useToast } from "./Toast";
import { useTeam } from "@/context/TeamContext";

interface TeamManagementProps {
  companyProfileDocumentId: string;
  initOpenInvite?: boolean;
}

export default function TeamManagement({ companyProfileDocumentId, initOpenInvite }: TeamManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "Sales Executive",
    full_name: "",
    designation: "",
  });
  const [isInviting, setIsInviting] = useState(false);
  const { showToast } = useToast();
  const { hasPermission } = useTeam();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers(companyProfileDocumentId);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching team:", error);
      showToast(error instanceof Error ? error.message : "Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyProfileDocumentId) {
      fetchMembers();
    }
    if (initOpenInvite) {
      setIsInviteModalOpen(true);
    }
  }, [companyProfileDocumentId, initOpenInvite]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const response = await addDirectMember({
        ...inviteData,
        company_profile_id: companyProfileDocumentId,
      });
      showToast(response.message || "Member added successfully!", "success");
      setIsInviteModalOpen(false);
      setInviteData({ email: "", role: "Sales Executive", full_name: "", designation: "" });
      fetchMembers();
    } catch (error: any) {
      showToast(error.message || "Failed to add team member", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (documentId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeTeamMember(documentId);
      showToast("Member removed successfully", "success");
      fetchMembers();
    } catch (error: any) {
      showToast(error.message || "Failed to remove member", "error");
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      showToast("Invitation resent successfully", "success");
    } catch (error) {
      showToast("Failed to resend invitation", "error");
    }
  };

  const canInvite = hasPermission("invite_members");
  const canRemove = hasPermission("remove_members");

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500">Manage your company's team members and their roles.</p>
        </div>
        {canInvite && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Team Member
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading team...</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No team members found.</td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {member.email.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{member.full_name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      member.status === "Active" ? "bg-green-50 text-green-600 border-green-100" :
                      member.status === "Invited" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    {member.status === "Invited" && canInvite && (
                      <button 
                        onClick={() => handleResend(member.documentId)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Resend
                      </button>
                    )}
                    {canRemove && member.role !== "Owner" && (
                      <button 
                        onClick={() => handleRemove(member.documentId)}
                        className="text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Team Member</h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData({...inviteData, full_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Role</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={inviteData.role}
                    onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Trade Manager">Trade Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Designation (Optional)</label>
                  <input
                    type="text"
                    placeholder="Sr. Manager"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={inviteData.designation}
                    onChange={(e) => setInviteData({...inviteData, designation: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isInviting}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 mt-2"
              >
                {isInviting ? "ADDING..." : "ADD MEMBER DIRECTLY →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
