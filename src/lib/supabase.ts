
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DecodedVehicle } from "@/services/vehicleData";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function uploadVinPhoto(userId: string, vinNumber: string, photoBase64: string): Promise<string | null> {
  try {
    const fileName = `${userId}/${vinNumber}-${Date.now()}.jpg`;
    
    // Upload the photo to Supabase storage
    const { data, error } = await supabase.storage
      .from('vin-photos')
      .upload(fileName, decode(photoBase64), {
        contentType: 'image/jpeg',
        upsert: false,
      });
      
    if (error) {
      console.error("Error uploading photo:", error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('vin-photos')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
}

export async function saveVinScan(
  userId: string,
  tenantId: string,
  vinNumber: string, 
  decodedData: DecodedVehicle, 
  photoUrl: string | null,
  latitude: number | null,
  longitude: number | null,
  premiumPayload: any = null
) {
  try {
    const { data, error } = await supabase
      .from('scans')
      .insert([
        { 
          user_id: userId,
          tenant_id: tenantId,
          vin: vinNumber,
          decoded_json: decodedData,
          photo_url: photoUrl,
          latitude,
          longitude,
          premium_payload: premiumPayload
        }
      ]);
      
    if (error) {
      console.error("Error saving scan:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error saving scan:", error);
    return { success: false, error };
  }
}

// Helper function to decode base64 to a format suitable for storage
function decode(base64String: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}
