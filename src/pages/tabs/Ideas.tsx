import { Idea } from "@/types";
import IdeaList from "../IdeaList";
import AddIdeaForm from "../AddIdeaForm";

type IdeasTabProps = {
    ideas: Idea[];
    onToggleBought: (ideaId: string) => Promise<void>;
    onDelete: (ideaId: string) => Promise<void>;
    onAddIdea: (ideaName: string) => Promise<void>;
};

export default function IdeasTab({
    ideas,
    onToggleBought,
    onDelete,
    onAddIdea
}: IdeasTabProps) {
    return (
        <div className="flex flex-col flex-1">
            <div className="overflow-y-auto pr-1 border border-gray-200 rounded-md flex-1">
                <IdeaList
                    ideas={ideas}
                    onToggleBought={onToggleBought}
                    onDelete={onDelete}
                    onEditUrl={(ideaId, currentUrl) => { }} // Empty function to satisfy TypeScript
                />
            </div>
            <AddIdeaForm onAddIdea={onAddIdea} />
        </div>
    );
} 