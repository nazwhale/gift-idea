import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import IdeaList from "./IdeaList.tsx";
import AddIdeaForm from "@/pages/AddIdeaForm.tsx";
import DetailsForm from "@/pages/DetailsForm.tsx";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";

type GifteeProps = {
  g: Giftee;
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

  const handleMarkAsBought = async (ideaId: string) => {
    const updated = await updateIdea(ideaId, { purchased_at: new Date() });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    toast({
      title: "Idea Marked as Bought",
      description: "Marked as purchased.",
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({ title: "Idea Deleted", description: "Removed the idea." });
  };

  return (
    <li className="flex items-center justify-between mb-2">
      <span>
        <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
          {g.name}
        </a>
        <span className="text-gray-500">
          - {ideas.filter((i) => i.purchased_at != null).length} bought,{" "}
          {ideas.filter((i) => i.purchased_at == null).length} idea
          {ideas.filter((i) => i.purchased_at == null).length !== 1 ? "s" : ""}
        </span>
      </span>
      <div className="flex space-x-2">
        {/* View Ideas Dialog */}
        <Dialog open={isIdeasDialogOpen} onOpenChange={setIsIdeasDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="xs" className="text-blue-500">
              View Ideas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{g.name}'s Ideas</DialogTitle>
            </DialogHeader>
            <IdeaList
              ideas={ideas}
              onMarkAsBought={handleMarkAsBought}
              onDelete={handleDeleteIdea}
            />
            <AddIdeaForm onAddIdea={handleAddIdea} />
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="xs" className="text-blue-500">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{g.name}'s Details</DialogTitle>
            </DialogHeader>
            <DetailsForm giftee={g} />
          </DialogContent>
        </Dialog>
      </div>
    </li>
  );
}
