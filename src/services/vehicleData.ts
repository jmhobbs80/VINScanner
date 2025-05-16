
export async function decodeVin(vin: string) {
  const endpoint = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to fetch VIN data from NHTSA API");
    }
    const data = await response.json();

    // Extract useful vehicle info
    const details = {};
    data.Results.forEach(item => {
      if (item.Value && item.Variable) {
        details[item.Variable] = item.Value;
      }
    });

    return details;
  } catch (error) {
    console.error("decodeVin error:", error);
    throw error;
  }
}
