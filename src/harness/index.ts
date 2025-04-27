document.addEventListener('DOMContentLoaded', () => {
    const srefButton = document.getElementById('sref-button');
    const srefInput = document.getElementById('sref') as HTMLInputElement;
    const pluginElement = document.querySelector('sefaria-plugin');

    if (srefButton && srefInput && pluginElement) {
        srefButton.addEventListener('click', () => {
            const sref = srefInput.value;
            if (sref) {
                pluginElement.setAttribute('sref', sref);
            }
        });
    } else {
        console.error('Required elements not found for harness setup.');
    }
});
