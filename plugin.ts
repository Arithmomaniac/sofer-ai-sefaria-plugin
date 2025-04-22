// Register as a web component
class SefariaPluginElement extends HTMLElement {
  static get observedAttributes() {
    return ['sref'];
  }

  private contentDiv: HTMLDivElement | null = null;
  private shadowRootInstance: ShadowRoot;

  constructor() {
    super();
    // Ensure shadow root is created early
    this.shadowRootInstance = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Create the content div if it doesn't exist
    if (!this.contentDiv) {
      this.contentDiv = document.createElement('div');
      this.shadowRootInstance.appendChild(this.contentDiv);
    }

    // Set initial content
    const initialSref = this.getAttribute('sref');
    this.updateContent(initialSref);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === 'sref' && newValue !== oldValue) {
      this.updateContent(newValue);
    }
  }

  // Helper method to update the div content
  private updateContent(sref: string | null) {
    if (this.contentDiv) {
      if (sref) {
        this.contentDiv.textContent = `Current sref: ${sref}`;
      } else {
        this.contentDiv.textContent = 'No sref provided.';
      }
    }
  }

  disconnectedCallback() {
    // Optional: Clean up if necessary
    this.contentDiv = null;
  }
}

customElements.define('sefaria-plugin', SefariaPluginElement);
