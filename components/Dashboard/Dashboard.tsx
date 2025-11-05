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
    TrendingUp,
    UserCircle
} from "lucide-react-native";

// Importar el DashboardTab adaptado
import { router } from 'expo-router';
import { useSession } from '../../hooks/useSession';
import { DashboardTab } from "./DashboardTab";

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

  const handleLogout = () => {
    router.push('/login')
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

   // Validar que session existe antes de usarlo
  const userName = session?.NombreSST || 'Usuario';
  const userBalance = session?.SaldoSST || "0.00";
  const userRole = session?.RolSST || 'Usuario';
  const userEmail = session?.CorreoSST || '';
  const userRoleId = session?.IdRolSST || '';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
          
          <TouchableOpacity style={styles.userButton}>
            <UserCircle size={16} color="#000" />
            {/* <Text style={styles.userText}>{contenidoHooks.Nombre}</Text> */}
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "tickets":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Tickets - Próximamente</Text>
          </View>
        );
      case "carga":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Carga - Próximamente</Text>
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
                style={styles.sidebarItem}
                onPress={() => {
                  handleTabChange("tickets");
                  setSidebarVisible(false);
                }}
              >
                <FileText size={20} color="#10b981" />
                <Text style={styles.sidebarItemText}>Tickets</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarItem}
                onPress={() => {
                  handleTabChange("carga");
                  setSidebarVisible(false);
                }}
              >
                <TrendingUp size={20} color="#f59e0b" />
                <Text style={styles.sidebarItemText}>Carga</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <CreditCard size={20} color="#8b5cf6" />
                <Text style={styles.sidebarItemText}>Saldo</Text>
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
      <NavigationTabs />
      
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
      </ScrollView>

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
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
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
    color: "#dc2626",
    fontWeight: "500",
  },
});