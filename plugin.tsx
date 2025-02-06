import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

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

  const a1 = 'eGFpLVJqcm1BVjBQcXNSa0NHTU1uakN4Q3RrcjdJb2Z5NTdjNUN';
  const a2 = '1a0xIckhSd09pc1J3TW9qZTlhNGNsVDlnMFJBSFZHd3ZFY1RZT0lXS1VqbkVj';
  const b = atob(`${a1}${a2}`);

  useEffect(() => {
    if (sref) {
      fetchAndTranslate(sref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sref]);

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
      await typeText(translation);
      setStatus(Status.Finished);
    } catch (error) {
      setStatus(Status.Error);
    }
  }

  async function promptLLM(text: string, query: string) {
    const body = {
      messages: [
        { role: "system", content: "You are a translator" },
        { role: "user", content: `Please translate the following text from ${query}: ${text}` }
      ],
      model: "grok-beta",
      stream: false,
      temperature: 0
    };
    const request = new Request("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${b}`
      },
      body: JSON.stringify(body),
    });
    const response = await fetch(request);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async function typeText(fullText: string) {
    let accum = '';
    for (let char of fullText) {
      accum += char;
      setDisplayText(accum);
      await sleep(Math.floor(Math.random() * 20));
    }
    const footerStr = '(Please understand! I am an experimental 🤖. I can hallucinate sometimes. 🫣)';
    let fAccum = '';
    for (let char of footerStr) {
      fAccum += char;
      setDisplayFooter(fAccum);
      await sleep(Math.floor(Math.random() * 50));
    }
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}>
      <div style={{
        marginTop: '1em', backgroundColor: 'rgba(0,0,0,0.05)',
        padding: '1em', borderRadius: '1em'
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