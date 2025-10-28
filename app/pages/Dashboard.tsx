// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// //import requests from '../services/axiosInstance';
// //import DonutChart from '../components/Dashboard/DonutChart';
// //import FileUpload from '../components/Dashboard/FileUpload';
// import MetricsCard from '@/components/MetricsCards';
// //import TicketsTable from '../components/Dashboard/TicketsTable';
// //import CustomModal from '../components/ui/CustomModal';

// // Interfaces
// interface Ticket {
//   id: string;
//   establecimiento: string;
//   fechaHora: string;
//   numeroTicket: string;
//   monto: string;
//   metodo: string;
//   estatus: string;
//   idEstatus?: number;
//   nombreRazon: string;
//   usoCFDI: string;
//   receptor?: string | null;
// }

// interface DonutData {
//   label: string;
//   value: number;
//   color: string;
// }

// interface MetricsData {
//   title: string;
//   value: string;
//   description: string;
//   icon: string;
//   variant: 'default' | 'success' | 'warning';
// }

// const DashboardScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
  
//   const [activeTab, setActiveTab] = useState<string>('general');
//   const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [userData, setUserData] = useState({
//     nombre: '',
//     saldo: 0,
//     idUsuario: '',
//     idRol: 0
//   });

//   const [donutData, setDonutData] = useState<DonutData[]>([
//     { label: "Fallido", value: 0, color: "#ef4444" },
//     { label: "En proceso", value: 0, color: "#3b82f6" },
//     { label: "Recuperada", value: 0, color: "#10b981" },
//     { label: "Rechazado", value: 0, color: "#f97316" },
//     { label: "En Revisión", value: 0, color: "#eab308" },
//     { label: "Pendiente", value: 0, color: "#8b5cf6" },
//     { label: "Completado", value: 0, color: "#22c55e" },
//     { label: "Cargado", value: 0, color: "#d1d5db" },
//   ]);

//   // Cargar datos del usuario
//   const loadUserData = async () => {
//     try {
//       const userSession = await AsyncStorage.getItem('userSession');
//       if (userSession) {
//         const user = JSON.parse(userSession);
//         setUserData({
//           nombre: user.nombre || '',
//           saldo: user.saldo || 0,
//           idUsuario: user.id || '',
//           idRol: user.idRol || 0
//         });
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   // Fetch tickets
// //   const fetchTickets = async () => {
// //     try {
// //       // Ajusta esta URL según tu API
// //       const response = await requests.get({ 
// //         command: `/usuario/${userData.idUsuario}` 
// //       });
      
//       //const data = response.data?.data || [];
//       const formattedTickets: Ticket[] = data.map((item: any) => ({
//         id: String(item.id),
//         establecimiento: item.establecimiento ?? "N/A",
//         fechaHora: item.created_at,
//         numeroTicket: item.num_ticket,
//         monto: item.monto ?? "N/A",
//         metodo: "N/A",
//         estatus: item.estadoSolicitud?.descripcion_estatus_solicitud || "Pendiente",
//         idEstatus: item.estadoSolicitud?.id,
//         nombreRazon: item.usuario?.datos_fiscales_principal?.nombre_razon ?? "N/A",
//         usoCFDI: item.usoCFDI ?? "N/A",
//         receptor: item.id_receptor ?? null
//       }));

//       setTickets(formattedTickets);
//     } catch (error) {
//       console.error("Error al obtener tickets:", error);
//       Alert.alert("Error", "No se pudieron cargar los tickets");
//     }
//   };

//   // Fetch metrics
//   const fetchMetrics = async () => {
//     try {
//       const response = await requests.get({ 
//         command: `/general/${userData.idUsuario}` 
//       });
//       const data = response.data?.data;
//       const total = data?.total ?? 0;
//       const porcentaje = data?.porcentaje ?? {};

//       const fallido = parseFloat(porcentaje["Fallido"] ?? "0");
//       const enProceso = parseFloat(porcentaje["En proceso"] ?? porcentaje["En Proceso"] ?? "0");
//       const recuperada = parseFloat(porcentaje["Recuperada"] ?? porcentaje["Recuperado"] ?? "0");
//       const rechazado = parseFloat(porcentaje["Rechazado"] ?? "0");
//       const cargado = parseFloat(porcentaje["Cargado"] ?? "0");

