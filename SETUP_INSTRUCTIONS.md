# Setup Instructions for Driver App

## Important: API Configuration for Mobile Testing

When testing on a **physical device** (not emulator), you need to update the API base URL:

1. Find your computer's IP address:
   - Windows: Open CMD and run `ipconfig` - look for IPv4 Address
   - Mac/Linux: Run `ifconfig` or `ip addr`

2. Update `src/config/api.ts`:
   ```typescript
   const LOCAL_BASE_URL = 'http://YOUR_IP_ADDRESS:3000';
   // Example: 'http://192.168.1.100:3000'
   ```

3. Make sure your backend server is running and accessible:
   ```bash
   cd nest-mongo
   npm run start:dev
   ```

4. Ensure both your phone and computer are on the same WiFi network

## Testing Chapa Payment

1. Make sure your backend has `CHAPA_SECRET_KEY` set in `.env`
2. The Chapa payment URL will open in the browser
3. After payment, you'll be redirected back
4. Check your wallet balance to confirm the recharge

## Debugging Tips

- Check the console logs in Expo/Metro bundler for API responses
- Verify the backend is running and accessible
- Check network connectivity between device and backend
- Ensure CORS is properly configured on the backend (if needed)
