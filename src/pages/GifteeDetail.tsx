import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getIdeasForGiftee,
  addIdea,
  updateIdea,
  deleteIdea,
} from "../lib/ideas";
import { useToast } from "@/hooks/use-toast"; // Import toast hook
import { deleteGiftee, getGifteeById, updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Giftee } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getSuggestionsForGiftee } from "../lib/chatgpt"; // Import from your chatgpt file

export default function GifteeDetail() {
  const { toast } = useToast(); // Initialize toast

  const { id: gifteeId } = useParams();
  const [giftee, setGiftee] = useState<Giftee | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ideaName, setIdeaName] = useState("");

  // DOB state
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Bio state
  const [bio, setBio] = useState<string>("");

  // ChatGPT suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

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

  const handleSaveDob = async () => {
    if (!gifteeId || !giftee) return;

    if (!day || !month || !year) {
      alert("Please fill out all fields");
      return;
    }

    const dob = `${year.padStart(4, "0")}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(2, "0")}`;

    try {
      await updateGiftee(giftee.id, { date_of_birth: dob, id: giftee.id });
      setGiftee((prev: Giftee | null) =>
        prev ? { ...prev, date_of_birth: dob } : null
      );

      toast({
        title: "Date of Birth Saved",
        description: `Date of birth for ${giftee.name} has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating date_of_birth:", error.message);
    }
  };

  const handleSaveBio = async () => {
    if (!gifteeId || !giftee) return;

    try {
      await updateGiftee(giftee.id, { bio, id: giftee.id });
      setGiftee((prev: Giftee | null) => (prev ? { ...prev, bio: bio } : null));
      toast({
        title: "Bio Saved",
        description: `Bio for ${giftee.name} has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating bio:", error.message);
    }
  };

  const handleAddIdea = async (name: string) => {
    if (!gifteeId) return;
    const idea = await addIdea(gifteeId, name);
    setIdeas((prev) => [...prev, idea]);
    toast({
      title: "Idea Added",
      description: `A new idea, "${name}", has been added for ${giftee.name}.`,
    });
  };

  const handleDeleteGiftee = async (deleteId: string) => {
    await deleteGiftee(deleteId);
    toast({
      title: "Giftee Deleted",
      description: `${giftee.name} has been removed.`,
    });
    // Optionally redirect back home after deletion
    window.location.href = "/";
  };

  const handleSubmitIdeaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaName.trim()) {
      handleAddIdea(ideaName);
      setIdeaName("");
    }
  };

  const handleFetchSuggestions = async () => {
    if (!giftee?.name) return;
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    try {
      // Pass the bio along to the GPT function
      const newSuggestions = await getSuggestionsForGiftee(
        giftee.name,
        giftee.bio
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsFetchingSuggestions(false);
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

      {/* Add Idea Form */}
      <Card className="mb-6">
        <CardHeader>
          {/* Fetch Suggestions from ChatGPT */}
          <div className="mb-6">
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300"
              onClick={handleFetchSuggestions}
              disabled={isFetchingSuggestions}
            >
              {isFetchingSuggestions ? "Fetching..." : "Get Suggestions"}
            </Button>
            {suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <ul
                    key={idx}
                    className="flex items-center justify-between list-disc list-inside"
                  >
                    <li className="flex justify-between items-center">
                      <span>{suggestion}</span>
                      <Button
                        variant="ghost"
                        className="text-blue-500"
                        size="sm"
                        onClick={() => handleAddIdea(suggestion)}
                      >
                        Add idea
                      </Button>
                    </li>
                  </ul>
                ))}
              </div>
            )}
          </div>
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

  const handleToggleChosen = async (ideaId, current) => {
    const purchasedAt = current ? null : new Date();
    const updated = await updateIdea(ideaId, {
      purchased_at: purchasedAt,
    });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));

    toast({
      title: "Status Updated",
      description: `"${idea.name}" marked as ${
        purchasedAt ? "Bought" : "Not Bought"
      }`,
    });
  };

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

  // Generate Amazon search link with Associate ID
  const generateAmazonSearchUrl = (searchQuery) => {
    const baseUrl = "https://www.amazon.co.uk/s";
    const queryParams = new URLSearchParams({
      k: searchQuery,
      tag: "giftgoats-21", // Your Associate ID
    });
    return `${baseUrl}?${queryParams.toString()}`;
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
        <div>
          {/* "Search Amazon" Button */}
          <Button
            className="text-green-600"
            variant="primary"
            size="sm"
            onClick={() =>
              window.open(
                generateAmazonSearchUrl(idea.name),
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Search Amazon
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteIdea(idea.id)}
            className="text-red-500"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleChosen(idea.id, idea.purchased_at)}
            className={
              idea.purchased_at == null ? "text-blue-500" : "text-black"
            }
          >
            {idea.purchased_at == null ? "Bought" : "Not bought"}
          </Button>
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
