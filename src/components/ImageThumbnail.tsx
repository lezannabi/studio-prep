import { imageStatusLabels, imageTagLabels } from "../lib/labels";
import { ProjectImage } from "../types/domain";

export function ImageThumbnail({
  image,
  active,
  draggable = false,
  onClick,
  onDragStart,
  onDrop,
  onDragEnd
}: {
  image: ProjectImage;
  active: boolean;
  draggable?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.();
      }}
      onDragEnd={onDragEnd}
      className={`w-full rounded-[20px] border p-2.5 text-left transition ${
        active ? "border-teal-600 bg-teal-50/60" : "border-stone-200/80 bg-white/90"
      }`}
    >
      <div
        className="h-24 overflow-hidden rounded-[14px]"
        style={{ background: image.background }}
      >
        {image.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="truncate text-sm font-medium text-stone-900">{image.name}</p>
          <p className="mt-1 text-xs text-stone-500">{image.shotLabel}</p>
        </div>
        <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] text-stone-500">
          {imageStatusLabels[image.status]}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-500">
        {image.isCover ? <span className="text-amber-600">★</span> : null}
        <span className="truncate">
          {image.tags.slice(0, 2).map((tag) => imageTagLabels[tag]).join(" · ")}
        </span>
      </div>
    </button>
  );
}
