import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateLookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const occasions = ["Work", "Casual", "Evening", "Active", "Summer", "Business", "Travel", "Party"];
const moods = ["Professional", "Relaxed", "Romantic", "Energetic", "Fresh", "Confident", "Creative", "Bold"];

export const CreateLookDialog = ({ open, onOpenChange, onCreated }: CreateLookDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [items, setItems] = useState<string[]>([""]);

  const addItem = () => setItems([...items, ""]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, value: string) =>
    setItems(items.map((item, i) => (i === idx ? value : item)));

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast.error("Please add a title");
      return;
    }
    const validItems = items.filter((i) => i.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("user_looks").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      occasion: occasion || null,
      mood: mood || null,
      items: validItems,
      is_public: isPublic,
    });

    if (error) {
      toast.error("Failed to save look");
    } else {
      toast.success("Look created! ✨");
      setTitle("");
      setDescription("");
      setOccasion("");
      setMood("");
      setIsPublic(false);
      setItems([""]);
      onOpenChange(false);
      onCreated();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-glass-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create a Look</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="font-sans text-sm text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekend brunch vibes" className="bg-secondary border-glass-border mt-1" />
          </div>

          <div>
            <Label className="font-sans text-sm text-muted-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the vibe..." className="bg-secondary border-glass-border mt-1 resize-none" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-sans text-sm text-muted-foreground">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="bg-secondary border-glass-border mt-1"><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-sans text-sm text-muted-foreground">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-secondary border-glass-border mt-1"><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {moods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="font-sans text-sm text-muted-foreground">Items</Label>
            <div className="space-y-2 mt-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(idx, e.target.value)}
                    placeholder={`Item ${idx + 1}`}
                    className="bg-secondary border-glass-border flex-1"
                  />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="p-2 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="w-full border-glass-border font-sans text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
            <div>
              <p className="text-sm font-sans text-foreground">Share publicly</p>
              <p className="text-xs text-muted-foreground font-sans">Others can see this look</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gold-gradient text-primary-foreground font-sans">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Look
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
