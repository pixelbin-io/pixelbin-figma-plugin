# PixelBin.io Figma Plugin

Figma Plugin for [PixelBin.io](PixelBin.io), it helps users remove watermark from images, present in Figma files.

## Installation

1. Open Figma and navigate to the 'Plugins' section.
2. Search for 'PixelBin.io', or visit this [link]() to access the plugin directly.
3. Click 'Install', and the plugin will be added to your Figma account.

## Project Structure

- **`manifest.json`**: The configuration file, it details the plugin's name, unique ID, API version, and interactive menu options for users. It also specifies allowed domains for network access, ensuring secure functionality.

- **`plugin`**: Contains the core functionality with `index.ts` as the entry point. This script initializes the plugin and orchestrates its operations.

- **`ui`**: Manages the user interface. The `index.html` file, integrated via the `showUI` function in the plugin folder, displays the UI. The primary UI component is in `App.tsx`, which outlines the interface layout and interactions.

- **`Pages`**: For pages such as 1>set/reset token 2>tranform 3>Upload 4>Download UI components to open is decided on basis state called currentFigmaCmd

## Development Process

    Workflow :

    1> As Entry point is plugin/index.ts therefore the UI is opened on basis of commands
    2> While working with figma objets like creating editing node/image in figma we are using "figma.ui.onmessage" in  plugin/index.ts which receives Events/data from UI and passes to UI also on the basis of message type reveived.
    3> As to work with sdk operations we are using UI File (entry file:App.tsx) , to pass Events/data from UI to plugin we are using "parent.postMessage".

    Details :

    1> In operations where we need to draw boxes over an image , we are allowing user to draw boxes on smaller image shown in our plugin , but while saving those values we multiplying the co-ordinates with origin height and width of image so that correct selected region of image reflects on actual image also.
    2> We are fetching transformations list from "defaultPixelBinClient.assets.getModules()" from "@pixelbin/admin" and for passing the list of plugins to "@pixelbin/core" we are camel casing the names of transformations

**Clone Repository**:

    git clone https://github.com/pixelbin-dev/erasebg-figma-plugin.git

**Install Dependencies**:

    npm install -D

**Build the Plugin**:

    npm run create:build

**Add to Figma**:

- In Figma, navigate to 'Plugins' > 'Development' > 'New Plugin'.
- Choose 'Link existing plugin' and select the `manifest.json` file from your plugin's build directory.

## References

1. [Figma's introduction to plugin development](https://www.figma.com/plugin-docs/intro/)
2. [Figma Plugin's with UI guide](https://github.com/thomas-lowry/figma-plugin-ds?tab=readme-ov-file#checkbox)
3. [Figma's default color pallete](https://www.figma.com/plugin-docs/css-variables)
