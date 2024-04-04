import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Text, Image } from "react-native";
import { db } from "../firebase-config";
import { collection, query, onSnapshot, where } from "firebase/firestore";

const MyReservationsScreen = ({ user }) => {
  const [rentalBookings, setRentalBookings] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "book"), where("userEmail", "==", user));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRentalBookings(updated);
    });

    // Cleanup function to unsubscribe from snapshot listener
    return () => unsubscribe();
  }, []); // Empty dependency array ensures that this effect runs only once on component mount

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {rentalBookings.map((booking, index) => (
        <View key={index} style={styles.bookingContainer}>
          <Image
            source={{ uri: booking.vehicleDetails?.image }}
            style={styles.vehicleImage}
          />
          <View style={styles.detailsContainer}>
            <Text style={styles.text}>
              Vehicle Name: {booking.vehicleDetails?.name}
            </Text>
            <Text style={styles.text}>
              Booking Date:{" "}
              {booking.bookingDate
                ? new Date(
                    booking.bookingDate.seconds * 1000
                  ).toLocaleDateString()
                : "Unknown"}
            </Text>
            <Text style={styles.text}>
              License Plate: {booking.licensePlate || "Unknown"}
            </Text>
            <Text style={styles.text}>
              Pickup Location:{" "}
              {`${booking.pickupLocation?.latitude}, ${booking.pickupLocation?.longitude}` ||
                "Unknown"}
            </Text>
            <Text style={styles.text}>Price: {booking.price || "Unknown"}</Text>
            <Text style={styles.text}>
              Booking Status: {booking.status || "Unknown"}
            </Text>
            {booking.status === "Confirmed" && (
              <Text style={styles.text}>
                Confirmation Code: {booking.confirmationCode || "Unknown"}
              </Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "90%",
  },
  vehicleImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    resizeMode: "contain",
  },
  detailsContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MyReservationsScreen;
