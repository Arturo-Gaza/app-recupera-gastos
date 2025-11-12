import { useNavigation } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
//import { useUserContenido } from "@/hooks/UserConteProvider";
import {
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  FileText,
  Menu,
  Settings2,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wallet
} from "lucide-react-native";

// Importar el DashboardTab adaptado
import { router } from 'expo-router';
import { useSession } from '../../hooks/useSession';
import BalanceManagement from "./BalanceMagnaments";
import { DashboardTab } from "./DashboardTab";
import FileUpload from "./FileUpload";
import PersonalDataManagement from "./PersonalData";
import RecipientsManagement from "./Receptores";
import TicketsTable from "./TableTickets";

interface DashboardProps {
  onBack?: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  //const { contenidoHooks } = useUserContenido();
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { session, loading: sessionLoading } = useSession();

  const [currentDate] = useState(new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // Estado para controlar la subsección activa del balance
  const [activeBalanceSubSection, setActiveBalanceSubSection] = useState<string>("/balance/recharge");

  const handleLogout = () => {
    router.push('/login')
  };

  // Validar que session existe antes de usarlo
  const userName = session?.NombreSST || 'Usuario';
  const userBalance = session?.SaldoSST || "0.00";
  const userRole = session?.RolSST || 'Usuario';
  const userEmail = session?.CorreoSST || '';
  const userRoleId = session?.IdRolSST || '';
  const userId = session?.IdUsuarioSST || 0;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 👇 Función para manejar cuando los archivos se suben exitosamente
  const handleFilesUploaded = (files: any[]) => {
    console.log('Archivos subidos exitosamente:', files);
    // Aquí puedes actualizar el estado, mostrar un mensaje, etc.
    // Por ejemplo, podrías recargar la tabla de tickets
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setSidebarVisible(true)}
      >
        <Menu size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            ¡Hola, {userName}! 👋
          </Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.balanceButton}>
            <BadgeDollarSign size={16} color="#000" />
            <Text style={styles.balanceText}>
              Saldo: ${userBalance}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );

  const NavigationTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === "dashboard" && styles.activeTab]}
          onPress={() => handleTabChange("dashboard")}
        >
          <BarChart3 size={16} color={activeTab === "dashboard" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, activeTab === "dashboard" && styles.activeTabText]}>
            General
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "tickets" && styles.activeTab]}
          onPress={() => handleTabChange("tickets")}
        >
          <FileText size={16} color={activeTab === "tickets" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, activeTab === "tickets" && styles.activeTabText]}>
            Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "carga" && styles.activeTab]}
          onPress={() => handleTabChange("carga")}
        >
          <TrendingUp size={16} color={activeTab === "carga" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, activeTab === "carga" && styles.activeTabText]}>
            Carga
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Componente para las subpestañas del balance
  const BalanceSubTabs = () => (
    <View style={styles.subTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subTabsContent}
      >
        <TouchableOpacity
          style={[styles.subTab, activeBalanceSubSection === "/balance/recharge" && styles.activeSubTab]}
          onPress={() => setActiveBalanceSubSection("/balance/recharge")}
        >
          <CreditCard size={14} color={activeBalanceSubSection === "/balance/recharge" ? "#fff" : "#666"} />
          <Text style={[styles.subTabText, activeBalanceSubSection === "/balance/recharge" && styles.activeSubTabText]}>
            Recargar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeBalanceSubSection === "/balance/statement" && styles.activeSubTab]}
          onPress={() => setActiveBalanceSubSection("/balance/statement")}
        >
          <FileText size={14} color={activeBalanceSubSection === "/balance/statement" ? "#fff" : "#666"} />
          <Text style={[styles.subTabText, activeBalanceSubSection === "/balance/statement" && styles.activeSubTabText]}>
            Estado de Cuenta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "balance":
        return (
          <View style={styles.balanceContainer}>
            <BalanceSubTabs />
            <BalanceManagement activeSubSection={activeBalanceSubSection} />
          </View>
        );
      case "tickets":
        return <TicketsTable />;
      case "datos":
        return <PersonalDataManagement />
      case "receptor":
        return <RecipientsManagement />
      case "carga":
        return (
          <View style={styles.fileUploadContainer}>
            <FileUpload
              userId={userId}
              onFilesUploaded={handleFilesUploaded}
              acceptedTypes={[".jpg", ".jpeg", ".png", ".gif", ".pdf"]}
              maxFileSize={10}
            />
          </View>
        );
      default:
        return <DashboardTab />;
    }
  };

  const Sidebar = () => (
    <>
      {sidebarVisible && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            onPress={() => setSidebarVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menú</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity
                style={[styles.sidebarItem, activeTab === "dashboard" && styles.activeSidebarItem]}
                onPress={() => {
                  handleTabChange("dashboard");
                  setSidebarVisible(false);
                }}
              >
                <BarChart3 size={20} color="#3b82f6" />
                <Text style={styles.sidebarItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarItem, activeTab === "balance" && styles.activeSidebarItem]}
                onPress={() => {
                  handleTabChange("balance");
                  setActiveBalanceSubSection("/balance/recharge");
                  setSidebarVisible(false);
                }}
              >
                <Wallet size={20} color="#10b981" />
                <Text style={styles.sidebarItemText}>"Recargar y consultar saldo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarItem, activeTab === "datos" && styles.activeSidebarItem]}
                onPress={() => {
                  handleTabChange("datos");
                  setSidebarVisible(false);
                }}
              >
                <User size={20} color="#393939ff" />
                <Text style={styles.sidebarItemText}>Administrar mis datos personales</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarItem, activeTab === "receptor" && styles.activeSidebarItem]}
                onPress={() => {
                  handleTabChange("receptor");
                  setSidebarVisible(false);
                }}>
                <UserCheck size={20} color="#000000ff" />
                <Text style={styles.sidebarItemText}>Administrar mis receptores</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Settings2 size={20} color="#8b5cf6" />
                <Text style={styles.sidebarItemText}>Administrar mi cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Users size={20} color="#2c0092ff" />
                <Text style={styles.sidebarItemText}>Administrar mis usuarios</Text>
              </TouchableOpacity>

              <View style={styles.sidebarDivider} />

              <TouchableOpacity
                style={[styles.sidebarItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <Header />

      {/* Mostrar NavigationTabs solo cuando NO esté en la pestaña balance */}
      {activeTab !== "balance" && <NavigationTabs />}

      {activeTab === "receptor" ? (
        renderTabContent()
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {renderTabContent()}
        </ScrollView>
      )}

      <Sidebar />
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 8,
    marginBottom: 8,
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
    backgroundColor: "#3b82f6",
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
    width: Dimensions.get("window").width * 0.8,
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
});