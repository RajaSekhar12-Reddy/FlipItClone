# BackPages Chrome Extension

## Installation Instructions

### Quick Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select this `chrome-extension` folder
5. The BackPages icon should appear in your toolbar

### Generating Better Icons (Optional)
1. Open `create-icons.html` in your browser
2. Click "Generate Icons" button
3. Replace the downloaded files in the `icons/` folder

### Features
- **Popup**: Click the toolbar icon to see website info
- **Floating Button**: Appears on websites for quick access
- **Context Menu**: Right-click for BackPages options
- **Badge**: Shows content count for current website

### Troubleshooting
- Make sure BackPages app is running on localhost:5000
- Check Developer Tools console for errors
- Reload the extension if it's not working

### Development
- Edit files and click "Reload" in `chrome://extensions/`
- Check popup.html, content.js, and background.js for main functionality
- Modify manifest.json for permissions and settings