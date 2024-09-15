import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import config from '../config';

export default function Records() {
  const [transactionData, setTransactionData] = useState([]);
  const [error, setError] = useState(null);
  const [pID, setPID] = useState(''); // premiumUserID
  const [operatorID, setOperatorID] = useState(''); // Added for operatorID
  const [userType, setUserType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserID = async () => {
      try {
        const id = await AsyncStorage.getItem('premiumUserID');
        const oid = await AsyncStorage.getItem('operatorID');
        const type = await AsyncStorage.getItem('userType');
        console.log("Fetched premium ID:", id);
        //console.log("Fetched operator ID:", oid); fuck this no record for transport operator, kapoy na
        console.log("Fetched User Type:", type);

        setPID(id);
        setOperatorID(oid); 
        setUserType(type);

        if (id && type) {
          fetchData(type, id, oid); 
        } else {
          setError('User data is not available');
          setLoading(false); 
        }
      } catch (error) {
        setError('Failed to get user data');
        console.error('AsyncStorage error:', error);
        setLoading(false); 
      }
    };

    getUserID();
  }, [activeTab]);

  const fetchData = async (userType, premiumUserID, operatorID) => {
    setLoading(true);
    try {
      let endpoint = activeTab === 'Pending' ? '/pendingBookings' : '/completedBookings';
      let query = `?userType=${userType}&premiumUserID=${premiumUserID}`;
      if (userType === 'operator') {
        query += `&operatorID=${operatorID}`;
      }

      const response = await fetch(`${config.BASE_URL}${endpoint}${query}`);
      const data = await response.json();

      console.log("Fetched transaction data:", data); // Debugging line

      if (response.ok) {
        setTransactionData(data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (bookingID) => {
    try {
      const response = await fetch(`${config.BASE_URL}/bookingDetails/${bookingID}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedRecord(data);
        setModalVisible(true);
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (err) {
      setError('Failed to fetch booking details');
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(userType, pID, operatorID); // Fetch data based on the active tab
  };

  const handleExport = () => {
 
    console.log('Exporting data:', selectedRecord);
  };

  const { width } = Dimensions.get('window'); // Get screen width

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'Pending' && styles.activeNavButton]}
          onPress={() => handleTabChange('Pending')}
        >
          <Text style={styles.navButtonText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'Completed' && styles.activeNavButton]}
          onPress={() => handleTabChange('Completed')}
        >
          <Text style={styles.navButtonText}>Completed</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.list}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading && !error && <Text style={styles.loadingText}>Loading...</Text>}
        {transactionData.length === 0 && !error && !loading && <Text style={styles.noDataText}>No records found</Text>}
        {transactionData.map((transaction, index) => (
          <TouchableOpacity key={index} onPress={() => fetchBookingDetails(transaction.bookingID)}>
            <View style={styles.transactionBox}>
              <Text style={styles.text}>Client Name: {transaction.clientName || 'N/A'}</Text>
              <Text style={styles.text}>Date Booked: {transaction.startDate ? new Date(transaction.startDate).toLocaleDateString() : 'N/A'}</Text>
              <Text style={styles.text}>Fee: ₱{transaction.expectedFee || 'N/A'}</Text>
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
            <View style={[styles.modalContainer, { width: width * 0.9 }]}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>Operator Name:</Text>
                  <Text style={styles.modalValue}>{selectedRecord.operatorFirstName} {selectedRecord.operatorLastName || 'N/A'}</Text>
                </View>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>Operator Email:</Text>
                  <Text style={styles.modalValue}>{selectedRecord.operatorEmail || 'N/A'}</Text>
                </View>
                {Object.entries(selectedRecord).map(([key, value]) => (
                  key !== 'bookingID' && key !== 'operatorFirstName' && key !== 'operatorLastName' && key !== 'operatorEmail' ? (
                    <View key={key} style={styles.modalDetails}>
                      <Text style={styles.modalText}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</Text>
                      <Text style={styles.modalValue}>{value || 'N/A'}</Text>
                    </View>
                  ) : null
                ))}
              </ScrollView>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                  <Text style={styles.exportButtonText}>Export</Text>
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
    backgroundColor: "#FFC93F",
    padding: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    width: "50%",
    borderBottomColor: 'transparent',
  },
  activeNavButton: {
    borderBottomColor: '#4CAF50',
  },
  navButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  transactionBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: "70%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalContent: {
    flexGrow: 1,
  },
  modalDetails: {
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  exportButton: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
