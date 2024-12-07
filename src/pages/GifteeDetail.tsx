import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getIdeasForGiftee, addIdea, updateIdea } from "../lib/ideas";
import { getGifteeById } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"; // Assuming you have these components

export default function GifteeDetail() {
  const { id: gifteeId } = useParams();
  const [giftee, setGiftee] = useState<any | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ideaName, setIdeaName] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");

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

  console.log("ideas", ideas);

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
            You have {ideas.length} ideas
          </CardDescription>
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
            <CardHeader>
              <CardTitle>{idea.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{idea.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => handleToggleChosen(idea.id, idea.is_chosen)}
                >
                  {idea.is_chosen ? "Mark Unchosen" : "Mark Chosen"}
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
