export type User = {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'user';
  tenant_id: string;
};

export type VinScan = {
  id: string;
  vin: string;
  decoded_data: DecodedVinData;
  image_url?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  user_id: string;
  tenant_id: string;
};

export type DecodedVinData = {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  VehicleType?: string;
  PlantCity?: string;
  PlantCountry?: string;
  PlantState?: string;
  BodyClass?: string;
  [key: string]: string | undefined;
};

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}
