import { CheckCircle } from "lucide-react-native";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (correo: string) => void;
  userCorreo: string | null;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onDelete,
  userCorreo,
}: DeleteUserModalProps) {
  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Eliminar colaborador</Text>
          <Text style={styles.message}>
            ¿Seguro que deseas eliminar al colaborador?{"\n"}Esta acción no se puede
            deshacer.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.destructiveButton]}
              onPress={() => {
                if (userCorreo) onDelete(userCorreo);
                onClose();
              }}
            >
              <Text style={styles.destructiveText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (correo: string) => void;
  userCorreo: string | null;
}

export function BlockUserModal({
  isOpen,
  onClose,
  onBlock,
  userCorreo,
}: BlockUserModalProps) {
  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Bloquear colaborador</Text>
          <Text style={styles.message}>¿Seguro que deseas bloquear al colaborador?</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.destructiveButton]}
              onPress={() => {
                if (userCorreo) onBlock(userCorreo);
                onClose();
              }}
            >
              <Text style={styles.destructiveText}>Bloquear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "¡Éxito!",
  message,
  buttonText = "Cerrar",
  icon,
}: SuccessModalProps) {
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {icon || <CheckCircle size={64} color="#16a34a" style={{ alignSelf: "center", marginBottom: 12 }} />}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onClose}>
            <Text style={styles.confirmText}>{buttonText}</Text>
          </TouchableOpacity>
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
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelText: {
    color: "#333",
  },
  destructiveButton: {
    backgroundColor: "#ef4444",
  },
  destructiveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    marginTop: 12,
    width: "100%",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
