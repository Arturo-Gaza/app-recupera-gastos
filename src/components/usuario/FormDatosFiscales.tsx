import { CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN, DATOS_FISCALES_CREATE, DATOS_FISCALES_UPDATE } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronDown, ChevronUp, FileText, Home, Receipt, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardTypeOptions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useSession } from '../../hooks/useSession';

// ========== INTERFACES ==========
interface DomicilioFiscal {
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

interface ThirdPartyData {
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
  domicilioFiscal?: DomicilioFiscal;
  idCIF?: string;
}

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

// ========== COMPONENTE DE ÉXITO ==========
function SuccessStep({
  onResetData,
  onBack
}: {
  onResetData?: () => void;
  onBack?: () => void;
}) {
  const router = useRouter();

  const handleResetData = () => {
    if (onResetData) {
      onResetData();
    } else {
      Alert.alert(
        'Registrar otro receptor',
        '¿Deseas registrar otro receptor?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sí, registrar',
            onPress: () => {
              router.push('/metodoRegistroFiscal');
            }
          }
        ]
      );
    }
    router.push('/metodoRegistroFiscal');
  };

  const handlerDash = () => {
    router.push('/dashboard');
  }

  return (
    <View style={successStyles.container}>
      <View style={styles.card}>
        <View style={successStyles.content}>
          <View style={successStyles.iconContainer}>
            <CheckCircle size={64} color="#10B981" />
          </View>

          <Text style={successStyles.successTitle}>
            Receptor registrado exitosamente
          </Text>
          <Text style={successStyles.successMessage}>
            El receptor ha sido registrado correctamente en el sistema.
          </Text>

          <View style={successStyles.buttonsContainer}>
            <TouchableOpacity
              style={[successStyles.button, successStyles.outlineButton]}
              onPress={handlerDash}
            >
              <Text style={successStyles.outlineButtonText}>Ir al Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[successStyles.button, successStyles.outlineButton]}
            >
              <Text style={successStyles.outlineButtonText}>Gestionar receptores</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[successStyles.button, successStyles.primaryButton]}
              onPress={handleResetData}
            >
              <Text style={successStyles.primaryButtonText}>Registrar otro receptor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#1A2A6C',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});

// ========== COMPONENTE PRINCIPAL ==========
interface FormDatosFiscalesCompletoProps {
  initialData?: any;
  modo?: 'creacion' | 'edicion';
}

