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
        // This function is called when the user saves the URL for an idea.
        // It updates the idea in the database and then updates the idea in the local state.

        // Make sure currentIdeaForUrl exists before updating
        if (!currentIdeaForUrl) return;

        // Update the idea in the database
        await updateIdea(currentIdeaForUrl.id, { url });

        // Update the idea in the local state
        const updatedIdeas = localIdeas.map(i => i.id === currentIdeaForUrl.id ? { ...i, url } : i);
        setLocalIdeas(updatedIdeas);


        // Close the dialog
        setUrlDialogOpen(false);
    };

    return (
        <div className="flex flex-col flex-1">
            {/* Ideas list - scrollable */}
            <div className="overflow-y-auto pr-1 border border-gray-200 rounded-md flex-1">
                <IdeaList
                    ideas={localIdeas}
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