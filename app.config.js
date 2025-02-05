const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PRE = process.env.APP_VARIANT === 'preview';

export default {
    name: IS_DEV ? "SOL(Dev)" : IS_PRE ? "SOL (Preview)" : "Slice of Life App",
    slug: "slice-of-life",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "sliceoflife",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#0B0C06"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV ? "com.sliceoflifeapp.dev" : IS_PRE ? "com.sliceoflifeapp.pre" : "com.sliceoflifeapp",
      usesAppleSignIn: true,
      config: {
        usesNonExemptEncryption: false 
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon/foreground.png",
        backgroundImage: "./src/assets/images/adaptive-icon/background.png"
      },
      package: IS_DEV ? "com.sliceoflifeapp.dev" : IS_PRE ? "com.sliceoflifeapp.pre" : "com.sliceoflifeapp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
      "expo-notifications",
      {
        "enableBackgroundRemoteNotifications": true 
      }
      ],
      "expo-secure-store",
      [
      "expo-build-properties",
      {
        android: {
            enableProguardInReleaseBuilds: true,
        }
      }
      ],
      "expo-apple-authentication",
      [
        "expo-font"
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_URL,
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "ce0eb959-ac1b-41d5-8b08-416d64c88369"
      }
    },
    updates: {
        url: "https://u.expo.dev/ce0eb959-ac1b-41d5-8b08-416d64c88369"
      },
      runtimeVersion: {
        "policy": "appVersion"
    },
    owner: "sliceoflife"
};
