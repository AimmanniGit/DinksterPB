import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CourtDiagramProps {
  isHalfCourt: boolean;
}

export const CourtDiagram: React.FC<CourtDiagramProps> = ({ isHalfCourt }) => {
  return (
    <View style={styles.container}>
      {/* Outer court boundary */}
      <View style={styles.courtBoundary}>
        {/* Active court area */}
        <View
          style={[
            styles.activeCourt,
            isHalfCourt ? styles.halfCourtActive : styles.fullCourtActive,
          ]}
        >
          {/* Net Line */}
          <View style={styles.netLine} />

          {/* Non-Volley Zone (Kitchen) Lines */}
          <View style={[styles.kitchenLine, { left: '32.5%' }]} />
          <View style={[styles.kitchenLine, { right: '32.5%' }]} />

          {/* Center Service Line */}
          <View style={[styles.centerLine, { left: 0, width: '32.5%' }]} />
          <View style={[styles.centerLine, { right: 0, width: '32.5%' }]} />
        </View>
      </View>

      <Text style={styles.caption}>
        {isHalfCourt
          ? '⚡ Half-court mode active (5+ shots). Lobs & drives out.'
          : 'Standard full court in play.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  courtBoundary: {
    width: '100%',
    height: 72,
    backgroundColor: '#E8F7F1',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCourt: {
    height: '90%',
    backgroundColor: '#5DCAA5',
    borderRadius: 4,
    position: 'absolute',
    top: '5%',
  },
  fullCourtActive: {
    left: '2%',
    right: '2%',
  },
  halfCourtActive: {
    left: '25%',
    right: '25%',
    backgroundColor: '#1D9E75',
    borderWidth: 1.5,
    borderColor: '#EF9F27',
  },
  netLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2.5,
    backgroundColor: '#111',
    transform: [{ translateX: -1.25 }],
  },
  kitchenLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  caption: {
    fontSize: 11.5,
    color: '#0A5C43',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
