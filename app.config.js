const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PRE = process.env.APP_VARIANT === 'preview';

console.log("process.env.APP_VARIANT", process.env.APP_VARIANT);
console.log("process.env.NODE_ENV", process.env.NODE_ENV);
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
      config: {
        usesNonExemptEncryption: false 
      }
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
      "expo-secure-store",
      [
        "expo-font"
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
