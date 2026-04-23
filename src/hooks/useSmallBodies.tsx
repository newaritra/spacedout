import { useQuery } from "@tanstack/react-query";
import { fetchSmallBodies } from "../fetch/smallBodies";

export default function useSmallBodies() {
  return useQuery({
    queryKey: ["smallBodies"],
    queryFn: async () => await fetchSmallBodies(),
  });
}
