import { StyleSheet } from 'react-native';

export const interactiveMapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  infoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  callout: {
    width: 180,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  calloutCategory: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  calloutDistance: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600',
    marginTop: 4,
  },
  calloutDuplicateWarning: {
    fontSize: 10,
    color: '#b91c1c',
    fontWeight: '700',
    marginTop: 4,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusCoords: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#334155',
    marginTop: 2,
  },
  statusAccuracy: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
