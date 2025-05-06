import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { Button } from "../components/ui/button";


import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import ResponsiveIdeasDialog from "@/components/ResponsiveIdeasDialog";

import { Giftee, Idea } from "@/types";
import { useToast } from "@/hooks/use-toast";

type GifteeProps = {
  g: Giftee;
  hideLabel?: boolean;
};

export default function GifteeRow({ g }: GifteeProps) {
  const { toast } = useToast();
  const [gifteeData, setGifteeData] = useState<Giftee>(g);
  const [ideas, setIdeas] = useState<Idea[]>(gifteeData.ideas || []);
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);

  // Update ideas when gifteeData changes
  useEffect(() => {
    setIdeas(gifteeData.ideas || []);
  }, [gifteeData]);

  // Functions for handling idea actions
  const handleAddIdea = async (ideaName: string) => {
    const newIdea = await addIdea(gifteeData.id, ideaName);
    setIdeas((prev) => [...prev, newIdea]);
    toast({
      title: "Idea Added",
      description: `Added "${newIdea.name}" for ${gifteeData.name}.`,
    });
  };

  const handleToggleBought = async (ideaId: string) => {
    // get current purchased_at value
    const currentIdea = ideas.find((i) => i.id === ideaId);
    const purchasedAt = currentIdea?.purchased_at ? null : new Date().toISOString();

    // if purchased_at is null, set to current date, else set to null
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated as Idea : i)));
    toast({
      title: `Idea Marked as ${purchasedAt ? "Bought" : "Not Bought"}`,
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({ title: "Idea Deleted", description: "Removed the idea." });
  };

  const handleDetailsUpdate = (updated: boolean, updatedGiftee?: Giftee) => {
    if (updated && updatedGiftee) {
      setGifteeData(updatedGiftee);
    }
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex space-x-2">
        {/* View Ideas - Responsive Dialog/Drawer with integrated Details tab */}
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 p-0 gap-1"
          onClick={() => setIsIdeasDialogOpen(true)}
          data-testid="ideas-button"
        >
          <Gift />See gift ideas
        </Button>

        <ResponsiveIdeasDialog
          giftee={gifteeData}
          ideas={ideas}
          open={isIdeasDialogOpen}
          setOpen={setIsIdeasDialogOpen}
          onToggleBought={handleToggleBought}
          onDelete={handleDeleteIdea}
          onAddIdea={handleAddIdea}
          onDetailsUpdate={handleDetailsUpdate}
        />
      </div>
    </div>
  );
}
