export type GeocodeResult = {
  lat: number
  lng: number
  formattedAddress?: string
}

// Simple, keyless geocoder using OpenStreetMap Nominatim as a fallback for development.
// For production, proxy through a server to avoid rate limits and to use a paid provider.
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ez-clear-app' } as any })
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const top = data[0]
      return {
        lat: parseFloat(top.lat),
        lng: parseFloat(top.lon),
        formattedAddress: top.display_name,
      }
    }
    return null
  } catch (e) {
    console.warn('Geocoding failed', e)
    return null
  }
}


