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

import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { styles } from "@/src/styles/DashboardStyle";
import { router } from "expo-router";
import { useSession } from "../../hooks/useSession";

import BalanceManagement from "./BalanceMagnaments";
import { AccountManagement } from "./ConfiguracionCuenta";
import { DashboardTab } from "./DashboardTab";
import FileUpload from "./FileUpload";
import PersonalDataManagement from "./PersonalData";
import RecipientsManagement from "./Receptores";
import TicketsTable from "./TableTickets";
import { UsersManagement } from "./UserMagnament";

interface DashboardProps {
  onBack?: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  

  //AHORA INCLUYE refreshSession
  const { session, loading: sessionLoading, refreshSession } = useSession();

  const [activeAccountSubSection, setActiveAccountSubSection] = useState(
    "/account/block"
  );
  const [activeBalanceSubSection, setActiveBalanceSubSection] = useState(
    "/balance/recharge"
  );

  const [currentDate] = useState(
    new Date().toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  );

  //Actualizar sesión cada vez que el Dashboard vuelve a ser visible
  useFocusEffect(
    useCallback(() => {
      refreshSession(); 
    }, [])
  );

  // Datos derivados de la sesión
  const userName = session?.NombreSST;
  const userBalance = session?.SaldoSST || "0.00";
  const userEmail = session?.CorreoSST || "";
  const userId = session?.IdUsuarioSST || 0;

  const handleLogout = () => {
    router.push("/login");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
  };

  const handleFilesUploaded = () => {};

 
  const Header = () => (
    <View style={styles.header}>
      <View style={[styles.card, styles.transparentCard]}>
        <Image
          source={require("@/assets/images/rg-logo.png")}
          style={[styles.logo, styles.largeLogo]}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setSidebarVisible(true)}
      >
        <Menu size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <View style={styles.headerText}>
          <Text style={styles.title}>¡Hola, {userName}! 👋</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.balanceButton}>
            <BadgeDollarSign size={16} color="#000" />
            <Text style={styles.balanceText}>Saldo: ${userBalance}</Text>
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
          <BarChart3
            size={16}
            color={activeTab === "dashboard" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "dashboard" && styles.activeTabText
            ]}
          >
            General
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "tickets" && styles.activeTab]}
          onPress={() => handleTabChange("tickets")}
        >
          <FileText
            size={16}
            color={activeTab === "tickets" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "tickets" && styles.activeTabText
            ]}
          >
            Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "carga" && styles.activeTab]}
          onPress={() => handleTabChange("carga")}
        >
          <TrendingUp
            size={16}
            color={activeTab === "carga" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "carga" && styles.activeTabText
            ]}
          >
            Carga
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const BalanceSubTabs = () => (
    <View style={styles.subTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subTabsContent}
      >
        <TouchableOpacity
          style={[
            styles.subTab,
            activeBalanceSubSection === "/balance/recharge" &&
              styles.activeSubTab
          ]}
          onPress={() => setActiveBalanceSubSection("/balance/recharge")}
        >
          <CreditCard
            size={14}
            color={
              activeBalanceSubSection === "/balance/recharge" ? "#fff" : "#666"
            }
          />
          <Text
            style={[
              styles.subTabText,
              activeBalanceSubSection === "/balance/recharge" &&
                styles.activeSubTabText
            ]}
          >
            Recargar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTab,
            activeBalanceSubSection === "/balance/statement" &&
              styles.activeSubTab
          ]}
          onPress={() => setActiveBalanceSubSection("/balance/statement")}
        >
          <FileText
            size={14}
            color={
              activeBalanceSubSection === "/balance/statement" ? "#fff" : "#666"
            }
          />
          <Text
            style={[
              styles.subTabText,
              activeBalanceSubSection === "/balance/statement" &&
                styles.activeSubTabText
            ]}
          >
            Estado de Cuenta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const handleAccountBack = () => {
    setActiveTab("dashboard");
  };

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
        return <PersonalDataManagement />;

      case "receptor":
        return <RecipientsManagement />;

      case "colaborador":
        return <UsersManagement />;

      case "cuenta":
        return (
          <AccountManagement
            activeSubSection={activeAccountSubSection}
            onBack={handleAccountBack}
          />
        );

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
              <TouchableOpacity
                onPress={() => setSidebarVisible(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "dashboard" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("dashboard");
                  setSidebarVisible(false);
                }}
              >
                <BarChart3 size={20} color="#3b82f6" />
                <Text style={styles.sidebarItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "balance" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("balance");
                  setActiveBalanceSubSection("/balance/recharge");
                  setSidebarVisible(false);
                }}
              >
                <Wallet size={20} color="#10b981" />
                <Text style={styles.sidebarItemText}>
                  Recargar y consultar saldo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "datos" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("datos");
                  setSidebarVisible(false);
                }}
              >
                <User size={20} color="#2706ffff" />
                <Text style={styles.sidebarItemText}>
                  Administrar mis datos personales
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "receptor" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("receptor");
                  setSidebarVisible(false);
                }}
              >
                <UserCheck size={20} color="#000000ff" />
                <Text style={styles.sidebarItemText}>
                  Administrar mis receptores
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "cuenta" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("cuenta");
                  setSidebarVisible(false);
                }}
              >
                <Settings2 size={20} color="#fa0000ff" />
                <Text style={styles.sidebarItemText}>Administrar mi cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  activeTab === "colaborador" && styles.activeSidebarItem
                ]}
                onPress={() => {
                  handleTabChange("colaborador");
                  setSidebarVisible(false);
                }}
              >
                <Users size={20} color="#2c0092ff" />
                <Text style={styles.sidebarItemText}>
                  Administrar mis usuarios
                </Text>
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

      {activeTab !== "balance" && activeTab !== "cuenta" && (
        <NavigationTabs />
      )}

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