//       // Métricas generales
//       setMetricsData([
//         {
//           title: "Tickets totales (30d)",
//           value: total.toString(),
//           description: "Incluye automáticos y manuales",
//           icon: "document-text",
//           variant: "default",
//         },
//         {
//           title: "% éxito (auto+manual)",
//           value: `${recuperada}%`,
//           description: "Sobre tickets cerrados",
//           icon: "trending-up",
//           variant: "success",
//         },
//         {
//           title: "% Fallidos",
//           value: `${fallido}%`,
//           description: "Casos no resueltos",
//           icon: "trending-down",
//           variant: "warning",
//         },
//       ]);

//       // Datos del donut
//       setDonutData([
//         { label: "Fallido", value: fallido, color: "#ef4444" },
//         { label: "Recuperada", value: recuperada, color: "#10b981" },
//         { label: "Rechazado", value: rechazado, color: "#f97316" },
//         { label: "Cargado", value: cargado, color: "#d1d5db" },
//       ]);
//     } catch (error) {
//       console.error("Error al obtener métricas:", error);
//       Alert.alert("Error", "No se pudieron cargar las métricas");
//     }
//   };

//   // Procesar ticket
//   const procesarTickets = async (id: string) => {
//     try {
//       await requests.get({ command: `/procesar/${id}` });
//       await fetchTickets();
//       Alert.alert("Éxito", `Ticket ${id} actualizado correctamente`);
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", `No se pudo procesar el ticket ${id}`);
//     }
//   };

//   // Cargar datos iniciales
//   const loadData = async () => {
//     setLoading(true);
//     await loadUserData();
//     await Promise.all([fetchTickets(), fetchMetrics()]);
//     setLoading(false);
//   };

//   // Refresh control
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   // Render tab content
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "tickets":
//         return (
//           <TicketsTable
//             tickets={tickets}
//             onProcesar={procesarTickets}
//             onRefresh={fetchTickets}
//           />
//         );
//       case "carga":
//         return (
//           <FileUpload
//             userId={userData.idUsuario}
//             onFilesUploaded={handleFilesFromUpload}
//           />
//         );
//       default:
//         return (
//           <>
//             <View style={styles.metricsGrid}>
//               {metricsData.map((metric, idx) => (
//                 <MetricsCard key={idx} {...metric} />
//               ))}
//             </View>
//             <View style={styles.chartContainer}>
//               <DonutChart
//                 title="Distribución por estatus"
//                 data={donutData}
//               />
//             </View>
//           </>
//         );
//     }
//   };

//   const handleFilesFromUpload = async () => {
//     try {
//       setShowSuccessModal(true);
//       setSuccessMessage("Archivos procesados correctamente");
//       await fetchTickets();
//       await fetchMetrics();
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Error al procesar los archivos");
//     }
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem('userSession');
//     navigation.navigate('Login' as never);
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#1A2A6C" />
//         <Text style={styles.loadingText}>Cargando dashboard...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>¡Hola, {userData.nombre}! 👋</Text>
//           <Text style={styles.subtitle}>
//             Gestiona tus gastos de manera inteligente
//           </Text>
//         </View>
        
//         <View style={styles.headerRight}>
//           <TouchableOpacity style={styles.balanceButton}>
//             <Ionicons name="wallet" size={16} color="#000" />
//             <Text style={styles.balanceText}>Saldo: ${userData.saldo}</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.userButton}>
//             <Ionicons name="person-circle" size={20} color="#666" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Navigation Tabs */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={styles.tabsContainer}
//       >
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'general' && styles.activeTab]}
//           onPress={() => setActiveTab('general')}
//         >
//           <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
//             General
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
//           onPress={() => setActiveTab('tickets')}
//         >
//           <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
//             Tickets
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'carga' && styles.activeTab]}
//           onPress={() => setActiveTab('carga')}
//         >
//           <Text style={[styles.tabText, activeTab === 'carga' && styles.activeTabText]}>
//             Carga Archivos
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Content */}
//       <ScrollView
//         style={styles.content}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {renderTabContent()}
//       </ScrollView>

//       {/* Success Modal */}
//       <CustomModal
//         visible={showSuccessModal}
//         onClose={() => setShowSuccessModal(false)}
//         title="¡Cargado exitosamente!"
//         message={successMessage}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1e293b',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#64748b',
//     marginTop: 4,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   balanceButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   balanceText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1e293b',
//   },
//   userButton: {
//     padding: 8,
//   },
//   tabsContainer: {
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//     paddingHorizontal: 16,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     marginRight: 8,
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#1A2A6C',
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#64748b',
//   },
//   activeTabText: {
//     color: '#1A2A6C',
//     fontWeight: '600',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   metricsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     gap: 12,
//   },
//   chartContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
// });

// export default DashboardScreen;