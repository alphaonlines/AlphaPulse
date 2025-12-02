It seems the server-side code (`server.js`) is correctly set up to fetch data from the Facebook API using environment variables. If you're still not seeing live data, the issue almost certainly lies with the Facebook API credentials you're providing or a problem during the API call itself.

Here's what you need to do to diagnose and fix the problem:

1.  **Verify your `.env` file:**
    *   Ensure you have a file named `.env` (no extension!) located in `C:\Users\custs\Desktop\AlphaPulse\AlphaPulse\`.
    *   Inside this `.env` file, you *must* have the correct values for `FACEBOOK_ACCESS_TOKEN` and `FACEBOOK_PAGE_ID`. The `FACEBOOK_APP_ID` is also good to have, but the server code specifically uses the `ACCESS_TOKEN` and `PAGE_ID` for API calls.
    *   **Crucially:** Your `FACEBOOK_ACCESS_TOKEN` needs to be a **Page Access Token** with sufficient permissions to read page information (like fan count) and posts. User access tokens can expire quickly or lack necessary permissions. You typically get a Page Access Token after authenticating a user and granting your app permissions to manage pages.

2.  **Check the Server Logs for Errors:**
    *   Go back to the terminal where you ran `npm start`.
    *   Look for any red error messages, especially those starting with `Error fetching Facebook data:` or similar. These messages come directly from the `server.js` catch block and will tell us if the server encountered a problem when trying to communicate with Facebook.

3.  **Validate your Facebook Access Token:**
    *   Facebook Access Tokens can expire. You can use Facebook's [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to test your access token and see if it's valid and has the required permissions.
    *   Ensure the token has permissions like `pages_read_engagement`, `pages_show_list`, etc., to access page data.

Please check the server logs and your `.env` file, especially the validity and permissions of your `FACEBOOK_ACCESS_TOKEN`. Share any error messages from the server logs.