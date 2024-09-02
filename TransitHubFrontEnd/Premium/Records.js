import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

export default function Records() {
  const [transactionData, setTransactionData] = useState([]);
  const [error, setError] = useState(null);
  const [pID, setPID] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const getUserID = async () => {
      const id = await AsyncStorage.getItem('premiumUserID');
      console.log("ID: ", id);
      setPID(id);
    };
    getUserID();
  }, []);

  useEffect(() => {
    fetch('http://192.168.5.45:8080/display-TransactionPremium', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "premiumUserID": parseInt(pID),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setTransactionData(data.result);
          console.log(data.result);
          setError(null);
        } else {
          setError('Failed to fetch transaction data');
        }
      })
      .catch((error) => {
        setError('Failed to fetch transaction data');
        console.error('Error:', error);
      });
  }, [pID]);

  const handleRecordPress = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const exportAsPDF = () => {
    // Handle PDF export functionality here
    console.log('Export as PDF');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {transactionData.length === 0 && !error && <Text>Loading...</Text>}
        {transactionData.map((transaction, index) => (
          <TouchableOpacity key={index} onPress={() => handleRecordPress(transaction)}>
            <View style={styles.transactionBox}>
              <Text style={styles.text}>To Location: {transaction.toLocation}</Text>
              <Text style={styles.text}>From Location: {transaction.fromLocation}</Text>
              <Text style={styles.date}>Date: {transaction.created_at}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedRecord && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>To Location:</Text>
                <Text style={styles.modalDetailText}>{selectedRecord.toLocation}</Text>
              </View>
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>From Location:</Text>
                <Text style={styles.modalDetailText}>{selectedRecord.fromLocation}</Text>
              </View>
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>Date:</Text>
                <Text style={styles.modalDetailText}>{selectedRecord.created_at}</Text>
              </View>
              <Text style={styles.modalText}>Package Width:</Text>
              <Text style={styles.modalText}>Package Height:</Text>
              <Text style={styles.modalText}>Package Weight:</Text>
              <Text style={styles.modalText}>First 2Km:</Text>
              <Text style={styles.modalText}>Succeeding Km:</Text>
              <Text style={styles.modalText}>Distance:</Text>
              <Text style={styles.modalText}>Fuel Allowance:</Text>
              <Text style={styles.modalText}>Total Fee:</Text>
              <Text style={styles.modalText}>Additional Info:</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={exportAsPDF}>
                  <Icon name="document-text" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Icon name="close" size={30} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDetailText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right', // Adjust alignment as needed
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
