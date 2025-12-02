The issue with the Facebook button not being clickable and the request for a slider-like switch for content toggling has been addressed.

Here's a summary of the changes implemented:

1.  **`index.html` Modifications:**
    *   The original `<div class="cta-row">` containing the "See Instagram Feed" and "See Facebook Feed" buttons has been replaced with a new structure:
        ```html
        <div id="social-media-tabs" class="social-media-tabs">
          <a id="cta-instagram-feed" class="tab-button active" href="javascript:void(0);">Instagram</a>
          <a id="cta-facebook-feed" class="tab-button" href="javascript:void(0);">Facebook</a>
        </div>
        ```
    *   This new structure provides two clickable "tab-button" elements within a `social-media-tabs` container. The separate `<div class="tab-slider"></div>` element, which was previously intended for the visual slider effect, has been removed to simplify the implementation and avoid potential click interception issues.

2.  **`style.css` Modifications:**
    *   New styles were added for `.social-media-tabs` to create a pill-shaped container, centering it on the page.
    *   Styles for `.tab-button` were defined, giving them padding, border-radius, and transitions for color and background.
    *   Crucially, the `.tab-button.active` class now directly applies `background-color: var(--primary);` and `color: var(--on-primary);`. This means that when a tab button is active, it visually takes on the primary color, creating the "slider" effect without needing a separate moving element.
    *   All CSS rules related to the `.tab-slider` element (e.g., its absolute positioning, width, and transform) have been removed.
    *   Any temporary background colors added for debugging inactive tab buttons were also removed.

3.  **`script.js` Modifications:**
    *   The JavaScript code was updated to reflect the new HTML structure. References to `ctaInstagramFeed` and `ctaFacebookFeed` now point to the `tab-button` elements.
    *   The `activateTab` function was updated to only manage the `active` class on the `tab-button` elements and control the visibility of content sections (`instagramSections` and `facebookSections`).
    *   All JavaScript code related to finding, positioning, and animating the `tabSlider` element (including the `moveSlider` function and the `window.addEventListener('resize')` for slider recalculation) has been removed, significantly simplifying the client-side logic.

**Current State of the "Slider":**
The implementation now features a click-based tab system that visually resembles a slider. When you click "Instagram" or "Facebook", the respective tab button highlights with the primary color, and the content below switches accordingly. This resolves the previous issue where the Facebook button was not clickable.

**Regarding Drag-and-Drop:**
The original request also mentioned a "Slider switch that maybe starts in the center then you can drag it right or left". The current implementation provides a click-based visual slider, but does *not* include drag-and-drop functionality. Implementing drag-and-drop would be a more complex feature requiring additional JavaScript to handle mouse/touch events, movement calculations, and UI updates.

**To verify the updates:**
1.  Ensure you have the `.env` file set up as instructed previously (if you want to see live Facebook data).
2.  Navigate to the project's root directory: `C:\Users\custs\Desktop\AlphaPulse`
3.  Run `npm start` in your terminal.
4.  Open your web browser and go to `http://localhost:3000`.

You should now see the updated tab switcher where both "Instagram" and "Facebook" tabs are clickable and visually indicate their active state. Please verify this and let me know if the issue is resolved to your satisfaction, or if you wish to proceed with implementing the drag-and-drop functionality (which would be a new, more involved task).