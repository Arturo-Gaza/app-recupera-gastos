import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        backgroundColor: "#fff",
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    menuButton: {
        padding: 1,
        marginBottom: 8,
        marginTop: -50
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
    date: {
        fontSize: 14,
        color: "#999",
        marginTop: 2,
    },
    headerActions: {
        alignItems: "flex-end",
        gap: 8,
    },
    balanceButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: 4,
    },
    balanceText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    userButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: 4,
    },
    userText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    tabsContainer: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    tabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        gap: 6,
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: "#1A2A6C",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    activeTabText: {
        color: "#fff",
    },
    // Estilos para las subpestañas del balance
    subTabsContainer: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    subTabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    subTab: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#f8fafc",
        gap: 4,
        marginRight: 6,
    },
    activeSubTab: {
        backgroundColor: "#10b981",
    },
    subTabText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#666",
    },
    activeSubTabText: {
        color: "#fff",
    },
    balanceContainer: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    fileUploadContainer: {
        flex: 1,
        padding: 16,
    },
    tabContent: {
        flex: 1,
        padding: 16,
    },
    comingSoon: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 50,
    },
    sidebarOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: width * 0.8,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    sidebarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    closeButton: {
        fontSize: 20,
        color: "#666",
        fontWeight: "bold",
    },
    sidebarContent: {
        flex: 1,
        padding: 16,
    },
    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        gap: 12,
        marginBottom: 4,
    },
    activeSidebarItem: {
        backgroundColor: "#f1f5f9",
    },
    sidebarItemText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "500",
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: "#e5e5e5",
        marginVertical: 16,
    },
    logoutItem: {
        backgroundColor: "#fef2f2",
    },
    logoutText: {
        fontSize: 16,
        color: "#251258ff",
        fontWeight: "500",
    },
    //Estilo para el logo
    transparentCard: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 0,
        marginTop: -55,
        marginLeft: 60
    },

    logo: {
        width: 200,
        height: 100,
        marginBottom: 30,
        marginTop: 5
    },

    largeLogo: {
        width: 300 * 0.7,
        height: 150 * 0.7,
        marginBottom: 30,
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
        alignSelf: "center",
    },
});