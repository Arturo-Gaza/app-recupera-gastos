import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface DonutChartProps {
    title: string;
    data: Array<{
        label: string;
        value: number;
        color: string;
    }>;
}

const DonutChart = ({ title, data }: DonutChartProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartSize = Dimensions.get('window').width * 0.7;
    const center = chartSize / 2;
    const radius = chartSize * 0.3;
    const innerRadius = chartSize * 0.15;

    let cumulativePercentage = 0;
    const segments = data.map((item) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const startAngle = (cumulativePercentage / 100) * 360;
        const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
        cumulativePercentage += percentage;

        return {
            ...item,
            percentage: Math.round(percentage),
            startAngle,
            endAngle,
        };
    });

    const createArcPath = (startAngle: number, endAngle: number) => {
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startAngleRad);
        const y1 = center + radius * Math.sin(startAngleRad);
        const x2 = center + radius * Math.cos(endAngleRad);
        const y2 = center + radius * Math.sin(endAngleRad);

        const x3 = center + innerRadius * Math.cos(endAngleRad);
        const y3 = center + innerRadius * Math.sin(endAngleRad);
        const x4 = center + innerRadius * Math.cos(startAngleRad);
        const y4 = center + innerRadius * Math.sin(startAngleRad);

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.chartContainer}>
                    {/* Contenedor SVG */}
                    <View style={[styles.svgContainer, { width: chartSize, height: chartSize }]}>
                        {total === 0 ? (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No hay datos</Text>
                            </View>
                        ) : (
                            <Svg
                                width={chartSize}
                                height={chartSize}
                                viewBox={`0 0 ${chartSize} ${chartSize}`}
                            >
                                <G rotation="-90" origin={`${center}, ${center}`}>
                                    {segments.map((segment, index) =>
                                        segment.startAngle === 0 && segment.endAngle === 360 ? (
                                            <Circle
                                                key={index}
                                                cx={center}
                                                cy={center}
                                                r={radius}
                                                fill={segment.color}
                                            />
                                        ) : (
                                            <Path
                                                key={index}
                                                d={createArcPath(segment.startAngle, segment.endAngle)}
                                                fill={segment.color}
                                                onPress={() => console.log('Segment pressed:', segment.label)}
                                            />
                                        )
                                    )}
                                </G>
                                
                                {/* Círculo interno blanco para el hueco del donut */}
                                <Circle
                                    cx={center}
                                    cy={center}
                                    r={innerRadius}
                                    fill="white"
                                />
                            </Svg>
                        )}
                    </View>

                    {/* Leyenda */}
                    <View style={styles.legend}>
                        {segments.map((segment, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={styles.legendColorContainer}>
                                    <View 
                                        style={[
                                            styles.legendColor, 
                                            { backgroundColor: segment.color }
                                        ]} 
                                    />
                                    <Text style={styles.legendLabel}>
                                        {segment.label}
                                    </Text>
                                </View>
                                <Text style={styles.legendPercentage}>
                                    {segment.percentage}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    cardContent: {
        padding: 16,
    },
    chartContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
    },
    svgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    legend: {
        width: '100%',
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    legendColorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    legendPercentage: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        marginLeft: 8,
    },
});

export default DonutChart;