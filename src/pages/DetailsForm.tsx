import { useState } from "react";
import { updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function DetailsForm({ giftee }: { giftee: Giftee }) {
  const { toast } = useToast();
  const [dob, setDob] = useState(giftee.date_of_birth || "");
  const [bio, setBio] = useState(giftee.bio || "");

  const handleSave = async () => {
    try {
      await updateGiftee(giftee.id, { date_of_birth: dob, bio });
      toast({
        title: "Details Saved",
        description: `Updated details for ${giftee.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="dob"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth
        </label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="block w-full p-2 border rounded-md"
          rows={3}
        />
      </div>
      <Button onClick={handleSave}>Save Details</Button>
    </div>
  );
}
