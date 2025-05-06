import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { GIFTEE_EVENTS, PAGE_VIEWED, PAGES, captureEvent } from "../lib/posthog";

import { Giftee, Idea } from "@/types";
import GifteeRow from "./GifteeRow";
import { useToast } from "@/hooks/use-toast";

import ResponsiveIdeasDialog from "@/components/ResponsiveIdeasDialog";
import { deleteIdea, updateIdea, addIdea } from "@/lib/ideas";

export default function Dashboard() {
  const { toast } = useToast();
  const [giftees, setGiftees] = useState<Giftee[]>([]);
  const [newGifteeName, setNewGifteeName] = useState("");
  const [newGiftee, setNewGiftee] = useState<Giftee | null>(null);
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);

  useEffect(() => {
    captureEvent(PAGE_VIEWED, {
      page: PAGES.DASHBOARD
    });

    getGiftees().then(setGiftees).catch(console.error);
  }, []);

  const handleAddGiftee = async () => {
    const giftee = await addGiftee(newGifteeName);
    setGiftees((prev) => [...prev, giftee]);
    setNewGifteeName("");
    setNewGiftee(giftee);
    setIsIdeasDialogOpen(true);

    captureEvent(GIFTEE_EVENTS.GIFTEE_ADDED, {
      giftee_id: giftee.id,
      giftee_name: giftee.name
    });

    toast({
      title: "Person Added",
      description: `${giftee.name} has been successfully added.`,
    });
  };

  const handleDetailsUpdate = (updated: boolean, updatedGiftee?: Giftee) => {
    if (updated && updatedGiftee && newGiftee) {
      setGiftees((prev) =>
        prev.map((g) => (g.id === updatedGiftee.id ? updatedGiftee : g))
      );
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsIdeasDialogOpen(open);
    if (!open) {
      setNewGiftee(null);
    }
  };

  // Empty handlers for the new person (who doesn't have ideas yet)
  const handleAddIdea = async (ideaName: string) => {
    if (!newGiftee) return;
    const newIdea = await addIdea(newGiftee.id, ideaName);

    // Update the newGiftee object with the new idea
    setNewGiftee(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ideas: [...(prev.ideas || []), newIdea]
      };
    });

    // Also update in the giftees list
    setGiftees(prev =>
      prev.map(g => g.id === newGiftee.id
        ? { ...g, ideas: [...(g.ideas || []), newIdea] }
        : g
      )
    );
  };

  const handleToggleBought = async (ideaId: string) => {
    if (!newGiftee) return;
    const idea = newGiftee.ideas?.find(i => i.id === ideaId);
    if (!idea) return;

    const purchasedAt = idea.purchased_at ? null : new Date().toISOString();
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });

    // Update in newGiftee
    setNewGiftee(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ideas: prev.ideas?.map(i => i.id === ideaId ? updated as Idea : i) || []
      };
    });

    // Update in giftees list
    setGiftees(prev =>
      prev.map(g => g.id === newGiftee.id
        ? {
          ...g,
          ideas: g.ideas?.map(i => i.id === ideaId ? updated as Idea : i) || []
        }
        : g
      )
    );
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!newGiftee) return;
    await deleteIdea(ideaId);

    // Update in newGiftee
    setNewGiftee(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ideas: prev.ideas?.filter(i => i.id !== ideaId) || []
      };
    });

    // Update in giftees list
    setGiftees(prev =>
      prev.map(g => g.id === newGiftee.id
        ? { ...g, ideas: g.ideas?.filter(i => i.id !== ideaId) || [] }
        : g
      )
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newGifteeName.trim()) {
      handleAddGiftee();
    }
  };

  const sortedGiftees = [...giftees].sort((a, b) => {
    const today = new Date();
    const dateA = new Date(a.date_of_birth || "");
    const dateB = new Date(b.date_of_birth || "");

    // Set both dates to current year
    dateA.setFullYear(today.getFullYear());
    dateB.setFullYear(today.getFullYear());

    // If the birthday has already passed this year, set it to next year
    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
    if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);

    return dateA.getTime() - dateB.getTime();
  });

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, 21);

  return (
    <div className="py-4">
      <div className="mb-4">
        <Link to="/ideas" className="text-sm text-primary underline">
          All ideas
        </Link>
      </div>

      {/* Only show Christmas countdown */}
      <div className="text-gray-500 mb-4">
        {daysToChristmas < 51 && (
          <div>
            🎄 <strong>{daysToChristmas}</strong> day
            {daysToChristmas === 1 ? "" : "s"} til Christmas
          </div>
        )}
      </div>

      <h1 className="text-xl mb-4">Your People</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          placeholder="Their name"
          value={newGifteeName}
          onChange={(e) => setNewGifteeName(e.target.value)}
        />
        <Button type="submit" variant="outline" data-testid="add-person-button">
          Add person
        </Button>
      </form>

      {/* ResponsiveIdeasDialog with details tab for newly added giftee */}
      {newGiftee && (
        <ResponsiveIdeasDialog
          giftee={newGiftee}
          ideas={newGiftee.ideas || []}
          open={isIdeasDialogOpen}
          setOpen={handleDialogClose}
          onToggleBought={handleToggleBought}
          onDelete={handleDeleteIdea}
          onAddIdea={handleAddIdea}
          onDetailsUpdate={handleDetailsUpdate}
          initialTab="details"
        />
      )}

      <ul>
        {sortedGiftees.map((g) => {
          const today = new Date();
          const birthday = new Date(g.date_of_birth || "");
          birthday.setFullYear(today.getFullYear());

          // If birthday has passed this year, set to next year
          if (birthday < today) {
            birthday.setFullYear(today.getFullYear() + 1);
          }

          const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const showBirthday = daysUntil <= 31;

          return (
            <li key={g.id} className="flex justify-between items-center py-2">
              <div>
                {g.name}
                {showBirthday && (
                  <span className="text-gray-500 ml-2">
                    - 🎂 {daysUntil} day{daysUntil === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <GifteeRow g={g} />
            </li>
          );
        })}
      </ul>
    </div>
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

  return giftees
    .filter((g) => {
      const dob = new Date(g.date_of_birth || "");
      dob.setFullYear(today.getFullYear());
      return dob >= today && dob <= nextNDays;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date_of_birth || "");
      const dateB = new Date(b.date_of_birth || "");
      dateA.setFullYear(today.getFullYear());
      dateB.setFullYear(today.getFullYear());
      return dateA.getTime() - dateB.getTime();
    });
}

function getChristmasGiftees(giftees: Giftee[]): Giftee[] {
  return giftees.filter((g) => g.on_christmas);
}
