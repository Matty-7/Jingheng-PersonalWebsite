export type MapLocationCodec<State> = {
  initial_state: State;
  keys: readonly string[];
  read: (params: URLSearchParams) => State;
  write: (state: State) => Record<string, string>;
};

export type MapSearchParams = Record<string, string | string[] | undefined>;

export function read_map_selection<State>(
  codec: MapLocationCodec<State>,
  search_params: MapSearchParams,
): State {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search_params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return codec.read(params);
}

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
