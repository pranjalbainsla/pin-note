import { useState } from "react";
import { Folder, Link2, Loader2 } from "lucide-react";
import { createPin } from "../../services/pinsService";

export default function MiscFolderPage({ setShowMiscFolder }: { setShowMiscFolder: (show: boolean) => void }) {

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>
    ) => {

        e.preventDefault();

        setIsDragging(false);

        const droppedText =
        e.dataTransfer.getData("text/plain");

        if (!droppedText.includes("youtube.com") &&
            !droppedText.includes("youtu.be")) {
        return;
        }

        try {

        setIsUploading(true);

        const res = await createPin(droppedText);
        
        if(res.ok) console.log("Pin created");

        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[850px] min-h-[550px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">

      {/* mac top bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
        <div className="w-3 h-3 rounded-full bg-red-400">
            <button onClick={() => setShowMiscFolder(false)} className="w-full h-full rounded-full opacity-0 hover:opacity-100 transition" />
        </div>
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>

      {/* content */}
      <div className="p-10">

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
            rounded-3xl
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
                ? "border-blue-500 bg-blue-50"
                : "border-neutral-300 bg-neutral-50"
            }
          `}
        >

          {isUploading ? (
            <>
              <Loader2
                size={52}
                className="animate-spin text-neutral-500"
              />

              <p className="text-neutral-500 text-lg">
                Summarizing video...
              </p>
            </>
          ) : (
            <>
              <Folder
                size={72}
                className={`
                  transition-all
                  ${
                    isDragging
                      ? "text-blue-500 scale-105"
                      : "text-neutral-500"
                  }
                `}
              />

              <div className="text-center">

                <p className="text-xl font-semibold mb-2">
                  Drop YouTube Link Here
                </p>

                <p className="text-neutral-500">
                  Drag a YouTube URL from your browser
                </p>

              </div>

              <Link2
                size={24}
                className="text-neutral-400"
              />
            </>
          )}

        </div>

      </div>

    </div>
  );
}