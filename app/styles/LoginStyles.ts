import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -25
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  input: { flex: 1, height: 40, color: "#000" },
  button: {
    backgroundColor: "#1A2A6C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linksContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  link: { color: "#1A2A6C", textDecorationLine: "underline" },
  orText: { textAlign: "center", color: "#888", marginVertical: 15, fontSize: 12 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
  },
  googleButtonText: {
    marginLeft: 8, fontWeight: "bold", color: "#000"

  },
  legalText: {
    fontSize: 10, color: "#888", textAlign: "center", marginTop: 10

  },
  footerText: {
    fontSize: 12, color: "#888", textAlign: "center", marginTop: 20

  },
  //Estilo para el logo
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: -55,
    marginLeft: 45
  },

  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    marginTop: -55
  },

  largeLogo: {
    width: 300 * 0.8, // Más ancho
    height: 150 * 0.8, // Más alto
    marginBottom: 30,
  },

});
