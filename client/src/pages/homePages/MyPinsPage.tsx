import { useQuery } from "@tanstack/react-query";
import PinCard from "@/components/pins/PinCard";
import { getPins } from "@/services/pinsService";
import { useAuth } from "@/context/AuthContext";

export default function MyPinsPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ["pins"],
    queryFn: getPins,
    enabled: isAuthenticated && !isBootstrapping,
  });

  const pins = data?.pins ?? [];
  const hasPins = pins.length > 0;

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-6 py-8">
      <p className="text-sm text-[var(--slate-muted)] mb-6 font-[family-name:var(--font-ui)]">
        My Pins
      </p>

      {isLoading && (
        <div className="py-20 text-center text-[var(--slate-muted)] font-[family-name:var(--font-ui)]">
          Loading pins...
        </div>
      )}

      {error && (
        <div className="text-red-500 font-[family-name:var(--font-ui)]">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      {!isLoading && !error && !hasPins && (
        <div className="py-20 text-center text-[var(--slate-muted)] font-[family-name:var(--font-ui)]">
          No pins yet.
        </div>
      )}

      {hasPins && (
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-5">
          {pins.map((pin) => (
            <PinCard key={pin.id} pin={pin} />
          ))}
        </div>
      )}
    </div>
  );
}
