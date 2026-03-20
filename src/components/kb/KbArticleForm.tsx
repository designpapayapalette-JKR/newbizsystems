"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { KbArticle, createKbArticle, updateKbArticle } from "@/actions/kb";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

interface KbArticleFormProps {
  article?: KbArticle;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function KbArticleForm({ article, onSuccess, trigger }: KbArticleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState(article?.category ?? "General");
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      if (article) {
        await updateKbArticle(article.id, { title, slug, content, category, is_published: isPublished });
        toast.success("Article updated");
      } else {
        await createKbArticle({ title, slug, content, category, is_published: isPublished });
        toast.success("Article created");
      }
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to save article");
    } finally {
      setLoading(false);
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!article) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Article</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{article ? "Edit Article" : "Create Article"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Getting Started" />
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown supported) *</Label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={12} 
              className="font-mono text-sm"
              required 
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox id="publish" checked={isPublished} onCheckedChange={(v) => setIsPublished(v === true)} />
            <Label htmlFor="publish" className="cursor-pointer">Publish to Help Center immediately</Label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {article ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
