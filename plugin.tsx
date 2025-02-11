import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SoferAI, SoferAIClient } from 'soferai';

enum Status {
  Idle,
  Loading,
  Typing,
  Finished,
  Error
}

export default function SefariaPlugin({ sref }: { sref?: string }) {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [displayText, setDisplayText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [transcriptionId, setTranscriptionId] = useState('');

  const [soferAiClient, setSoferAiClient] = useState<SoferAIClient | null>(null);

  useEffect(() => {
    const newClient = apiKey ? new SoferAIClient({ apiKey }) : new SoferAIClient();
    setSoferAiClient(newClient);
  }, [apiKey]);

  useEffect(() => {
    if (soferAiClient && transcriptionId) {
      fetchTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soferAiClient, transcriptionId]);

  async function fetchTranscript() {
    setStatus(Status.Loading);
    setDisplayText('');
    try {
      const transcripton = (await soferAiClient?.transcribe.getTranscription(transcriptionId))?.text
      setDisplayText(transcripton || '');
      setStatus(Status.Finished);
    } catch (error) {
      setStatus(Status.Error);
    }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}>
      <div style={{
        marginTop: '1em',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: '1em',
        borderRadius: '1em'
      }}>
        {status === Status.Loading && <h3>🤖 is loading...</h3>}
        {status === Status.Error && (
          <>
            <h3>🤖 🤒</h3>
            <small>Whoops! Something went wrong.</small>
          </>
        )}
        {(status === Status.Finished || status === Status.Typing) && (
          <>
            <p>{displayText}</p>
          </>
        )}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const key = formData.get('apiKey') as string;
        const url = formData.get('transcriptionId') as string;
        setApiKey(key);
        setTranscriptionId(url);
      }}>
      <h4>OpenAI Settings</h4>
      <div>
        <label>API Key:<input name="apiKey" type="text" defaultValue={apiKey} /></label>
      </div>
      <div>
        <label>Base URL: <input name="transcriptionId" type="text" defaultValue={transcriptionId} /></label>
      </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

// Register as a web component
class SefariaPluginElement extends HTMLElement {
  static get observedAttributes() {
    return ['sref'];
  }
  
  private _root: any; // store the persistent React root

  connectedCallback() {
    const sref = this.getAttribute('sref') || undefined;
    // Create shadow DOM and persistent React root if needed
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this._root) {
      this._root = createRoot(this.shadowRoot!);
      this._root.render(<SefariaPlugin sref={sref} />);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'sref' && newValue !== oldValue && this._root) {
      this._root.render(<SefariaPlugin sref={newValue} />);
    }
  }
}
customElements.define('sefaria-plugin', SefariaPluginElement);
