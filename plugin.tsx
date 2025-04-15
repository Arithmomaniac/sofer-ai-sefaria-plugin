import React from 'react';
import { createRoot } from 'react-dom/client';
import { useStore, Status } from './src/store';

export default function SefariaPlugin({ sref }: { sref?: string }) {
  // Get state and actions from Zustand store
  const {
    status,
    displayText,
    apiKey,
    transcriptionId,
    updateSettingsAndFetch
  } = useStore();


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
        {(status === Status.Finished) && (
          <>
            <p>Ref: {displayText}</p>
          </>
        )}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const key = formData.get('apiKey') as string;
        const id = formData.get('transcriptionId') as string;
        updateSettingsAndFetch(key, id);
      }}>
      <h4>Sofer.Ai Settings</h4>
      <div>
        <label>API Key:<input name="apiKey" type="text" defaultValue={apiKey} /></label>
      </div>
      <div>
        <label>Transcription Id:<input name="transcriptionId" type="text" defaultValue={transcriptionId} /></label>
      </div>
        <button type="submit">Update</button>
      </form>

      <div style={{ fontSize: '60%' }}>Ref: {sref}</div>
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
