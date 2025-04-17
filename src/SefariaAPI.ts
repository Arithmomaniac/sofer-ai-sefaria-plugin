export interface SefariaText {
  /** Text of the title of the document. May be empty string when there is not title. Any citations found in the title will be assumed as context for citations found in the "body". */
  title: string;
  /** Text of the body of the document. */
  body: string;
}

export interface FindRefsQueryOptions {
  /** Return the text for each citation. 0 or 1. Default is 0. */
  with_text?: 0 | 1;
  /** Return debug information for each citation. 0 or 1. Default is 0. */
  debug?: 0 | 1;
  /** When `with_text` is `1`, what is the max number of segments to return for a citation. Limits size of response for general citations. 0 means no limit. Default is 0. */
  max_segments?: number;
}

export interface CitationResult {
  /** Start character of result relative to input text. */
  startChar: number;
  /** End character of result relative to input text. */
  endChar: number;
  /** Text of the citation for this result. Corresponds to `data.title.substring(startChar, endChar)` or `data.body.substring(startChar, endChar)`. */
  text: string;
  /** True if reference was located but failed to be linked to a source on Sefaria. Could mean an error in the linker or the source doesn't exist on Sefaria. */
  linkFailed: boolean;
  /** List of references in Sefaria format that this result could be linked to. If more than one reference, then the citation was considered to be ambiguous. */
  refs: string[];
}

export interface RefDataDetail {
  /** Hebrew translation of reference. */
  heRef: string;
  /** Reference in URL form. Create a URL to Sefaria with this format: www.sefaria.org/<url>. */
  url: string;
  /** Primary category of reference in Sefaria. Corresponds to location in table of contents (sefaria.org/texts). */
  primaryCategory: string;
  /** Hebrew text of the reference. Only included if `with_text` URL param is `1`. */
  he?: string[];
  /** English text of the reference. Only included if `with_text` URL param is `1`. */
  en?: string[];
  /** Was text truncated. Only included if `with_text` URL param is `1` and `max_segments` URL param is greater than 0. */
  isTruncated: boolean;
}

/** Object with keys for every ref found in the corresponding `results` array. */
export interface RefData {
  [ref: string]: RefDataDetail;
}

/** Detailed response for either the 'title' or 'body' field of the input text. */
export interface FindRefsResponseDetail {
  /** Array of citation results found in the text. */
  results: CitationResult[];
  /** Object containing detailed data for each reference found in the `results` array. */
  refData: RefData;
  /** Array of debug data where each element corresponds to an element in "results". Only included if "debug" URL param is `1`. */
  debugData?: any[];
}

/** Response format for the /api/find-refs endpoint. */
export interface FindRefsResponse {
  /** Data corresponding to results in the "title" field of the POST data. */
  title: FindRefsResponseDetail;
  /** Data corresponding to results in the "body" field of the POST data. */
  body: FindRefsResponseDetail;
}

/**
 * Calls the Sefaria Linker API (POST /api/find-refs) to find references in given text.
 * Takes in text input (title and body) and returns the location, Sefaria link,
 * and optionally text content and debug info for each citation found.
 *
 * @param text An object containing the title and body text. Citations in the title are used as context for the body.
 * @param options Optional URL query parameters: `with_text`, `debug`, `max_segments`.
 * @returns A promise resolving to the API response containing results for title and body.
 * @throws Throws an error if the API request fails.
 * @see {@link https://developers.sefaria.org/docs/linker-api} for detailed API documentation.
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
    body: JSON.stringify({ text }) // POST body requires a 'text' field containing the SefariaText object
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
