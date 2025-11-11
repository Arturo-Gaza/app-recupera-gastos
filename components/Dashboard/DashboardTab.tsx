import { SOLICITUD_DASHBOARD } from '@/app/services/apiConstans';
import requests from '@/app/services/requests';
import { Calendar, FileText, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-gifted-charts';

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

// Interfaces (se mantienen igual)
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

export function DashboardTab() {
  const [apiData, setApiData] = useState<ApiDashboardData | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [fechaData, setFechaData] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // ✅ NUEVOS ESTADOS CORREGIDOS PARA BARRAS
  const [verticalBarData, setVerticalBarData] = useState<any[]>([]);
  const [maxBarValue, setMaxBarValue] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await requests.post({
        command: SOLICITUD_DASHBOARD,
        data: fechaData
      });

      const apiResponse: ApiResponse = response.data;

      if (apiResponse.success && apiResponse.data) {
        setApiData(apiResponse.data);
        
        const years = apiResponse.data.data_mensual?.map(item => item.anio) || [];
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear('all');
        }
      } else {
        setApiData(null);
      }
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fechaData]);

  // USEEFFECT PARA ACTUALIZAR GRÁFICA DE BARRAS CUANDO CAMBIA apiData
  useEffect(() => {
    if (apiData?.estadisticas_por_estatus) {
      const data = apiData.estadisticas_por_estatus
        .filter(item => item.total_tickets > 0)
        .map(item => ({
          value: item.total_tickets,
          label: item.descripcion_estatus_solicitud,
          frontColor: STATUS_COLORS[item.estatus_id] || '#9ca3af',
        }));

      const max = data.length
        ? Math.ceil(Math.max(...data.map(d => d.value)) * 1.2)
        : 10;

      setVerticalBarData(data);
      setMaxBarValue(max);

      console.log("DATOS BARRAS ACTUALIZADOS:", { data, max });
    } else {
      setVerticalBarData([]);
      setMaxBarValue(10);
    }
  }, [apiData]);

  // Preparar datos para gráfica de pie
  const chartData = apiData?.estadisticas_por_estatus
    .filter(item => item.total_tickets > 0)
    .map(item => ({
      name: item.descripcion_estatus_solicitud,
      value: item.total_tickets,
      color: STATUS_COLORS[item.estatus_id] || '#9ca3af',
    })) || [];

  const pieChartData = chartData.map((item) => ({
    name: item.name,
    population: item.value,
    color: item.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  // CÁLCULOS DE ESTADÍSTICAS
  const totalTickets = apiData?.total_tickets || 0;
  const estadisticas = apiData?.estadisticas_por_estatus || [];

  const exitosos = estadisticas.find(s => s.estatus_id === 9)?.total_tickets || 0;
  const enProceso = estadisticas.find(s => s.estatus_id === 2)?.total_tickets || 0;
  const fallidos = estadisticas.find(s => s.estatus_id === 7)?.total_tickets || 0;
  const pendientes = estadisticas.filter(s => [1, 3, 4].includes(s.estatus_id))
    .reduce((sum, s) => sum + s.total_tickets, 0);

  const ticketsCerrados = exitosos + fallidos + pendientes + enProceso;
  const successRate = ticketsCerrados > 0 ? Math.round((exitosos / ticketsCerrados) * 100) : 0;
  const failureRate = ticketsCerrados > 0 ? Math.round((fallidos / ticketsCerrados) * 100) : 0;

  // Handlers para fechas
  const toggleExpandido = () => {
    setExpandido(!expandido);
    if (expandido && fechaData.fecha_inicio !== "") {
      setFechaData({ fecha_inicio: "", fecha_fin: "" });
    }
  };

  const handleFechaInicioChange = (text: string) => {
    setFechaData(prev => ({ ...prev, fecha_inicio: text }));
  };

  const handleFechaFinChange = (text: string) => {
    setFechaData(prev => ({ ...prev, fecha_fin: text }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando gráficas...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  console.log('DATOS BARRAS VERTICALES:', {
    data: verticalBarData,
    maxValue: maxBarValue
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <View style={styles.statTextContainer}>
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
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>% de éxito (auto+manual)</Text>
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={styles.statDescription}>Sobre tickets cerrados</Text>
            </View>
            <TrendingUp size={32} color="#10b981" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>% de Fallidos</Text>
              <Text style={styles.statValue}>{failureRate}%</Text>
              <Text style={styles.statDescription}>Casos no resueltos manualmente</Text>
            </View>
            <TrendingDown size={32} color="#ef4444" />
          </View>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsContainer}>
        {/* Gráfica Pie */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribución por estatus</Text>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={screenWidth - 72}
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

        {/* Gráfica de Barras */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Distribución por estatus</Text>
            <View style={styles.yearSelector}>
              <Text style={styles.yearSelectorLabel}>Año:</Text>
              <View style={styles.yearSelect}>
                <Text style={styles.yearSelectText}>
                  {selectedYear === 'all' ? 'Todos' : selectedYear}
                </Text>
              </View>
            </View>
          </View>
          
          {verticalBarData.length > 0 ? (
            <View style={styles.barChartContainer}>
              <BarChart
                data={verticalBarData}
                barWidth={40}
                spacing={30}
                initialSpacing={20}
                endSpacing={20}
                roundedTop={true}
                roundedBottom={true}
                hideRules={true}
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor="#e5e5e5"
                yAxisColor="#e5e5e5"
                noOfSections={4}
                maxValue={maxBarValue}
                height={220}
                width={screenWidth - 72}
                isAnimated={true}
                showVerticalLines={false}
                yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10, textAlign: 'center' }}
                showValuesAsTopLabel={true}
                topLabelTextStyle={{ color: '#1f2937', fontSize: 10, fontWeight: 'bold' }}
                showFractionalValues={false}
                showYAxisIndices={true}
                yAxisIndicesColor="#e5e5e5"
                yAxisIndicesWidth={1}
                key={`vertical-barchart-${verticalBarData.length}`}
              />
              
              <View style={styles.legendContainer}>
                {verticalBarData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.frontColor }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay datos para mostrar</Text>
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
          <Text style={[styles.miniStatValue, { color: '#f59e0b' }]}>{enProceso}</Text>
          <Text style={styles.miniStatLabel}>En Revision </Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#ef4444' }]}>{fallidos}</Text>
          <Text style={styles.miniStatLabel}>Fallidos</Text>
        </View>

        <View style={styles.miniStatCard}>
          <Text style={[styles.miniStatValue, { color: '#60a5fa' }]}>{pendientes}</Text>
          <Text style={styles.miniStatLabel}>Pendientes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
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
    marginBottom: 16,
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
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chartsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearSelectorLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  yearSelect: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  yearSelectText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  barChartContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  miniStatCard: {
    flex: 1,
    minWidth: (Dimensions.get('window').width - 64) / 2 - 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});