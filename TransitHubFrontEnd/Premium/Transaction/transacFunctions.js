import { useState } from 'react';

export const useRegion = () => {
    const [region, setRegion] = useState({
        latitude: 10.3157,
        longitude: 123.8854,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    return { region, setRegion };
};

export const calculateDistance = async (fromCoords, toCoords, setExpectedDistance, setExpectedDuration, GOOGLE_MAPS_API_KEY) => {
    if (fromCoords && toCoords) {
        const origin = `${fromCoords.latitude},${fromCoords.longitude}`;
        const destination = `${toCoords.latitude},${toCoords.longitude}`;

        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`);
            if (!response.ok) {
                throw new Error('Network response was not okin maps');
            }
            const result = await response.json();

            if (result.rows[0].elements[0].status === "OK") {
                const distanceInMeters = result.rows[0].elements[0].distance.value;
                const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                const durationInSeconds = result.rows[0].elements[0].duration.value;
                const durationInMinutes = Math.ceil(durationInSeconds / 60); 

                setExpectedDistance(distanceInKm);
                setExpectedDuration(durationInMinutes);
            }
        } catch (error) {
            console.error("Error fetching distance and duration:", error);
        }
    }
};

export const computeDateRange = (markedDates) => {
    const dates = Object.keys(markedDates);
    if (dates.length === 0) {
        return { firstDate: "", lastDate: "" };
    }
    const sortedDates = dates.sort();
    return { firstDate: sortedDates[0], lastDate: sortedDates[sortedDates.length - 1] };
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
};

export const getFormattedDateRange = (markedDates) => {
    const dates = Object.keys(markedDates);
    if (dates.length === 0) return ''; 
    const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
    const firstDate = formatDate(sortedDates[0]);
    const lastDate = formatDate(sortedDates[sortedDates.length - 1]);
    return sortedDates.length === 1 ? firstDate : `${firstDate} - ${lastDate}`;
};

export const calculateFee = (first2km, succeedingKm, expectedDistance, vehicleFee) => {
    // Convert state values to numbers
    const first2kmRate = parseFloat(first2km) || 0; 
    const succeedingKmRate = parseFloat(succeedingKm) || 0; 
    const distance = parseFloat(expectedDistance) || 0;
    const vehicleFeeAmount = parseFloat(vehicleFee) || 0; 

    let fee = 0;

    if (distance <= 2) {
        fee = first2kmRate;
    } else {
        fee = first2kmRate;
        const additionalDistance = distance - 2;
        fee += additionalDistance * succeedingKmRate;
    }
    fee += vehicleFeeAmount;

    return parseFloat(fee.toFixed(2)); 
};
