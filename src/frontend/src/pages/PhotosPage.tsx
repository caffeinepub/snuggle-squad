import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";

const STORAGE_KEY = "snuggle-photos";

interface StoredPhoto {
  refBytes: string; // base64-encoded reference bytes
  uploadedAt: string;
  name: string;
}

function loadPhotos(): StoredPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredPhoto[];
  } catch {
    return [];
  }
}

function savePhotos(photos: StoredPhoto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function PhotosPage() {
  const { isFetching: actorLoading } = useActor();
  const [photos, setPhotos] = useState<StoredPhoto[]>(loadPhotos);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve display URLs for all stored photos
  useEffect(() => {
    if (photos.length === 0) return;
    const pending = photos.filter((p) => !photoUrls[p.refBytes]);
    if (pending.length === 0) return;

    const newUrls: Record<string, string> = {};
    for (const photo of pending) {
      try {
        const refBytes = base64ToUint8Array(photo.refBytes);
        const url = ExternalBlob.fromBytes(refBytes).getDirectURL();
        if (url) newUrls[photo.refBytes] = url;
      } catch {
        // skip photos that fail to resolve
      }
    }
    if (Object.keys(newUrls).length > 0) {
      setPhotoUrls((prev) => ({ ...prev, ...newUrls }));
    }
  }, [photos, photoUrls]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file 📸");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large — max 10MB 🙈");
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(Math.round(pct * 100));
        });

        const storedRef = await blob.getBytes();
        const refBase64 = uint8ArrayToBase64(storedRef);
        const url = ExternalBlob.fromBytes(storedRef).getDirectURL();

        const newPhoto: StoredPhoto = {
          refBytes: refBase64,
          uploadedAt: new Date().toISOString(),
          name: file.name,
        };
        const updated = [newPhoto, ...photos];
        savePhotos(updated);
        setPhotos(updated);
        if (url) {
          setPhotoUrls((prev) => ({ ...prev, [refBase64]: url }));
        }
        toast.success("Photo uploaded! 📸");
      } catch {
        toast.error("Upload failed, please try again");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [photos],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = (refBytes: string, name: string) => {
    const updated = photos.filter((p) => p.refBytes !== refBytes);
    savePhotos(updated);
    setPhotos(updated);
    setPhotoUrls((prev) => {
      const next = { ...prev };
      delete next[refBytes];
      return next;
    });
    toast.success(`"${name}" removed 🗑️`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
            Photos
          </h1>
          <p className="font-body text-muted-foreground text-sm mt-1">
            {photos.length} {photos.length === 1 ? "photo" : "photos"} in your
            squad album 📸
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || actorLoading}
          className="rounded-2xl font-body font-semibold gap-2 shadow-cozy"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Uploading...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Photo</span>
              <span className="sm:hidden">Add</span>
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload photo"
        />
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="font-body text-sm font-semibold text-foreground mb-1">
                Uploading photo...
              </p>
              <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {uploadProgress}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone (shown when no photos) */}
      {photos.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`bg-card rounded-3xl border-2 border-dashed p-14 text-center transition-all duration-200 ${
            dragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className="text-5xl mb-3">
            {dragging ? (
              <Upload className="w-12 h-12 mx-auto text-primary" />
            ) : (
              "📸"
            )}
          </div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            {dragging ? "Drop it here!" : "No photos yet!"}
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-5">
            Upload squad memories to share with everyone
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={actorLoading}
            className="rounded-2xl font-body font-semibold shadow-cozy gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Upload First Photo
          </Button>
        </motion.div>
      )}

      {/* Photos grid */}
      {photos.length > 0 && (
        <>
          {/* Drop zone overlay for adding more */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 text-center py-3 px-4 ${
              dragging
                ? "border-primary bg-primary/10"
                : "border-transparent hover:border-primary/30"
            }`}
          >
            {dragging && (
              <p className="font-body text-sm text-primary font-semibold">
                Drop to upload!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {photos.map((photo, idx) => (
                <motion.div
                  key={photo.refBytes}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.3,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="relative group aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-cozy"
                >
                  {photoUrls[photo.refBytes] ? (
                    <img
                      src={photoUrls[photo.refBytes]}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/25 transition-all duration-200 rounded-3xl" />

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.refBytes, photo.name)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Delete ${photo.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Name tooltip on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent py-2 px-2 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-b-3xl">
                    <p className="font-body text-xs text-white/90 truncate">
                      {photo.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer action */}
          <div className="text-center pt-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || actorLoading}
              className="rounded-2xl font-body font-medium gap-2"
            >
              <Upload className="w-4 h-4" />
              Add More Photos
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
