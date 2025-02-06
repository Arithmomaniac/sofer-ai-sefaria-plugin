import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

export default function SefariaPlugin({ sref }: { sref?: string }) {
  const a1 = 'eGFpLVJqcm1BVjBQcXNSa0NHTU1uakN4Q3RrcjdJb2Z5NTdjNUN'
  const a2 = '1a0xIckhSd09pc1J3TW9qZTlhNGNsVDlnMFJBSFZHd3ZFY1RZT0lXS1VqbkVj'
  const b = atob(`${a1}${a2}`)
  const [counter, setCounter] = useState(0);
  const [uiState, setUiState] = useState(0);
  const [textContent, setTextContent] = useState('');
  const [footerText, setFooterText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [displayFooter, setDisplayFooter] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(c => c + 1);
      console.log(`Counter: ${counter}`);
      console.log(`UI State: ${uiState}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [counter, uiState]);

  useEffect(() => {
    if ((uiState === 0 || uiState === 5) && sref) {
      fetchData(sref);
    }
  }, [sref]);

  async function fetchData(query: string) {
    setUiState(1);
    setTextContent('');
    setFooterText('');
    setDisplayText('');
    setDisplayFooter('');
    try {
      const response = await fetch(`https://www.sefaria.org/api/v3/texts/${query}`);
      const data = await response.json();
      const rawText = data.versions.find((version: any) => version.actualLanguage !== 'en').text;
      const result = await promptLLM(rawText, query);
      setUiState(2);
      setTextContent(result);
      renderResults(result, query);
    } catch {
      setUiState(3);
    }
  }

  async function promptLLM(text: string, query: string) {
    const body = {
      messages: [
        { role: "system", content: "You are a translator" },
        { role: "user", content: `Please translate the following text from ${query}": ${text}` }
      ],
      model: "grok-beta",
      stream: false,
      temperature: 0
    }
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

  async function renderResults(fullText: string, query: string) {
    setUiState(4);
    let accum = '';
    for (let idx = 0; idx < fullText.length; idx++) {
      accum += fullText[idx];
      await sleep(Math.floor(Math.random() * 20));
      setDisplayText(accum);
    }
    const footerStr = '(Please understand! I am an experimental 🤖. I can hallucinate sometimes. 🫣)';
    let fAccum = '';
    for (let idx = 0; idx < footerStr.length; idx++) {
      fAccum += footerStr[idx];
      await sleep(Math.floor(Math.random() * 50));
      setDisplayFooter(fAccum);
    }
    setUiState(5);
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div style={{fontFamily: 'Arial, sans-serif', fontSize: '18px'}}>
      <div style={{
        marginTop: '1em', backgroundColor: 'rgba(0,0,0,0.05)',
        padding: '1em', borderRadius: '1em'
      }}>
        {uiState === 1 && <h3>🤖 is 🤔 {'.'.repeat(counter % 4)}</h3>}
        {uiState === 3 && (
          <>
            <h3>🤖 🤒</h3>
            <small>Whoops! Something went wrong.</small>
          </>
        )}
        {uiState === 4 && <h3>🤖 is typing {'.'.repeat(counter % 4)}</h3>}
        {uiState === 5 && <h3>🤖 Translation of {sref}</h3>}
        <p>{displayText}</p>
        <small>{displayFooter}</small>
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