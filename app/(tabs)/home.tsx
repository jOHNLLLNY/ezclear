/**
 * Home Screen
 * Main dashboard with service categories and recent jobs
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Pressable,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeProvider';
import { useAuth } from '../../src/context/AuthContext';
import { AppBar } from '../../src/components/ui/AppBar';
import { SurfaceCard } from '../../src/components/ui/Card';
import { JobCard } from '../../src/components/ui/JobCard';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { CTABox } from '../../src/components/ui/CTABox';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SERVICES_FLAT } from '../../src/constants/categories'; // icons mapped to Ionicons
import { db, supabase } from '../../src/lib/supabase';
import i18n from '../../i18n';

const { width } = Dimensions.get('window');

// Data will come from Supabase


// Services row config
const GAP = 2; // minimal uniform spacing between service chips
const ITEM_W = 90; // slightly wider to accommodate bigger bubbles
const BUBBLE = 52; // slightly larger bubbles per user request

const shorten = (s: string) => s; // no longer needed; we translate via i18n

const serviceCategories = SERVICES_FLAT;

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { profile, session } = useAuth();
  const accountType = ((profile?.user_type as 'worker' | 'hirer') || (session?.user?.user_metadata?.user_type as 'worker' | 'hirer') || 'worker');
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const miniMapRef = useRef<View | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({ latitude: 43.65107, longitude: -79.347015, latitudeDelta: 0.08, longitudeDelta: 0.08 });
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(0)).current;
  const animH = useRef(new Animated.Value(0)).current;
  const animR = useRef(new Animated.Value(16)).current;
  const dimOpacity = useRef(new Animated.Value(0)).current;
  const layoutRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const debounceTimer = useRef<any>(null);

  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1f2b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1f2b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8a94a6' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3242' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const data = await db.getJobs();
      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load jobs');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // initial load
    (async () => {
      try {
        setLoading(true);
        await onRefresh();
      } finally {
        setLoading(false);
      }
    })();
    (async () => {
      try {
        setLoadingContractors(true)
        const { data } = await supabase
          .from('public_contractors')
          .select('id, full_name, avatar_url, location, rating, services')
          .order('rating', { ascending: false })
          .limit(6)
        setContractors(data || [])
      } catch {}
      finally { setLoadingContractors(false) }
    })();
  }, []);

  const handleJobPress = (jobId: string) => {
    router.push(`/(tabs)/job-detail?id=${jobId}`);
  };

  const handleCategoryPress = (slug: string) => {
    if (accountType === 'hirer') {
      router.push(`/(tabs)/contractors?service=${encodeURIComponent(slug)}`);
    } else {
      router.push(`/(tabs)/jobs?category=${encodeURIComponent(slug)}`);
    }
  };

  const handleSearch = (query: string) => {
    router.push(`/(tabs)/jobs?search=${query}`);
  };

  // distance helper (km)
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const locationCoords: Record<string, { lat: number; lon: number }> = {
    'Toronto, ON': { lat: 43.65107, lon: -79.347015 },
    'Vancouver, BC': { lat: 49.2827, lon: -123.1207 },
    'Calgary, AB': { lat: 51.0447, lon: -114.0719 },
  };

  const applyRegionFilter = (region: Region) => {
    const center = { lat: region.latitude, lon: region.longitude };
    const withinKm = 300;
    const next = jobs.filter((j) => {
      const lc = locationCoords[j.location as keyof typeof locationCoords];
      if (!lc) return true;
      return haversine(center.lat, center.lon, lc.lat, lc.lon) <= withinKm;
    });
    setFilteredJobs(next);
  };

  useEffect(() => {
    applyRegionFilter(mapRegion);
  }, [jobs]);

  // Navigate to the dedicated Explore Map screen instead of expanding overlay
  const openMap = () => {
    const role = accountType === 'hirer' ? 'hire' : 'worker';
    router.push(`/(tabs)/explore-map?view=map&role=${role}`);
  };

  const closeMap = () => {
    const { x, y, w, h } = layoutRef.current;
    Animated.parallel([
      Animated.timing(animX, { toValue: x, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(animY, { toValue: y, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(animW, { toValue: w, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(animH, { toValue: h, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(animR, { toValue: 16, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(dimOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(({ finished }) => { if (finished) setIsMapExpanded(false); });
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isMapExpanded) { closeMap(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [isMapExpanded]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <AppBar
        showLogo
        actions={
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/messages')}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Search Bar */}
        <View style={[styles.searchSection, { paddingHorizontal: spacing[4] }]}>
          <SearchBar
            placeholder={i18n.t('home.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
          />
        </View>

        {/* CTA Section - only for hirer */}
        {accountType === 'hirer' && (
          <View style={[styles.ctaSection, { paddingHorizontal: 16 }]} onLayout={() => console.log('home_banner_view')}>
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 680, borderRadius: 16, overflow: 'hidden' }}>
              <CTABox
                title={i18n.t('home.bannerTitle')}
                subtitle={i18n.t('home.bannerSubtitle')}
                buttonText={i18n.t('home.bannerCta')}
                onPress={() => {
                  router.push('/(tabs)/contractors');
                }}
                icon="search"
                compact
              />
            </View>
          </View>
        )}

        {/* Services - header with View All */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.onSurface, fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.xl }}>{i18n.t('home.services')}</Text>
            <Pressable onPress={() => accountType === 'hirer' ? router.push('/(tabs)/contractors') : router.push('/(tabs)/jobs')} android_ripple={{ color: '#00000022' }} accessibilityLabel={i18n.t('home.viewAll')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.semibold, fontSize: 14 }}>{i18n.t('home.viewAll')}</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={serviceCategories.map(i => ({ ...i, label: i18n.t(`services.${i.slug}`) }))}
            keyExtractor={(item) => item.slug}
            contentContainerStyle={{ paddingHorizontal: GAP }}
            getItemLayout={(_, i) => ({ length: ITEM_W + GAP, offset: (ITEM_W + GAP) * i, index: i })}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => handleCategoryPress(item.slug)}
                style={{ width: ITEM_W, marginRight: index === serviceCategories.length - 1 ? 0 : GAP, alignItems: 'center' }}
                android_ripple={{ color: '#00000022' }}
              >
                <View style={{ width: BUBBLE, height: BUBBLE, borderRadius: BUBBLE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: colors.stroke }}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ marginTop: 8, fontSize: 12, color: colors.onSurface, textAlign: 'center' }}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>

        {/* Map */}
        <View style={{ paddingHorizontal: spacing[4], marginBottom: 16 }}>
          <Pressable
            ref={miniMapRef as any}
            onPress={openMap}
            style={{ height: 160, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.stroke }}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={mapRegion}
              customMapStyle={darkMapStyle}
              showsMyLocationButton={false}
              pointerEvents="none"
            >
              {/* Job markers within current region using real lat/lng */}
              {filteredJobs.map((job: any) => (
                job.lat && job.lng ? (
                  <Marker
                    key={`m-${job.id}`}
                    coordinate={{ latitude: job.lat, longitude: job.lng }}
                    title={job.title}
                    description={job.location}
                    pinColor={colors.primary}
                    accessibilityLabel={`${job.title}, ${job.location}, $${job.budget || ''}`}
                    onPress={() => handleJobPress(job.id)}
                  />
                ) : null
              ))}
            </MapView>
            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 6 }}>
              <Ionicons name="expand-outline" size={18} color="white" />
            </View>
          </Pressable>
        </View>

        {/* Available list: Contractors for hire, Jobs for worker */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.onSurface,
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.fontSize.xl,
                },
              ]}
            >
              {accountType === 'hirer' ? i18n.t('home.availableContractors') : i18n.t('home.availableJobs')}
            </Text>
            <Pressable onPress={() => accountType === 'hirer' ? router.push('/(tabs)/contractors') : router.push('/(tabs)/jobs')} android_ripple={{ color: '#00000022' }}>
              <Text
                style={[
                  styles.seeAllText,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.medium,
                    fontSize: typography.fontSize.base,
                  },
                ]}
              >
                {i18n.t('home.viewAll')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.jobsList}>
            {loadingContractors ? (
              <View>
                <View style={{ height: 80, borderRadius: 16, backgroundColor: colors.surface }} />
                <View style={{ height: 12 }} />
                <View style={{ height: 80, borderRadius: 16, backgroundColor: colors.surface }} />
              </View>
            ) : accountType === 'hirer' ? (
              contractors.length === 0 ? (
                <Text style={{ color: colors.textSecondary }}>{i18n.t('home.noContractors')}</Text>
              ) : (
                contractors.map((c) => (
                  <Pressable key={c.id} onPress={() => router.push('/(tabs)/contractors')} android_ripple={{ color: '#00000022' }} style={{ backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A3345', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#0F172A' }} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }} numberOfLines={2}>{c.full_name || 'Unnamed'}</Text>
                      {!!c.location && <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{c.location}</Text>}
                    </View>
                    {typeof c.rating === 'number' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={16} color="#FBBF24" />
                        <Text style={{ color: colors.textPrimary, marginLeft: 4 }}>{c.rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </Pressable>
                ))
              )
            ) : (
              filteredJobs.length === 0 ? (
                <Text style={{ color: colors.textSecondary }}>{i18n.t('home.noJobs')}</Text>
              ) : (
                filteredJobs.slice(0, 6).map((j) => (
                  <Pressable key={`job-${j.id}`} onPress={() => router.push(`/(tabs)/job-detail?id=${j.id}`)} android_ripple={{ color: '#00000022' }} style={{ backgroundColor: '#111827', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A3345', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#0F172A', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.semibold }} numberOfLines={2}>{j.title}</Text>
                      {!!j.location && <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{j.location}</Text>}
                    </View>
                    {!!j.budget && (
                      <Text style={{ color: colors.textPrimary }}>${j.budget}</Text>
                    )}
                  </Pressable>
                ))
              )
            )}
          </View>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Expanded Map Overlay */}
      {isMapExpanded && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: dimOpacity }]} pointerEvents="auto" />
          <Animated.View style={{ position: 'absolute', left: animX, top: animY, width: animW, height: animH, borderRadius: animR, overflow: 'hidden' }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              initialRegion={mapRegion}
              onRegionChangeComplete={(r) => {
                setMapRegion(r);
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                debounceTimer.current = setTimeout(() => applyRegionFilter(r), 500);
              }}
              customMapStyle={darkMapStyle}
              showsUserLocation
              showsMyLocationButton
            >
              {filteredJobs.map((job: any) => (
                job.lat && job.lng ? (
                  <Marker
                    key={`full-${job.id}`}
                    coordinate={{ latitude: job.lat, longitude: job.lng }}
                    title={job.title}
                    description={job.location}
                    pinColor={colors.primary}
                    onPress={() => handleJobPress(job.id)}
                  />
                ) : null
              ))}
            </MapView>
            {/* Header Overlay */}
            <View style={{ position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={closeMap} accessibilityLabel="Close map" style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 10 }}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 10 }} onPress={() => {}}>
                  <Ionicons name="locate-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 10 }} onPress={() => {}}>
                  <Ionicons name="layers-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 10 }} onPress={() => { applyRegionFilter(mapRegion); }}>
                  <Text style={{ color: '#fff' }}>Search this area</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Bottom chip */}
            <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: '#fff' }}>Move map to update jobs</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    marginBottom: 24,
  },
  ctaSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    // styles applied inline
  },
  seeAllText: {
    // styles applied inline
  },
  categoriesContainer: {
    paddingRight: 16,
    gap: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  jobsList: {
    gap: 10,
  },
  jobCard: {
    // styles handled by JobCard component
  },
});
