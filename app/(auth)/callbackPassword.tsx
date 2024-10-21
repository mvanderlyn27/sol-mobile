import { useAuth } from "@/src/contexts/AuthProvider";
import { Redirect, usePathname } from "expo-router";
import * as Linking from "expo-linking";
import { Text } from "react-native";
import { useEffect } from "react";
export default function Callback() {
  const { session, signInWithToken } = useAuth();
  //   const url = useURL();
  const pathname = usePathname();
  console.log("url from this thing", pathname);
  console.log("url from this thing");
  //   const url = await Linking.getInitialURL();
  //   console.log ("url callback", url);
  const parseSupabaseUrl = (url: string) => {
    let parsedUrl = url;
    if (url.includes("#")) {
      parsedUrl = url.replace("#", "?");
    }

    return parsedUrl;
  };
  const checkDeepLink = async () => {
    const url = await Linking.getInitialURL();
    console.log("url callback", url);
    if (url) {
      const parsedUrl = parseSupabaseUrl(url);
      const { hostname, path, queryParams } = Linking.parse(parsedUrl);
      console.log("hostname", hostname, "path", path, "queryParams", queryParams);
      if (queryParams && queryParams.token) {
        const token = queryParams.token;
        const method = queryParams.method;
        console.log("token", token, "method", method);
        const parsedToken = Array.isArray(token) ? token[0] : token;
        const parsedMethod = Array.isArray(method) ? method[0] : method;
        if (token) {
          await signInWithToken(parsedToken, parsedMethod);
        }
      }
    }
  };
  useEffect(() => {
    checkDeepLink();
  }, []);
  return <Redirect href="/login" />;
}
