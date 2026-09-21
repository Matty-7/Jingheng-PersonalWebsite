export type MapLocationCodec<State> = {
  initial_state: State;
  keys: readonly string[];
  read: (params: URLSearchParams) => State;
  write: (state: State) => Record<string, string>;
};

export function map_location_url(
  current_url: string,
  keys: readonly string[],
  values: Record<string, string>,
): URL {
  const url = new URL(current_url);
  for (const key of keys) {
    url.searchParams.delete(key);
    if (values[key]) url.searchParams.set(key, values[key]);
  }
  return url;
}
