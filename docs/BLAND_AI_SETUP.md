# Bland.ai Integration Setup

## Step 1: Get Your Bland.ai API Key

1. Go to https://bland.ai
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Copy your API key

## Step 2: Add to .env.local

Add this to your `.env.local` file:

```
BLAND_API_KEY=your_bland_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Set up Webhook (Production)

When deploying to production, configure the webhook URL in Bland.ai dashboard:
- Webhook URL: `https://yourdomain.com/api/bland/webhook`
- Bland.ai will POST call completion events to this endpoint

## Step 4: Test

1. Ensure you have a phone number saved in your profile (Voice Settings)
2. Create a call schedule
3. Click "Call Me Now (Bland.ai)"
4. You should receive a call on your phone within seconds

## Notes

- Bland.ai offers a generous free tier for testing
- Calls are typically 3-5 minutes per user inquiry
- All task questions are dynamically generated from user-defined tasks
- Call transcripts are automatically saved to your database

## Troubleshooting

- **No call received**: Check that your phone number is correctly saved in your profile
- **API key error**: Verify your BLAND_API_KEY is correct and not expired
- **Webhook not firing**: Ensure your production domain is correctly configured in Bland.ai
