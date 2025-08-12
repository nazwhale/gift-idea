import { useState, useEffect } from "react";
import { updateGiftee } from "../../lib/giftees";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GIFTEE_EVENTS, captureEvent } from "../../lib/posthog";
import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";

type DetailsTabProps = {
    giftee: Giftee;
    onClose: (updated: boolean, updatedGiftee?: Giftee) => void;
};

export default function DetailsTab({ giftee, onClose }: DetailsTabProps) {
    const { toast } = useToast();
    const [birthday, setBirthday] = useState("");
    const [age, setAge] = useState("");
    const [bio, setBio] = useState(giftee.bio || "");
    // Prepend '+' to phone number for PhoneInput component which requires the '+' prefix for proper country code display
    const [phoneNumber, setPhoneNumber] = useState(
        giftee.phone_number ? `+${giftee.phone_number}` : ""
    );

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
            const updatedFields = {
                date_of_birth: dateOfBirth,
                bio,
                // Strip '+' prefix from phone number as database doesn't accept it
                phone_number: phoneNumber ? phoneNumber.replace(/^\+/, '') : null
            };
            await updateGiftee(giftee.id, updatedFields);

            // Create updated giftee object to pass back
            const updatedGiftee = {
                ...giftee,
                date_of_birth: dateOfBirth,
                bio,
                // Strip '+' prefix from phone number as database doesn't accept it
                phone_number: phoneNumber ? phoneNumber.replace(/^\+/, '') : null
            };

            // Track details update
            captureEvent(GIFTEE_EVENTS.GIFTEE_DETAILS_UPDATED, {
                giftee_id: giftee.id,
                giftee_name: giftee.name,
                has_date_of_birth: !!dateOfBirth,
                has_bio: !!bio,
                has_phone_number: !!phoneNumber
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
        <div className="space-y-4 mb-4 px-2">
            {/* Personal Info Section */}
            <div className="bg-gray-50/80 dark:bg-gray-900/30 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-4">
                        <Input
                            id="birthday"
                            type="text"
                            placeholder="Birthday (DD-MM)"
                            data-testid="birthday-input"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="border-0 bg-transparent text-lg px-0 py-3 focus-visible:ring-0 placeholder:text-gray-400 font-normal"
                        />
                        {birthday && birthday.match(/^\d{2}-\d{2}$/) && (
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                {new Date(`2000-${birthday.split('-')[1]}-${birthday.split('-')[0]}`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                            </p>
                        )}
                    </div>
                    <div className="px-5 py-4">
                        <Input
                            id="age"
                            type="number"
                            placeholder="Age"
                            data-testid="age-input"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="border-0 bg-transparent text-lg px-0 py-3 focus-visible:ring-0 placeholder:text-gray-400 font-normal"
                        />
                        {age && (
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Birth year: {new Date().getFullYear() - parseInt(age, 10)}
                            </p>
                        )}
                    </div>
                    <div className="px-5 py-4">
                        <PhoneInput
                            id="phone-number"
                            defaultCountry="GB"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            data-testid="phone-input"
                            className="border-0 bg-transparent text-lg"
                        />
                        <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
                            For birthday WhatsApp reminders
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50/80 dark:bg-gray-900/30 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4">
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Notes about their preferences, favorite brands, dislikes..."
                        className="w-full bg-transparent border-0 text-lg px-0 py-3 placeholder:text-gray-400 focus:outline-none resize-none min-h-[120px] font-normal leading-relaxed"
                        data-testid="bio-input"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-background pt-6 pb-2">
                <Button
                    onClick={handleSave}
                    className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-2xl shadow-sm transition-all duration-200"
                    data-testid="save-details-button"
                >
                    Save Details
                </Button>
            </div>
        </div>
    );
} 