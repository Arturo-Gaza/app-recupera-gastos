import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface PlanFeature {
    label: string;
    value: string;
}

interface PlanCardRecargaProps {
    id: string;
    name: string;
    price: number;
    category: "personal" | "empresarial";
    features: PlanFeature[];
    featured?: boolean;
    onSelect: () => void;
}

const PlanCardRecarga: React.FC<PlanCardRecargaProps> = ({
    name,
    price,
    features,
    featured = false,
    onSelect
}) => {
    return (
        <View style={[styles.card, featured && styles.cardFeatured]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{name}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>Personal</Text>
                </View>
            </View>

            {/* Precio */}
            <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{price.toLocaleString('es-MX')}</Text>
                <Text style={styles.period}>/recarga</Text>
            </View>

            {/* Descripción */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                    Recarga prepago flexible para uso personal
                </Text>
            </View>

            {/* Características */}
           

            {/* Botón */}
            <TouchableOpacity
                style={[styles.button, featured && styles.buttonFeatured]}
                onPress={onSelect}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, featured && styles.buttonTextFeatured]}>
                    Seleccionar Recarga
                </Text>
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        height: 300
    },
    cardFeatured: {
        borderColor: '#3b82f6',
        borderWidth: 2,
        backgroundColor: '#f0f7ff',
        shadowColor: '#3b82f6',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    categoryBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0369a1',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 12,
    },
    currency: {
        fontSize: 18,
        color: '#6b7280',
        marginRight: 2,
        fontWeight: '600',
    },
    price: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    period: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 4,
    },
    descriptionContainer: {
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    features: {
        marginBottom: 20,
        flex: 1,
    },
    defaultFeatures: {
        flex: 1,
        justifyContent: 'center',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    checkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 2,
    },
    featureText: {
        fontSize: 13,
        color: '#6b7280',
        flex: 1,
        lineHeight: 18,
    },
    featureValue: {
        fontWeight: '600',
        color: '#111827',
    },
    button: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 'auto',
    },
    buttonFeatured: {
        backgroundColor: '#3b82f6',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    buttonTextFeatured: {
        color: '#fff',
    },
});

export default PlanCardRecarga;