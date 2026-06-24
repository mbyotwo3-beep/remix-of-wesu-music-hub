import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wesu.music",
  appName: "Wesu+",
  webDir: "dist",
  server: {
    // For live-reload during development against the Lovable preview, uncomment:
    // url: 'https://id-preview--3d992fed-0a4b-4613-aa6b-368907935324.lovable.app',
    // cleartext: true,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#0a0a0f",
  },
};

export default config;
