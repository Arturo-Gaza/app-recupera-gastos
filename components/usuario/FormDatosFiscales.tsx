import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardTypeOptions,
  Image
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { User, Home, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import requests from '@/app/services/requests';
import { DATOS_FISCALES_CREATE } from '@/app/services/apiConstans';

// Interfaces para los tipos de datos
interface DomicilioFiscal {
  calle?: string;
  num_exterior?: string;
  num_interior?: string;
  codigo_postal?: string;
  colonia?: string;
  localidad?: string;
  municipio?: string;
  estado?: string;
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
  domicilioFiscal?: DomicilioFiscal;
}

// Props del componente
interface FormDatosFiscalesProps {
  loading?: boolean;
  onSubmit?: () => void;
  onBack?: () => void;
}

export default function FormDatosFiscalesPage({
  loading = false,
  onSubmit,
  onBack,
}: FormDatosFiscalesProps) {
  const router = useRouter();
  
  // Estados
  const [thirdPartyData, setThirdPartyData] = useState<ThirdPartyData>({
    es_persona_moral: false,
    nombre_razon: '',
    primer_apellido: '',
    segundo_apellido: '',
    nombre_comercial: '',
    rfc: '',
    curp: '',
    email_facturacion_text: '',
    domicilioFiscal: {
      calle: '',
      num_exterior: '',
      num_interior: '',
      codigo_postal: '',
      colonia: '',
      localidad: '',
      municipio: '',
      estado: ''
    }
  });

  const [internalLoading, setInternalLoading] = useState(false);

  // Definir los campos del domicilio con tipos correctos
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

  // Funciones de validación
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
    if (address.length < 3) return "La dirección debe tener al menos 3 caracteres";
    return null;
  };

  const validatePostalCode = (postalCode: string): string | null => {
    if (postalCode.length !== 5) return "El código postal debe tener 5 dígitos";
    return null;
  };

  const normalizeText = (text: string): string => {
    return text.trim().toUpperCase();
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
      domicilioFiscal: {
        calle: '',
        num_exterior: '',
        num_interior: '',
        codigo_postal: '',
        colonia: '',
        localidad: '',
        municipio: '',
        estado: ''
      }
    }));
  };

  // Handlers para los cambios de texto
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

  // Validación antes de enviar
  const validateBeforeSubmit = (): boolean => {
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

  // Handlers de navegación y submit - SOLO CREAR
  const handleSubmit = async () => {
    if (onSubmit) {
      // Si se pasó la prop onSubmit, la usamos
      onSubmit();
    } else {
      // Lógica por defecto si no se pasa la prop
      setInternalLoading(true);
      
      // Validaciones antes de enviar
      if (!validateBeforeSubmit()) {
        setInternalLoading(false);
        return;
      }

      try {
        console.log('📝 Datos a enviar:', thirdPartyData);
        
        // Preparar los datos para la API
        const formData = {
          es_persona_moral: thirdPartyData.es_persona_moral,
          nombre_razon: thirdPartyData.nombre_razon,
          primer_apellido: thirdPartyData.primer_apellido || '',
          segundo_apellido: thirdPartyData.segundo_apellido || '',
          nombre_comercial: thirdPartyData.nombre_comercial || '',
          rfc: thirdPartyData.rfc,
          curp: thirdPartyData.curp || '',
          email_facturacion_text: thirdPartyData.email_facturacion_text,
          
          // Domicilio fiscal
          domicilio_fiscal: {
            calle: thirdPartyData.domicilioFiscal?.calle || '',
            num_exterior: thirdPartyData.domicilioFiscal?.num_exterior || '',
            num_interior: thirdPartyData.domicilioFiscal?.num_interior || '',
            codigo_postal: thirdPartyData.domicilioFiscal?.codigo_postal || '',
            colonia: thirdPartyData.domicilioFiscal?.colonia || '',
            localidad: thirdPartyData.domicilioFiscal?.localidad || '',
            municipio: thirdPartyData.domicilioFiscal?.municipio || '',
            estado: thirdPartyData.domicilioFiscal?.estado || '',
          },
          
          // Metadata adicional
          fecha_registro: new Date().toISOString(),
          metodo_registro: 'manual'
        };

        console.log('🚀 Enviando a API:', formData);

        // Llamada a la API - SOLO CREAR
        const terceroResponse = await requests.post({
          command: DATOS_FISCALES_CREATE,
          data: formData,
        });

        const { data } = terceroResponse;
        console.log('✅ Respuesta de la API:', data);

        if (data.success) {
          Alert.alert(
            'Éxito', 
            'Datos fiscales guardados correctamente',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navegar a la pantalla de método de registro fiscal
                  router.push('/metodoRegistroFiscal');
                }
              }
            ]
          );
        } else {
          throw new Error(data.message || data.error || 'Error en la respuesta del servidor');
        }
        
      } catch (error: any) {
        console.error('❌ Error al enviar datos:', error);
        
        let errorMessage = 'Ocurrió un error al guardar los datos';
        
        if (error.response) {
          // Error de la API
          errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          // Error de red
          errorMessage = 'Error de conexión. Verifica tu internet.';
        } else if (error.message) {
          // Error del cliente
          errorMessage = error.message;
        }
        
        Alert.alert('Error', errorMessage);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Usa la prop loading o el estado interno
  const currentLoading = loading || internalLoading;

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
          Datos Fiscales del Tercero
        </Text>
        
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

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={handleBack}
              disabled={currentLoading}
            >
              <Text style={styles.outlineButtonText}>
                Regresar
              </Text>
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
                  Continuar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2A6C',
    marginLeft: 20
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
  editModeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
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
  editModeSubText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6b7280',
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
    marginBottom: 24,
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
  //Estilo para el logo
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
    width: 300 * 0.8, // Más ancho
    height: 150 * 0.8, // Más alto
    marginBottom: 30,
  },
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
    marginTop: 5
  },
});

