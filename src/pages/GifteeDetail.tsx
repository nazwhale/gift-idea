import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getIdeasForGiftee,
  addIdea,
  updateIdea,
  deleteIdea,
} from "../lib/ideas";
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
    } catch (error: any) {
      console.error("Error updating date_of_birth:", error.message);
    }
  };

  const handleSaveBio = async () => {
    if (!gifteeId || !giftee) return;

    try {
      await updateGiftee(giftee.id, { bio, id: giftee.id });
      setGiftee((prev: Giftee | null) => (prev ? { ...prev, bio: bio } : null));
    } catch (error: any) {
      console.error("Error updating bio:", error.message);
    }
  };

  const handleAddIdea = async (name: string) => {
    if (!gifteeId) return;
    const idea = await addIdea(gifteeId, name);
    setIdeas((prev) => [...prev, idea]);
  };

  const handleDeleteGiftee = async (deleteId: string) => {
    await deleteGiftee(deleteId);
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
              variant="outline"
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
        <CardContent>
          <div className="space-y-4">
            {/* DOB Fields */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="DD"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
                className="w-16"
              />
              <Input
                type="text"
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
                className="w-16"
              />
              <Input
                type="text"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                className="w-20"
              />
              <Button variant="outline" size="sm" onClick={handleSaveDob}>
                Save Date of Birth
              </Button>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Input
                type="text"
                placeholder="Add some bio information"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleSaveBio}>
                Save Bio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Idea Form */}
      <Card className="mb-6">
        <CardHeader>
          <form className="space-y-4" onSubmit={handleSubmitIdeaForm}>
            <Input
              placeholder="Idea name"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
            />
            <Button type="submit">Add Idea</Button>
          </form>
        </CardHeader>
      </Card>

      {/* Fetch Suggestions from ChatGPT */}
      <div className="mb-6">
        <Button
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white"
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
                <li>
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
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(idea.url || "");
  }, [idea]);

  const handleToggleChosen = async (ideaId: string, current: Date | null) => {
    const purchasedAt = current ? null : new Date();
    const updated = await updateIdea(ideaId, {
      purchased_at: purchasedAt,
    });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleUpdateUrl = async () => {
    const updated = await updateIdea(idea.id, { url });
    setIdeas(ideas.map((i) => (i.id === idea.id ? updated : i)));
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas(ideas.filter((i) => i.id !== ideaId));
  };

  const handleRating = async (ideaId: string, rating: number) => {
    const updated = await updateIdea(ideaId, { rating });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteIdea(idea.id)}
          className="text-red-500"
        >
          Delete
        </Button>
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

      {idea.purchased_at != null && (
        <div className="flex flex-col my-4">
          <Label className="mb-2">Giftee's rating</Label>
          <div className="space-x-2">
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
      )}

      <div className="flex justify-between items-center my-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleChosen(idea.id, idea.purchased_at)}
          className={idea.purchased_at == null ? "text-blue-500" : "text-black"}
        >
          {idea.purchased_at == null ? "Bought" : "Not bought"}
        </Button>
      </div>
    </Card>
  );
}
