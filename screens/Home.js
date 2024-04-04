import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import { query, collection, onSnapshot } from "firebase/firestore";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { createBooking, db } from "../firebase-config";
import * as Location from "expo-location";

const SearchScreen = ({ user }) => {
  console.log("user", user);
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rentalListings, setRentalListings] = useState([]);
  const [userCity, setCity] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currCity = await getLocationCity(
        location.coords.latitude,
        location.coords.longitude
      );
      setCity(currCity);

      setLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const q = query(collection(db, "rentals"));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const results = [];

        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const rentalData = doc.data();
            // Get city name from rental listing's latitude and longitude
            const city = await Location.reverseGeocodeAsync({
              latitude: rentalData.latitude,
              longitude: rentalData.longitude,
            });
            const rentalCity = city[0].city;

            // Compare cities and push rental listings if they match
            if (userCity === rentalCity) {
              results.push(rentalData);
            }
          })
        );

        setRentalListings(results);
      });

      // Cleanup function to unsubscribe from snapshot listener
      return () => unsubscribe();
    }
  }, [location, userCity]);

  const getLocationCity = async (latitude, longitude) => {
    try {
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return response[0].city;
    } catch (error) {
      console.log("Error fetching city: ", error);
      return null;
    }
  };

  const handleMarkerPress = (listing) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const getRandomFutureDate = () => {
    const today = new Date();
    const futureDate = new Date(
      today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    return futureDate;
  };

  const handleBookNow = async () => {
    if (!selectedListing || !selectedListing.ownerEmail) {
      console.error("Selected listing or owner information is missing.");
      console.log("Selected Listing:", selectedListing);
      return;
    }

    const bookingDate = getRandomFutureDate();

    const message = `Booking attempted for ${
      selectedListing.name
    } on ${bookingDate.toDateString()}. Waiting for approval...`;
    console.log(message);
    console.log("Here is the user ", user);
    Alert.alert("Booking Attempted", message);

    // Prepare data for booking
    const bookingData = {
      vehicleDetails: {
        name: selectedListing.name,
        image: selectedListing.photo,
      },
      bookingDate: bookingDate.toString(),
      licensePlate: selectedListing.licensePlate,
      pickupLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      price: selectedListing.price,
      ownerEmail: selectedListing.ownerEmail, // Include only ownerEmail
      status: "Pending",
      confirmationCode: null,
      userEmail: user, // Add user's email to the booking data
    };

    // Add booking to Firestore
    await createBooking(bookingData);

    setModalVisible(false); // Close the modal after attempting to book
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleRegionChangeComplete = async (region) => {
    console.log(region);

    const currCity = await getLocationCity(region.latitude, region.longitude);
    setCity(currCity);

    setLocation({ latitude: region.latitude, longitude: region.longitude });

    // setCurrentRegion(region);
    // Do something with the updated region, such as reverse geocoding
    // You can fetch city information based on the new region here
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {rentalListings.map((listing, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: listing.latitude,
                longitude: listing.longitude,
              }}
              title={listing.address}
              description={`Price: $${listing.price}`}
              onPress={() => handleMarkerPress(listing)}
            >
              <View style={styles.markerContainer}>
                <TouchableOpacity onPress={() => console.log("Marker clicked")}>
                  <View style={styles.markerPrice}>
                    <Text style={{ color: "black" }}>${listing.price}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* <ImageBackground
            source={require('../assets/bolt.png')} // Adjust the path to your image
            style={styles.imageBackground}
          > */}
          <View style={styles.modalContent}>
            {/* <ImageBackground
    source={require("../assets/bolt.png")}
    style={styles.imageBackground}
  > */}
            <View style={styles.modalHeader}>
              <Text style={styles.summaryTitle}>Listing Summary:</Text>
              <TouchableOpacity
                style={styles.closeButtonContainer}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>
            {selectedListing && (
              <>
                <Image
                  source={{ uri: selectedListing.photo }}
                  style={styles.photo}
                  onError={(error) =>
                    console.error("Error loading image:", error)
                  }
                />
                <Text style={styles.text}>
                  Car Name: {selectedListing.name}
                </Text>
                <Text style={styles.text}>
                  Address: {selectedListing.address}
                </Text>
                <Text style={styles.text}>MSRP: ${selectedListing.msrp}</Text>
                <Text
                  style={[
                    styles.text,
                    { fontSize: 18, color: "darkgreen", fontWeight: "bold" },
                  ]}
                >
                  Price: ${selectedListing.price}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <Text style={styles.bookNowText}>BOOK NOW</Text>
            </TouchableOpacity>
            {/* </ImageBackground> */}
          </View>
          {/* </ImageBackground> */}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerPrice: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgb(127, 255, 212)",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#7FFFD4",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: "80%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "black",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  closeButton: {
    fontSize: 23,
    fontWeight: "bold",
    color: "red",
  },
  closeButtonContainer: {
    position: "absolute",
    marginLeft: 205,
    marginTop: -45,
    // top: -50,
    // right: -60,
  },

  photo: {
    width: 200,
    height: 150,
    resizeMode: "cover",
    marginBottom: 10,
  },
  text: {
    marginBottom: 5,
    fontFamily: "Futura",
    fontSize: 17,
  },
  summaryTitle: {
    fontFamily: "Futura",
    fontSize: 18,
    fontWeight: "bold",
  },
  bookNowButton: {
    backgroundColor: "navy",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 20,
  },
  bookNowText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SearchScreen;
