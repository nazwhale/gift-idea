import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Mail } from "lucide-react";
import logo from "../assets/react.svg"; // Placeholder for Gift Goats logo

export default function IllustrativeReminderEmail() {
    return (
        <Card className="max-w-xl mx-auto border border-gray-200 bg-gray-50 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3 p-4 border-b bg-white rounded-t-lg">
                <Mail className="text-blue-500" size={28} />
                <div>
                    <CardTitle className="text-2xl font-bold leading-tight">Reminder: Jamie's Birthday in 21 days</CardTitle>
                    <div className="text-xs text-gray-400 font-mono mt-1">Gift Goats &lt;notifications@mail.giftgoats.com&gt;</div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="text-base">
                    Jamie's birthday is on <b>Sunday 20 July</b> (in <b>21 days</b>). They'll be <b>2 years old</b>.
                </div>
                <div>
                    <b>Gift Ideas:</b>
                    <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                        <li>
                            <a href="https://www.amazon.co.uk/Hello-Baby-Animals-duopress-labs/dp/1938093682" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                                https://www.amazon.co.uk/Hello-Baby-Animals-duopress-labs/dp/1938093682
                            </a>
                        </li>
                        <li>A soft, plush puppy toy that resembles their favourite animal.</li>
                        <li>A beautifully illustrated, durable board book about animals and greetings.</li>
                    </ul>
                </div>
                <div className="flex gap-4 mt-2">
                    <a href="#" className="text-blue-600 underline">💬 Send a message on WhatsApp</a>
                    <a href="#" className="text-blue-600 underline">☎️ Phone them</a>
                </div>
            </CardContent>
        </Card>
    );
} 