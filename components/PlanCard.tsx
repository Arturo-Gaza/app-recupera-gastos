import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlanFeature {
    label: string;
    value: string;
}

interface PrecioVigente {
    id: number;
    nombre_precio: string;
    id_plan: number;
    precio: string;
    desde_factura: number;
    hasta_factura: number;
    vigencia_desde: string;
    vigencia_hasta: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface PlanCardProps {
    name: string;
    description: string;
    price: number;
    features: PlanFeature[];
    featured?: boolean;
    precios_vigentes: PrecioVigente[];
    onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
    name,
    description,
    price,
    features,
    featured = false,
    precios_vigentes,
    onSelect
}) => {
    const [showPrecios, setShowPrecios] = useState(false);

    const togglePrecios = () => {
        setShowPrecios(!showPrecios);
    };

    return (
        <View style={[styles.card, featured && styles.cardFeatured]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            {/* Precio */}
            <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{price.toLocaleString('es-MX')}</Text>
                <Text style={styles.period}>/mes</Text>
            </View>

            {/* Botón */}
            <TouchableOpacity
                style={[styles.button, featured && styles.buttonFeatured]}
                onPress={onSelect}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, featured && styles.buttonTextFeatured]}>Elegir Plan</Text>
            </TouchableOpacity>

            {/* Características */}
            <View style={styles.features}>
                {features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <View style={styles.checkIcon}>
                            <Check width={14} height={14} color="#10b981" />
                        </View>
                        <Text style={styles.featureText}>
                            {feature.label}: <Text style={styles.featureValue}>{feature.value}</Text>
                        </Text>
                    </View>
                ))}
            </View>

            {/* Acordeón de Precios Vigentes */}
            <View style={styles.preciosContainer}>
                <TouchableOpacity 
                    style={styles.accordionTrigger}
                    onPress={togglePrecios}
                    activeOpacity={0.7}
                >
                    <Text style={styles.accordionText}>Ver precios vigentes</Text>
                    {showPrecios ? 
                        <ChevronUp width={16} height={16} color="#6b7280" /> : 
                        <ChevronDown width={16} height={16} color="#6b7280" />
                    }
                </TouchableOpacity>

                {showPrecios && (
                    <View style={styles.accordionContent}>
                        <View style={styles.preciosList}>
                            {precios_vigentes.map((precio) => (
                                <View key={precio.id} style={styles.precioItem}>
                                    <View style={styles.precioInfo}>
                                        <Text style={styles.precioNombre}>{precio.nombre_precio}</Text>
                                        <Text style={styles.precioRango}>
                                            {precio.desde_factura} – {precio.hasta_factura ?? "∞"} facturas
                                        </Text>
                                    </View>
                                    <Text style={styles.precioValor}>
                                        ${parseFloat(precio.precio).toLocaleString("es-MX", { 
                                            minimumFractionDigits: 2 
                                        })}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: -10
    },
    cardFeatured: {
        borderColor: '#3b82f6',
        borderWidth: 2,
        backgroundColor: '#f0f7ff',
    },
    header: {
        marginBottom: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    currency: { 
        fontSize: 16, 
        color: '#6b7280', 
        marginRight: 2 
    },
    price: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#1f2937' 
    },
    period: { 
        fontSize: 16, 
        color: '#6b7280', 
        marginLeft: 4 
    },
    features: { 
        marginBottom: 20 
    },
    featureItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    checkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    featureText: { 
        fontSize: 14, 
        color: '#6b7280', 
        flexShrink: 1 
    },
    featureValue: { 
        fontWeight: '500', 
        color: '#111827' 
    },
    button: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonFeatured: {
        backgroundColor: '#3b82f6',
    },
    buttonText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#374151' 
    },
    buttonTextFeatured: { 
        color: '#fff' 
    },
    preciosContainer: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 16,
    },
    accordionTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    accordionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    accordionContent: {
        marginTop: 12,
    },
    preciosList: {
        gap: 12,
    },
    precioItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    precioInfo: {
        flex: 1,
    },
    precioNombre: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 2,
    },
    precioRango: {
        fontSize: 12,
        color: '#6b7280',
    },
    precioValor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
});

export default PlanCard;