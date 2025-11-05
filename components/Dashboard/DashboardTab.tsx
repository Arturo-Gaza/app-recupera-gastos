import { SOLICITUD_DASHBOARD } from '@/app/services/apiConstans';
import requests from '@/app/services/requests';
import { Calendar, FileText, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const STATUS_COLORS: Record<number, string> = {
  1: '#60a5fa', // Cargado - blue-400
  2: '#eab308', // En Revisión - yellow-500
  3: '#f59e0b', // Asignado - amber-500
  4: '#4ade80', // Visualizado - green-400
  5: '#f97316', // Procesando - orange-500
  6: '#14b8a6', // Recuperado - teal-500
  7: '#ef4444', // Rechazado - red-500
  8: '#6366f1', // Descargado - indigo-500
  9: '#059669', // Concluido - emerald-600
};

// Interfaces basadas en la estructura real de tu API
interface EstatusItem {
  estatus_id: number;
  descripcion_estatus_solicitud: string;
  total_tickets: number;
  porcentaje: number;
}

interface EstatusMensual {
  estado_id: number;
  nombre_estatus: string;
  total: number;
}

interface MesData {
  mes: string;
  estatus: EstatusMensual[];
}

interface YearData {
  anio: number;
  meses: MesData[];
}

interface ApiDashboardData {
  total_tickets: number;
  estadisticas_por_estatus: EstatusItem[];
  fecha_inicio: string;
  fecha_fin: string;
  data_mensual: YearData[];
}

interface ApiResponse {
  success: boolean;
  data: ApiDashboardData;
  data2: any;
  message: string;
}

// Define tu command para la API

export function DashboardTab() {
  const [apiData, setApiData] = useState<ApiDashboardData | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [fechaData, setFechaData] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [loading, setLoading] = useState(false);

  // Función para fetch data de la API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Reemplaza "requests.post" con tu cliente HTTP real
      const response = await requests.post({
        command: SOLICITUD_DASHBOARD,
        data: fechaData
      });

      const apiResponse: ApiResponse = response.data;
      console.log('RESPUESTA COMPLETA DE API:', apiResponse);

      if (apiResponse.success && apiResponse.data) {
        setApiData(apiResponse.data);
      } else {
        console.log('No hay datos o la respuesta no fue exitosa');
        setApiData(null);
      }
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambian las fechas
  useEffect(() => {
    fetchData();
  }, [fechaData]);

  // DEFINIR chartData BASADA EN LA ESTRUCTURA REAL
  const chartData = apiData?.estadisticas_por_estatus.map(estatus => ({
    name: estatus.descripcion_estatus_solicitud,
    value: estatus.total_tickets,
    color: STATUS_COLORS[estatus.estatus_id] || '#666666'
  })) || [];

  // PREPARAR DATOS PARA GRÁFICA PIE
  const pieChartData = chartData.map((item) => ({
    name: item.name,
    population: item.value,
    color: item.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  // PREPARAR DATOS PARA GRÁFICA DE BARRAS (Tendencia mensual)
  const prepareBarChartData = () => {
    if (!apiData?.data_mensual) return { labels: [], datasets: [] };

    const labels: string[] = [];
    const data: number[] = [];

    apiData.data_mensual.forEach((yearData) => {
      yearData.meses.forEach((mesData) => {
        const label = `${mesData.mes} ${yearData.anio}`;
        labels.push(label);
        
        // Sumar todos los tickets del mes
        const totalMes = mesData.estatus.reduce((sum, estatus) => sum + estatus.total, 0);
        data.push(totalMes);
      });
    });

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const barChartData = prepareBarChartData();

  // CÁLCULOS DE ESTADÍSTICAS BASADOS EN LA ESTRUCTURA REAL
  const totalTickets = apiData?.total_tickets || 0;
  
  // Calcular tickets por categoría según los estatus
  const exitosos = apiData?.estadisticas_por_estatus.find(e => e.estatus_id === 9)?.total_tickets || 0;
  const enProceso = apiData?.estadisticas_por_estatus
    .filter(e => [2, 3, 4, 5].includes(e.estatus_id))
    .reduce((sum, e) => sum + e.total_tickets, 0) || 0;
  const fallidos = apiData?.estadisticas_por_estatus.find(e => e.estatus_id === 7)?.total_tickets || 0;
  const pendientes = apiData?.estadisticas_por_estatus.find(e => e.estatus_id === 1)?.total_tickets || 0;

  const successRate = totalTickets > 0 ? Math.round((exitosos / totalTickets) * 100) : 0;
  const failureRate = totalTickets > 0 ? Math.round((fallidos / totalTickets) * 100) : 0;

  // Handlers para fechas
  const toggleExpandido = () => setExpandido(!expandido);

  const handleFechaInicioChange = (text: string) => {
    setFechaData(prev => ({ ...prev, fecha_inicio: text }));
  };

  const handleFechaFinChange = (text: string) => {
    setFechaData(prev => ({ ...prev, fecha_fin: text }));
  };

  // CONFIGURACIÓN DE GRÁFICAS
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros de Fecha */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.dateToggleButton}
          onPress={toggleExpandido}
        >
          <Calendar size={16} color="#666" />
          <Text style={styles.dateToggleText}>
            {expandido ? "Últimos 30 días" : "Establecer rango de fecha"}
          </Text>
        </TouchableOpacity>

        {expandido && (
          <View style={styles.dateInputsContainer}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>Inicio</Text>
              <TextInput
                style={styles.dateInput}
                value={fechaData.fecha_inicio}
                onChangeText={handleFechaInicioChange}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>Fin</Text>
              <TextInput
                style={styles.dateInput}
                value={fechaData.fecha_fin}
                onChangeText={handleFechaFinChange}
                placeholder="YYYY-MM-DD"
                editable={!!fechaData.fecha_inicio}
              />
            </View>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>
                Tickets totales {fechaData.fecha_inicio !== "" && fechaData.fecha_fin !== "" ? "" : "(Últimos 30 días)"}
              </Text>
              <Text style={styles.statValue}>{totalTickets}</Text>
              <Text style={styles.statDescription}>Incluye automáticos y manuales</Text>
            </View>
            <FileText size={32} color="#3b82f6" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>% de éxito (auto+manual)</Text>
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={styles.statDescription}>Sobre tickets cerrados</Text>
            </View>
            <TrendingUp size={32} color="#10b981" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View>
              <Text style={styles.statLabel}>% de Fallidos</Text>
              <Text style={styles.statValue}>{failureRate}%</Text>
              <Text style={styles.statDescription}>Casos no resueltos manualmente</Text>
            </View>
            <TrendingDown size={32} color="#ef4444" />
          </View>
        </View>
      </View>

      {/* GRÁFICAS REALES */}
      <View style={styles.chartsContainer}>
        {/* Gráfica Pie - Distribución por estatus */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribución por estatus</Text>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={Dimensions.get('window').width - 72}
              height={220}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay datos para mostrar</Text>
            </View>
          )}
        </View>

        {/* Gráfica de Barras - Tendencia mensual */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tendencia mensual</Text>
          </View>
          {barChartData.labels.length > 0 ? (
            <BarChart
              data={barChartData}
              width={Dimensions.get('window').width - 72}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay datos mensuales</Text>
            </View>
          )}
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#10b981' }]}>{exitosos}</Text>
          <Text style={styles.miniStatLabel}>Tickets Exitosos</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#eab308' }]}>{enProceso}</Text>
          <Text style={styles.miniStatLabel}>En Proceso</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#ef4444' }]}>{fallidos}</Text>
          <Text style={styles.miniStatLabel}>Fallidos</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#06b6d4' }]}>{pendientes}</Text>
          <Text style={styles.miniStatLabel}>Pendientes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    gap: 12,
  },
  dateToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignSelf: 'flex-start',
  },
  dateToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
  },
  chartsContainer: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    width: Dimensions.get('window').width - 72,
  },
  noDataText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    minWidth: (Dimensions.get('window').width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});