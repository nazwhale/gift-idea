import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getIdeasForGiftee,
  addIdea,
  updateIdea,
  deleteIdea,
} from "../lib/ideas";
import { useToast } from "@/hooks/use-toast"; // Import toast hook
import { deleteGiftee, getGifteeById } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Giftee } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function GifteeDetail() {
  const { toast } = useToast(); // Initialize toast

  const { id: gifteeId } = useParams();
  const [giftee, setGiftee] = useState<Giftee | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);

  useEffect(() => {
    if (gifteeId) {
      getGifteeById(gifteeId)
        .then((fetchedGiftee) => {
          setGiftee(fetchedGiftee);
          if (fetchedGiftee.date_of_birth) {
            const [y, m, d] = fetchedGiftee.date_of_birth.split("-");
            setDay(d || "");
            setMonth(m || "");
            setYear(y || "");
          }
          if (fetchedGiftee.bio) {
            setBio(fetchedGiftee.bio);
          }
        })
        .catch(console.error);

      getIdeasForGiftee(gifteeId).then(setIdeas).catch(console.error);
    }
  }, [gifteeId]);

  const handleDeleteGiftee = async (deleteId: string) => {
    await deleteGiftee(deleteId);
    toast({
      title: "Giftee Deleted",
      description: `${giftee.name} has been removed.`,
    });
    // Optionally redirect back home after deletion
    window.location.href = "/";
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex justify-between">
            <div className="flex items-center">
              <div className="mr-2">{giftee.name || "Loading..."} </div>
              {giftee.on_christmas && (
                <Badge variant="outline" className="ml-1 bg-green-100">
                  Christmas
                </Badge>
              )}
              {giftee.on_birthday && (
                <Badge variant="outline" className="ml-1 bg-blue-100">
                  Birthday
                </Badge>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-red-500"
              onClick={() => handleDeleteGiftee(giftee.id)}
            >
              Delete
            </Button>
          </CardTitle>
          <CardDescription className="text-secondary">
            Has {ideas.length} ideas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Gift Ideas List */}
      <div className="mt-6 space-y-4">
        {ideas.map((idea) => (
          <Idea idea={idea} key={idea.id} setIdeas={setIdeas} ideas={ideas} />
        ))}
      </div>
    </div>
  );
}

function Idea({ idea, setIdeas, ideas }) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(idea.url || "");
  }, [idea]);

  const handleUpdateUrl = async () => {
    const updated = await updateIdea(idea.id, { url });
    setIdeas(ideas.map((i) => (i.id === idea.id ? updated : i)));

    toast({
      title: "Link Updated",
      description: `Link has been updated for "${idea.name}".`,
    });
  };

  const handleDeleteIdea = async (ideaId) => {
    await deleteIdea(ideaId);
    setIdeas(ideas.filter((i) => i.id !== ideaId));

    toast({
      title: "Idea Deleted",
      description: `The idea "${idea.name}" has been removed.`,
    });
  };

  const handleRating = async (ideaId, rating) => {
    const updated = await updateIdea(ideaId, { rating });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleSubmitUrl = (e) => {
    e.preventDefault();
    if (url.trim()) {
      handleUpdateUrl();
    }
  };

  return (
    <Card key={idea.id} className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md">{idea.name}</h3>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-secondary text-blue-500"
            >
              <span>link</span>
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitUrl} className="flex my-4 space-x-2">
        <Input
          placeholder="www.amazon.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" variant="ghost">
          Add link
        </Button>
      </form>
    </Card>
  );
}
