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

## Development Process

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
