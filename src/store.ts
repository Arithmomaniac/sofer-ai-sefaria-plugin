import { create } from 'zustand';
import { SoferAIClient } from 'soferai';
import { findRefs } from './SefariaAPI';

// Re-define or import Status enum
export enum Status {
  Idle,
  Loading,
  Finished,
  Error
}

interface PluginState {
  status: Status;
  displayText: string;
  apiKey: string;
  transcriptionId: string;
  soferAiClient: SoferAIClient | null;
  // Ref state
  refsLoading: boolean;
  refsList: { text: string; url: string }[] | null;
  refsError: string | null;
  currentTranscriptRequestId: number; // To handle race conditions
  // Actions
  setStatus: (status: Status) => void;
  setDisplayText: (text: string) => void;
  fetchTranscript: () => Promise<void>;
  updateSettingsAndFetch: (apiKey: string, transcriptionId: string) => void;
}

export const useStore = create<PluginState>((set, get) => ({
  status: Status.Idle,
  displayText: '',
  apiKey: '',
  transcriptionId: '',
  soferAiClient: null,
  // Ref state init
  refsLoading: false,
  refsList: null,
  refsError: null,
  currentTranscriptRequestId: 0,

  setStatus: (status) => set({ status }),
  setDisplayText: (text) => set({ displayText: text }),

  fetchTranscript: async () => {
    const { transcriptionId, soferAiClient, setStatus, setDisplayText } = get();
    if (!soferAiClient || !transcriptionId) {
      console.warn("FetchTranscript called without client or transcriptionId.");
      return;
    }

    setStatus(Status.Loading);
    setDisplayText(''); // Clear previous text immediately

    // Define the async function for finding refs inside fetchTranscript
    const findAndSetRefs = async (text: string, expectedTranscriptRequestId: number) => {
      // Check relevance before starting
      if (expectedTranscriptRequestId !== get().currentTranscriptRequestId) {
        console.log(`Skipping ref finding for stale request ID ${expectedTranscriptRequestId}`);
        return; // Don't even start if already stale
      }
      // If relevant, proceed:
      set(state => expectedTranscriptRequestId === state.currentTranscriptRequestId ? { refsLoading: true, refsList: null, refsError: null } : {});

      try {
        const response = await findRefs({ title: '', body: text }, { debug: 1 });
        console.log("Sefaria Refs:", response); // Keep logging for now

        const bodyRefs = response?.body?.refData ? Object.keys(response.body.refData).map(key => ({text: key, url: response.body.refData[key].url})) : [];

        // Use functional set to update only if the request is still relevant
        set(state => expectedTranscriptRequestId === state.currentTranscriptRequestId ? { refsList: bodyRefs, refsLoading: false, refsError: null }: {});

      } catch (error: any) {
        console.error("Error finding refs:", error);
        set(state => expectedTranscriptRequestId === state.currentTranscriptRequestId ? { refsError: 'Failed to load references.', refsLoading: false, refsList: null } : {});
      }
    };

    try {
      let transcripton = (await soferAiClient.transcribe.getTranscription(transcriptionId))?.text;
      transcripton = transcripton?.replace(/<i>[\s\S]*?<\/i>/g, ''); // Remove italics

      setDisplayText(transcripton || ''); // Set display text first
      setStatus(Status.Finished); // Mark main loading as finished

      if (transcripton) {
        const requestId = get().currentTranscriptRequestId; // Get current ID for this request
        findAndSetRefs(transcripton, requestId); // Start finding refs concurrently
      } else {
        // No transcript text, ensure refs are cleared
         set({ refsLoading: false, refsList: null, refsError: null });
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setStatus(Status.Error);
      setDisplayText('');
      // Also clear ref state and increment ID on fetch failure
      const nextRequestId = get().currentTranscriptRequestId + 1;
      set({
        refsLoading: false,
        refsList: null,
        refsError: null,
        currentTranscriptRequestId: nextRequestId
      });
    }
  },

  updateSettingsAndFetch: (apiKey, transcriptionId) => {
    const newClient = apiKey ? new SoferAIClient({ apiKey }) : new SoferAIClient();

    set(state => ({
      apiKey,
      transcriptionId,
      soferAiClient: newClient,
      status: Status.Idle,
      displayText: '',
      // Reset ref state and update ID
      refsLoading: false,
      refsList: null,
      refsError: null,
      currentTranscriptRequestId: state.currentTranscriptRequestId + 1 // Increment ID for new request
    }));

    if (transcriptionId) {
      get().fetchTranscript();
    }
  }
}));
