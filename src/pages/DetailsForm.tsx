import { useState, useEffect } from "react";
import { updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function DetailsForm({ giftee, onClose }: { giftee: Giftee; onClose: (updated: boolean, updatedGiftee?: Giftee) => void }) {
  const { toast } = useToast();
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState(giftee.bio || "");

  // Set initial values if date_of_birth exists
  useEffect(() => {
    if (giftee.date_of_birth) {
      const dobDate = new Date(giftee.date_of_birth);

      // Extract month and day for birthday (format: MM-DD)
      const month = String(dobDate.getMonth() + 1).padStart(2, '0');
      const day = String(dobDate.getDate()).padStart(2, '0');
      setBirthday(`${month}-${day}`);

      // Calculate age based on birth year
      const birthYear = dobDate.getFullYear();
      const currentYear = new Date().getFullYear();
      setAge(String(currentYear - birthYear));
    }
  }, [giftee.date_of_birth]);

  const calculateDateOfBirth = () => {
    if (!birthday || !age) return "";

    // Parse birthday (MM-DD)
    const [month, day] = birthday.split("-").map(num => parseInt(num, 10));

    // Calculate birth year based on age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age, 10);

    // Create date string in format YYYY-MM-DD
    return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleSave = async () => {
    try {
      const dateOfBirth = calculateDateOfBirth();
      await updateGiftee(giftee.id, { date_of_birth: dateOfBirth, bio });
      toast({
        title: "Details Saved",
        description: `Updated details for ${giftee.name}.`,
      });

      // Pass true to indicate successful update, along with the updated data
      onClose(true, { ...giftee, date_of_birth: dateOfBirth, bio });
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
          htmlFor="birthday"
          className="block text-sm font-medium text-gray-700"
        >
          Birthday (Month and Day)
        </label>
        <Input
          id="birthday"
          type="text"
          placeholder="MM-DD"
          data-testid="birthday-input"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Format: MM-DD (e.g., 01-15 for January 15)</p>
      </div>
      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700"
        >
          Age
        </label>
        <Input
          id="age"
          type="number"
          data-testid="age-input"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        {age && (
          <p className="text-xs text-gray-500 mt-1">
            Birth year: {new Date().getFullYear() - parseInt(age, 10)}
          </p>
        )}
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
          data-testid="bio-input"
        />
      </div>
      <Button onClick={handleSave} className="w-full" data-testid="save-details-button">
        Save Details
      </Button>
    </div>
  );
}
