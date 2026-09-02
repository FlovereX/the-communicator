import { Label, TextArea, TextInput } from "@/components/shared/FormControls";

export function ArticleSection({
  isEditing,
  title,
  body,
  wordCount,
  onTitleChange,
  onBodyChange,
}: {
  isEditing: boolean;
  title: string;
  body: string;
  wordCount?: number;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}) {
  if (isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="article-headline">Headline</Label>
          <TextInput
            id="article-headline"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="article-body">Story body</Label>
          <TextArea
            id="article-body"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={16}
            className="font-serif text-base leading-relaxed"
            placeholder="Start writing..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
      {wordCount ? (
        <p className="mt-1 text-xs text-foreground/40">{wordCount} words</p>
      ) : null}
      {body ? (
        <div className="mt-4 flex flex-col gap-4 font-serif text-base leading-relaxed text-foreground/80">
          {body.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground/50">
          No draft yet. Click Edit Story to start writing.
        </p>
      )}
    </div>
  );
}
