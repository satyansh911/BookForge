import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { User, Mail, Shield, ShieldCheck, Globe, Briefcase, Info, Camera } from "lucide-react"

import InputField from "../components/ui/InputField"
import Button from "../components/ui/Button"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"

const ProfilePage = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "",
    pronouns: "",
    bio: "",
    occupation: "",
    location: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || "", 
        email: user.email || "",
        pronouns: user.pronouns || "",
        bio: user.bio || "",
        occupation: user.occupation || "",
        location: user.location || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: formData.name,
        pronouns: formData.pronouns,
        bio: formData.bio,
        occupation: formData.occupation,
        location: formData.location,
        avatar: formData.avatar
      });
      updateUser(response.data);
      toast.success("Identity updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[10px] tracking-[0.5em] text-muted uppercase animate-pulse">Retrieving Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <header className="flex flex-col gap-6 pb-12 border-b border-border">
        <p className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold">Account / Settings</p>
        <h1 className="text-6xl font-serif font-black tracking-tighter uppercase leading-none">USER PROFILE</h1>
        <p className="text-secondary max-w-lg leading-relaxed">
          Manage your personal identity, credentials, and account preferences within the BookForge ecosystem.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-16">
        {/* Left Column: Context */}
        <div className="space-y-8">
          {/* Profile Photo Section */}
          <div className="p-8 bg-surface border border-border space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold">Registry Visual</p>
              <div className="relative w-32 h-32 mx-auto ring-1 ring-border p-1 group">
                <div className="w-full h-full bg-border/20 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-muted/30" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>
            
            <InputField
              label="Avatar URL"
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="HTTPS://..."
              className="text-[10px]"
            />

            <div className="pt-4 border-t border-border/10">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-2 text-accent">Security Level</h3>
              <p className="text-[11px] text-muted leading-relaxed uppercase">Your account is protected by industry-standard encryption.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 space-y-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-10">
              <InputField
                label="Full Display Name"
                type="text"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                placeholder="YOUR NAME"
                required
              />
              <div className="grid md:grid-cols-2 gap-10">
                <InputField
                  label="Pronouns"
                  type="text"
                  name="pronouns"
                  icon={Info}
                  value={formData.pronouns}
                  onChange={handleChange}
                  placeholder="THEY / THEM"
                />
                <InputField
                  label="Primary Occupation"
                  type="text"
                  name="occupation"
                  icon={Briefcase}
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="SYNTHESIZER"
                />
              </div>

              <InputField
                label="Base Location"
                type="text"
                name="location"
                icon={Globe}
                value={formData.location}
                onChange={handleChange}
                placeholder="NEO-TOKYO, JP"
              />

              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold block">Bibliographical Note</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="SYNTHESIZING KNOWLEDGE SINCE..."
                  className="w-full h-32 bg-transparent border-b border-border py-4 focus:border-accent outline-none transition-colors font-serif italic text-lg resize-none"
                />
              </div>

              <div className="opacity-50">
                <InputField
                  label="Registered Email (Immutable)"
                  type="email"
                  name="email"
                  icon={Mail}
                  value={formData.email}
                  disabled
                />
              </div>
            </div>

            <div className="pt-8 border-t border-border/50">
              <Button type="submit" isLoading={isLoading} className="px-12 py-4">
                SAVE CHANGES
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage