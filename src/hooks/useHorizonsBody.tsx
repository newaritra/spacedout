import { useQuery } from "@tanstack/react-query";
import { parseHorizonsResponse, type HorizonsBodyData } from "../lib/horizons";

type UseHorizonsBodyArgs = {
  command: string;
  start: string;
  stop: string;
  stepSize?: string;
};

async function fetchHorizonsBody(
  args: UseHorizonsBodyArgs,
): Promise<HorizonsBodyData> {
  const { command, start, stop, stepSize = "1d" } = args;

  const params = new URLSearchParams({
    format: "json",
    COMMAND: command,
    EPHEM_TYPE: "VECTORS",
    CENTER: "500@0",
    START_TIME: start,
    STOP_TIME: stop,
    STEP_SIZE: stepSize,
  });

  const res = await fetch(`/api/horizons?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Horizons request failed: ${res.status}`);
  }

  const json = await res.json();

  if (!json?.result) {
    throw new Error("Horizons returned no result text");
  }

  const parsed = parseHorizonsResponse(json.result);

  return parsed;
}

export function useHorizonsBody({
  command,
  start,
  stop,
  stepSize = "1d",
}: UseHorizonsBodyArgs) {
  const { data, isPending, error } = useQuery({
    queryKey: ["horizonsBody", command, start, stop, stepSize],
    queryFn: () => fetchHorizonsBody({ command, start, stop, stepSize }),
  });

  return { data, loading: isPending, error };
}
