import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "@rneui/themed";
import { useAuth } from "../../contexts/AuthProvider";
import Toast from "react-native-root-toast";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, error } = useAuth();

  async function signInWithEmail() {
    setLoading(true);
    await signIn(email, password);

    if (error) {
      // Alert.alert(error);
      let toast = Toast.show("Request failed to send.", {
        duration: Toast.durations.LONG,
      });
    }
    setLoading(false);
  }
  async function signUpWithEmail() {
    setLoading(true);
    await signUp(email, password);
    if (error) {
      Alert.alert(error);
    } else {
      Alert.alert("Check your email for the login link!");
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
