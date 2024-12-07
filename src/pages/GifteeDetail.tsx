import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getIdeasForGiftee, addIdea, updateIdea } from "../lib/ideas";
import { getGifteeById, updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "@/components/ui/label";

import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Calendar } from "@/components/ui/calendar.tsx"; // Assuming you have these components
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function GifteeDetail() {
  const { id: gifteeId } = useParams();
  const [giftee, setGiftee] = useState<any | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ideaName, setIdeaName] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [newDob, setNewDob] = useState<string>("");

  useEffect(() => {
    if (gifteeId) {
      // Fetch giftee's name
      getGifteeById(gifteeId)
        .then((giftee) => setGiftee(giftee))
        .catch(console.error);

      // Fetch gift ideas for this giftee
      getIdeasForGiftee(gifteeId).then(setIdeas).catch(console.error);
    }
  }, [gifteeId]);

  // Generic handler for updating the giftee's date_of_birth
  const handleSaveDob = async (dob) => {
    setNewDob(dob);
    console.log("giftee", giftee);

    if (!gifteeId) return;

    try {
      await updateGiftee(giftee.id, { date_of_birth: dob, id: giftee.id });
      setGiftee((prev) =>
        prev ? { ...prev, date_of_birth: dob, id: giftee.id } : null
      );
    } catch (error) {
      console.error("Error updating date_of_birth:", error.message);
    }
  };

  const handleAddIdea = async () => {
    if (!gifteeId) return;
    const idea = await addIdea(gifteeId, ideaName, ideaDesc);
    setIdeas([...ideas, idea]);
    setIdeaName("");
    setIdeaDesc("");
  };

  const handleToggleChosen = async (ideaId: string, currentVal: boolean) => {
    const updated = await updateIdea(ideaId, { is_chosen: !currentVal });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleRating = async (ideaId: string, rating: number) => {
    const updated = await updateIdea(ideaId, { rating });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (ideaName.trim()) {
      handleAddIdea(); // Trigger the add giftee function
    }
  };

  if (!giftee) return <div>Loading...</div>;

  return (
    <div>
      {/* Link back to Home */}
      <div className="mb-4">
        <Link to="/" className="text-sm text-primary underline">
          ← Home
        </Link>
      </div>
      {/* Giftee Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {giftee.name || "Loading..."}
          </CardTitle>
          <CardDescription className="text-secondary">
            Has {ideas.length} ideas
          </CardDescription>

          <div className="mb-8 contents">
            <Label htmlFor="dateOfBirth" className="mb-2 mt-4">
              Birthday
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !giftee?.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {giftee?.date_of_birth ? (
                    format(giftee?.date_of_birth, "PP")
                  ) : (
                    <span>Birthday</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={giftee?.date_of_birth}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      handleSaveDob(selectedDate.toISOString().split("T")[0]); // Format to 'YYYY-MM-DD'
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Idea name"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
            />
            <Button type="submit">Add Idea</Button>
          </form>
        </CardContent>
      </Card>

      {/* Gift Ideas List */}
      <div className="mt-6 space-y-4">
        {ideas.map((idea) => (
          <Card key={idea.id}>
            <CardHeader className="py-4">
              <CardTitle className="text-md">{idea.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{idea.description}</p>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => handleToggleChosen(idea.id, idea.is_chosen)}
                >
                  {idea.is_chosen ? "Mark as unchosen" : "Mark as chosen"}
                </Button>
                <div className="flex space-x-2">
                  <span>Rating:</span>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant={idea.rating === num ? "default" : "outline"}
                      onClick={() => handleRating(idea.id, num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
