import { useState } from "react";
import { Eye, Gift } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import IdeasForm from "@/pages/IdeasForm.tsx";
import DetailsForm from "@/pages/DetailsForm.tsx";

import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";

type GifteeProps = {
  g: Giftee;
  hideLabel?: boolean;
};

export default function GifteeRow({ g }: GifteeProps) {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState(g.ideas || []);
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Functions for handling idea actions
  const handleAddIdea = async (ideaName: string) => {
    const newIdea = await addIdea(g.id, ideaName);
    setIdeas((prev) => [...prev, newIdea]);
    toast({
      title: "Idea Added",
      description: `Added "${newIdea.name}" for ${g.name}.`,
    });
  };

  const handleToggleBought = async (ideaId: string) => {
    // get current purchased_at value
    const currentIdea = ideas.find((i) => i.id === ideaId);
    const purchasedAt = currentIdea?.purchased_at ? null : new Date().toISOString();

    // if purchased_at is null, set to current date, else set to null
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    toast({
      title: `Idea Marked as ${purchasedAt ? "Bought" : "Not Bought"}`,
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({ title: "Idea Deleted", description: "Removed the idea." });
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex space-x-2">
        {/* View Ideas Dialog */}
        <Dialog open={isIdeasDialogOpen} onOpenChange={setIsIdeasDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blue-500 p-0 gap-1">
              <Gift />Ideas
            </Button>
          </DialogTrigger>

          <DialogContent className="overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>
                {g.name}'s {ideas.length} Ideas
              </DialogTitle>
              <DialogDescription>
                Manage gift ideas and get AI suggestions
              </DialogDescription>
            </DialogHeader>
            <IdeasForm
              giftee={g}
              ideas={ideas}
              onToggleBought={handleToggleBought}
              onDelete={handleDeleteIdea}
              onAddIdea={handleAddIdea}
            />
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blue-500 p-0 gap-1">
              <Eye />Details
            </Button>
          </DialogTrigger>
          {/* Prevent auto-focusing on the date input when dialog opens
              This stops mobile devices from automatically showing date pickers
              when the modal is opened */}
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{g.name}'s Details</DialogTitle>
              <DialogDescription>
                Update personal information and preferences
              </DialogDescription>
            </DialogHeader>
            <DetailsForm giftee={g} onClose={setIsDetailsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
