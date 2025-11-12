import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyListContent: {
        flexGrow: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    searchContainer: {
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    ticketCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    ticketNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    ticketId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3b82f6',
        flex: 1,
        marginHorizontal: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    ticketInfo: {
        marginBottom: 16,
    },
    establishment: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    amount: {
        fontSize: 15,
        fontWeight: '500',
        color: '#059669',
        marginBottom: 4,
    },
    cfdi: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    // Estilos para el selector de receptores
    receptorContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    receptorLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#374151',
    },
    selectorWrapper: {
        position: 'relative',
    },
    selectorTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    selectorExpanded: {
        borderColor: '#3b82f6',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    selectorDisabled: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    selectorText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    selectorTextDisabled: {
        color: '#9ca3af',
    },
    chevron: {
        marginLeft: 8,
    },
    chevronRotated: {
        transform: [{ rotate: '180deg' }],
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderTopWidth: 0,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        maxHeight: 150,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    dropdownOptionSelected: {
        backgroundColor: '#3b82f6',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#374151',
    },
    dropdownOptionTextSelected: {
        color: 'white',
        fontWeight: '500',
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#f8fafc',
        minWidth: 70,
        alignItems: 'center',
        marginBottom: 4,
    },
    processButton: {
        backgroundColor: '#dbeafe',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        justifyContent: 'center',
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    clearSearchText: {
        color: '#3b82f6',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        color: '#3b82f6',
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '80%',
        borderRadius: 8,
    },
      noImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});