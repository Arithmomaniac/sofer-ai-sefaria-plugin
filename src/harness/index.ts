document.addEventListener('DOMContentLoaded', () => {
    const srefButton = document.getElementById('sref-button');
    const srefInput = document.getElementById('sref') as HTMLInputElement;
    const scrollLog = document.getElementById('scroll-log') as HTMLTextAreaElement;
    const pluginElement = document.querySelector('sefaria-plugin');

    if (srefButton && srefInput && pluginElement && scrollLog) {
        // Listen for sref updates
        srefButton.addEventListener('click', () => {
            const sref = srefInput.value;
            if (sref) {
                pluginElement.setAttribute('sref', sref);
            }
        });

        // Listen for scrollToRef events
        pluginElement.addEventListener('scrollToRef', (event: Event) => {
            const customEvent = event as CustomEvent;
            const sref = customEvent.detail.sref;
            const timestamp = new Date().toLocaleTimeString();
            const logMessage = `[${timestamp}] scrollToRef called with: ${sref}\n`;
            scrollLog.value = logMessage + scrollLog.value;
        });
    } else {
        console.error('Required elements not found for harness setup.');
    }
});
