import { Idea } from "@/types";

export default function DebugIdeaInfo({ idea }: { idea: Idea }) {
    return (
        <div className="border border-red-300 p-2 m-2 bg-red-50 text-xs">
            <h3 className="font-bold">Debug Info:</h3>
            <pre>
                {JSON.stringify(
                    {
                        id: idea.id,
                        name: idea.name,
                        url: idea.url,
                        url_type: typeof idea.url,
                        has_url: Boolean(idea.url),
                        purchased_at: idea.purchased_at,
                    },
                    null,
                    2
                )}
            </pre>
        </div>
    );
} 