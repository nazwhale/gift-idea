import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddUrlDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    currentUrl: string | null;
    onSave: (url: string) => void;
    ideaName?: string;
}

// Helper function to ensure URLs are properly formatted
const formatUrl = (url: string): string => {
    // Return empty string as is
    if (!url.trim()) return url;

    // Check if the URL already has a protocol
    if (url.match(/^https?:\/\//i)) {
        return url.trim();
    }

    // Add https:// as the default protocol
    return `https://${url.trim()}`;
};

export default function AddUrlDialog({
    open,
    setOpen,
    currentUrl,
    onSave,
    ideaName,
}: AddUrlDialogProps) {
    const [url, setUrl] = useState<string>(currentUrl || "");

    useEffect(() => {
        if (open) {
            setUrl(currentUrl || "");
        }
    }, [open, currentUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Format the URL before saving
        const formattedUrl = formatUrl(url);
        console.log("Formatting URL from:", url, "to:", formattedUrl);
        onSave(formattedUrl);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {currentUrl ? "Edit Link" : "Add Link"} {ideaName ? `for "${ideaName}"` : ""}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full"
                            data-testid="url-input"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" data-testid="save-url-button">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 