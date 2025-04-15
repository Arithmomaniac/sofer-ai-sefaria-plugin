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

  setStatus: (status) => set({ status }),
  setDisplayText: (text) => set({ displayText: text }),

  fetchTranscript: async () => {
    const { transcriptionId, soferAiClient, setStatus, setDisplayText } = get();
    if (!soferAiClient || !transcriptionId) {
        console.warn("FetchTranscript called without client or transcriptionId.");
        return;
    }

    setStatus(Status.Loading);
    setDisplayText('');
    try {
      let transcripton = (await soferAiClient.transcribe.getTranscription(transcriptionId))?.text;
      transcripton = transcripton?.replace(/<i>[\s\S]*?<\/i>/g, '');
      if (transcripton) {
        const response = await findRefs({ title: '', body: transcripton }, { debug: 1 });
        console.log("Sefaria Refs:", response);
      }
      setDisplayText(transcripton || '');
      setStatus(Status.Finished);
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setStatus(Status.Error);
      setDisplayText('');
    }
  },

  updateSettingsAndFetch: (apiKey, transcriptionId) => {
    const newClient = apiKey ? new SoferAIClient({ apiKey }) : new SoferAIClient();
    set({ apiKey, transcriptionId, soferAiClient: newClient, status: Status.Idle, displayText: '' });

    if (transcriptionId) {
       get().fetchTranscript();
    }
  }
}));
