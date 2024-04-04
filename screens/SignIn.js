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
      {/* <View style={{ backgroundColor: "teal", borderRadius: 5, padding: 10 }}>
  
      </View> */}
      <Image
        style={{
          height: 200,
          width: 400,
          objectFit: "contain",
        }}
        source={require("../assets/companyLogo.png")}
      />
      <View style={{ flexDirection: "row", marginTop: -75 }}>
        <Image
          style={{
            height: 150,
            width: 150,
            objectFit: "contain",
            marginRight: -50,
            borderRadius: 30,
          }}
          source={require("../assets/gagan.png")}
        />
        <Image
          style={{
            height: 150,
            width: 150,
            objectFit: "contain",
            marginRight: -50,
            borderRadius: 30,
          }}
          source={require("../assets/leo.png")}
        />
        <Image
          style={{
            height: 150,
            width: 150,
            objectFit: "contain",
            borderRadius: 30,
          }}
          source={require("../assets/jd.png")}
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
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    justifyContent: "space-evenly",
    borderColor: "#151515",
    borderWidth: 10,
  },

  textInputStyles: {
    backgroundColor: "#dedede",
    borderWidth: 1,
    borderColor: "#D3d3d3",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },

  button: {
    padding: 10,
    backgroundColor: "#f1c40f",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
