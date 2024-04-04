import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";
const SignIn = (props) => {
  const { onLogin } = props;
  const [emailFromUI, setEmailFromUI] = useState("renter@email.com");
  const [passwordFromUI, setPasswordFromUI] = useState("123456");

  return (
    <View style={styles.outerContainer}>
      <View style={{ backgroundColor: "teal", borderRadius: 5, padding: 10 }}>
        <Image
          style={{
            height: 200,
            width: 400,
            objectFit: "contain",
            borderRadius: 30,
          }}
          source={require("../assets/companyLogo.png")}
        />
      </View>

      <View style={styles.innerContainer}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>Sign In</Text>
        <TextInput
          style={styles.textInputStyles}
          placeholder="Enter Email"
          onChangeText={setEmailFromUI}
          value={emailFromUI}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.textInputStyles}
          placeholder="Enter Password"
          onChangeText={setPasswordFromUI}
          value={passwordFromUI}
          secureTextEntry={true}
          keyboardType="default"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => onLogin(emailFromUI, passwordFromUI)}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default SignIn;

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  innerContainer: {
    width: "90%",
    height: "50%",
    backgroundColor: "#f1c40f",
    borderRadius: 10,
    padding: 20,
    justifyContent: "space-evenly",
    borderColor: "black",
    borderWidth: 2,
  },

  textInputStyles: {
    backgroundColor: "lightgray",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },

  button: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
