import { useQuery } from "@tanstack/react-query";
import { fetchStarData } from "../fetch/cosmicData";

export default function useStars() {
  return useQuery({
    queryKey: ["stars"],
    queryFn: async () => fetchStarData(),
    staleTime: Infinity,
  });
}
