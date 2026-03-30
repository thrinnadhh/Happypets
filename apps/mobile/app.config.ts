// apps/mobile/app.config.ts (partial)
export default {
  expo: {
    scheme: 'thehappypets',
    plugins: [
      ['expo-linking'], // For Razorpay UPI intent callbacks
    ],
    android: {
      intentFilters: [
        {
          action: 'VIEW',
          data: [{ scheme: 'thehappypets', host: 'payment-callback' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
  },
};
