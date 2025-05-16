
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft, Mail, UserPlus, Shield, Trash, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  getTenant,
  getTeamMembers, 
  updatePremiumStatus, 
  updateUserRole,
  removeUserFromOrg,
  createInvitation,
  updateOrgName,
  updateUserProfile
} from "@/lib/supabase/queries";

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type InviteForm = {
  email: string;
  role: string;
};

type UserProfileForm = {
  name: string;
  email: string;
};

export default function OrgSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, hasPremium } = useAuth();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [orgName, setOrgName] = useState("");
  const [editingOrgName, setEditingOrgName] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [savingOrgName, setSavingOrgName] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const inviteForm = useForm<InviteForm>({
    defaultValues: {
      email: "",
      role: "user"
    }
  });

  const profileForm = useForm<UserProfileForm>({
    defaultValues: {
      name: user?.email?.split('@')[0] || "",
      email: user?.email || ""
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.tenant_id) {
        setLoading(true);
        
        // Fetch team members
        const members = await getTeamMembers(user.tenant_id);
        setTeamMembers(members);
        
        // Fetch organization details
        const tenant = await getTenant(user.tenant_id);
        if (tenant) {
          setOrgName(tenant.name || "Organization");
          setNewOrgName(tenant.name || "Organization");
          setIsPremium(tenant.has_premium || false);
        }
        
        // Set user profile data in form
        const currentUser = members.find(m => m.id === user.id);
        if (currentUser) {
          profileForm.reset({
            name: currentUser.name,
            email: currentUser.email
          });
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.tenant_id, user?.id, profileForm]);

  const handleTogglePremium = async () => {
    if (!user?.tenant_id || user?.role !== 'owner') return;
    
    const newStatus = !isPremium;
    const success = await updatePremiumStatus(user.tenant_id, newStatus);
    
    if (success) {
      setIsPremium(newStatus);
      toast({
        title: "Premium status updated",
        description: newStatus ? "Premium features are now enabled." : "Premium features are now disabled.",
      });
    } else {
      toast({
        title: "Error updating premium status",
        description: "There was an error updating the premium status.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (user?.role !== 'owner') return;
    
    const success = await updateUserRole(memberId, newRole);
    
    if (success) {
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      
      toast({
        title: "Role updated",
        description: "Team member role has been updated.",
      });
    } else {
      toast({
        title: "Error updating role",
        description: "There was an error updating the team member's role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (user?.role !== 'owner' || user?.id === memberId) return;
    
    const success = await removeUserFromOrg(memberId);
    
    if (success) {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Member removed",
        description: "Team member has been removed from the organization.",
      });
    } else {
      toast({
        title: "Error removing member",
        description: "There was an error removing the team member.",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async (data: InviteForm) => {
    if (!user?.tenant_id || !user?.id) return;
    
    const { success } = await createInvitation(
      user.tenant_id,
      data.email,
      data.role,
      user.id
    );
    
    if (success) {
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}.`,
      });
      setInviteDialogOpen(false);
      inviteForm.reset();
    } else {
      toast({
        title: "Error sending invitation",
        description: "There was an error sending the invitation.",
        variant: "destructive",
      });
    }
  };

  const handleSaveOrgName = async () => {
    if (!user?.tenant_id || user?.role !== 'owner' || !newOrgName.trim()) return;
    
    setSavingOrgName(true);
    const success = await updateOrgName(user.tenant_id, newOrgName);
    
    if (success) {
      setOrgName(newOrgName);
      setEditingOrgName(false);
      toast({
        title: "Organization name updated",
        description: "The organization name has been updated successfully.",
      });
    } else {
      toast({
        title: "Error updating organization name",
        description: "There was an error updating the organization name.",
        variant: "destructive",
      });
    }
    setSavingOrgName(false);
  };

  const handleSaveProfile = async (data: UserProfileForm) => {
    if (!user?.id) return;
    
    setSavingProfile(true);
    const success = await updateUserProfile(user.id, data);
    
    if (success) {
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === user.id 
            ? { ...member, name: data.name, email: data.email } 
            : member
        )
      );
      
      setEditProfileOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } else {
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
    setSavingProfile(false);
  };

  const isOwner = user?.role === 'owner';

  return (
    <div className="container max-w-4xl py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Organization Settings</h1>
        </div>
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Profile</DialogTitle>
              <DialogDescription>
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Manage your organization details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                {editingOrgName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="org-name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      onClick={handleSaveOrgName} 
                      size="sm"
                      disabled={savingOrgName || !newOrgName.trim()}
                    >
                      {savingOrgName ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingOrgName(false);
                        setNewOrgName(orgName);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="font-medium text-lg" id="org-name">{orgName}</div>
                    {isOwner && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingOrgName(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {isOwner && (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-medium">Premium Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable premium features for your organization
                    </p>
                  </div>
                  <Switch 
                    checked={isPremium} 
                    onCheckedChange={handleTogglePremium}
                    disabled={!isOwner}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your organization's team members
                </CardDescription>
              </div>
              
              {isOwner && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...inviteForm}>
                      <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
                        <FormField
                          control={inviteForm.control}
                          name="email"
                          rules={{ 
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="email@example.com" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={inviteForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Send Invite</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No team members found
                </p>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <p className="font-medium">{member.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.name || member.email.split('@')[0]}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {isOwner && member.id !== user?.id ? (
                          <>
                            <Select 
                              defaultValue={member.role} 
                              onValueChange={(value) => handleRoleChange(member.id, value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">{member.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
