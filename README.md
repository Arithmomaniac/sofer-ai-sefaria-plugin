This is a template for creating Sefaria plugins. (See [this video](https://drive.google.com/file/d/16HZxYHxqEWubmoKToLdWl2WN0ZJ8zJGX/view) for a ) for a demo of how this works, though some of the details are no longer accurate.) It includes:

- The base component for development
- An html page that can be used in local development as a test harness
- A GitHub workflow to deploy both the plugin and the test harness to GitHub pages.

Some technical notes:
- This template uses Webpack, but you can use a different bundler. The only requirement is that there is a single `plugins.js` file for the output.
- Similarly, you can use a different GitHub Workflow, as long as it ensures `plugins.js` is available at `<username>.github.io/<project-name>/plugins.js`.
- This template uses Typescript in order to demonstrate how you can use non-vanilla JS to build a plugin, but that is not required.

The plugin is exported as a Web Component. You can use React inside (see [Arithmomanaic/sofer-ai-sefaria-plugin](https://github.com/Arithmomaniac/sofer-ai-sefaria-plugin) for an example), but if you're just looking to build a simple application, you may want to use [Lit](https://lit.dev/) or [WebJSX](https://webjsx.org/) to develop the root plugin, and use [Lion](https://lion.js.org/) as your component library.