import React, { useState } from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function OwnerHome() {
    const navigation = useNavigation();
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

    const handleDeliveryRequest = () => {
        const newCount = deliveryCount + 1;
        setDeliveryCount(newCount);

        // Show subscription modal if count reaches 7
        if (newCount >= 7) {
            setModalVisible(true);
        } else {
            navigation.navigate('Location');
        }
    };

    const handleSubscribe = () => {
        setModalVisible(false);
        setBottomSheetVisible(true); // Show bottom sheet for payment
    };

    const confirmSubscription = () => {
        // Logic for confirming subscription would go here
        setSubscriptionSuccess(true);
        setBottomSheetVisible(false);

        // Optionally reset delivery count or handle as needed
        setDeliveryCount(0); // Reset count after subscribing
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome To</Text>
            <Image
                style={styles.logo}
                source={require('../assets/img/blackText.png')}
            />
            <Text style={styles.label}>What are you going to deliver today?</Text>

            <View style={styles.row}>
                <TouchableOpacity onPress={handleDeliveryRequest}>
                    <Image style={styles.options} source={require('../assets/img/package.png')} />
                </TouchableOpacity>
            </View>

            {/* Subscription Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Choose Your Plan</Text>

                        <View style={styles.planContainer}>
                            <Text style={styles.planText}>Monthly Subscription</Text>
                            <Text style={styles.priceText}>₱299/month</Text>
                            <Text style={styles.benefitsText}>✓ Unlimited deliveries</Text>
                            <Text style={styles.benefitsText}>✓ Cancel anytime</Text>
                        </View>

                        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                            <Text style={styles.subscribeText}>Subscribe Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Sheet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={bottomSheetVisible}
                onRequestClose={() => setBottomSheetVisible(false)}
            >
                <View style={styles.bottomSheetContainer}>
                    {subscriptionSuccess ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={50} color="green" />
                            <Text style={styles.successMessage}>Success</Text>
                        </View>
                    ) : (
                        <View style={styles.bottomSheetView}>
                            <Text style={styles.bottomSheetTitle2}>Paymongo</Text>
                            <View style={styles.separator} />

                            <Text style={styles.bottomSheetTitle}>Monthly Subscription</Text>
                            <View style={styles.rowContainer}>
                                <Text style={styles.bottomSheetMessage1}>Starting today</Text>
                                <Text style={styles.bottomSheetMessage1}> ₱299/Month</Text>
                            </View>
                            <Text style={styles.bottomSheetMessage2}>
                                You can Cancel Anytime!
                            </Text>
                            <View style={styles.separator} />
                            <Text style={styles.bottomSheetMessage3}>
                                You'll be charged P299 automatically every month until you cancel.
                            </Text>
                            <Text style={styles.bottomSheetMessage}>
                                This is a test subscription. It will recur according to this schedule. You will not be charged.
                            </Text>
                            <TouchableOpacity style={styles.bottomSheetButton} onPress={confirmSubscription}>
                                <Text style={styles.bottomSheetButtonText}>Subscribe</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC93F',
    },
    welcome: {
        fontSize: 30,
        marginTop: 50,
        alignSelf: 'center'
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    logo: {
        marginTop: -60,
        marginBottom: -30,
        alignSelf: 'center',
        width: 350,
        height: 250,
    },
    options: {
        marginTop: 30,
    },
    deliveryCountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    planContainer: {
        backgroundColor: '#E9F5FF',
        borderRadius: 10,
        padding: 20,
        marginVertical: 15,
        width: '100%',
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#CCCCCC',
        marginVertical: 10,
    },
    planText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    priceText: {
        fontSize: 16,
        color: 'green',
        marginTop: 5,
    },
    benefitsText: {
        fontSize: 14,
        color: 'black',
        textAlign: 'left'
    },
    subscribeButton: {
        backgroundColor: 'maroon',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    subscribeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelText: {
        color: '#888',
        marginTop: 15,
        textDecorationLine: 'underline',
    },
    bottomSheetContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        margin: 0,
    },
    bottomSheetView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'left',
        elevation: 5,
    },
    successContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: 200,
    },
    checkIcon: {
        fontSize: 50,
        color: 'green',
    },
    successMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
    },
    bottomSheetTitle2: {
        fontSize: 18,
        fontWeight: 'medium',
        textAlign: 'left',
        color: '#868688',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bottomSheetMessage1: {
        fontSize: 15,
        textAlign: 'left',
        marginBottom: 10,
    },
    bottomSheetMessage2: {
        fontSize: 13,
        textAlign: 'left',
        color: 'gray',
    },
    bottomSheetMessage3: {
        fontSize: 11,
        textAlign: 'left',
        color: 'gray',
    },
    bottomSheetMessage: {
        fontSize: 11,
        marginBottom: 20,
        textAlign: 'left',
        color: 'gray',
    },
    bottomSheetButton: {
        backgroundColor: '#24B47E',
        padding: 7,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    bottomSheetButtonText: {
        color: 'white',
        fontWeight: 'medium',
        fontSize: 16,
    },
});
