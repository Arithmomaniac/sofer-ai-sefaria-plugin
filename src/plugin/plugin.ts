import type { CustomElement } from "typed-custom-elements"

class SefariaPluginElement extends HTMLElement implements CustomElement {
  static get observedAttributes() {
    // "sref" is the refrerence string to the current location in the Sefaria app (e.g., "Genesis 1:1")
    return ['sref'];
  }

  /**
   * Dispatches a custom 'scrollToRef' event to scroll the main Sefaria app to a specified ref.
   * This is monitored by the Sefaria app, which does the scrolling.
  *  
  * @param targetRef - The reference string to scroll to (e.g., "Genesis 1:1")
   */
  private dispatchScrollToRef(targetRef: string) {
    const event = new CustomEvent('scrollToRef', {
      detail: { sref: targetRef },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private shadowRootInstance: ShadowRoot;

  constructor() {
    super();
    this.shadowRootInstance = this.attachShadow({ mode: 'open' });
  }

  // Everything above this point will be needed in every plugin, more or less.
  // The following is a stub implementation of the plugin.

  private contentDiv: HTMLDivElement | null = null;
  private scrollRefInput: HTMLInputElement | null = null;

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
          this.dispatchScrollToRef(targetRef);
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
    this.scrollRefInput = null;
  }
}

customElements.define('sefaria-plugin', SefariaPluginElement);
