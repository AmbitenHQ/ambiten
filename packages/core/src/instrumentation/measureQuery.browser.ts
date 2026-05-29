import { QueryInstrumentationMeta } from "./measureQueryWithErrors";

export async function measureQueryForBrowser<T>(
  _meta: QueryInstrumentationMeta,
  executor: () => Promise<T>
): Promise<T> {
  return executor();
}