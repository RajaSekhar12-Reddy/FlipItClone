# BackPages Chrome Extension

A Chrome extension that provides instant access to community reviews, complaints, and advice for any website you visit.

## Features

- **Floating Button**: Quick access on every website
- **Popup Interface**: Compact view of website feedback
- **Context Menu**: Right-click to check or contribute
- **Real-time Data**: Live updates from BackPages community
- **Badge Notifications**: See content count at a glance

## Installation

1. **Download the Extension**
   - Download all files in the `chrome-extension` folder
   - Or clone this repository

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Setup**
   - The extension will automatically connect to your BackPages instance
   - For production, update the `baseUrl` in `popup.js`, `content.js`, and `background.js`

## Usage

### Popup Interface
- Click the BackPages icon in the toolbar
- View website statistics and recent activity
- Browse reviews, complaints, and advice
- Quick actions to add content

### Floating Button
- Appears on the right side of every webpage
- Hover to expand and show "BackPages" text
- Click to open the full back page for the current website

### Context Menu
- Right-click on any webpage
- Select "Check on BackPages" to view feedback
- Select "Write a Review" or "Report an Issue" to contribute

### Badge Notifications
- Shows the number of community contributions for the current website
- Appears as a small badge on the extension icon

## API Integration

The extension communicates with your BackPages instance via:
- `GET /api/website/<domain>` - Fetch website data

Ensure CORS is properly configured if running on different domains.

## Customization

### Changing Colors
Edit the CSS variables in `popup.css` and `content.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* etc... */
}
```

### Updating Base URL
Change the `baseUrl` in all three JavaScript files:
- `popup.js`
- `content.js` 
- `background.js`

### Icon Customization
Replace the icon files in the `icons/` folder or use the `create-icons.html` tool to generate new ones.

## Permissions

The extension requires these permissions:
- `activeTab` - Access current tab information
- `storage` - Store user preferences
- `tabs` - Create new tabs and get URLs
- `host_permissions` - Access BackPages API

## Browser Support

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Troubleshooting

### Extension Not Loading
- Ensure all files are in the correct directory structure
- Check for JavaScript errors in the extension console
- Verify manifest.json syntax

### Can't Connect to BackPages
- Check that your BackPages instance is running
- Verify the `baseUrl` in the JavaScript files
- Ensure CORS headers are set correctly

### Popup Not Showing Data
- Check browser console for network errors
- Verify the API endpoint `/api/website/<domain>` is working
- Test with a known website that has content

## Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon for the BackPages extension
4. Test your changes

The extension will automatically reload when you refresh it in the extensions page.