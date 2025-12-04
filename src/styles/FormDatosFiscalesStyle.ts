import { StyleSheet } from "react-native";



export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2A6C',
    marginLeft: 20,
    marginBottom: 16,
  },
  // Estilos comunes
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: -55,
    marginLeft: 35
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    marginTop: 85
  },
  largeLogo: {
    width: 300 * 0.8,
    height: 150 * 0.8,
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'left',
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2A6C',
  },
  formGrid: {
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#1A2A6C',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center'
  },
  // Estilos para información del tercero
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#1A2A6C',
  },
  // Estilos para regímenes fiscales
  regimenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  regimenHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deselectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  deselectButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A2A6C',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos para la tabla de regímenes
  tableContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 400,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  centerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  regimenItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  regimenRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    minHeight: 60,
  },
  regimenCell: {
    fontSize: 12,
    flex: 1,
  },
  codeCell: {
    fontWeight: '600',
    color: '#1A2A6C',
  },
  descriptionCell: {
    flex: 2,
    paddingRight: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 2,
    fontSize: 12,
    minWidth: 62,
    textAlign: 'center',
  },
  usosSection: {
    backgroundColor: '#f8f9fa',
  },
  usosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  usosHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2A6C',
    flex: 1,
  },
  usosContent: {
    padding: 8,
  },
  usosTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  usosHeaderCell: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  usoRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    minHeight: 45,
  },
  usoCell: {
    fontSize: 10,
    flex: 1,
  },
  // Estilos para la sección de upload
  uploadDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emailInput: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
