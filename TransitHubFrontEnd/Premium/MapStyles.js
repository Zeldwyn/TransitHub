import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'space-between',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'white',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginRight: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  nextPageContainer: {
    padding: 10,
  },
  pageText: {
    marginBottom: 10,
  },
  inputBox: {
    width: "70%",
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    height: 40,
  },
  boldText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
});
