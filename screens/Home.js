import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  Image,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { getRentalListingsByEmail } from "../firebase-config";
import { createBooking } from "../firebase-config";

const SearchScreen = ({ user }) => {
  console.log("user", user);
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rentalListings, setRentalListings] = useState([]);
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
      setLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const fetchRentalListings = async () => {
        const city = await getLocationCity(
          location.latitude,
          location.longitude
        );
        const listings = await getRentalListingsByEmail(city);
        setRentalListings(listings);
      };
      fetchRentalListings();
    }
  }, [location]);

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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.summaryTitle}>Listing Summary:</Text>
              <TouchableOpacity onPress={handleCloseModal}>
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
                <Text style={styles.text}>Price:${selectedListing.price}</Text>
              </>
            )}
            <Button title="BOOK NOW" onPress={handleBookNow} />
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  photo: {
    width: 200,
    height: 150,
    resizeMode: "cover",
    marginBottom: 10,
  },
  text: {
    marginBottom: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SearchScreen;
