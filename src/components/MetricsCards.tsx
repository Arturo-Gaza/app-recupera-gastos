import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricsCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  variant: 'default' | 'success' | 'warning';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  description,
  icon,
  variant,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { 
          backgroundColor: '#dcfce7', 
          iconColor: '#16a34a' 
        };
      case 'warning':
        return { 
          backgroundColor: '#fef3c7', 
          iconColor: '#d97706' 
        };
      default:
        return { 
          backgroundColor: '#e0f2fe', 
          iconColor: '#0369a1' 
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[cardStyles.card, { backgroundColor: variantStyles.backgroundColor }]}>
      <View style={cardStyles.header}>
        <Ionicons name={icon as any} size={24} color={variantStyles.iconColor} />
        <Text style={cardStyles.value}>{value}</Text>
      </View>
      <Text style={cardStyles.title}>{title}</Text>
      <Text style={cardStyles.description}>{description}</Text>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default MetricsCard;