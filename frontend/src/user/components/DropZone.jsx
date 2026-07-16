import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";

function DropZone({ accept, disabled, file, onFileChange, className = "" }) {
    const { t } = useI18n();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files) => {
        const next = files?.[0];
        if (next) {
            onFileChange(next);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    inputRef.current?.click();
                }
            }}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
                event.preventDefault();
                if (!disabled) setDragging(true);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                if (!disabled) setDragging(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
            }}
            onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (disabled) return;
                handleFiles(event.dataTransfer.files);
            }}
            className={[
                "rounded-lg border border-dashed p-4 text-center transition",
                dragging ? "border-cyan-400/50 bg-cyan-400/10" : "border-[var(--color-border)] bg-[var(--color-surface-muted)]",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-cyan-400/30",
                className,
            ].join(" ")}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={(event) => handleFiles(event.target.files)}
            />
            <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                    <Upload size={18} />
                </span>
                <p className="text-xs font-semibold text-cyan-100">
                    {dragging ? t("features.dropzone.active") : t("features.dropzone.idle")}
                </p>
                {file ? (
                    <p className="truncate text-[11px] opacity-80">
                        {t("features.dropzone.selected", { name: file.name })}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export default DropZone;
