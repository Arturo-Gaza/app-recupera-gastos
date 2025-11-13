
import { RECEPTORES_BYUSER } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AddColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  id_usuario: string;
  onConfirm: (data: {
    id_usuario: string;
    email: string;
    facturantes: number[];
    facturante_predeterminado: number | null;
  }) => Promise<void>;
  isEdit?: boolean;
  initialEmail?: string;
}

interface Receptor {
  id: number;
  nombre_razon: string;
  predeterminado: boolean;
}

export function AddColaborador({
  isOpen,
  onClose,
  title,
  description,
  confirmText,
  cancelText,
  id_usuario,
  onConfirm,
  isEdit = false,
  initialEmail = "",
}: AddColaboradorProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [receptores, setReceptores] = useState<Receptor[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [predeterminado, setPredeterminado] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && isEdit && initialEmail) setEmail(initialEmail);
    else if (isOpen && !isEdit) setEmail("");
  }, [isOpen, isEdit, initialEmail]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchReceptores = async () => {
      try {
        const response = await requests.get({
          command: RECEPTORES_BYUSER + id_usuario,
        });
        const data = response?.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            nombre_razon: item.nombre_razon,
            predeterminado: item.predeterminado,
          }));

          setReceptores(mapped);
          const preselected = mapped.filter((r) => r.predeterminado).map((r) => r.id);
          setSelected(preselected);

          const defaultOne = mapped.find((r) => r.predeterminado);
          setPredeterminado(defaultOne ? defaultOne.id : null);
        } else setReceptores([]);
      } catch (err) {
        console.error("Error al cargar receptores:", err);
        setReceptores([]);
      }
    };
    fetchReceptores();
  }, [isOpen, id_usuario]);

  const handleToggle = (id: number) => {
    setSelected((prev) => {
      let newSelected;
      if (prev.includes(id)) {
        newSelected = prev.filter((item) => item !== id);
        if (predeterminado === id) setPredeterminado(null);
      } else newSelected = [...prev, id];
      return newSelected;
    });
  };

  const handlePredeterminado = (id: number) => {
    setPredeterminado(id);
    if (!selected.includes(id)) setSelected((prev) => [...prev, id]);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError("Correo inválido");
      return;
    }
    if (selected.length === 0) {
      setError("Selecciona al menos un receptor");
      return;
    }
    if (!predeterminado) {
      setError("Selecciona un receptor predeterminado");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onConfirm({
        id_usuario,
        email,
        facturantes: selected,
        facturante_predeterminado: predeterminado,
      });

      Alert.alert(
        isEdit ? "Usuario actualizado" : "Usuario agregado",
        isEdit
          ? `Se modificó el usuario ${email}`
          : `Se envió invitación a ${email}`
      );

      setEmail("");
      setSelected([]);
      setPredeterminado(null);
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Campo de correo */}
          <Text style={styles.label}>Correo *</Text>
          <TextInput
            style={[styles.input, isEdit && styles.disabledInput]}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isEdit}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Lista de receptores */}
          <Text style={[styles.label, { marginTop: 12 }]}>Selecciona receptores:</Text>
          <ScrollView style={styles.list}>
            {receptores.length > 0 ? (
              receptores.map((r) => (
                <View key={r.id} style={styles.receptorRow}>
                  <Checkbox
                    value={selected.includes(r.id)}
                    onValueChange={() => handleToggle(r.id)}
                    color={selected.includes(r.id) ? "#1A2A6C" : undefined}
                  />
                  <Text style={styles.receptorText}>{r.nombre_razon}</Text>
                  <Checkbox
                    value={predeterminado === r.id}
                    onValueChange={() => handlePredeterminado(r.id)}
                    color={predeterminado === r.id ? "#1A2A6C" : undefined}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay receptores disponibles</Text>
            )}
          </ScrollView>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.button, styles.confirmButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    padding: 20,
    maxHeight: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    maxHeight: 200,
    marginTop: 6,
  },
  receptorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  receptorText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 10,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#1A2A6C",
  },
  cancelText: {
    color: "#333",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
