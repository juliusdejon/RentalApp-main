import { initializeApp } from "firebase/app";
import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
    addDoc,
} from "firebase/firestore";
import { reverseGeocodeAsync } from 'expo-location';
import * as Location from 'expo-location';

import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCgUnbK9pq2aofP3jQbGeVML50NRozv-SA",
    authDomain: "evrentalapp.firebaseapp.com",
    projectId: "evrentalapp",
    storageBucket: "evrentalapp.appspot.com",
    messagingSenderId: "70861969734",
    appId: "1:70861969734:web:1ab9b625a36f4cebffed47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services (database, auth, etc)
const auth = getAuth(app);

const db = getFirestore(app);

const createRentalListing = async (vehicle) => {
    try {
        const docRef = await addDoc(collection(db, "bookings"), vehicle);
        console.log("Document written with ID: ", docRef.id);
        return [null, docRef.id];
    } catch (e) {
        console.error("Error adding document: ", e);
        return [e, null];
    }
};

const createBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, "book"), bookingData);
        console.log("Booking created with ID: ", docRef.id);
        return [null, docRef.id];
    } catch (e) {
        console.error("Error adding booking: ", e);
        return [e, null];
    }
};




const getRentalListingsByEmail = async (userEmail) => {
    // Get user's location (latitude and longitude)
    let userLocation = null;
    try {
        userLocation = await Location.getCurrentPositionAsync({});
    } catch (error) {
        console.log("Error getting user's location: ", error);
        return [];
    }

    const q = query(collection(db, "rentals"));
    const results = [];
    try {
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
            const rentalData = doc.data();
            // Get city name from rental listing's latitude and longitude
            const city = await reverseGeocodeAsync({ latitude: rentalData.latitude, longitude: rentalData.longitude });
            const rentalCity = city[0].city;

            // Get user's city name from user's location
            const userCity = await reverseGeocodeAsync({ latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude });

            // Compare cities and push rental listings if they match
            if (userCity[0].city === rentalCity) {
                results.push(rentalData);
            }
        }
    } catch (error) {
        console.log(error);
    }
    return results;
};
const getRentalBookingsByUser = async (userEmail) => {
    const q = query(collection(db, "book"), where("userEmail", "==", userEmail));
    const results = [];
    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
            results.push({ bookingId: doc.id, ...doc.data() });
        });
    } catch (error) {
        console.log(error);
    }
    return results;
};

export {
    db,
    auth,
    signInWithEmailAndPassword,
    signOut,
    createRentalListing,
    getRentalListingsByEmail,
    createBooking,
    getRentalBookingsByUser,
};