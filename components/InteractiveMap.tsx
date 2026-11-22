import React, { memo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { calculateDistance, isWithinRadius } from '../utils/haversine';
import type { Coordinates } from '../utils/types/haversine.types';
import type { IncidentMarkerData } from './types/InteractiveMap.types';
import { interactiveMapStyles as styles } from '../styles/InteractiveMap.styles';

export { type IncidentMarkerData };

const MOCK_INCIDENTS: IncidentMarkerData[] = [
  {
    id: 'inc-1',
    title: 'Lampu Jalan Rusak',
    category: 'Infrastruktur',
    coords: { latitude: -6.200150, longitude: 106.816720 },
  },
  {
    id: 'inc-2',
    title: 'Titik Kumpul Evakuasi Gedung A',
    category: 'Kesiapsiagaan',
    coords: { latitude: -6.200800, longitude: 106.817300 },
  },
];

export const InteractiveMap: React.FC = memo(function InteractiveMap() {
  const { coords, errorMsg, isLoading, refresh } = useLocationTracking({
    distanceInterval: 5,
    timeInterval: 5000,
  });

  if (isLoading && !coords) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.infoText}>Mendeteksi lokasi GPS...</Text>
      </View>
    );
  }

  if (errorMsg && !coords) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userCoords: Coordinates = coords ?? {
    latitude: -6.200000,
    longitude: 106.816666,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          }}
          title="Lokasi Anda"
          pinColor="blue"
        />

        {MOCK_INCIDENTS.map((item) => {
          const dist = calculateDistance(userCoords, item.coords);
          const isNearby = isWithinRadius(userCoords, item.coords, 25);

          return (
            <Marker
              key={item.id}
              coordinate={item.coords}
              pinColor={isNearby ? 'red' : 'orange'}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{item.title}</Text>
                  <Text style={styles.calloutCategory}>{item.category}</Text>
                  <Text style={styles.calloutDistance}>
                    Jarak: {Math.round(dist)} meter
                  </Text>
                  {isNearby && (
                    <Text style={styles.calloutDuplicateWarning}>
                      ⚠️ Terdeteksi dalam radius 25m (Potensi Duplikat)
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.floatingCard}>
        <Text style={styles.statusTitle}>📍 LBS Tracking Aktif</Text>
        <Text style={styles.statusCoords}>
          {userCoords.latitude.toFixed(6)}, {userCoords.longitude.toFixed(6)}
        </Text>
        <Text style={styles.statusAccuracy}>
          Akurasi: ±{coords?.accuracy ? Math.round(coords.accuracy) : 0}m
        </Text>
      </View>
    </View>
  );
});
