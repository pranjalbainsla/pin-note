import { useState } from "react";
import { Link2, Loader2, UploadCloud } from "lucide-react";
import FolderPanel from "@/components/home/FolderPanel";
import { createPin } from "@/services/pinsService";

export default function AddPinPage({
  setShowAddPin,
}: {
  setShowAddPin: (show: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setIsDragging(false);

    const droppedText = e.dataTransfer.getData("text/plain");

    if (
      !droppedText.includes("youtube.com") &&
      !droppedText.includes("youtu.be")
    ) {
      return;
    }

    try {
      setIsUploading(true);

      const res = await createPin(droppedText);

      if (res.status === "ok") console.log("Pin created");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FolderPanel
      title="Add Pin"
      onClose={() => setShowAddPin(false)}
      className="top-20 w-[850px] min-h-[550px]"
      bodyClassName="p-10"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => {
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`
            h-[350px]
            rounded-2xl
            border-2
            border-dashed
            transition-all
            flex
            flex-col
            items-center
            justify-center
            gap-5

            ${
              isDragging
                ? "border-[#A8B8A8] bg-[#E8EDE8]/60"
                : "border-[#D8D6D0] bg-[#FAFAF8]"
            }
          `}
      >

        {isUploading ? (
          <>
            <Loader2
              size={52}
              className="animate-spin text-[#8A8A8A]"
            />

            <p className="text-[#4A4A4A] text-lg">
              Summarizing video...
            </p>
          </>
        ) : (
          <>
            <UploadCloud
              size={72}
              className={`
                  transition-all
                  ${
                    isDragging
                      ? "text-[#8A9A8A] scale-105"
                      : "text-[#8A8A8A]"
                  }
                `}
            />

            <div className="text-center">

              <p className="text-xl font-medium text-[#2D2D2D] mb-2">
                Drop YouTube Link Here
              </p>

              <p className="text-[#4A4A4A]">
                Drag a YouTube URL from your browser
              </p>

            </div>

            <Link2
              size={24}
              className="text-[#B0B0B0]"
            />
          </>
        )}

      </div>
    </FolderPanel>
  );
}
