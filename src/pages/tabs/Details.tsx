import { useState, useEffect } from "react";
import { deleteGiftee, updateGiftee } from "../../lib/giftees";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GIFTEE_EVENTS, captureEvent } from "../../lib/posthog";
import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";

type DetailsTabProps = {
    giftee: Giftee;
    onClose: (updated: boolean, updatedGiftee?: Giftee) => void;
    onDelete: (deleted: boolean, deletedGifteeId?: string) => void;
};

export default function DetailsTab({ giftee, onClose, onDelete }: DetailsTabProps) {
    const { toast } = useToast();
    const [name, setName] = useState(giftee.name);
    const [birthday, setBirthday] = useState("");
    const [age, setAge] = useState("");
    const [bio, setBio] = useState(giftee.bio || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Prepend '+' to phone number for PhoneInput component which requires the '+' prefix for proper country code display
    const [phoneNumber, setPhoneNumber] = useState(
        giftee.phone_number ? `+${giftee.phone_number}` : ""
    );

    useEffect(() => {
        setName(giftee.name);
        setBirthday("");
        setAge("");
        setBio(giftee.bio || "");
        setPhoneNumber(giftee.phone_number ? `+${giftee.phone_number}` : "");

        if (giftee.date_of_birth) {
            const dobDate = new Date(giftee.date_of_birth);

            const month = String(dobDate.getMonth() + 1).padStart(2, '0');
            const day = String(dobDate.getDate()).padStart(2, '0');
            setBirthday(`${day}-${month}`);

            const birthYear = dobDate.getFullYear();
            const currentYear = new Date().getFullYear();
            setAge(String(currentYear - birthYear));
        }
    }, [giftee]);

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
            setIsSaving(true);
            const trimmedName = name.trim();
            if (!trimmedName) {
                toast({
                    title: "Name required",
                    description: "Please add this person's name before saving.",
                    variant: "destructive",
                });
                return;
            }

            const dateOfBirth = calculateDateOfBirth();
            const updatedFields = {
                name: trimmedName,
                date_of_birth: dateOfBirth,
                bio,
                // Strip '+' prefix from phone number as database doesn't accept it
                phone_number: phoneNumber ? phoneNumber.replace(/^\+/, '') : null
            };
            await updateGiftee(giftee.id, updatedFields);

            // Create updated giftee object to pass back
            const updatedGiftee = {
                ...giftee,
                name: trimmedName,
                date_of_birth: dateOfBirth,
                bio,
                // Strip '+' prefix from phone number as database doesn't accept it
                phone_number: phoneNumber ? phoneNumber.replace(/^\+/, '') : null
            };

            // Track details update
            captureEvent(GIFTEE_EVENTS.GIFTEE_DETAILS_UPDATED, {
                giftee_id: giftee.id,
                giftee_name: trimmedName,
                has_date_of_birth: !!dateOfBirth,
                has_bio: !!bio,
                has_phone_number: !!phoneNumber
            });

            toast({
                title: "Details Saved",
                description: `Updated details for ${trimmedName}.`,
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
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteGiftee(giftee.id);

            toast({
                title: "Person Deleted",
                description: `${giftee.name} has been removed.`,
            });

            onDelete(true, giftee.id);
        } catch (error) {
            console.error("Error deleting giftee:", error);
            toast({
                title: "Error",
                description: "Failed to delete person. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="space-y-4 flex-1">
                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Name"
                                data-testid="name-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="birthday" className="text-sm font-medium">
                                    Birthday
                                </label>
                                <Input
                                    id="birthday"
                                    type="text"
                                    placeholder="DD-MM"
                                    data-testid="birthday-input"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                />
                                {birthday && birthday.match(/^\d{2}-\d{2}$/) && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(`2000-${birthday.split('-')[1]}-${birthday.split('-')[0]}`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="age" className="text-sm font-medium">
                                    Age
                                </label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="Age"
                                    data-testid="age-input"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                                {age && (
                                    <p className="text-xs text-muted-foreground">
                                        Birth year: {new Date().getFullYear() - parseInt(age, 10)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone-number" className="text-sm font-medium">
                                Phone Number
                            </label>
                            <PhoneInput
                                id="phone-number"
                                defaultCountry="GB"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                data-testid="phone-input"
                            />
                            <p className="text-xs text-muted-foreground">
                                For birthday WhatsApp reminders
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <label htmlFor="bio" className="text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Notes about their preferences, favorite brands, dislikes..."
                            className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            data-testid="bio-input"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                            data-testid="delete-person-button"
                        >
                            {isDeleting ? "Deleting..." : "Delete Person"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <DialogFooter className="sticky bottom-0 pb-4 pt-4 bg-background">
                <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={isSaving || isDeleting}
                    data-testid="save-details-button"
                >
                    {isSaving ? "Saving..." : "Save Details"}
                </Button>
            </DialogFooter>
        </div>
    );
} 
