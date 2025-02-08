import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {  OpenAI } from 'openai';

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
  const [displayFooter, setDisplayFooter] = useState('');
  const [openAIOptions, setOpenAIOptions] = useState<{ apiKey: string; baseURL: string, model: string }>({ apiKey: '', baseURL: '', model: '' });

  useEffect(() => {
    if (sref && openAIOptions.apiKey && openAIOptions.baseURL && openAIOptions.model) {
      fetchAndTranslate(sref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sref, openAIOptions]);

  async function fetchAndTranslate(query: string) {
    setStatus(Status.Loading);
    setDisplayText('');
    setDisplayFooter('');
    try {
      const response = await fetch(`https://www.sefaria.org/api/v3/texts/${query}`);
      const data = await response.json();
      const rawText = data.versions.find((version: any) => version.actualLanguage !== 'en').text;
      const translation = await promptLLM(rawText, query);
      setStatus(Status.Typing);
      await setText(translation);
      setStatus(Status.Finished);
    } catch (error) {
      setStatus(Status.Error);
    }
  }

  async function promptLLM(text: string, query: string) {
    const openai = new OpenAI({
      apiKey: atob(openAIOptions.apiKey),
      baseURL: openAIOptions.baseURL,
      dangerouslyAllowBrowser: true
    });
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a translator" },
        { role: "user", content: `Please translate the following text from ${query}: ${text}` }
      ],
      model: openAIOptions.model,
      stream: false,
      temperature: 0
    });
    return response.choices[0].message.content!;
  }

  async function setText(fullText: string) {
    setDisplayText(fullText);
    const footerStr = '(Please understand! I am an experimental 🤖. I can hallucinate sometimes. 🫣)';
    setDisplayFooter(footerStr);
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
      {status === Status.Typing && <h3>🤖 is typing...</h3>}
      {status === Status.Error && (
        <>
        <h3>🤖 🤒</h3>
        <small>Whoops! Something went wrong.</small>
        </>
      )}
      {(status === Status.Finished || status === Status.Typing) && (
        <>
        {sref && <h3>🤖 Translation of {sref}</h3>}
        <p>{displayText}</p>
        <small>{displayFooter}</small>
        </>
      )}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const apiKey = formData.get('apiKey') as string;
        const baseURL = formData.get('baseURL') as string;
        const model = formData.get('model') as string;
        setOpenAIOptions({ apiKey, baseURL, model });
      }}>
      <h4>OpenAI Settings</h4>
      <div>
        <label>API Key:<input name="apiKey" type="text" defaultValue={openAIOptions.apiKey} /></label>
      </div>
      <div>
        <label>Base URL: <input name="baseURL" type="text" defaultValue={openAIOptions.baseURL} /></label>
      </div>
      <div>
        <label>Model: <input name="model" type="text" defaultValue={openAIOptions.model} /></label>
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
