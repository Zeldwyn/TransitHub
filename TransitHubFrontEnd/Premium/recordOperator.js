import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions, Alert } from 'react-native';
import config from '../config';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Icon from 'react-native-vector-icons/Ionicons'; 

export default function RecordsOperator() {
  const [transactionData, setTransactionData] = useState([]);
  const [error, setError] = useState(null);
  const [pID, setPID] = useState(''); 
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
        console.log("OperatorID:", operatorID)
        console.log("Fetched User Type:", type);

        setPID(id);
        setOperatorID(operatorID); 
        setUserType(type);

        if (!oid && id) {
          // Fetch operatorID if it's not in AsyncStorage
          const response = await fetch(`${config.BASE_URL}/getOperatorID?premiumUserID=${operatorID}`);
          const data = await response.json();

          if (response.ok && data.operatorID) {
            await AsyncStorage.setItem('operatorID', data.operatorID.toString());
            setPID(data.operatorID);
          } else {
            setError('Failed to fetch operator ID');
          }
        }

        if (id && type) {
          fetchData(type, id, oid || data.operatorID); // Use fetched operatorID if available
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
      let endpoint = activeTab === 'Pending' ? '/pendingOperatorBookings' : '/completedOperatorBookings';
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

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    if (Array.isArray(data)) {
      // Handle array of objects
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','), // Header row
        ...data.map(row =>
          headers.map(header => JSON.stringify(row[header] || '')).join(',')
        ) // Data rows
      ];

      return csvRows.join('\n');
    } else if (typeof data === 'object') {
      // Handle single object
      const headers = Object.keys(data);
      const csvRows = [
        headers.join(','), // Header row
        headers.map(header => JSON.stringify(data[header] || '')).join(',')
      ];

      return csvRows.join('\n');
    }

    return '';
  };

  const handleExport = async () => {
    if (!selectedRecord) {
      Alert.alert('No data to export');
      return;
    }

    const clientName = selectedRecord.clientName || 'UnknownClient';
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric characters with underscores
    const fileName = `${sanitizedClientName}_data.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    const csvData = convertToCSV(selectedRecord);

    try {
      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    }
  };

  const handleExportAll = async () => {
    if (transactionData.length === 0) {
      Alert.alert('No data to export');
      return;
    }

    const fileName = 'all_records_data.csv';
    const fileUri = FileSystem.documentDirectory + fileName;

    const csvData = convertToCSV(transactionData);

    try {
      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    }
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
                  <Icon name="download-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
            </View>
        </Modal>
      )}

      <View style={styles.searchExportContainer}>
        <TouchableOpacity style={styles.exportButtonAll} onPress={handleExportAll}>
          <Icon name="download-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Export All Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC93F',
    padding: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: "100%"
  },
  navButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  activeNavButton: {
    borderBottomColor: `green`,
    borderBottomWidth: 2
  },
  navButtonText: {
    fontSize: 16,
    color: '#000',
  },
  searchExportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "50%",
    justifyContent: 'center',
    backgroundColor: "#800000",
  },
  exportButtonAll: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#800000",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  list: {
    padding: "10",
    flex: 1,
  },
  transactionBox: {
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: "maroon",
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: "70%",
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    width: '100%',
  },
  modalDetails: {
    marginBottom: 10,
    width: "100%",
  },
  modalText: {
    fontWeight: 'bold',
  },
  modalValue: {
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  closeButton: {
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "50%",
  },
  closeButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
