import { CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN, DATOS_FISCALES_CREATE } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, FileText, Receipt } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';

// Interfaces (actualizadas)
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

// Interfaces para los datos recibidos del formulario anterior
interface DomicilioFiscalData {
  calle?: string;
  num_exterior?: string;
  num_interior?: string;
  codigo_postal?: string;
  colonia?: string;
  localidad?: string;
  municipio?: string;
  estado?: string;
  pais?: string;
}

interface ThirdPartyDataFromForm {
  es_persona_moral: boolean;
  nombre_razon: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombre_comercial: string;
  rfc: string;
  curp: string;
  email_facturacion_text: string;
  fecha_inicio_op?: string;
  fecha_emision?: string;
  lugar_emision?: string;
  id_estatus_sat?: number;
  predeterminado?: boolean;
  domicilioFiscal?: DomicilioFiscalData;
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
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Obtener datos del formulario anterior
  const datosFiscales: ThirdPartyDataFromForm = params.datosFiscales 
    ? JSON.parse(params.datosFiscales as string)
    : null;

  //NUEVO: Procesar datos de edición
  const datosEdicion = params.initialData 
    ? JSON.parse(params.initialData as string)
    : null;

  const [availableRegimens, setAvailableRegimens] = useState<RegimenFiscal[]>([]);
  const [selectedRegimens, setSelectedRegimens] = useState<SelectedRegimen[]>([]);
  const [loadingRegimens, setLoadingRegimens] = useState(true);
  const [expandedRegimen, setExpandedRegimen] = useState<number | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  
  //MODIFICADO: Datos adicionales - ahora con valores de edición o creación
  const [fiscalData, setFiscalData] = useState({
    fecha_inicio_op: datosEdicion?.fecha_inicio_op || datosFiscales?.fecha_inicio_op || '',
    id_estatus_sat: datosEdicion?.id_estatus_sat || datosFiscales?.id_estatus_sat || 1,
    idCIF: datosEdicion?.idCIF || '',
    lugar_emision: datosEdicion?.lugar_emision || datosFiscales?.lugar_emision || '',
    fecha_emision: datosEdicion?.fecha_emision || datosFiscales?.fecha_emision || '',
    fecha_ult_cambio_op: datosEdicion?.fecha_ult_cambio_op || '',
    predeterminado: datosEdicion?.predeterminado ?? datosFiscales?.predeterminado ?? true
  } as {
    fecha_inicio_op: string;
    id_estatus_sat: number;
    idCIF: string;
    lugar_emision: string;
    fecha_emision: string;
    fecha_ult_cambio_op: string;
    predeterminado: boolean;
  });

  // NUEVA FUNCIÓN: Obtener datos del tercero (modo edición o creación)
  const getDatosTercero = () => {
    if (datosEdicion) {
      // Devolver datos mapeados desde el JSON de la API
      return {
        es_persona_moral: datosEdicion.es_persona_moral,
        nombre_razon: datosEdicion.nombre_razon,
        primer_apellido: datosEdicion.primer_apellido || '',
        segundo_apellido: datosEdicion.segundo_apellido || '',
        nombre_comercial: datosEdicion.nombre_comercial || '',
        rfc: datosEdicion.rfc,
        curp: datosEdicion.curp || '',
        email_facturacion_text: datosEdicion.email_facturacion_text,
        fecha_inicio_op: datosEdicion.fecha_inicio_op,
        fecha_emision: datosEdicion.fecha_emision,
        lugar_emision: datosEdicion.lugar_emision,
        id_estatus_sat: datosEdicion.id_estatus_sat,
        predeterminado: datosEdicion.predeterminado,
        domicilioFiscal: datosEdicion.domicilioFiscal || {}
      };
    }
    return datosFiscales;
  };

  const datosTercero = getDatosTercero();

  // Loading combinado
  const currentLoading = loading || internalLoading;

  //MODIFICADO: Cargar regímenes fiscales Y configurar los seleccionados si estamos editando
  useEffect(() => {
    loadRegimens();
    
    // Si estamos en modo edición, configurar los regímenes seleccionados
    if (datosEdicion && datosEdicion.regimenesFiscales) {
      configurarRegimenesEditados(datosEdicion.regimenesFiscales);
    }
  }, []);

