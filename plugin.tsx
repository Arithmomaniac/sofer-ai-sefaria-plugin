import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import SefariaPlugin from './src/SefariaPlugin';

// Register as a web component
class SefariaPluginElement extends HTMLElement {
  static get observedAttributes() {
    return ['sref'];
  }

  private root: Root | null = null;

  connectedCallback() {
    const sref = this.getAttribute('sref') || undefined;
    const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });

    // Create React root if it doesn't exist
    if (!this.root) {
      this.root = createRoot(shadowRoot);
    }

    // Render the component within providers
    this.renderComponent(sref);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'sref' && newValue !== oldValue && this.root) {
      this.renderComponent(newValue);
    }
  }

  // Helper method to render the component
  private renderComponent(sref?: string) {
    const shadowRoot = this.shadowRoot;
    if (this.root && shadowRoot) {
      this.root.render(
        <SefariaPlugin sref={sref} shadowRootContainer={shadowRoot} />
      );
    }
  }
}
customElements.define('sefaria-plugin', SefariaPluginElement);
