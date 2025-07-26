"use client"
import { DialogShell } from "./_shared/dialog-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatabaseService, type Member } from "@/lib/database";
import { useAuth } from "@/components/auth-provider";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: { id: string; family_name: string }[];
  onMemberAdded?: (member: Member) => void;
}

export function AddMemberModal({ isOpen, onClose, families, onMemberAdded }: AddMemberModalProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  // State for all fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [memberStatus, setMemberStatus] = useState<'active' | 'inactive' | 'pending'>('active');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyRelationshipId, setFamilyRelationshipId] = useState<string | null>(null);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [baptismDate, setBaptismDate] = useState("");
  const [membershipDate, setMembershipDate] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [department, setDepartment] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [notes, setNotes] = useState("");
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  // Hidden/advanced
  const [faceRecognitionData] = useState<any>(null); // Not shown in UI for now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for departments and existing members
  const [departments, setDepartments] = useState<{ id: string; name: string; type: string }[]>([]);
  const [existingMembers, setExistingMembers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load departments and existing members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load departments
      const deptResponse = await fetch('/api/departments');
      const deptData = await deptResponse.json();
      if (deptData.departments) {
        setDepartments(deptData.departments);
      }
      
      // Load existing members for family relationship
      const membersResponse = await fetch('/api/members');
      const membersData = await membersResponse.json();
      if (membersData.members) {
        setExistingMembers(membersData.members.map((m: any) => ({
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddCustomField = () => {
    if (customKey && customValue) {
      setCustomFields([...customFields, { key: customKey, value: customValue }]);
      setCustomKey("");
      setCustomValue("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalFamilyId = familyId;
      if (!finalFamilyId && newFamilyName) {
        const newFamily = await DatabaseService.createFamily({ family_name: newFamilyName });
        finalFamilyId = newFamily.id;
      }
      const member = await DatabaseService.addMember({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        date_of_birth: dateOfBirth,
        gender,
        address,
        join_date: joinDate,
        member_status: memberStatus,
        family_id: finalFamilyId,
        baptism_date: baptismDate,
        membership_date: membershipDate,
        profile_image: profileImage,
        marital_status: maritalStatus,
        occupation,
        department: department === "none" ? "" : department,
        emergency_contact: emergencyContact,
        notes,
        custom_fields: customFields,
        // face_recognition_data: isAdmin ? faceRecognitionData : undefined,
      });
      if (onMemberAdded) onMemberAdded(member);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogShell isOpen={isOpen} onClose={onClose} title="Add New Member">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input required placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input required placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <div>
            <label className="block mb-1 font-medium">Date of Birth</label>
            <Input type="date" placeholder="Date of Birth" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
          </div>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Address & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
          <div>
            <label className="block mb-1 font-medium">Join Date</label>
            <Input type="date" placeholder="Join Date" value={joinDate} onChange={e => setJoinDate(e.target.value)} />
          </div>
          <Select value={memberStatus} onValueChange={v => setMemberStatus(v as 'active' | 'inactive' | 'pending')}>
            <SelectTrigger><SelectValue placeholder="Member Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Family & Baptism Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Family</label>
            <Select value={familyId || ""} onValueChange={setFamilyId}>
              <SelectTrigger><SelectValue placeholder="Select Family" /></SelectTrigger>
              <SelectContent>
                {families.map(fam => (
                  <SelectItem key={fam.id} value={fam.id}>{fam.family_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Or add new family..." value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} className="mt-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Family Relationship</label>
            <Select value={familyRelationshipId || "none"} onValueChange={setFamilyRelationshipId}>
              <SelectTrigger><SelectValue placeholder="Select Family Member" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Relationship</SelectItem>
                {existingMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Baptism Date</label>
            <Input type="date" placeholder="Baptism Date" value={baptismDate} onChange={e => setBaptismDate(e.target.value)} />
          </div>
        </div>
        {/* Profile & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Profile Image URL" value={profileImage} onChange={e => setProfileImage(e.target.value)} />
          <Select value={maritalStatus} onValueChange={setMaritalStatus}>
            <SelectTrigger><SelectValue placeholder="Marital Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Occupation" value={occupation} onChange={e => setOccupation(e.target.value)} />
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <Select value={department || "none"} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Emergency & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Emergency Contact" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
          <Input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {/* Custom Fields */}
        <div>
          <label className="block mb-1 font-medium">Custom Fields</label>
          <div className="flex gap-2 mb-2">
            <Input placeholder="Field Name" value={customKey} onChange={e => setCustomKey(e.target.value)} />
            <Input placeholder="Value" value={customValue} onChange={e => setCustomValue(e.target.value)} />
            <Button onClick={handleAddCustomField} type="button">Add</Button>
          </div>
          <ul className="list-disc pl-5">
            {customFields.map((f, i) => (
              <li key={i}>{f.key}: {f.value}</li>
            ))}
          </ul>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? "Adding..." : "Add Member"}</Button>
      </div>
    </DialogShell>
  );
}

export default AddMemberModal
