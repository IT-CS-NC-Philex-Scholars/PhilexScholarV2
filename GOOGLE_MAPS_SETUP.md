# Google Maps API Setup for Places Autocomplete

This application uses Google Maps Places API for autocomplete functionality of city and province fields. Follow these steps to set up your Google Maps API key:

## Getting a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. Go to "Credentials" and create a new API key
5. Restrict the API key to only the APIs you need and set appropriate HTTP referrers

## Setting Up the Application

1. Copy your API key
2. Add it to your `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Restart your application if necessary

## Troubleshooting

- If you see "This page can't load Google Maps correctly" or similar errors in the console, check that your API key is correct and properly restricted
- Make sure the necessary APIs are enabled in your Google Cloud Console
- Check that your billing information is set up correctly in Google Cloud Console
- For local development, you may need to allow `localhost` in your API key restrictions

## Usage Tips

- The Places Input component uses shadcn/ui styling for consistent design
- It's configured to show only Philippines locations by default
- No maps are displayed - we're only using the address prediction and autocomplete functionality
- The component is optimized for low bandwidth usage since it doesn't load map tiles
- Error handling is improved to prevent "This page can't load Google Maps correctly" messages
- When you type in the Street Address field and select an option, it will:
  - Fill the street address field with the formatted street address
  - Automatically populate the City/Municipality field
  - Automatically populate the Province field
  - If available, it will also fill the Postal Code field
- When a city is selected, it will try to extract the province
- The province search specifically looks for administrative_area_level_1 components to match provinces like Benguet, Cebu, etc.
- Each field extracts the most appropriate components from Google's address data