import { useMediaQuery } from "@/hooks/use-media-query";
import { Giftee, Idea } from "@/types";
import IdeasForm from "@/pages/IdeasForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from "./ui/drawer";

type ResponsiveIdeasDialogProps = {
    giftee: Giftee;
    ideas: Idea[];
    open: boolean;
    setOpen: (open: boolean) => void;
    onToggleBought: (ideaId: string) => Promise<void>;
    onDetailsUpdate: (updated: boolean, updatedGiftee?: Giftee) => void;
    onDelete: (ideaId: string) => Promise<void>;
    onAddIdea: (ideaName: string) => Promise<void>;
    initialTab: string;
};

export default function ResponsiveIdeasDialog({
    giftee,
    ideas,
    open,
    setOpen,
    onToggleBought,
    onDetailsUpdate,
    onDelete,
    onAddIdea,
    initialTab
}: ResponsiveIdeasDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex flex-col max-h-[95vh] w-[80vw] max-w-[700px] p-0" data-testid="ideas-dialog-content">
                    <div className="p-6 pb-0">
                        <DialogHeader>
                            <DialogTitle>
                                {giftee.name}'s {ideas.length} Ideas
                            </DialogTitle>
                            <DialogDescription>
                                Manage gift ideas and get AI suggestions
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="px-6 flex-1 overflow-hidden">
                        <IdeasForm
                            initialTab={initialTab}
                            giftee={giftee}
                            ideas={ideas}
                            onToggleBought={onToggleBought}
                            onDelete={onDelete}
                            onAddIdea={onAddIdea}
                            onDetailsUpdate={onDetailsUpdate}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
            // This fixes the issue where the input disappears above the fold on first tap
            repositionInputs={false}>
            <DrawerContent data-testid="ideas-drawer-content">
                <div className="p-4 pb-0">
                    <DrawerHeader className="text-left px-0">
                        <DrawerTitle>
                            {giftee.name}'s {ideas.length} Ideas
                        </DrawerTitle>
                        <DrawerDescription>
                            Manage gift ideas and get AI suggestions
                        </DrawerDescription>
                    </DrawerHeader>
                </div>
                <div className="px-4 flex-1 overflow-hidden">
                    <IdeasForm
                        giftee={giftee}
                        ideas={ideas}
                        onToggleBought={onToggleBought}
                        onDelete={onDelete}
                        onAddIdea={onAddIdea}
                        onDetailsUpdate={onDetailsUpdate}
                        initialTab={initialTab}
                    />
                </div>
                <DrawerClose className="absolute right-4 top-4" />
            </DrawerContent>
        </Drawer >
    );
} 