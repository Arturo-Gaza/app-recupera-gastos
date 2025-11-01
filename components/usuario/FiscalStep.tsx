import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { FileText, Receipt, ChevronDown, ChevronUp } from 'lucide-react-native';
import requests from '@/app/services/requests';
import { CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN } from '@/app/services/apiConstans';

// Interfaces (se mantienen igual)
interface UsoCFDI {
  usoCFDI: string;
  descripcion: string;
  aplica_persona_fisica: boolean;
  aplica_persona_moral: boolean;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    id_regimen: number;
    usoCFDI: string;
  };
}

interface RegimenFiscal {
  id_regimen: number;
  clave: string;
  descripcion: string;
  aplica_persona_fisica: boolean;
  aplica_persona_moral: boolean;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string | null;
  created_at: string;
  updated_at: string;
  usos_cfdi: UsoCFDI[];
  usosCfdi?: UsoCFDI[];
}

interface SelectedRegimen {
  id_regimen: number;
  fecha_inicio_regimen: string;
  predeterminado: boolean;
  usosCfdi: SelectedUsoCFDI[];
}

interface SelectedUsoCFDI {
  uso_cfdi: string;
  predeterminado: boolean;
}

interface FiscalStepProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: any;
}

export default function FiscalStep({
  onBack,
  onSubmit,
  loading = false,
  initialData
}: FiscalStepProps) {
  const [availableRegimens, setAvailableRegimens] = useState<RegimenFiscal[]>([]);
  const [selectedRegimens, setSelectedRegimens] = useState<SelectedRegimen[]>([]);
  const [loadingRegimens, setLoadingRegimens] = useState(true);
  const [expandedRegimen, setExpandedRegimen] = useState<number | null>(null);
  
  // Datos adicionales
  const [fiscalData, setFiscalData] = useState({
    fecha_inicio_op: '',
    id_estatus_sat: 1,
    idCIF: '',
    lugar_emision: '',
    fecha_emision: '',
    fecha_ult_cambio_op: '',
    predeterminado: false
  });

  // Cargar regímenes fiscales
  useEffect(() => {
    loadRegimens();
  }, []);

  const loadRegimens = async () => {
    try {
      setLoadingRegimens(true);
      console.log('🔍 Cargando regímenes fiscales...');
      
      const response = await requests.get({ 
        command: CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN + false 
      });
      
      console.log('📦 Respuesta completa de la API:', response);
      
      let regimensData: RegimenFiscal[] = [];
      
      // DEBUG: Ver la estructura real
      console.log('🔍 DEBUG - Estructura de response:', {
        tieneData: !!response.data,
        tipoData: typeof response.data,
        esArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : 'no data'
      });

      // Si response.data es un string (JSON stringificado)
      if (response.data && typeof response.data === 'string') {
        console.log('✅ response.data es string, parseando...');
        try {
          const parsedData = JSON.parse(response.data);
          console.log('📊 Datos parseados:', parsedData);
          
          if (parsedData.data && Array.isArray(parsedData.data)) {
            regimensData = parsedData.data;
          } else if (Array.isArray(parsedData)) {
            regimensData = parsedData;
          }
        } catch (parseError) {
          console.error('❌ Error parseando JSON:', parseError);
        }
      }
      // Si response.data es directamente el array
      else if (response.data && Array.isArray(response.data)) {
        console.log('✅ response.data es array directo');
        regimensData = response.data;
      }
      // Si response.data es un objeto con propiedad data
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ response.data.data es array');
        regimensData = response.data.data;
      }
      
      console.log(`📈 Se encontraron ${regimensData.length} regímenes`);
      
      if (regimensData.length > 0) {
        console.log('📋 Primer régimen:', regimensData[0]);
      } else {
        console.log('⚠️ No se encontraron regímenes');
        console.log('🔍 Response.data completo:', response.data);
      }
      
      setAvailableRegimens(regimensData);
      
    } catch (error) {
      console.error('❌ Error loading regimens:', error);
      Alert.alert('Error', 'No se pudieron cargar los regímenes fiscales');
      setAvailableRegimens([]);
    } finally {
      setLoadingRegimens(false);
    }
  };

  // Handlers para regímenes
  const handleRegimenToggle = (regimen: RegimenFiscal, checked: boolean) => {
    if (checked) {
      const newSelectedRegimen: SelectedRegimen = {
        id_regimen: regimen.id_regimen,
        fecha_inicio_regimen: new Date().toISOString().split('T')[0],
        predeterminado: selectedRegimens.length === 0,
        usosCfdi: []
      };
      setSelectedRegimens(prev => [...prev, newSelectedRegimen]);
    } else {
      setSelectedRegimens(prev => prev.filter(r => r.id_regimen !== regimen.id_regimen));
      if (expandedRegimen === regimen.id_regimen) {
        setExpandedRegimen(null);
      }
    }
  };

  const handleFechaInicioRegimenChange = (idRegimen: number, fecha: string) => {
    setSelectedRegimens(prev =>
      prev.map(regimen =>
        regimen.id_regimen === idRegimen
          ? { ...regimen, fecha_inicio_regimen: fecha }
          : regimen
      )
    );
  };

  const handlePredeterminadoToggle = (idRegimen: number, checked: boolean) => {
    setSelectedRegimens(prev =>
      prev.map(regimen => ({
        ...regimen,
        predeterminado: regimen.id_regimen === idRegimen ? checked : false
      }))
    );
  };

  // Handlers para usos de CFDI
  const handleUsoCFDIToggle = (idRegimen: number, usoCFDI: string, checked: boolean) => {
    setSelectedRegimens(prev =>
      prev.map(regimen => {
        if (regimen.id_regimen === idRegimen) {
          const usosCfdi = checked
            ? [...(regimen.usosCfdi || []), { uso_cfdi: usoCFDI, predeterminado: false }]
            : (regimen.usosCfdi || []).filter(u => u.uso_cfdi !== usoCFDI);
          
          return { ...regimen, usosCfdi };
        }
        return regimen;
      })
    );
  };

  const handleUsoCFDIPredeterminadoToggle = (idRegimen: number, usoCFDI: string, checked: boolean) => {
    setSelectedRegimens(prev =>
      prev.map(regimen => {
        if (regimen.id_regimen === idRegimen) {
          const usosCfdi = (regimen.usosCfdi || []).map(uso => ({
            ...uso,
            predeterminado: uso.uso_cfdi === usoCFDI ? checked : false
          }));
          return { ...regimen, usosCfdi };
        }
        return regimen;
      })
    );
  };

  const toggleRegimenExpansion = (idRegimen: number) => {
    setExpandedRegimen(prev => prev === idRegimen ? null : idRegimen);
  };

  const handleSubmit = () => {
    if (selectedRegimens.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos un régimen fiscal');
      return;
    }

    const submitData = {
      regimens: selectedRegimens,
      additionalData: fiscalData
    };

    console.log('Datos a enviar:', submitData);
    onSubmit(submitData);
  };

  // Componente para renderizar cada item de la tabla
  const renderRegimenItem = ({ item: regimen }: { item: RegimenFiscal }) => {
    const selectedRegimen = selectedRegimens.find(r => r.id_regimen === regimen.id_regimen);
    const isSelected = !!selectedRegimen;
    const isExpanded = expandedRegimen === regimen.id_regimen;

    return (
      <View style={styles.regimenItem}>
        {/* Fila principal del régimen */}
        <View style={styles.regimenRow}>
          <View style={styles.centerCell}>
            <Checkbox.Android
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => handleRegimenToggle(regimen, !isSelected)}
              color="#1A2A6C"
            />
          </View>
          
          <Text style={[styles.regimenCell, styles.centerCell, styles.codeCell]}>
            {regimen.clave}
          </Text>
          
          <Text style={[styles.regimenCell, styles.descriptionCell]}>
            {regimen.descripcion}
          </Text>
          
          <View style={styles.centerCell}>
            {isSelected && (
              <TextInput
                style={styles.dateInput}
                value={selectedRegimen?.fecha_inicio_regimen}
                onChangeText={(text) => handleFechaInicioRegimenChange(regimen.id_regimen, text)}
                placeholder="YYYY-MM-DD"
              />
            )}
          </View>
          
          <View style={styles.centerCell}>
            {isSelected && (
              <Checkbox.Android
                status={selectedRegimen?.predeterminado ? 'checked' : 'unchecked'}
                onPress={() => handlePredeterminadoToggle(regimen.id_regimen, !selectedRegimen?.predeterminado)}
                color="#1A2A6C"
              />
            )}
          </View>
        </View>

        {/* Sección expandible de Usos de CFDI */}
        {isSelected && (
          <View style={styles.usosSection}>
            <TouchableOpacity
              style={styles.usosHeader}
              onPress={() => toggleRegimenExpansion(regimen.id_regimen)}
            >
              <Receipt size={16} color="#1A2A6C" />
              <Text style={styles.usosHeaderText}>
                Usos de CFDI ({selectedRegimen?.usosCfdi?.length || 0} seleccionados)
              </Text>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.usosContent}>
                <View style={styles.usosTableHeader}>
                  <Text style={[styles.usosHeaderCell, styles.centerCell]}>SEL.</Text>
                  <Text style={[styles.usosHeaderCell, styles.centerCell]}>CÓDIGO</Text>
                  <Text style={styles.usosHeaderCell}>DESCRIPCIÓN</Text>
                  <Text style={[styles.usosHeaderCell, styles.centerCell]}>PRED.</Text>
                </View>

                {regimen.usos_cfdi && regimen.usos_cfdi.map((uso) => {
                  const selectedUso = selectedRegimen?.usosCfdi?.find(u => u.uso_cfdi === uso.usoCFDI);
                  const isUsoSelected = !!selectedUso;

                  return (
                    <View key={uso.usoCFDI} style={styles.usoRow}>
                      <View style={styles.centerCell}>
                        <Checkbox.Android
                          status={isUsoSelected ? 'checked' : 'unchecked'}
                          onPress={() => handleUsoCFDIToggle(regimen.id_regimen, uso.usoCFDI, !isUsoSelected)}
                          color="#1A2A6C"
                        />
                      </View>
                      
                      <Text style={[styles.usoCell, styles.centerCell, styles.codeCell]}>
                        {uso.usoCFDI}
                      </Text>
                      
                      <Text style={[styles.usoCell, styles.descriptionCell]}>
                        {uso.descripcion}
                      </Text>
                      
                      <View style={styles.centerCell}>
                        {isUsoSelected && (
                          <Checkbox.Android
                            status={selectedUso?.predeterminado ? 'checked' : 'unchecked'}
                            onPress={() => handleUsoCFDIPredeterminadoToggle(regimen.id_regimen, uso.usoCFDI, !selectedUso?.predeterminado)}
                            color="#1A2A6C"
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Renderizado condicional para la tabla
  const renderRegimenList = () => {
    if (loadingRegimens) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1A2A6C" />
          <Text style={styles.loadingText}>Cargando regímenes...</Text>
        </View>
      );
    }

    if (!availableRegimens || availableRegimens.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron regímenes fiscales</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadRegimens}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.tableContainer}>
        {/* Header de la tabla - FIJO */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>SEL.</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>CÓD.</Text>
          <Text style={styles.tableHeaderCell}>RÉGIMEN FISCAL</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>FECHA INICIO</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>PRED.</Text>
        </View>

        {/* FLATLIST para la tabla - SCROLL INDEPENDIENTE */}
        <FlatList
          data={availableRegimens}
          renderItem={renderRegimenItem}
          keyExtractor={(item) => item.id_regimen.toString()}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled={true}
      >
        
        {/* Sección de Regímenes Fiscales */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#1A2A6C" />
            <Text style={styles.sectionTitle}>Regímenes Fiscales</Text>
          </View>

          <View style={styles.regimenHeader}>
            <Text style={styles.regimenHeaderText}>Regímenes Fiscales *</Text>
            <TouchableOpacity
              style={styles.deselectButton}
              onPress={() => setSelectedRegimens([])}
            >
              <Text style={styles.deselectButtonText}>Deseleccionar Todos</Text>
            </TouchableOpacity>
          </View>

          {renderRegimenList()}
        </View>

        {/* Sección de Información Adicional */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#1A2A6C" />
            <Text style={styles.sectionTitle}>Información Adicional</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha Inicio de Operaciones</Text>
              <TextInput
                style={styles.input}
                value={fiscalData.fecha_inicio_op}
                onChangeText={(text) => setFiscalData(prev => ({ ...prev, fecha_inicio_op: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estatus SAT</Text>
              <View style={styles.selectContainer}>
                <Text style={styles.selectText}>
                  {fiscalData.id_estatus_sat === 1 ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFiscalData(prev => ({ ...prev, id_estatus_sat: 1 }))}
                >
                  <View style={styles.radioCircle}>
                    {fiscalData.id_estatus_sat === 1 && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Activo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFiscalData(prev => ({ ...prev, id_estatus_sat: 2 }))}
                >
                  <View style={styles.radioCircle}>
                    {fiscalData.id_estatus_sat === 2 && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Inactivo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ID CIF</Text>
              <TextInput
                style={styles.input}
                value={fiscalData.idCIF}
                onChangeText={(text) => setFiscalData(prev => ({ ...prev, idCIF: text }))}
                maxLength={13}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lugar de Emisión</Text>
              <TextInput
                style={styles.input}
                value={fiscalData.lugar_emision}
                onChangeText={(text) => setFiscalData(prev => ({ ...prev, lugar_emision: text }))}
                maxLength={200}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de Emisión</Text>
              <TextInput
                style={styles.input}
                value={fiscalData.fecha_emision}
                onChangeText={(text) => setFiscalData(prev => ({ ...prev, fecha_emision: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha Último Cambio Op.</Text>
              <TextInput
                style={styles.input}
                value={fiscalData.fecha_ult_cambio_op}
                onChangeText={(text) => setFiscalData(prev => ({ ...prev, fecha_ult_cambio_op: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={fiscalData.predeterminado ? 'checked' : 'unchecked'}
              onPress={() => setFiscalData(prev => ({ ...prev, predeterminado: !prev.predeterminado }))}
              color="#1A2A6C"
            />
            <Text style={styles.checkboxLabel}>
              Configurar como registro predeterminado
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.outlineButtonText}>Regresar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Finalizar Registro</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
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
  // ESTILOS PARA LA TABLA CON FLATLIST
  tableContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 400, // ALTURA FIJA
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
    padding: 6,
    fontSize: 12,
    minWidth: 100,
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectText: {
    fontSize: 16,
    color: '#374151',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1A2A6C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A2A6C',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  },
});