export default function FormDatosFiscalesCompleto({
  initialData,
  modo = 'creacion'
}: FormDatosFiscalesCompletoProps) {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados para el formulario de datos fiscales
  const [thirdPartyData, setThirdPartyData] = useState<ThirdPartyData>({
    es_persona_moral: false,
    nombre_razon: '',
    primer_apellido: '',
    segundo_apellido: '',
    nombre_comercial: '',
    rfc: '',
    curp: '',
    email_facturacion_text: '',
    fecha_inicio_op: '',
    fecha_emision: '',
    lugar_emision: '',
    id_estatus_sat: 1,
    predeterminado: true,
    domicilioFiscal: {
      calle: '',
      num_exterior: '',
      num_interior: '',
      codigo_postal: '',
      colonia: '',
      localidad: '',
      municipio: '',
      estado: '',
      pais: 'México'
    }
  });

  // Estados para la sección de regímenes fiscales
  const [availableRegimens, setAvailableRegimens] = useState<RegimenFiscal[]>([]);
  const [selectedRegimens, setSelectedRegimens] = useState<SelectedRegimen[]>([]);
  const [loadingRegimens, setLoadingRegimens] = useState(false);
  const [expandedRegimen, setExpandedRegimen] = useState<number | null>(null);

  // Estados de UI
  const [currentStep, setCurrentStep] = useState<'datos' | 'regimenes' | 'exito'>('datos');
  const [internalLoading, setInternalLoading] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [loadingCSF, setLoadingCSF] = useState(false);
  const { session, loading: sessionLoading } = useSession();

  // NUEVO: Cargar datos de edición
  useEffect(() => {
    if (initialData && modo === 'edicion') {
      cargarDatosEdicion(initialData);
    }
  }, [initialData, modo]);

  //NUEVA FUNCIÓN: Cargar datos cuando estamos editando
  const cargarDatosEdicion = (datosEdicion: any) => {


    setThirdPartyData({
      es_persona_moral: datosEdicion.es_persona_moral || false,
      nombre_razon: datosEdicion.nombre_razon || '',
      primer_apellido: datosEdicion.primer_apellido || '',
      segundo_apellido: datosEdicion.segundo_apellido || '',
      nombre_comercial: datosEdicion.nombre_comercial || '',
      rfc: datosEdicion.rfc || '',
      curp: datosEdicion.curp || '',
      email_facturacion_text: datosEdicion.email_facturacion_text || '',
      fecha_inicio_op: datosEdicion.fecha_inicio_op || '',
      fecha_emision: datosEdicion.fecha_emision || '',
      lugar_emision: datosEdicion.lugar_emision || '',
      id_estatus_sat: datosEdicion.id_estatus_sat || 1,
      predeterminado: datosEdicion.predeterminado ?? true,
      idCIF: datosEdicion.idCIF || '',
      domicilioFiscal: {
        calle: datosEdicion.domicilioFiscal?.calle || '',
        num_exterior: datosEdicion.domicilioFiscal?.num_exterior || '',
        num_interior: datosEdicion.domicilioFiscal?.num_interior || '',
        codigo_postal: datosEdicion.domicilioFiscal?.codigo_postal || '',
        colonia: datosEdicion.domicilioFiscal?.colonia || '',
        localidad: datosEdicion.domicilioFiscal?.localidad || '',
        municipio: datosEdicion.domicilioFiscal?.municipio || '',
        estado: datosEdicion.domicilioFiscal?.estado || '',
        pais: datosEdicion.domicilioFiscal?.pais || 'México'
      }
    });

    // Si hay regímenes fiscales en los datos de edición, cargarlos
    if (datosEdicion.regimenesFiscales && datosEdicion.regimenesFiscales.length > 0) {
      const regimenesSeleccionados: SelectedRegimen[] = datosEdicion.regimenesFiscales.map((regimen: any) => ({
        id_regimen: regimen.id_regimen,
        fecha_inicio_regimen: regimen.fecha_inicio_regimen || datosEdicion.fecha_inicio_op || new Date().toISOString().split('T')[0],
        predeterminado: regimen.predeterminado || false,
        usosCfdi: regimen.usosCfdi?.map((uso: any) => ({
          uso_cfdi: uso.uso_cfdi,
          predeterminado: uso.predeterminado
        })) || []
      }));
      setSelectedRegimens(regimenesSeleccionados);
    }


  };

  // ========== CARGA AUTOMÁTICA DESDE ARCHIVO CSF ==========
  useEffect(() => {
    const loadCSFData = async () => {
      if (params.fiscalData && !autoLoaded && modo === 'creacion') {
        try {
          setLoadingCSF(true);
          const fiscalData = JSON.parse(params.fiscalData as string);

          // Verificar que los datos tengan la estructura esperada
          if (!fiscalData || (!fiscalData.data && !fiscalData.rfc)) {
            throw new Error('Datos del CSF incompletos o inválidos');
          }

          await autoFillFormData(fiscalData);
          setAutoLoaded(true);

        } catch (error) {

          Alert.alert(
            "Error al cargar datos",
            "No se pudieron cargar los datos del archivo CSF. Por favor, ingresa los datos manualmente.",
            [{ text: 'Entendido' }]
          );
        } finally {
          setLoadingCSF(false);
        }
      }
    };

    loadCSFData();
  }, [params.fiscalData]);

  // ========== FUNCIONES COMUNES ==========
  const normalizeText = (text: string): string => {
    return text.trim().toUpperCase();
  };

  // ========== FUNCIÓN PARA AUTOLLENAR FORMULARIO DESDE ARCHIVO ==========
  const autoFillFormData = (apiData: any) => {
    // La estructura puede variar, así que manejemos diferentes casos
    const data = apiData.data || apiData;

    setThirdPartyData({
      es_persona_moral: data.es_persona_moral || false,
      nombre_razon: data.nombre_razon || data.razonSocial || '',
      primer_apellido: data.primer_apellido || data.apellidoPaterno || '',
      segundo_apellido: data.segundo_apellido || data.apellidoMaterno || '',
      nombre_comercial: data.nombre_comercial || data.nombreComercial || '',
      rfc: data.rfc || '',
      curp: data.curp || '',
      email_facturacion_text: data.email || data.correo || data.email_facturacion_text || '',
      fecha_inicio_op: data.fecha_inicio_op || data.fechaInicioOperaciones || '',
      fecha_emision: data.fecha_emision || data.fechaEmision || '',
      lugar_emision: data.lugar_emision || data.lugarEmision || '',
      id_estatus_sat: data.id_estatus_sat || 1,
      predeterminado: data.predeterminado || true,
      idCIF: data.idCIF || data.cif || '',
      domicilioFiscal: {
        calle: data.domicilioFiscal?.calle || data.domicilio?.calle || '',
        num_exterior: data.domicilioFiscal?.num_exterior || data.domicilio?.numeroExterior || '',
        num_interior: data.domicilioFiscal?.num_interior || data.domicilio?.numeroInterior || '',
        codigo_postal: data.domicilioFiscal?.codigo_postal || data.domicilio?.codigoPostal || '',
        colonia: data.domicilioFiscal?.colonia || data.domicilio?.colonia || '',
        localidad: data.domicilioFiscal?.localidad || data.domicilio?.localidad || '',
        municipio: data.domicilioFiscal?.municipio || data.domicilio?.municipio || '',
        estado: data.domicilioFiscal?.estado || data.domicilio?.estado || '',
        pais: data.domicilioFiscal?.pais || data.domicilio?.pais || 'México'
      }
    });

    // Si hay regímenes fiscales en la respuesta, los seleccionamos automáticamente
    if (data.regimenesFiscales && data.regimenesFiscales.length > 0) {
      const selectedRegimens: SelectedRegimen[] = data.regimenesFiscales.map((regimen: any) => ({
        id_regimen: regimen.id_regimen,
        fecha_inicio_regimen: regimen.fecha_inicio_regimen || data.fecha_inicio_op || new Date().toISOString().split('T')[0],
        predeterminado: regimen.predeterminado || false,
        usosCfdi: regimen.usosCfdi || []
      }));
      setSelectedRegimens(selectedRegimens);
    }

    //Mostrar mensaje con los datos reales del CSF
    Alert.alert(
      'Datos del CSF cargados',
      `Se han cargado los datos fiscales de:\n\nRFC: ${data.rfc || 'N/A'}\nNombre: ${data.nombre_razon || data.razonSocial || 'N/A'}`,
      [{ text: 'Continuar' }]
    );
  };

  // ========== FUNCIONES PARA DATOS FISCALES ==========
  const domicilioFields = [
    { key: 'calle' as const, label: 'Calle', maxLength: 200 },
    { key: 'num_exterior' as const, label: 'Número Exterior', maxLength: 49 },
    { key: 'num_interior' as const, label: 'Número Interior', maxLength: 49 },
    { key: 'codigo_postal' as const, label: 'Código Postal *', maxLength: 5, keyboardType: 'numeric' as KeyboardTypeOptions },
    { key: 'colonia' as const, label: 'Colonia', maxLength: 149 },
    { key: 'localidad' as const, label: 'Localidad', maxLength: 149 },
    { key: 'municipio' as const, label: 'Municipio', maxLength: 149 },
    { key: 'estado' as const, label: 'Estado', maxLength: 149 },
  ];

  const validateApellido = (apellido: string): string | null => {
    if (apellido.length < 2) return "El apellido debe tener al menos 2 caracteres";
    return null;
  };

  const validateRFC = (rfc: string, esPersonaMoral: boolean): boolean => {
    const pattern = esPersonaMoral ? /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/ : /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
    return pattern.test(rfc);
  };

  const validateCURPWithRFC = (curp: string, rfc: string): { isValid: boolean; message: string } => {
    if (curp.length !== 18) return { isValid: false, message: "La CURP debe tener 18 caracteres" };
    return { isValid: true, message: "" };
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAddress = (address: string): string | null => {
    if (address.length < 2) return "La dirección debe tener al menos 2 caracteres";
    return null;
  };

  const validatePostalCode = (postalCode: string): string | null => {
    if (postalCode.length !== 5) return "El código postal debe tener 5 dígitos";
    return null;
  };

  const resetDataMoral = () => {
    setThirdPartyData(prev => ({
      ...prev,
      nombre_razon: '',
      primer_apellido: '',
      segundo_apellido: '',
      nombre_comercial: '',
      rfc: '',
      curp: '',
      email_facturacion_text: '',
      fecha_inicio_op: '',
      fecha_emision: '',
      lugar_emision: '',
      domicilioFiscal: {
        calle: '',
        num_exterior: '',
        num_interior: '',
        codigo_postal: '',
        colonia: '',
        localidad: '',
        municipio: '',
        estado: '',
        pais: 'México'
      }
    }));
  };

  const currentLoading = internalLoading || sessionLoading;

  const handleRFCChange = (text: string) => {
    const normalizedValue = normalizeText(text);
    setThirdPartyData(prev => ({
      ...prev,
      rfc: normalizedValue,
      curp: !prev.es_persona_moral
        ? normalizedValue.length >= 10
          ? normalizedValue.substring(0, 10) + prev.curp.substring(10)
          : prev.curp.substring(0, normalizedValue.length)
        : prev.curp,
    }));
  };

  const updateDomicilioFiscal = (field: keyof DomicilioFiscal, value: string) => {
    setThirdPartyData(prev => ({
      ...prev,
      domicilioFiscal: {
        ...prev.domicilioFiscal,
        [field]: value
      }
    }));
  };

  const validateDatosFiscales = (): boolean => {
    const errors: string[] = [];

    if (!thirdPartyData.nombre_razon.trim()) {
      errors.push('El nombre/razón social es requerido');
    }

    if (!thirdPartyData.rfc.trim()) {
      errors.push('El RFC es requerido');
    } else if (!validateRFC(thirdPartyData.rfc, thirdPartyData.es_persona_moral)) {
      errors.push('El RFC no tiene un formato válido');
    }

    if (!thirdPartyData.email_facturacion_text.trim()) {
      errors.push('El correo electrónico es requerido');
    } else if (!validateEmail(thirdPartyData.email_facturacion_text)) {
      errors.push('El formato del correo electrónico es inválido');
    }

    if (!thirdPartyData.domicilioFiscal?.codigo_postal) {
      errors.push('El código postal es requerido');
    } else if (validatePostalCode(thirdPartyData.domicilioFiscal.codigo_postal)) {
      errors.push('El código postal debe tener 5 dígitos');
    }

    if (errors.length > 0) {
      Alert.alert('Errores de validación', errors.join('\n• '));
      return false;
    }

    return true;
  };

  // ========== FUNCIONES PARA REGÍMENES FISCALES ==========
  const loadRegimens = async () => {
    try {
      setLoadingRegimens(true);

      const esPersonaMoral = thirdPartyData.es_persona_moral

      const response = await requests.get({
        command: CATALOGO_REGIMEN_FISCALES_GET_BY_BOOLEAN + esPersonaMoral,
      });

      let regimensData: RegimenFiscal[] = [];

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
      else if (response.data && Array.isArray(response.data)) {
        regimensData = response.data;
      }
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

  const validateRegimenesFiscales = (): boolean => {
    if (selectedRegimens.length === 0) {
      Alert.alert('Error', 'Debe seleccionar al menos un régimen fiscal');
      return false;
    }
    return true;
  };

  // ========== FUNCIÓN PARA CONSTRUIR Y ENVIAR JSON COMPLETO ==========
  const buildCompleteJSON = () => {
    if (!session || !session.IdUsuarioSST) {
      throw new Error('No hay sesión activa o el usuario no tiene ID');
    }

    // ✅ NUEVO: Incluir ID si estamos en modo edición
    const idReceptor = modo === 'edicion' && initialData ? initialData.id : null;

    const completeData = {
      id: idReceptor, // ✅ MODIFICADO: Incluir ID en edición
      id_usuario: session.IdUsuarioSST,
      rfc: thirdPartyData.rfc,
      curp: thirdPartyData.curp,
      idCIF: thirdPartyData.idCIF || '',
      es_persona_moral: thirdPartyData.es_persona_moral,
      nombre_razon: thirdPartyData.nombre_razon,
      primer_apellido: thirdPartyData.primer_apellido,
      segundo_apellido: thirdPartyData.segundo_apellido,
      nombre_comercial: thirdPartyData.nombre_comercial,
      email_facturacion_text: thirdPartyData.email_facturacion_text,

      // Domicilio fiscal
      domicilioFiscal: {
        calle: thirdPartyData.domicilioFiscal?.calle || '',
        num_exterior: thirdPartyData.domicilioFiscal?.num_exterior || '',
        num_interior: thirdPartyData.domicilioFiscal?.num_interior || null,
        codigo_postal: thirdPartyData.domicilioFiscal?.codigo_postal || '',
        colonia: thirdPartyData.domicilioFiscal?.colonia || '',
        localidad: thirdPartyData.domicilioFiscal?.localidad || '',
        municipio: thirdPartyData.domicilioFiscal?.municipio || '',
        estado: thirdPartyData.domicilioFiscal?.estado || '',
        pais: thirdPartyData.domicilioFiscal?.pais || 'México'
      },

      // Datos adicionales
      fecha_inicio_op: thirdPartyData.fecha_inicio_op || '',
      fecha_emision: thirdPartyData.fecha_emision || '',
      lugar_emision: thirdPartyData.lugar_emision || '',
      id_estatus_sat: thirdPartyData.id_estatus_sat || 1,
      predeterminado: thirdPartyData.predeterminado || true,
      fecha_ultimo_cambio: new Date().toISOString().split('T')[0],

      // Campos opcionales
      email: null,
      email_facturacion_id: null,
      telefono: null,
      datos_extra: null,
      fecha_ult_cambio_op: null,
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

  // ========== HANDLERS SEPARADOS PARA CREAR Y ACTUALIZAR ==========

  // Handler para crear nuevo registro
  const handleCreate = async () => {
    setInternalLoading(true);
    
    try {
      const completeData = buildCompleteJSON();
      const response = await requests.post({
        command: DATOS_FISCALES_CREATE,
        data: completeData,
      });

      const { data } = response;

      if (data.success) {
        Alert.alert('¡Éxito!', 'Registro fiscal completado correctamente');
        // Opcional: navegar o limpiar formulario después del éxito
        router.push("/dashboard")
      } else {
        Alert.alert('Error', data.message || 'Error al crear el registro');
      }
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de conexión al crear';
      Alert.alert('Error', message);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handler para actualizar registro existente
  const handleUpdate = async () => {
    setInternalLoading(true);
    
    try {
      const completeData = buildCompleteJSON();
      const response = await requests.put({
        command: DATOS_FISCALES_UPDATE,
        data: completeData,
      });

      const { data } = response;

      if (data.success) {
        Alert.alert('¡Éxito!', 'Receptor actualizado correctamente');
        // Opcional: navegar o limpiar formulario después del éxito
        // setCurrentStep('exito');
        router.back(); 
        
      } else {
        Alert.alert('Error', data.message || 'Error al actualizar el registro');
      }
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de conexión al actualizar';
      Alert.alert('Error', message);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handler principal que decide cuál usar
  const handleFinalSubmit = async () => {
    if (!validateRegimenesFiscales()) return;

    if (modo === 'edicion') {
      await handleUpdate();
      
    } else {
      await handleCreate();
      
    }
  };

  // ========== NAVEGACIÓN ENTRE STEPS ==========
  const handleNextStep = () => {
    if (!validateDatosFiscales()) return;

    // Cargar regímenes cuando pasamos al siguiente step
    loadRegimens();
    setCurrentStep('regimenes');
  };

  const handlePrevStep = () => {
    setCurrentStep('datos');
  };

  // ========== FUNCIÓN PARA RESETEAR FORMULARIO ==========
  const resetFormData = () => {
    setThirdPartyData({
      es_persona_moral: false,
      nombre_razon: '',
      primer_apellido: '',
      segundo_apellido: '',
      nombre_comercial: '',
      rfc: '',
      curp: '',
      email_facturacion_text: '',
      fecha_inicio_op: '',
      fecha_emision: '',
      lugar_emision: '',
      id_estatus_sat: 1,
      predeterminado: true,
      domicilioFiscal: {
        calle: '',
        num_exterior: '',
        num_interior: '',
        codigo_postal: '',
        colonia: '',
        localidad: '',
        municipio: '',
        estado: '',
        pais: 'México'
      }
    });
    setSelectedRegimens([]);
    setCurrentStep('datos');
    setAutoLoaded(false);
  };

  // ========== RENDERIZADO DE REGÍMENES ==========
  const renderRegimenItem = ({ item: regimen }: { item: RegimenFiscal }) => {
    const selectedRegimen = selectedRegimens.find(r => r.id_regimen === regimen.id_regimen);
    const isSelected = !!selectedRegimen;
    const isExpanded = expandedRegimen === regimen.id_regimen;

    return (
      <View style={styles.regimenItem}>
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
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>SEL.</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>CÓD.</Text>
          <Text style={styles.tableHeaderCell}>RÉGIMEN FISCAL</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>FECHA INICIO</Text>
          <Text style={[styles.tableHeaderCell, styles.centerCell]}>PRED.</Text>
        </View>

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

  // ========== RENDER PRINCIPAL ==========
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.card, styles.transparentCard]}>
          <Image
            source={require('@/assets/images/rg-logo.png')}
            style={[styles.logo, styles.largeLogo]}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerTitle}>
          {modo === 'edicion' ? 'Editar Receptor' : 'Datos Fiscales del Tercero'}
          {currentStep === 'regimenes' ? ' - Regímenes Fiscales' :
            currentStep === 'exito' ? ' - Registro Exitoso' : ''}
        </Text>

        {/* Mostrar loading mientras se procesa el CSF */}
        {loadingCSF && (
          <View style={styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1A2A6C" />
              <Text style={styles.loadingText}>Procesando datos del CSF...</Text>
            </View>
          </View>
        )}

        {/* STEP 1: DATOS FISCALES */}
        {currentStep === 'datos' && (
          <>
            {/* ✅ MODIFICADO: Mostrar información de edición */}
            {modo === 'edicion' && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color="#1A2A6C" />
                  <Text style={styles.sectionTitle}>Editando Receptor</Text>
                </View>

                <Text style={styles.uploadDescription}>
                  Estás editando el receptor existente. Modifica los datos necesarios y guarda los cambios.
                </Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>RFC: </Text>
                    {thirdPartyData.rfc || 'No disponible'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {thirdPartyData.nombre_razon || 'No disponible'}
                  </Text>
                </View>
              </View>
            )}

            {/* Sección informativa de datos cargados desde CSF */}
            {autoLoaded && modo === 'creacion' && (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color="#10B981" />
                  <Text style={styles.sectionTitle}>Datos del Archivo CSF</Text>
                </View>

                <Text style={styles.uploadDescription}>
                  Los datos se han cargado automáticamente desde el archivo CSF procesado.
                  Revisa y completa la información si es necesario.
                </Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>RFC: </Text>
                    {thirdPartyData.rfc || 'No disponible'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {thirdPartyData.nombre_razon || 'No disponible'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Archivo procesado: </Text>
                    Correctamente
                  </Text>
                </View>
              </View>
            )}

            {/* Checkbox para persona moral/física */}
            <View style={styles.card}>
              <View style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={thirdPartyData.es_persona_moral ? 'checked' : 'unchecked'}
                  disabled={currentLoading}
                  onPress={() => {
                    resetDataMoral();
                    setThirdPartyData(prev => ({
                      ...prev,
                      es_persona_moral: !prev.es_persona_moral,
                    }));
                  }}
                  color="#3b82f6"
                />
                <Text style={styles.checkboxLabel}>Es persona moral</Text>
              </View>

              {/* Datos de la persona fiscal */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <User size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>
                    Datos de la Persona {thirdPartyData.es_persona_moral ? 'Moral' : 'Física'}
                  </Text>
                </View>

                <View style={styles.formGrid}>
                  {/* Nombre/Razón Social */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      {thirdPartyData.es_persona_moral ? 'Razón Social *' : 'Nombre(s) *'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={thirdPartyData.nombre_razon}
                      placeholderTextColor="rgba(0, 0, 0, 0.3)"
                      onChangeText={(text) => setThirdPartyData(prev => ({
                        ...prev,
                        nombre_razon: normalizeText(text)
                      }))}
                      maxLength={100}
                      placeholder={thirdPartyData.es_persona_moral ? 'Razón Social' : 'Nombre(s)'}
                      editable={!currentLoading}
                    />
                  </View>

                  {/* Campos para persona física */}
                  {!thirdPartyData.es_persona_moral && (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Primer Apellido *</Text>
                        <TextInput
                          style={styles.input}
                          value={thirdPartyData.primer_apellido}
                          placeholderTextColor="rgba(0, 0, 0, 0.3)"
                          onChangeText={(text) => setThirdPartyData(prev => ({
                            ...prev,
                            primer_apellido: normalizeText(text)
                          }))}
                          maxLength={99}
                          placeholder="Primer Apellido"
                          editable={!currentLoading}
                        />
                        {thirdPartyData.primer_apellido && validateApellido(thirdPartyData.primer_apellido) && (
                          <Text style={styles.errorText}>
                            {validateApellido(thirdPartyData.primer_apellido)}
                          </Text>
                        )}
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Segundo Apellido *</Text>
                        <TextInput
                          style={styles.input}
                          value={thirdPartyData.segundo_apellido}
                          placeholderTextColor="rgba(0, 0, 0, 0.3)"
                          onChangeText={(text) => setThirdPartyData(prev => ({
                            ...prev,
                            segundo_apellido: normalizeText(text)
                          }))}
                          maxLength={99}
                          placeholder="Segundo Apellido"
                          editable={!currentLoading}
                        />
                        {thirdPartyData.segundo_apellido && validateApellido(thirdPartyData.segundo_apellido) && (
                          <Text style={styles.errorText}>
                            {validateApellido(thirdPartyData.segundo_apellido)}
                          </Text>
                        )}
                      </View>
                    </>
                  )}

                  {/* Nombre Comercial para persona moral */}
                  {thirdPartyData.es_persona_moral && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Nombre Comercial</Text>
                      <TextInput
                        style={styles.input}
                        value={thirdPartyData.nombre_comercial}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                        onChangeText={(text) => setThirdPartyData(prev => ({
                          ...prev,
                          nombre_comercial: normalizeText(text)
                        }))}
                        maxLength={200}
                        placeholder="Nombre Comercial"
                        editable={!currentLoading}
                      />
                    </View>
                  )}

                  {/* RFC */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>RFC *</Text>
                    <TextInput
                      style={styles.input}
                      value={thirdPartyData.rfc}
                      onChangeText={handleRFCChange}
                      placeholderTextColor="rgba(0, 0, 0, 0.3)"
                      placeholder="XXXX000000XXX"
                      maxLength={thirdPartyData.es_persona_moral === true ? 12 : 13}
                      editable={!currentLoading}
                      autoCapitalize="characters"
                    />
                    {thirdPartyData.rfc && !validateRFC(thirdPartyData.rfc, thirdPartyData.es_persona_moral) && (
                      <Text style={styles.errorText}>
                        {thirdPartyData.es_persona_moral
                          ? "Formato inválido: 3 letras + fecha real (AAMMDD) + 3 caracteres"
                          : "Formato inválido: 4 letras + fecha real (AAMMDD) + 3 caracteres"}
                      </Text>
                    )}
                  </View>

                  {/* CURP para persona física */}
                  {!thirdPartyData.es_persona_moral && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>CURP</Text>
                      <TextInput
                        style={styles.input}
                        value={thirdPartyData.curp}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                        onChangeText={(text) => setThirdPartyData(prev => ({
                          ...prev,
                          curp: normalizeText(text)
                        }))}
                        placeholder="XXXX000000XXXXXXXX (opcional)"
                        maxLength={18}
                        editable={!currentLoading}
                        autoCapitalize="characters"
                      />
                      {thirdPartyData.curp && !validateCURPWithRFC(thirdPartyData.curp, thirdPartyData.rfc).isValid && (
                        <Text style={styles.errorText}>
                          {validateCURPWithRFC(thirdPartyData.curp, thirdPartyData.rfc).message}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="rgba(0, 0, 0, 0.3)"
                      value={thirdPartyData.email_facturacion_text}
                      onChangeText={(text) => setThirdPartyData(prev => ({
                        ...prev,
                        email_facturacion_text: text
                      }))}
                      placeholder="correo@ejemplo.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!currentLoading}
                    />
                    {thirdPartyData.email_facturacion_text && !validateEmail(thirdPartyData.email_facturacion_text) && (
                      <Text style={styles.errorText}>Formato de correo inválido</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              {/* Domicilio Fiscal */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Home size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Domicilio Fiscal</Text>
                </View>

                <View style={styles.formGrid}>
                  {domicilioFields.map(({ key, label, maxLength, keyboardType }) => (
                    <View key={key} style={styles.inputContainer}>
                      <Text style={styles.label}>{label}</Text>
                      <TextInput
                        style={styles.input}
                        value={thirdPartyData.domicilioFiscal?.[key] || ''}
                        onChangeText={(text) => {
                          if (key === 'codigo_postal') {
                            const numericValue = text.replace(/\D/g, '').substring(0, 5);
                            updateDomicilioFiscal(key, numericValue);
                          } else {
                            updateDomicilioFiscal(key, normalizeText(text));
                          }
                        }}
                        maxLength={maxLength}
                        placeholder={label}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                        keyboardType={keyboardType}
                        editable={!currentLoading}
                      />
                      {key === 'calle' && thirdPartyData.domicilioFiscal?.calle && validateAddress(thirdPartyData.domicilioFiscal.calle) && (
                        <Text style={styles.errorText}>
                          {validateAddress(thirdPartyData.domicilioFiscal.calle)}
                        </Text>
                      )}
                      {key === 'num_exterior' && thirdPartyData.domicilioFiscal?.num_exterior && validateAddress(thirdPartyData.domicilioFiscal.num_exterior) && (
                        <Text style={styles.errorText}>
                          {validateAddress(thirdPartyData.domicilioFiscal.num_exterior)}
                        </Text>
                      )}
                      {key === 'codigo_postal' && thirdPartyData.domicilioFiscal?.codigo_postal && validatePostalCode(thirdPartyData.domicilioFiscal.codigo_postal) && (
                        <Text style={styles.errorText}>
                          {validatePostalCode(thirdPartyData.domicilioFiscal.codigo_postal)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Botones Step 1 */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.outlineButton]}
                  onPress={() => router.back()}
                  disabled={currentLoading}
                >
                  <Text style={styles.outlineButtonText}>
                    Regresar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, currentLoading && styles.disabledButton]}
                  onPress={handleNextStep}
                  disabled={currentLoading}
                >
                  {currentLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Continuar a Regímenes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* STEP 2: REGÍMENES FISCALES */}
        {currentStep === 'regimenes' && (
          <>
            {/* Información del Tercero (solo lectura) */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color="#1A2A6C" />
                <Text style={styles.sectionTitle}>
                  {modo === 'edicion' ? 'Editando Receptor' : 'Información del Tercero'}
                </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>RFC: </Text>
                  {thirdPartyData.rfc}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Nombre: </Text>
                  {thirdPartyData.nombre_razon} {thirdPartyData.primer_apellido} {thirdPartyData.segundo_apellido}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email: </Text>
                  {thirdPartyData.email_facturacion_text}
                </Text>
              </View>
            </View>

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

            {/* ✅ NUEVA SECCIÓN: Información Adicional */}
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
                    value={thirdPartyData.fecha_inicio_op}
                    onChangeText={(text) => setThirdPartyData(prev => ({ ...prev, fecha_inicio_op: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>ID CIF</Text>
                  <TextInput
                    style={styles.input}
                    value={thirdPartyData.idCIF}
                    onChangeText={(text) => setThirdPartyData(prev => ({ ...prev, idCIF: text }))}
                    maxLength={13}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Lugar de Emisión</Text>
                  <TextInput
                    style={styles.input}
                    value={thirdPartyData.lugar_emision}
                    onChangeText={(text) => setThirdPartyData(prev => ({ ...prev, lugar_emision: text }))}
                    maxLength={200}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Fecha de Emisión</Text>
                  <TextInput
                    style={styles.input}
                    value={thirdPartyData.fecha_emision}
                    onChangeText={(text) => setThirdPartyData(prev => ({ ...prev, fecha_emision: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={thirdPartyData.predeterminado ? 'checked' : 'unchecked'}
                  onPress={() => setThirdPartyData(prev => ({ ...prev, predeterminado: !prev.predeterminado }))}
                  color="#1A2A6C"
                />
                <Text style={styles.checkboxLabel}>
                  Configurar como registro predeterminado
                </Text>
              </View>
            </View>

            {/* Botones Step 2 */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handlePrevStep}
                disabled={currentLoading}
              >
                <Text style={styles.outlineButtonText}>Regresar a Datos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton, currentLoading && styles.disabledButton]}
                onPress={handleFinalSubmit}
                disabled={currentLoading}
              >
                {currentLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {modo === 'edicion' ? 'Actualizar Receptor' : 'Finalizar Registro'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 3: ÉXITO */}
        {currentStep === 'exito' && (
          <SuccessStep
            onResetData={resetFormData}
            onBack={() => setCurrentStep('regimenes')}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ========== ESTILOS ==========
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2A6C',
    marginLeft: 20,
    marginBottom: 16,
  },
  // Estilos comunes
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: -55,
    marginLeft: 35
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    marginTop: 85
  },
  largeLogo: {
    width: 300 * 0.8,
    height: 150 * 0.8,
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
  // Estilos para información del tercero
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
  // Estilos para regímenes fiscales
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
  // Estilos para la tabla de regímenes
  tableContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 400,
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
    padding: 2,
    fontSize: 12,
    minWidth: 62,
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
  // Estilos para la sección de upload
  uploadDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
});