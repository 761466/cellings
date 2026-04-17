"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ImagePlus,
  Minus,
  Plus,
  Trash2,
  Type,
  List as ListIcon,
  SplitSquareHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { DetailBlock } from "@/lib/types";
import { uploadProductAsset } from "@/lib/storage";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function newId() {
  return (
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)) + ""
  );
}

function SortableBlock({
  block,
  onUpdate,
  onDelete,
}: {
  block: DetailBlock;
  onUpdate: (next: DetailBlock) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [uploading, setUploading] = React.useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border bg-background shadow-card",
        isDragging && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="순서 변경"
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          {block.type === "image"
            ? "이미지"
            : block.type === "text"
              ? "텍스트"
              : block.type === "features"
                ? "특징 목록"
                : "구분선"}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-destructive hover:bg-destructive/10"
          aria-label="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        {block.type === "image" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted">
                <ImagePlus className="h-4 w-4" />
                {block.url ? "교체" : "이미지 업로드"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setUploading(true);
                      const { publicUrl } = await uploadProductAsset(f, "blocks");
                      onUpdate({ ...block, url: publicUrl });
                    } catch (err) {
                      toast.error(
                        `업로드 실패: ${(err as Error).message || "권한·용량 확인"}`,
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {uploading ? (
                <span className="text-xs text-muted-foreground">업로드 중…</span>
              ) : null}
              <Select
                value={block.layout ?? "full"}
                onChange={(e) =>
                  onUpdate({ ...block, layout: e.target.value as "full" | "half" })
                }
                className="w-32"
              >
                <option value="full">전체 너비</option>
                <option value="half">2분할</option>
              </Select>
            </div>
            {block.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.url}
                alt={block.alt ?? ""}
                className={cn(
                  "max-h-[280px] rounded-lg object-contain",
                  block.layout === "half" ? "w-1/2" : "w-full",
                )}
              />
            ) : null}
            <Input
              value={block.alt ?? ""}
              onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
              placeholder="대체 텍스트 (접근성·SEO)"
            />
          </div>
        ) : null}

        {block.type === "text" ? (
          <div className="space-y-2">
            <Select
              value={block.variant}
              onChange={(e) =>
                onUpdate({
                  ...block,
                  variant: e.target.value as "title" | "body",
                })
              }
              className="w-32"
            >
              <option value="title">제목</option>
              <option value="body">본문</option>
            </Select>
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder={block.variant === "title" ? "제목 입력" : "본문 입력"}
              rows={block.variant === "title" ? 2 : 5}
            />
          </div>
        ) : null}

        {block.type === "features" ? (
          <div className="space-y-2">
            {block.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={item.icon ?? ""}
                  onChange={(e) => {
                    const items = block.items.slice();
                    items[idx] = { ...item, icon: e.target.value };
                    onUpdate({ ...block, items });
                  }}
                  placeholder="아이콘 (이모지 1자 등)"
                  className="w-24"
                />
                <Input
                  value={item.text}
                  onChange={(e) => {
                    const items = block.items.slice();
                    items[idx] = { ...item, text: e.target.value };
                    onUpdate({ ...block, items });
                  }}
                  placeholder="항목 텍스트"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const items = block.items.slice();
                    items.splice(idx, 1);
                    onUpdate({ ...block, items });
                  }}
                  aria-label="항목 삭제"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdate({
                  ...block,
                  items: [...block.items, { icon: "•", text: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" /> 항목 추가
            </Button>
          </div>
        ) : null}

        {block.type === "divider" ? (
          <div className="py-2">
            <div className="h-px bg-border" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BlockEditor({
  value,
  onChange,
}: {
  value: DetailBlock[];
  onChange: (next: DetailBlock[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = value.findIndex((b) => b.id === e.active.id);
    const newIdx = value.findIndex((b) => b.id === e.over!.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  };

  const add = (type: DetailBlock["type"]) => {
    const id = newId();
    let block: DetailBlock;
    if (type === "image") block = { id, type, url: "", layout: "full", alt: "" };
    else if (type === "text") block = { id, type, variant: "body", content: "" };
    else if (type === "features") block = { id, type, items: [{ icon: "✓", text: "" }] };
    else block = { id, type };
    onChange([...value, block]);
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {value.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdate={(next) =>
                  onChange(value.map((b) => (b.id === block.id ? next : b)))
                }
                onDelete={() =>
                  onChange(value.filter((b) => b.id !== block.id))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
        <Button type="button" size="sm" variant="outline" onClick={() => add("image")}>
          <ImagePlus className="h-4 w-4" /> 이미지
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add("text")}>
          <Type className="h-4 w-4" /> 텍스트
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => add("features")}
        >
          <ListIcon className="h-4 w-4" /> 특징 목록
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => add("divider")}
        >
          <SplitSquareHorizontal className="h-4 w-4" /> 구분선
        </Button>
      </div>
    </div>
  );
}
