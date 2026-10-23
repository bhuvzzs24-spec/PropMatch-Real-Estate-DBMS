import type { Amenity, LocationItem, PropertyType } from '@/types/api';

export const mockPropertyTypes: PropertyType[] = [
  { typeId: 1, typeName: 'Apartment' },
  { typeId: 2, typeName: 'Independent House' },
  { typeId: 3, typeName: 'Villa' },
  { typeId: 4, typeName: 'Plot' },
  { typeId: 5, typeName: 'Commercial' },
];

export const mockAmenities: Amenity[] = [
  { amenityId: 1, amenityName: 'Parking' },
  { amenityId: 2, amenityName: 'Lift' },
  { amenityId: 3, amenityName: 'Gym' },
  { amenityId: 4, amenityName: 'Swimming Pool' },
  { amenityId: 5, amenityName: 'Power Backup' },
  { amenityId: 6, amenityName: 'Security' },
  { amenityId: 7, amenityName: 'Garden' },
  { amenityId: 8, amenityName: 'Clubhouse' },
  { amenityId: 9, amenityName: 'Water Supply 24x7' },
];

export const mockLocations: LocationItem[] = [
  { locationId: 1, city: 'Bengaluru', locality: 'Whitefield', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.75 },
  { locationId: 2, city: 'Bengaluru', locality: 'HSR Layout', state: 'Karnataka', pincode: '560102', latitude: 12.9116, longitude: 77.6389 },
  { locationId: 3, city: 'Bengaluru', locality: 'Indiranagar', state: 'Karnataka', pincode: '560038', latitude: 12.9784, longitude: 77.6408 },
  { locationId: 4, city: 'Bengaluru', locality: 'Koramangala', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245 },
  { locationId: 5, city: 'Bengaluru', locality: 'Electronic City', state: 'Karnataka', pincode: '560100', latitude: 12.8452, longitude: 77.6602 },
  { locationId: 6, city: 'Bengaluru', locality: 'Jayanagar', state: 'Karnataka', pincode: '560041', latitude: 12.9308, longitude: 77.5838 },
  { locationId: 7, city: 'Bengaluru', locality: 'Marathahalli', state: 'Karnataka', pincode: '560037', latitude: 12.9591, longitude: 77.6974 },
  { locationId: 8, city: 'Bengaluru', locality: 'Hebbal', state: 'Karnataka', pincode: '560024', latitude: 13.0358, longitude: 77.597 },
];
