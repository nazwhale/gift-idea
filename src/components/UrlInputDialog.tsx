import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { updateIdea } from "@/lib/ideas";

interface UrlInputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ideaId: string;
    currentUrl: string | null;
    onUrlUpdated: (ideaId: string, updatedIdea: any) => void;
}

export default function UrlInputDialog({
    isOpen,
    onClose,
    ideaId,
    currentUrl,
    onUrlUpdated,
}: UrlInputDialogProps) {
    const [url, setUrl] = useState(currentUrl || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const updatedIdea = await updateIdea(ideaId, { url });
            onUrlUpdated(ideaId, updatedIdea);
            onClose();
        } catch (error) {
            console.error("Error updating URL:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" data-testid="url-dialog">
                <DialogHeader>
                    <DialogTitle>{currentUrl ? "Edit URL" : "Add URL"}</DialogTitle>
                    <DialogDescription>
                        {currentUrl
                            ? "Update the URL for this gift idea"
                            : "Add a URL for this gift idea"}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        id="url"
                        placeholder="https://example.com/product"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full"
                        data-testid="url-input-field"
                    />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        data-testid="url-cancel-btn"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        data-testid="url-save-btn"
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 