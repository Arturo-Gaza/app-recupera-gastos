import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';



interface PlanFeature {
    label: string;
    value: string;
}

interface PlanCardProps {
    name: string;
    description: string;
    price: number;
    features: PlanFeature[];
    featured?: boolean;
    onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
    name,
    description,
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
                <Text style={styles.description}>{description}</Text>
            </View>

            {/* Precio */}
            <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{price.toLocaleString('es-MX')}</Text>
                <Text style={styles.period}>/mes</Text>
            </View>

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

            {/* Botón */}
            <TouchableOpacity
                style={[styles.button, featured && styles.buttonFeatured]}
                onPress={onSelect}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, featured && styles.buttonTextFeatured]}>Elegir Plan</Text>
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
    currency: { fontSize: 16, color: '#6b7280', marginRight: 2 },
    price: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
    period: { fontSize: 16, color: '#6b7280', marginLeft: 4 },
    features: { marginBottom: 20 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    checkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    featureText: { fontSize: 14, color: '#6b7280', flexShrink: 1 },
    featureValue: { fontWeight: '500', color: '#111827' },
    button: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonFeatured: {
        backgroundColor: '#3b82f6',
    },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    buttonTextFeatured: { color: '#fff' },
});

export default PlanCard;
