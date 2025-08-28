# IntelliSwipe Advisor (Vite + React)

This is a browser extension that acts as a Tinder advisor, providing a "Match Score" for profiles based on your preferences.

## Development Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will watch for file changes and automatically rebuild the extension.

## How to Install

1.  **Build the Extension:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready extension files.

2.  **Load into Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked" and select the `dist` directory that was created in the previous step.
    - The IntelliSwipe Advisor extension should now be active.

## How to Use

1.  Navigate to Tinder.com.
2.  Click on the IntelliSwipe Advisor extension icon in your browser toolbar.
3.  Enter your preferences (likes and dislikes) in the popup and click "Save".
4.  As you browse Tinder profiles, you will see a "Match Score" overlay with an analysis based on your preferences.

**Note:** The selectors used to find the bio and profile information on Tinder's website may change, which could cause the extension to stop working. This is an inherent challenge of building on top of another platform's UI.