  //NUEVA FUNCIÓN: Configurar regímenes cuando estamos editando
  const configurarRegimenesEditados = (regimenesEditados: any[]) => {
    const regimenesSeleccionados: SelectedRegimen[] = regimenesEditados.map(regimen => ({
      id_regimen: regimen.id_regimen,
      fecha_inicio_regimen: regimen.fecha_inicio_regimen,
      predeterminado: regimen.predeterminado,
      usosCfdi: regimen.usosCfdi?.map((uso: any) => ({
        uso_cfdi: uso.uso_cfdi,
        predeterminado: uso.predeterminado
      })) || []
    }));
    
    setSelectedRegimens(regimenesSeleccionados);
  };

  const loadRegimens = async () => {
    try {
      setLoadingRegimens(true);
      
      const response = await requests.get({ 
        command: CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN + false 
      });
      
      
      
      let regimensData: RegimenFiscal[] = [];
      

      // Si response.data es un string (JSON stringificado)
      if (response.data && typeof response.data === 'string') {
        
        try {
          const parsedData = JSON.parse(response.data);
          
          
          if (parsedData.data && Array.isArray(parsedData.data)) {
            regimensData = parsedData.data;
          } else if (Array.isArray(parsedData)) {
            regimensData = parsedData;
          }
        } catch (parseError) {
          
        }
      }
      // Si response.data es directamente el array
      else if (response.data && Array.isArray(response.data)) {
      
        regimensData = response.data;
      }
      // Si response.data es un objeto con propiedad data
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        
        regimensData = response.data.data;
      }
    
      
      setAvailableRegimens(regimensData);
      
    } catch (error) {
      
      Alert.alert('Error', 'No se pudieron cargar los regímenes fiscales');
      setAvailableRegimens([]);
    } finally {
      setLoadingRegimens(false);
    }
  };

  // Handlers para regímenes (se mantienen igual)
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

  // Handlers para usos de CFDI (se mantienen igual)
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

  //MODIFICADO: Construir el JSON completo (ahora incluye ID en modo edición)
  const buildCompleteJSON = () => {
    if (!datosTercero) {
      throw new Error('Faltan datos del formulario anterior');
    }

    //NUEVO: Incluir ID si estamos en modo edición
    const idReceptor = datosEdicion?.id || null;

    // Construir el objeto completo según tu estructura
    const completeData = {
      id: idReceptor, // ✅ MODIFICADO: Incluir ID en edición
      id_usuario: 4, // Ajusta según tu lógica de usuarios
      rfc: datosTercero.rfc,
      curp: datosTercero.curp,
      idCIF: fiscalData.idCIF,
      es_persona_moral: datosTercero.es_persona_moral,
      nombre_razon: datosTercero.nombre_razon,
      primer_apellido: datosTercero.primer_apellido,
      segundo_apellido: datosTercero.segundo_apellido,
      nombre_comercial: datosTercero.nombre_comercial,
      email_facturacion_text: datosTercero.email_facturacion_text,
      
      // Domicilio fiscal
      domicilioFiscal: {
        calle: datosTercero.domicilioFiscal?.calle || '',
        num_exterior: datosTercero.domicilioFiscal?.num_exterior || '',
        num_interior: datosTercero.domicilioFiscal?.num_interior || null,
        codigo_postal: datosTercero.domicilioFiscal?.codigo_postal || '',
        colonia: datosTercero.domicilioFiscal?.colonia || '',
        localidad: datosTercero.domicilioFiscal?.localidad || '',
        municipio: datosTercero.domicilioFiscal?.municipio || '',
        estado: datosTercero.domicilioFiscal?.estado || '',
        pais: datosTercero.domicilioFiscal?.pais || 'México'
      },
      
      // Datos adicionales
      fecha_inicio_op: fiscalData.fecha_inicio_op,
      fecha_emision: fiscalData.fecha_emision,
      lugar_emision: fiscalData.lugar_emision,
      id_estatus_sat: fiscalData.id_estatus_sat,
      predeterminado: fiscalData.predeterminado,
      fecha_ultimo_cambio: new Date().toISOString().split('T')[0], // Fecha actual
      
      // Campos opcionales
      email: null,
      email_facturacion_id: null,
      telefono: null,
      datos_extra: null,
      fecha_ult_cambio_op: fiscalData.fecha_ult_cambio_op || null,
      habilitado: true,
      
      // Regímenes fiscales seleccionados
      regimenesFiscales: selectedRegimens.map(regimen => ({
        id_regimen: regimen.id_regimen,
        predeterminado: regimen.predeterminado,
        fecha_inicio_regimen: regimen.fecha_inicio_regimen,
        usosCfdi: regimen.usosCfdi || []
      }))
    };

    return completeData;
  };

  const handleSubmit = async () => {
    try {
      if (selectedRegimens.length === 0) {
        Alert.alert('Error', 'Debe seleccionar al menos un régimen fiscal');
        return;
      }

      // Validar que tenemos los datos del formulario anterior
      if (!datosTercero) {
        Alert.alert('Error', 'No se encontraron los datos del formulario anterior');
        return;
      }

      // Construir el JSON completo
      const completeData = buildCompleteJSON();

      
      
      // Si se pasó la prop onSubmit, la usamos
      if (onSubmit) {
        onSubmit(completeData);
      } else {
        // Lógica por defecto - ENVIAR TODO A LA API
        setInternalLoading(true);
        
        try {
          // ENVIAR TODO JUNTO A LA API
          const response = await requests.post({
            command: DATOS_FISCALES_CREATE,
            data: completeData,
          });

          const { data } = response;

          if (data.success) {
            Alert.alert(
              '¡Éxito!', 
              datosEdicion ? 'Receptor actualizado correctamente' : 'Registro fiscal completado correctamente',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navegar a donde corresponda después del registro completo
                    router.push('/dashboard');
                  }
                }
              ]
            );
          } else {
            throw new Error(data.message || 'Error en la respuesta del servidor');
          }
          
        } catch (error: any) {
          
          Alert.alert('Error', 'No se pudo completar el registro fiscal');
        } finally {
          setInternalLoading(false);
        }
      }

    } catch (error: any) {
      
      Alert.alert('Error', error.message || 'Error al procesar los datos');
    }
  };

  // Renderizado condicional para la tabla (se mantiene igual)
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
          
          <View style={styles.fechaInicioCell}>
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

  // Renderizado condicional para la tabla (se mantiene igual)
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
          <Text style={[styles.tableHeaderCell, styles.fechaInicioCell]}>FECHA INICIO</Text>
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
        
        {/* ✅ MODIFICADO: Información del Tercero (ahora muestra datos de edición o creación) */}
        {datosTercero && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#1A2A6C" />
              <Text style={styles.sectionTitle}>
                {datosEdicion ? 'Editando Receptor' : 'Información del Tercero'}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>RFC: </Text>
                {datosTercero.rfc}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Nombre: </Text>
                {datosTercero.nombre_razon} {datosTercero.primer_apellido} {datosTercero.segundo_apellido}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Email: </Text>
                {datosTercero.email_facturacion_text}
              </Text>
            </View>
          </View>
        )}
        
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
               style={[styles.input, styles.fechaInput]}
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

        {/* MODIFICADO: Botones (texto dinámico según modo) */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={onBack}
            disabled={currentLoading}
          >
            <Text style={styles.outlineButtonText}>Regresar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, currentLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={currentLoading}
          >
            {currentLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {datosEdicion ? 'Actualizar Receptor' : 'Finalizar Registro'}
              </Text>
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
  // NUEVOS ESTILOS para información del tercero
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
  },
  infoLabel: {
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
    minWidth: 80,
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
    backgroundColor: "red"
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
  fechaInput: {
    height: 50,           // ← Altura específica
    minHeight: 50,        // ← Altura mínima
    fontSize: 18,         // ← Texto más grande
    backgroundColor: '#f8f9fa', // ← Fondo diferente
    borderColor: '#1A2A6C',     // ← Color del borde
    borderWidth: 2,             // ← Borde más grueso
  },
  fechaInicioCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140, // ← ANCHO FIJO Y GRANDE
    minWidth: 140,
    paddingHorizontal: 5,
  },
});