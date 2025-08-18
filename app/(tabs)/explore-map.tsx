import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'

// Normalize role: 'hire' -> contractors on map; 'worker' -> jobs on map
function normalizeRole(r: any): 'hire' | 'worker' {
  if (r === 'hire' || r === 'hirer') return 'hire'
  return 'worker'
}

export default function ExploreMap() {
  const params = useLocalSearchParams<{ view?: string; role?: string; serviceSlug?: string }>()
  const role = normalizeRole(params.role || 'hire')
  const serviceSlug = typeof params.serviceSlug === 'string' ? params.serviceSlug : undefined
  const router = useRouter()

  const [region, setRegion] = useState<Region>({
    latitude: 43.6532,
    longitude: -79.3832,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  })
  const [items, setItems] = useState<any[]>([])
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Request location (optional) — do not block render
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({})
          if (mounted) setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }))
        }
      } catch {}
      await fetchMarkers()
    })()
    return () => { mounted = false }
  }, [role, serviceSlug])

  async function fetchMarkers(bounds?: { minLat:number; maxLat:number; minLng:number; maxLng:number }) {
    if (role === 'hire') {
      // Show contractors
      let q: any = supabase
        .from('profiles')
        .select('id, full_name, city, rating, location_lat, location_lng, geo, service_slugs, user_type')
        .eq('user_type','worker')
      // Prefer DB-side filtering when numeric columns exist
      if (bounds) {
        q = q.gte('location_lat', bounds.minLat).lte('location_lat', bounds.maxLat)
             .gte('location_lng', bounds.minLng).lte('location_lng', bounds.maxLng)
      }
      if (serviceSlug) {
        try { q = q.contains('service_slugs', [serviceSlug]) } catch {}
      }
      const { data, error } = await q
      if (!error) setItems(data || [])
    } else {
      // Show jobs (open/in_progress)
      let q: any = supabase
        .from('jobs')
        .select('id, title, status, lat, lng, geo')
        .in('status', ['open','in_progress'])
      if (bounds) {
        q = q.gte('lat', bounds.minLat).lte('lat', bounds.maxLat)
             .gte('lng', bounds.minLng).lte('lng', bounds.maxLng)
      }
      const { data, error } = await q
      if (!error) setItems(data || [])
    }
  }

  function resolveLatLng(obj: any): { lat: number | null; lng: number | null } {
    const lat = obj?.location_lat ?? obj?.lat ?? obj?.geo?.lat ?? obj?.geo?.latitude ?? null
    const lng = obj?.location_lng ?? obj?.lng ?? obj?.geo?.lng ?? obj?.geo?.longitude ?? null
    return { lat: typeof lat === 'number' ? lat : null, lng: typeof lng === 'number' ? lng : null }
  }

  function onSearchThisArea() {
    ;(mapRef.current as any)?.getMapBoundaries?.().then(({ northEast, southWest }: any) => {
      fetchMarkers({
        minLat: southWest.latitude,
        maxLat: northEast.latitude,
        minLng: southWest.longitude,
        maxLng: northEast.longitude,
      })
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F1A' }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation
        toolbarEnabled={false}
      >
        {role === 'hire'
          ? items.map((c) => {
              const { lat, lng } = resolveLatLng(c)
              if (lat == null || lng == null) return null
              return (
                <Marker
                  key={c.id}
                  coordinate={{ latitude: lat, longitude: lng }}
                  title={c.full_name}
                  description={c.city}
                  pinColor="#00E6CF"
                  onCalloutPress={() => router.push('/(tabs)/contractors')}
                />
              )
            })
          : items.map((j) => {
              const { lat, lng } = resolveLatLng(j)
              if (lat == null || lng == null) return null
              return (
                <Marker
                  key={j.id}
                  coordinate={{ latitude: lat, longitude: lng }}
                  title={j.title}
                  description={j.status}
                  pinColor={j.status === 'open' ? '#00E6CF' : '#8A8AFF'}
                  onCalloutPress={() => router.push(`/(tabs)/job-detail?id=${j.id}`)}
                />
              )
            })}
      </MapView>

      {/* Overlay Controls */}
      <View style={{ position: 'absolute', top: 12, right: 12, gap: 12 }}>
        <Pressable onPress={() => (mapRef.current as any)?.animateToRegion(region, 500)}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="locate-outline" size={18} color="#fff" />
        </Pressable>
        <Pressable onPress={() => {}}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="layers-outline" size={18} color="#fff" />
        </Pressable>
        <Pressable onPress={onSearchThisArea}
          style={{ paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Search this area</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

