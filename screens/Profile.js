import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
function ProfileScreen(props) {
  const { onLogout, user } = props;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: "#34495e",
        }}
      ></View>

      <View
        style={{
          flex: 3,
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 20,
          bottom: 120,
        }}
      >
        <Image
          style={styles.imageStyle}
          source={require("../assets/icon.png")}
        />
        <Text style={styles.welcomeText}>Renter</Text>
        <Text>{user}</Text>
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 27,
    fontWeight: "bold",
    marginVertical: 10,
  },

  button: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageStyle: {
    width: 200,
    height: 200,
    borderColor: "black",
    borderRadius: 100,
    backgroundColor: "#97E7E1",
    marginVertical: 10,
    borderColor: "black",
    borderWidth: 0.5,
  },
});
