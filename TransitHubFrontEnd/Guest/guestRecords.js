import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, } from 'react-native';

export default function GuestRecords() {
  const [transactionData, setTransactionData] = useState([]);
  const [error, setError] = useState(null);
  const [deviceID, setDeviceID] = useState('');

  useEffect(() => {
    const getDeviceID = async () => {
      const id = await AsyncStorage.getItem('deviceID');
      console.log("ID: ", id);
      setDeviceID(id);
    };
    getDeviceID();
  });

  useEffect(() => {
    fetch('http://192.168.1.6:8080/display-TransactionGuest', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "deviceID": deviceID,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setTransactionData(data.result);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch transaction data');
        }
      })
      .catch((error) => {
        setError('Failed to fetch transaction data');
        console.error('Error:', error);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {transactionData.length === 0 && !error && <Text>Loading...</Text>}
      {transactionData.map((transaction, index) => (
        <View key={index} style={styles.transactionBox}>
          <Text style={styles.text}>To Location: {transaction.toLocation}</Text>
          <Text style={styles.text}>From Location: {transaction.fromLocation}</Text>
          <Text style={styles.date}>Date: {transaction.created_at}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  transactionBox: {
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    backgroundColor: 'maroon',
  },
  text: {
    fontSize: 16,
    color: 'white',
    margin: 3,
  },
  date: {
    fontSize: 12,
    flexDirection: 'row-reverse',
    color: 'white',
    margin: 3,
  },
});
