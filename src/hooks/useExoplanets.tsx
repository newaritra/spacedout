import { useQuery } from "@tanstack/react-query";
import { fetchExoplanetSystems } from "../fetch/cosmicData";

export default function useExoplanets() {
  return useQuery({
    queryKey: ["exoplanets"],
    queryFn: async () => fetchExoplanetSystems(),
    staleTime: Infinity,
  });
}
