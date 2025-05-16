
/**
 * Premium services for enhanced VIN scanning capabilities
 */

/**
 * Get detailed build sheet data for a vehicle from DataOne API
 * @param vin Vehicle Identification Number
 * @returns Promise with build sheet data
 */
export async function getBuildSheet(vin: string) {
  console.log(`[PREMIUM] Fetching build sheet for ${vin}`);
  
  try {
    const DATAONE_API_KEY = import.meta.env.VITE_DATAONE_API_KEY;
    
    if (!DATAONE_API_KEY) {
      console.warn("DataOne API key not found");
      throw new Error("DataOne API key not configured");
    }
    
    const url = `https://api.dataonesoftware.com/vin?vin=${vin}&format=json&api_key=${DATAONE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`DataOne API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      source: "DataOne",
      timestamp: new Date().toISOString(),
      vin,
      data
    };
  } catch (error) {
    console.error("Error fetching build sheet:", error);
    // Return error info to be displayed in UI
    return {
      source: "DataOne",
      timestamp: new Date().toISOString(),
      vin,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error"
    };
  }
}

/**
 * Get vehicle history information from VinAudit API
 * @param vin Vehicle Identification Number
 * @returns Promise with vehicle history data
 */
export async function getVehicleHistory(vin: string) {
  console.log(`[PREMIUM] Fetching vehicle history for ${vin}`);
  
  try {
    const VINAUDIT_KEY = import.meta.env.VITE_VINAUDIT_KEY;
    
    if (!VINAUDIT_KEY) {
      console.warn("VinAudit API key not found");
      throw new Error("VinAudit API key not configured");
    }
    
    // Using VinAudit bulk endpoint
    const url = `https://api.vindecoder.eu/3.2/${VINAUDIT_KEY}/decode/${vin}.json`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`VinAudit API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      source: "VinAudit",
      timestamp: new Date().toISOString(),
      vin,
      data
    };
  } catch (error) {
    console.error("Error fetching vehicle history:", error);
    // Return error info to be displayed in UI
    return {
      source: "VinAudit",
      timestamp: new Date().toISOString(),
      vin,
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error"
    };
  }
}

/**
 * Get location information from coordinates using Mapbox API
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @param vin VIN number to associate with this location data
 * @returns Promise with geocoded location data
 */
export async function reverseGeocode(latitude: number, longitude: number, vin: string) {
  console.log(`[PREMIUM] Reverse geocoding coordinates: ${latitude}, ${longitude}`);
  
  try {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!MAPBOX_TOKEN) {
      console.warn("Mapbox token not found");
      throw new Error("Mapbox token not configured");
    }
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      source: "Mapbox",
      timestamp: new Date().toISOString(),
      vin, // Add VIN to make the return type compatible
      coordinates: {
        latitude,
        longitude
      },
      data
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    // Return error info to be displayed in UI
    return {
      source: "Mapbox",
      timestamp: new Date().toISOString(),
      vin, // Add VIN to make the return type compatible
      coordinates: {
        latitude,
        longitude
      },
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error"
    };
  }
}
