export interface SefariaText {
  title: string;
  body: string;
}

export interface FindRefsQueryOptions {
  with_text?: 0 | 1;
  debug?: 0 | 1;
  max_segments?: number;
}

export interface CitationResult {
  startChar: number;
  endChar: number;
  text: string;
  linkFailed: boolean;
  refs: string[];
}

export interface RefData {
  [ref: string]: {
    heRef: string;
    url: string;
    primaryCategory: string;
    he?: string[];
    en?: string[];
    isTruncated: boolean;
  };
}

export interface FindRefsResponseDetail {
  results: CitationResult[];
  refData: RefData;
  debugData?: any[];
}

export interface FindRefsResponse {
  title: FindRefsResponseDetail;
  body: FindRefsResponseDetail;
}

/**
 * Call the Sefaria API to find references.
 *
 * @param text An object containing the title and body text.
 * @param options Query options including with_text, debug, and max_segments.
 * @returns A promise resolving to the API response.
 */
export async function findRefs(
  text: SefariaText,
  options: FindRefsQueryOptions = {}
): Promise<FindRefsResponse> {
  // Build URL query parameters
  const queryParams = new URLSearchParams();
  if (options.with_text !== undefined) {
    queryParams.append("with_text", options.with_text.toString());
  }
  if (options.debug !== undefined) {
    queryParams.append("debug", options.debug.toString());
  }
  if (options.max_segments !== undefined) {
    queryParams.append("max_segments", options.max_segments.toString());
  }
  
  const url = `https://www.sefaria.org/api/find-refs?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}