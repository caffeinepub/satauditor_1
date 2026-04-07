import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useActor(): { actor: any; isFetching: boolean } {
  return useActorBase(createActor) as { actor: any; isFetching: boolean };
}
