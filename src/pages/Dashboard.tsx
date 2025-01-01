import { useEffect, useState } from "react";
import { getGiftees, addGiftee, updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Import these from Shadcn UI or your local dropdown menu component.
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react"; // A common 3-dot icon

import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [giftees, setGiftees] = useState<Giftee[]>([]);
  const [newGifteeName, setNewGifteeName] = useState("");

  useEffect(() => {
    getGiftees().then(setGiftees).catch(console.error);
  }, []);

  const handleAddGiftee = async () => {
    const giftee = await addGiftee(newGifteeName);
    setGiftees((prev) => [...prev, giftee]);
    setNewGifteeName("");
    toast({
      title: "Person Added",
      description: `${giftee.name} has been successfully added.`,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newGifteeName.trim()) {
      handleAddGiftee();
    }
  };

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, 21);

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/ideas" className="text-sm text-primary underline">
          All ideas
        </Link>
      </div>

      {/* Upcoming Birthdays and Christmas */}
      <div className="text-gray-500 mb-4">
        {daysToChristmas < 51 && (
          <div>
            🎄 <strong>{daysToChristmas}</strong> day
            {daysToChristmas === 1 ? "" : "s"} til Christmas
          </div>
        )}
        <div>
          <ul>
            {birthdays.map((g) => (
              <li key={"birthdays" + g.id}>
                🍰{" "}
                <strong>
                  {Math.ceil(
                    (new Date(g.date_of_birth).setFullYear(
                      new Date().getFullYear()
                    ) -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                </strong>
                days til {g.name}'s birthday
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h1 className="text-xl mb-4">Your People</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          placeholder="Their name"
          value={newGifteeName}
          onChange={(e) => setNewGifteeName(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Add person
        </Button>
      </form>

      <h3>Christmas '24</h3>
      <ul>
        {getChristmasGiftees(giftees).map((g) => (
          <GifteeRow key={g.id} g={g} />
        ))}
      </ul>

      <div className="text-gray-300">---</div>

      <h3>All people</h3>
      <ul>
        {giftees.map((g) => (
          <GifteeRow key={g.id} g={g} />
        ))}
      </ul>
    </div>
  );
}

type GifteeProps = {
  g: Giftee;
};

function GifteeRow({ g }: GifteeProps) {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState(g.ideas || []);
  // For new idea creation
  const [ideaName, setIdeaName] = useState("");

  // Modal states
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Form states for bio and DOB
  const [dob, setDob] = useState(g.date_of_birth || "");
  const [bio, setBio] = useState(g.bio || "");

  // Handle adding a new idea (small form in the modal)
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!g.id) return;

    const newIdea = await addIdea(g.id, ideaName);
    setIdeas((prev) => [...prev, newIdea]);
    setIdeaName("");
    toast({
      title: "Idea Added",
      description: `${newIdea.name} added for ${g.name}.`,
    });
  };

  const handleSaveDetails = async () => {
    try {
      await updateGiftee(g.id, { date_of_birth: dob, bio });
      toast({
        title: "Details Saved",
        description: `Updated details for ${g.name}.`,
      });
      setIsDetailsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsBought = async (ideaId: string) => {
    // For example:
    const purchasedAt = new Date();
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    toast({
      title: "Marked as Bought",
      description: `Idea purchased.`,
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({
      title: "Idea Deleted",
      description: `Idea removed.`,
    });
  };

  return (
    <li className="flex items-center justify-between mb-2">
      <span>
        <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
          {g.name}
        </a>{" "}
        <span className="text-gray-500">
          - {ideas.filter((i) => i.purchased_at != null).length} bought,{" "}
          {ideas.filter((i) => i.purchased_at == null).length} idea
          {ideas.filter((i) => i.purchased_at == null).length !== 1 ? "s" : ""}
        </span>
      </span>
      <div className="flex space-x-2">
        {/* Button to Open the "Ideas" Modal */}
        <Dialog open={isIdeasDialogOpen} onOpenChange={setIsIdeasDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className="px-2 ml-2 text-blue-500"
              onClick={() => setIsIdeasDialogOpen(true)}
            >
              View Ideas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{g.name}'s Ideas</DialogTitle>
            </DialogHeader>

            {/* List existing ideas in the modal */}
            {ideas.length > 0 ? (
              <ul className="space-y-2 mb-4 overflow-y-scroll max-h-96">
                {ideas.map((idea) => (
                  <li
                    key={idea.id}
                    className="flex items-center justify-between border-b p-2 rounded"
                  >
                    <div>
                      <p>{idea.name}</p>
                      {idea.purchased_at && (
                        <span className="ml-2 text-sm text-green-600">
                          (bought)
                        </span>
                      )}
                    </div>

                    {/* 3-dot Icon Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!idea.purchased_at && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleMarkAsBought(idea.id)}
                          >
                            Mark as bought
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No ideas yet.</p>
            )}

            {/* Add new idea form */}
            <form onSubmit={handleAddIdea} className="flex space-x-2">
              <Input
                placeholder="Add new idea"
                value={ideaName}
                onChange={(e) => setIdeaName(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Details Button */}
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
            <div className="space-y-4">
              {/* DOB Input */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              {/* Bio Input */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="block w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveDetails}>Save Details</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </li>
  );
}

/**
 * Helper functions for upcoming birthdays and Christmas giftees
 */
function calculateDaysToChristmas(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const christmas = new Date(`${currentYear}-12-25`);
  const timeDiff = christmas.getTime() - today.getTime();

  if (timeDiff < 0) {
    const nextChristmas = new Date(`${currentYear + 1}-12-25`);
    return Math.ceil(
      (nextChristmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function birthdaysInNextNDays(giftees: Giftee[], n: number): Giftee[] {
  const today = new Date();
  const nextNDays = new Date();
  nextNDays.setDate(today.getDate() + n);

  return giftees.filter((g) => {
    const dob = new Date(g.date_of_birth);
    dob.setFullYear(today.getFullYear());
    return dob >= today && dob <= nextNDays;
  });
}

function getChristmasGiftees(giftees: Giftee[]): Giftee[] {
  return giftees.filter((g) => g.on_christmas);
}
