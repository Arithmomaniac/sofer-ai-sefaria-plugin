// Register as a web component
class SefariaPluginElement extends HTMLElement {
  static get observedAttributes() {
    return ['sref'];
  }

  private contentDiv: HTMLDivElement | null = null;
  private scrollRefInput: HTMLInputElement | null = null;
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

    // Create scroll ref input and button if they don't exist
    if (!this.scrollRefInput) {
      // Create container div for input and button
      const container = document.createElement('div');

      // Create input
      this.scrollRefInput = document.createElement('input');
      this.scrollRefInput.type = 'text';
      this.scrollRefInput.placeholder = 'target sref';
      container.appendChild(this.scrollRefInput);

      // Create button
      const scrollButton = document.createElement('button');
      scrollButton.textContent = 'Trigger Scroll';
      scrollButton.addEventListener('click', () => {
        const targetRef = this.scrollRefInput?.value;
        if (targetRef) {
          const event = new CustomEvent('scrollToRef', {
            detail: { sref: targetRef },
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(event);
        }
      });
      container.appendChild(scrollButton);

      this.shadowRootInstance.appendChild(container);
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
