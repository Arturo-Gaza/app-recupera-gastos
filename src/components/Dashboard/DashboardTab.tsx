import { SOLICITUD_DASHBOARD } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { styles } from '@/src/styles/DashboardTabStyle';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, FileText, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  Text,
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

// Función para formatear fecha como YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DashboardTab() {
  const [apiData, setApiData] = useState<ApiDashboardData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'inicio' | 'fin' | null>(null);
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
        data: {
          ...fechaData,
          usuario_id: "" // Agregar el usuario_id vacío como requeriste
        }
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

  // Handlers para el date picker
  const handleDateChange = (event: any, selectedDate?: Date, type: 'inicio' | 'fin' = 'inicio') => {
    setShowDatePicker(null);
    
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      
      if (type === 'inicio') {
        setFechaData(prev => ({ ...prev, fecha_inicio: formattedDate }));
      } else {
        setFechaData(prev => ({ ...prev, fecha_fin: formattedDate }));
      }
    }
  };

  const mostrarDatePicker = (type: 'inicio' | 'fin') => {
    setShowDatePicker(type);
  };

  const limpiarFechas = () => {
    setFechaData({
      fecha_inicio: '',
      fecha_fin: ''
    });
  };

  const getDisplayText = () => {
    if (fechaData.fecha_inicio && fechaData.fecha_fin) {
      return `${fechaData.fecha_inicio} - ${fechaData.fecha_fin}`;
    }
    return "Últimos 30 días (automático)";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando gráficas...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Filtros de Fecha */}
      <View style={styles.filtersContainer}>
        <Text style={styles.dateSectionTitle}>Establecer rango de Fechas</Text>
        
        <View style={styles.dateSelectionContainer}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>Fecha Inicio</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => mostrarDatePicker('inicio')}
            >
              <Calendar size={16} color="#666" />
              <Text style={styles.dateButtonText}>
                {fechaData.fecha_inicio || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>Fecha Fin</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => mostrarDatePicker('fin')}
              disabled={!fechaData.fecha_inicio}
            >
              <Calendar size={16} color="#666" />
              <Text style={[
                styles.dateButtonText,
                !fechaData.fecha_inicio && styles.dateButtonTextDisabled
              ]}>
                {fechaData.fecha_fin || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {(fechaData.fecha_inicio || fechaData.fecha_fin) && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={limpiarFechas}
          >
            <Text style={styles.clearButtonText}>Limpiar fechas (usar 30 días automático)</Text>
          </TouchableOpacity>
        )}

        <View style={styles.currentRangeDisplay}>
          <Text style={styles.currentRangeLabel}>Rango actual:</Text>
          <Text style={styles.currentRangeText}>{getDisplayText()}</Text>
        </View>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleDateChange(event, date, showDatePicker)}
          />
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Tickets totales</Text>
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

      {/* Resto del código se mantiene igual */}
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
                roundedTop={false}
                roundedBottom={false}
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
                yAxisTextStyle={{ color: '#ffffffff', fontSize: 10 }}
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