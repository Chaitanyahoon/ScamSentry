// Simple geocoding utility using a free API
export interface GeocodingResult {
  lat: number
  lng: number
  city: string
  state: string
  country: string
  displayName: string
}

export async function geocodeCity(cityName: string): Promise<GeocodingResult | null> {
  try {
    // Using Nominatim (OpenStreetMap) free geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&addressdetails=1`,
    )

    if (!response.ok) {
      throw new Error("Geocoding request failed")
    }

    const data = await response.json()

    if (data.length === 0) {
      return null
    }

    const result = data[0]
    const address = result.address || {}

    return {
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
      city: address.city || address.town || address.village || "",
      state: address.state || "",
      country: address.country || "",
      displayName: result.display_name,
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}
