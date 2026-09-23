"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  error?: string | null;
}

export default function UploadZone({ onFileSelected, isUploading, error }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-teal">
          PDF Chatbot
        </p>
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
          Ask your document
          <br />
          anything.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-muted">
          Drop in a PDF and have a grounded conversation with it — every answer points back to the
          source.
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "flex w-full max-w-md cursor-pointer flex-col items-center gap-4 rounded-card border-2 border-dashed bg-surface px-8 py-14 text-center shadow-paper transition-colors",
          dragging ? "border-teal bg-teal-soft" : "border-line hover:border-teal/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />
        <PaperIcon />
        {isUploading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="ml-1">Reading your document…</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-ink">
              Drop a PDF here, or{" "}
              <span className="text-teal underline">browse</span>
            </p>
            <p className="text-xs text-muted">PDF only, up to ~25MB</p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-4 max-w-md text-center text-sm text-rust">{error}</p>
      )}
    </div>
  );
}

function PaperIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-teal">
      <path
        d="M7 3.5h7.5L18 7v13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M14 3.5V7h4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 12h6M9 15h6M9 9h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
