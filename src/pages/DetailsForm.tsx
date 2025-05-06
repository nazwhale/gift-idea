import { useState, useEffect } from "react";
import { updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { GIFTEE_EVENTS, captureEvent } from "../lib/posthog";

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

      // Extract day and month for birthday (format: DD-MM)
      const month = String(dobDate.getMonth() + 1).padStart(2, '0');
      const day = String(dobDate.getDate()).padStart(2, '0');
      setBirthday(`${day}-${month}`);

      // Calculate age based on birth year
      const birthYear = dobDate.getFullYear();
      const currentYear = new Date().getFullYear();
      setAge(String(currentYear - birthYear));
    }
  }, [giftee.date_of_birth]);

  const calculateDateOfBirth = () => {
    if (!birthday || !age) return "";

    // Parse birthday (DD-MM)
    const [day, month] = birthday.split("-").map(num => parseInt(num, 10));

    // Calculate birth year based on age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age, 10);

    // Create date string in format YYYY-MM-DD
    return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleSave = async () => {
    try {
      const dateOfBirth = calculateDateOfBirth();
      const updatedFields = { date_of_birth: dateOfBirth, bio };
      await updateGiftee(giftee.id, updatedFields);

      // Create updated giftee object to pass back
      const updatedGiftee = {
        ...giftee,
        date_of_birth: dateOfBirth,
        bio
      };

      // Track details update
      captureEvent(GIFTEE_EVENTS.GIFTEE_DETAILS_UPDATED, {
        giftee_id: giftee.id,
        giftee_name: giftee.name,
        has_date_of_birth: !!dateOfBirth,
        has_bio: !!bio
      });

      toast({
        title: "Details Saved",
        description: `Updated details for ${giftee.name}.`,
      });

      // Pass true to indicate successful update, along with the updated data
      onClose(true, updatedGiftee);
    } catch (error) {
      console.error("Error updating giftee:", error);
      toast({
        title: "Error",
        description: "Failed to save details. Please try again.",
        variant: "destructive",
      });

      // Track error
      captureEvent(GIFTEE_EVENTS.GIFTEE_UPDATE_FAILED, {
        giftee_id: giftee.id,
        error: (error as Error).message
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
          Birthday (Day and Month)
        </label>
        <Input
          id="birthday"
          type="text"
          placeholder="DD-MM"
          data-testid="birthday-input"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
        {birthday && birthday.match(/^\d{2}-\d{2}$/) ? (
          <p className="text-xs text-gray-500 mt-1">
            Selected: {new Date(`2000-${birthday.split('-')[1]}-${birthday.split('-')[0]}`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">Format: DD-MM (e.g., 15-01 for 15 January)</p>
        )}
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
        <p className="text-xs text-gray-500 mt-1">
          Include brands they like and dislike to get better gift suggestions.
        </p>
      </div>
      <div className="sticky bottom-0 pt-4 pb-4 bg-background border-t">
        <Button onClick={handleSave} className="w-full" data-testid="save-details-button">
          Save Details
        </Button>
      </div>
    </div>
  );
}
