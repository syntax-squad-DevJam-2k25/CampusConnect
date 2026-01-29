import { useEffect, useState } from "react";
import { DashboardLayout } from "@/Components/DashboardLayout";
import { EditProfileDialog } from "@/Components/EditProfileDialog";
import { ProfileInfo } from "@/Components/ProfileInfo";

export default function Profile() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [leetcode, setLeetcode] = useState(null);
  const [codeforces, setCodeforces] = useState(null);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= FETCH CODING DATA ================= */
  useEffect(() => {
    fetch("http://localhost:5001/api/users/leetcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => setLeetcode(res.data))
      .catch(err => console.error("LeetCode fetch error", err));

    fetch("http://localhost:5001/api/codeforces/getCodeforcesData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => setCodeforces(res.data))
      .catch(err => console.error("Codeforces fetch error", err));
  }, []);

  if (!profile) {
    return (
      <DashboardLayout title="👤 My Profile" subtitle="Manage your profile and coding stats">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Header content with Edit button
  const headerContent = (
    <div className="flex items-center gap-3 flex-1 justify-end">
      <button
        onClick={() => setEditMode(true)}
        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 border border-transparent hover:border-violet-400 shadow-lg shadow-violet-500/20"
      >
        Edit Profile
      </button>
    </div>
  );

  return (
    <DashboardLayout
      headerContent={headerContent}
    >
      <div className="space-y-8">

        {/* VIEW COMPONENT */}
        <ProfileInfo
          profile={profile}
          leetcode={leetcode}
          codeforces={codeforces}
        />

        {/* EDIT COMPONENT (DIALOG) */}
        <EditProfileDialog
          open={editMode}
          onOpenChange={setEditMode}
          profile={profile}
          onProfileUpdate={fetchProfile}
        />
      </div>
    </DashboardLayout>
  );
}
