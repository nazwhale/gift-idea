import { useState } from "react";
import { Idea, Giftee } from "@/types";
import IdeaList from "../IdeaList";
import AddIdeaForm from "../AddIdeaForm";
import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import AddUrlDialog from "@/components/AddUrlDialog";

type IdeasTabProps = {
    giftee: Giftee;
    ideas: Idea[];
    onToggleBought?: (ideaId: string) => Promise<void>;
    onDelete?: (ideaId: string) => Promise<void>;
    onAddIdea?: (ideaName: string) => Promise<void>;
    onIdeasChange?: (updatedIdeas: Idea[]) => void;
};

export default function IdeasTab({
    giftee,
    ideas,
    onToggleBought,
    onDelete,
    onAddIdea,
    onIdeasChange
}: IdeasTabProps) {
    const [localIdeas, setLocalIdeas] = useState<Idea[]>(ideas);
    const [urlDialogOpen, setUrlDialogOpen] = useState(false);
    const [currentIdeaForUrl, setCurrentIdeaForUrl] = useState<{ id: string, name: string, url: string | null } | null>(null);

    const handleAddIdea = async (ideaName: string) => {
        if (onAddIdea) {
            await onAddIdea(ideaName);
            return;
        }

        const newIdea = await addIdea(giftee.id, ideaName);
        const updatedIdeas = [...localIdeas, newIdea];
        setLocalIdeas(updatedIdeas);
        onIdeasChange?.(updatedIdeas);
    };

    const handleToggleBought = async (ideaId: string) => {
        if (onToggleBought) {
            await onToggleBought(ideaId);
            return;
        }

        const idea = localIdeas.find(i => i.id === ideaId);
        if (!idea) return;

        const purchasedAt = idea.purchased_at ? null : new Date().toISOString();
        const updated = await updateIdea(ideaId, { purchased_at: purchasedAt }) as Idea;

        const updatedIdeas = localIdeas.map(i => i.id === ideaId ? updated : i);
        setLocalIdeas(updatedIdeas);
        onIdeasChange?.(updatedIdeas);
    };

    const handleDeleteIdea = async (ideaId: string) => {
        if (onDelete) {
            await onDelete(ideaId);
            return;
        }

        await deleteIdea(ideaId);
        const updatedIdeas = localIdeas.filter(i => i.id !== ideaId);
        setLocalIdeas(updatedIdeas);
        onIdeasChange?.(updatedIdeas);
    };

    const handleEditUrl = async (ideaId: string, currentUrl: string | null) => {
        const idea = localIdeas.find(i => i.id === ideaId);
        if (!idea) return;

        setCurrentIdeaForUrl({
            id: ideaId,
            name: idea.name,
            url: currentUrl
        });
        setUrlDialogOpen(true);
    };

    const handleSaveUrl = async (url: string) => {
        if (!currentIdeaForUrl) return;

        try {
            // Update the idea with the new URL
            const updated = await updateIdea(currentIdeaForUrl.id, { url }) as Idea;

            // Make sure the updated object has the URL property
            const updatedWithUrl = {
                ...updated,
                url: url // Explicitly set the URL property
            };

            // Update local state with the explicitly set URL
            const updatedIdeas = localIdeas.map(i =>
                i.id === currentIdeaForUrl.id ? updatedWithUrl : i
            );

            setLocalIdeas(updatedIdeas);
            onIdeasChange?.(updatedIdeas);
        } catch (error) {
            console.error("Error updating idea URL:", error);
        }
    };

    return (
        <div className="flex flex-col flex-1">
            {/* Ideas list - scrollable */}
            <div className="overflow-y-auto pr-1 border border-gray-200 rounded-md flex-1">
                <IdeaList
                    ideas={onIdeasChange ? localIdeas : ideas}
                    onToggleBought={handleToggleBought}
                    onDelete={handleDeleteIdea}
                    onEditUrl={handleEditUrl}
                />
            </div>

            {/* Add idea form */}
            <AddIdeaForm onAddIdea={handleAddIdea} />

            {/* Add URL dialog */}
            {currentIdeaForUrl && (
                <AddUrlDialog
                    open={urlDialogOpen}
                    setOpen={setUrlDialogOpen}
                    currentUrl={currentIdeaForUrl.url}
                    onSave={handleSaveUrl}
                    ideaName={currentIdeaForUrl.name}
                />
            )}
        </div>
    );
} 