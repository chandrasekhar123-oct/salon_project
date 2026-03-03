import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';


const PRIMARY = '#E23744';
const GRADIENT_END = '#FF6B6B';
const BG = '#F8F9FB';
const CARD = '#FFFFFF';
const SHADOW = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 };

const cities = [
  {
    id: 'blr',
    name: 'Bangalore',
    lat: 12.9716, lng: 77.5946,
    areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'MG Road', 'Whitefield']
  },
  {
    id: 'mum',
    name: 'Mumbai',
    lat: 19.0760, lng: 72.8777,
    areas: ['Andheri', 'Bandra', 'Juhu', 'Colaba', 'Powai']
  },
  {
    id: 'del',
    name: 'Delhi',
    lat: 28.7041, lng: 77.1025,
    areas: ['Connaught Place', 'Hauz Khas', 'Saket', 'Dwarka', 'Rohini']
  },
  {
    id: 'hyd',
    name: 'Hyderabad',
    lat: 17.3850, lng: 78.4867,
    areas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Hitech City', 'Kukatpally', 'Madhapur', 'Secunderabad']
  }
];

// Haversine distance in km between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Find the nearest city from predefined list given lat/lng
const findNearestCity = (lat, lng) => {
  return cities.reduce((nearest, city) => {
    const d = haversineDistance(lat, lng, city.lat, city.lng);
    return d < nearest.dist ? { city, dist: d } : nearest;
  }, { city: cities[0], dist: Infinity }).city;
};

const banners = [
  { id: 'b1', title: 'Flat 30% OFF', subtitle: 'On all haircuts', color: '#FFE6E9' },
  { id: 'b2', title: 'Free Beard Trim', subtitle: 'With facial booking', color: '#FFF4E6' },
];

const categories = [
  { id: 'c1', label: 'Haircut', icon: 'cut' },
  { id: 'c2', label: 'Beard', icon: 'male' },
  { id: 'c3', label: 'Facial', icon: 'happy-outline' },
  { id: 'c4', label: 'Spa', icon: 'leaf-outline' },
  { id: 'c5', label: 'Bridal', icon: 'heart-outline' },
  { id: 'c6', label: 'Kids', icon: 'happy' },
  { id: 'c7', label: 'Tattoos', icon: 'brush-outline' },
];


const salons = [
  // Bangalore Salons
  {
    id: 's1',
    name: 'Red Scissor Studio',
    rating: 4.6,
    distance: 1.2,
    priceFrom: 199,
    open: true,
    cityId: 'blr',
    address: 'MG Road, Bangalore',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=60',
    reviewCount: 120,
    services: [
      { id: 'sv1', name: 'Haircut', duration: 30, price: 150 },
      { id: 'sv2', name: 'Beard Trim', duration: 20, price: 100 },
      { id: 'sv3', name: 'Facial', duration: 45, price: 500 },
    ],
  },
  {
    id: 's2',
    name: 'Urban Blade Lounge',
    rating: 4.4,
    distance: 2.3,
    priceFrom: 249,
    open: true,
    cityId: 'blr',
    address: 'Church Street, Bangalore',
    img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=60',
    reviewCount: 85,
    services: [
      { id: 'sv4', name: 'Haircut', duration: 30, price: 200 },
      { id: 'sv5', name: 'Hair Spa', duration: 50, price: 700 },
      { id: 'sv6', name: 'Beard Styling', duration: 25, price: 180 },
    ],
  },
  {
    id: 's3',
    name: 'Glow & Groom',
    rating: 4.8,
    distance: 0.9,
    priceFrom: 299,
    open: false,
    cityId: 'blr',
    address: 'Indiranagar, Bangalore',
    img: 'https://images.unsplash.com/photo-1500856056008-859079534e9e?auto=format&fit=crop&w=900&q=60',
    reviewCount: 210,
    services: [
      { id: 'sv7', name: 'Bridal Makeup', duration: 120, price: 3500 },
      { id: 'sv8', name: 'Kids Cut', duration: 20, price: 180 },
      { id: 'sv9', name: 'Clean-up Facial', duration: 35, price: 600 },
    ],
  },
  // Mumbai Salons
  {
    id: 's4',
    name: 'The Royal Salon',
    rating: 4.9,
    distance: 0.5,
    priceFrom: 500,
    open: true,
    cityId: 'mum',
    address: 'Bandra West, Mumbai',
    img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    reviewCount: 340,
    services: [
      { id: 'sv10', name: 'Global Color', duration: 90, price: 2500 },
      { id: 'sv11', name: 'Creative Haircut', duration: 45, price: 800 },
    ],
  },
  {
    id: 's5',
    name: 'Coastal Cuts',
    rating: 4.2,
    distance: 3.1,
    priceFrom: 150,
    open: true,
    cityId: 'mum',
    address: 'Juhu Beach Road, Mumbai',
    img: 'https://images.unsplash.com/photo-1599351431247-f57933847020?auto=format&fit=crop&w=800&q=80',
    reviewCount: 62,
    services: [
      { id: 'sv12', name: 'Basic Trim', duration: 20, price: 150 },
      { id: 'sv13', name: 'Shave', duration: 15, price: 100 },
    ],
  },
  // Delhi Salons
  {
    id: 's6',
    name: 'Imperial Styles',
    rating: 4.7,
    distance: 1.5,
    priceFrom: 400,
    open: true,
    cityId: 'del',
    address: 'Connaught Place, Delhi',
    img: 'https://images.unsplash.com/photo-1512690196162-7c97262c4145?auto=format&fit=crop&w=800&q=80',
    reviewCount: 156,
    services: [
      { id: 'sv14', name: 'Executive Grooming', duration: 60, price: 1200 },
      { id: 'sv15', name: 'Head Massage', duration: 20, price: 300 },
    ],
  },
  // Hyderabad Salons
  {
    id: 's7',
    name: 'Nizami Grooming Lounge',
    rating: 4.8,
    distance: 1.2,
    priceFrom: 350,
    open: true,
    cityId: 'hyd',
    address: 'Banjara Hills Road No 12, Hyderabad',
    img: 'https://images.unsplash.com/photo-1512690196162-7c97262c4145?auto=format&fit=crop&w=800&q=80',
    reviewCount: 180,
    services: [
      { id: 'sv16', name: 'Nizami Haircut', duration: 40, price: 450 },
      { id: 'sv17', name: 'Charcoal Facial', duration: 30, price: 600 },
    ],
  },
  {
    id: 's8',
    name: 'The Pearl Parlour',
    rating: 4.5,
    distance: 2.8,
    priceFrom: 200,
    open: true,
    cityId: 'hyd',
    address: 'Madhapur Main Road, Hyderabad',
    img: 'https://images.unsplash.com/photo-1599351431247-f57933847020?auto=format&fit=crop&w=800&q=80',
    reviewCount: 95,
    services: [
      { id: 'sv18', name: 'Hair Straightening', duration: 120, price: 2500 },
      { id: 'sv19', name: 'Spa Mani-Pedi', duration: 60, price: 800 },
    ],
  },
  {
    id: 's9',
    name: 'Ink & Art Tattoo Studio',
    rating: 4.9,
    distance: 0.8,
    priceFrom: 1000,
    open: true,
    cityId: 'hyd',
    address: 'Jubilee Hills, Hyderabad',
    img: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    reviewCount: 142,
    services: [
      { id: 'sv20', name: 'B&W Tattoo (Small)', duration: 60, price: 1500 },
      { id: 'sv21', name: 'Color Tattoo (Medium)', duration: 120, price: 3500 },
      { id: 'sv22', name: 'Piercing', duration: 15, price: 500 },
    ],
  },


];

const workers = [
  { id: 'w1', name: 'Amit', rating: 4.7, experience: 5, photo: 'https://i.pravatar.cc/150?img=12' },
  { id: 'w2', name: 'Sara', rating: 4.8, experience: 6, photo: 'https://i.pravatar.cc/150?img=32' },
  { id: 'w3', name: 'John', rating: 4.5, experience: 4, photo: 'https://i.pravatar.cc/150?img=45' },
];

const slots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];

const paymentMethods = ['UPI', 'Card', 'Cash at Salon'];

const allCountries = [
  { code: '+93', name: 'Afghanistan', flag: '🇦🇫', lat: 33.9391, lng: 67.7100 },
  { code: '+355', name: 'Albania', flag: '🇦🇱', lat: 41.1533, lng: 20.1683 },
  { code: '+213', name: 'Algeria', flag: '🇩🇿', lat: 28.0339, lng: 1.6596 },
  { code: '+376', name: 'Andorra', flag: '🇦🇩', lat: 42.5063, lng: 1.5218 },
  { code: '+244', name: 'Angola', flag: '🇦🇴', lat: -11.2027, lng: 17.8739 },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', lat: -38.4161, lng: -63.6167 },
  { code: '+374', name: 'Armenia', flag: '��', lat: 40.0691, lng: 45.0382 },
  { code: '+61', name: 'Australia', flag: '��🇺', lat: -25.2744, lng: 133.7751 },
  { code: '+43', name: 'Austria', flag: '🇦🇹', lat: 47.5162, lng: 14.5501 },
  { code: '+994', name: 'Azerbaijan', flag: '🇦�', lat: 40.1431, lng: 47.5769 },
  { code: '+1242', name: 'Bahamas', flag: '🇧�🇸', lat: 25.0343, lng: -77.3963 },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', lat: 26.0275, lng: 50.5500 },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', lat: 23.6850, lng: 90.3563 },
  { code: '+375', name: 'Belarus', flag: '🇧🇾', lat: 53.7098, lng: 27.9534 },
  { code: '+32', name: 'Belgium', flag: '🇧🇪', lat: 50.5039, lng: 4.4699 },
  { code: '+501', name: 'Belize', flag: '🇧🇿', lat: 17.1899, lng: -88.4976 },
  { code: '+229', name: 'Benin', flag: '🇧🇯', lat: 9.3077, lng: 2.3158 },
  { code: '+975', name: 'Bhutan', flag: '🇧🇹', lat: 27.5142, lng: 90.4336 },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴', lat: -16.2902, lng: -63.5887 },
  { code: '+387', name: 'Bosnia', flag: '🇧🇦', lat: 43.9159, lng: 17.6791 },
  { code: '+267', name: 'Botswana', flag: '�🇼', lat: -22.3285, lng: 24.6849 },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', lat: -14.2350, lng: -51.9253 },
  { code: '+673', name: 'Brunei', flag: '🇧🇳', lat: 4.5353, lng: 114.7277 },
  { code: '+359', name: 'Bulgaria', flag: '🇧�🇬', lat: 42.7339, lng: 25.4858 },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫', lat: 12.3640, lng: -1.5275 },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭', lat: 12.5657, lng: 104.9910 },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲', lat: 3.8480, lng: 11.5021 },
  { code: '+1', name: 'Canada', flag: '🇨🇦', lat: 56.1304, lng: -106.3468 },
  { code: '+236', name: 'Central African Rep.', flag: '🇨🇫', lat: 6.6111, lng: 20.9394 },
  { code: '+235', name: 'Chad', flag: '🇹🇩', lat: 15.4542, lng: 18.7322 },
  { code: '+56', name: 'Chile', flag: '🇨🇱', lat: -35.6751, lng: -71.5430 },
  { code: '+86', name: 'China', flag: '�🇳', lat: 35.8617, lng: 104.1954 },
  { code: '+57', name: 'Colombia', flag: '🇨🇴', lat: 4.5709, lng: -74.2973 },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷', lat: 9.7489, lng: -83.7534 },
  { code: '+385', name: 'Croatia', flag: '🇭🇷', lat: 45.1000, lng: 15.2000 },
  { code: '+53', name: 'Cuba', flag: '🇨🇺', lat: 21.5218, lng: -77.7812 },
  { code: '+357', name: 'Cyprus', flag: '🇨🇾', lat: 35.1264, lng: 33.4299 },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿', lat: 49.8175, lng: 15.4730 },
  { code: '+45', name: 'Denmark', flag: '🇩🇰', lat: 56.2639, lng: 9.5018 },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯', lat: 11.8251, lng: 42.5903 },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨', lat: -1.8312, lng: -78.1834 },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', lat: 26.8206, lng: 30.8025 },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻', lat: 13.7942, lng: -88.8965 },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹', lat: 9.1450, lng: 40.4897 },
  { code: '+358', name: 'Finland', flag: '�🇮', lat: 61.9241, lng: 25.7482 },
  { code: '+33', name: 'France', flag: '🇫🇷', lat: 46.2276, lng: 2.2137 },
  { code: '+241', name: 'Gabon', flag: '🇬�🇦', lat: -0.8037, lng: 11.6094 },
  { code: '+220', name: 'Gambia', flag: '🇬�', lat: 13.4432, lng: -15.3101 },
  { code: '+995', name: 'Georgia', flag: '🇬�🇪', lat: 42.3154, lng: 43.3569 },
  { code: '+49', name: 'Germany', flag: '🇩🇪', lat: 51.1657, lng: 10.4515 },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', lat: 7.9465, lng: -1.0232 },
  { code: '+30', name: 'Greece', flag: '🇬🇷', lat: 39.0742, lng: 21.8243 },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹', lat: 15.7835, lng: -90.2308 },
  { code: '+224', name: 'Guinea', flag: '🇬🇳', lat: 9.9456, lng: -11.3247 },
  { code: '+592', name: 'Guyana', flag: '🇬🇾', lat: 4.8604, lng: -58.9302 },
  { code: '+509', name: 'Haiti', flag: '🇭🇹', lat: 18.9712, lng: -72.2852 },
  { code: '+504', name: 'Honduras', flag: '🇭🇳', lat: 15.1999, lng: -86.2419 },
  { code: '+36', name: 'Hungary', flag: '🇭🇺', lat: 47.1625, lng: 19.5033 },
  { code: '+354', name: 'Iceland', flag: '🇮🇸', lat: 64.9631, lng: -19.0208 },
  { code: '+91', name: 'India', flag: '🇮🇳', lat: 20.5937, lng: 78.9629 },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', lat: -0.7893, lng: 113.9213 },
  { code: '+98', name: 'Iran', flag: '🇮🇷', lat: 32.4279, lng: 53.6880 },
  { code: '+964', name: 'Iraq', flag: '🇮🇶', lat: 33.2232, lng: 43.6793 },
  { code: '+353', name: 'Ireland', flag: '🇮🇪', lat: 53.4129, lng: -8.2439 },
  { code: '+972', name: 'Israel', flag: '🇮🇱', lat: 31.0461, lng: 34.8516 },
  { code: '+39', name: 'Italy', flag: '🇮🇹', lat: 41.8719, lng: 12.5674 },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮', lat: 7.5400, lng: -5.5471 },
  { code: '+1876', name: 'Jamaica', flag: '��', lat: 18.1096, lng: -77.2975 },
  { code: '+81', name: 'Japan', flag: '🇯🇵', lat: 36.2048, lng: 138.2529 },
  { code: '+962', name: 'Jordan', flag: '🇯🇴', lat: 30.5852, lng: 36.2384 },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿', lat: 48.0196, lng: 66.9237 },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', lat: -0.0236, lng: 37.9062 },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', lat: 29.3117, lng: 47.4818 },
  { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬', lat: 41.2044, lng: 74.7661 },
  { code: '+856', name: 'Laos', flag: '🇱🇦', lat: 19.8563, lng: 102.4955 },
  { code: '+371', name: 'Latvia', flag: '🇱🇻', lat: 56.8796, lng: 24.6032 },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧', lat: 33.8547, lng: 35.8623 },
  { code: '+218', name: 'Libya', flag: '🇱🇾', lat: 26.3351, lng: 17.2283 },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹', lat: 55.1694, lng: 23.8813 },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺', lat: 49.8153, lng: 6.1296 },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬', lat: -18.7669, lng: 46.8691 },
  { code: '+265', name: 'Malawi', flag: '🇲🇼', lat: -13.2543, lng: 34.3015 },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', lat: 4.2105, lng: 101.9758 },
  { code: '+960', name: 'Maldives', flag: '🇲�', lat: 3.2028, lng: 73.2207 },
  { code: '+223', name: 'Mali', flag: '🇲🇱', lat: 17.5707, lng: -3.9962 },
  { code: '+356', name: 'Malta', flag: '🇲🇹', lat: 35.9375, lng: 14.3754 },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷', lat: 21.0079, lng: -10.9408 },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺', lat: -20.3484, lng: 57.5522 },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', lat: 23.6345, lng: -102.5528 },
  { code: '+373', name: 'Moldova', flag: '🇲�🇩', lat: 47.4116, lng: 28.3699 },
  { code: '+377', name: 'Monaco', flag: '🇲🇨', lat: 43.7384, lng: 7.4246 },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳', lat: 46.8625, lng: 103.8467 },
  { code: '+382', name: 'Montenegro', flag: '🇲🇪', lat: 42.7087, lng: 19.3744 },
  { code: '+212', name: 'Morocco', flag: '🇲🇦', lat: 31.7917, lng: -7.0926 },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿', lat: -18.6657, lng: 35.5296 },
  { code: '+264', name: 'Namibia', flag: '🇳🇦', lat: -22.9576, lng: 18.4904 },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', lat: 28.3949, lng: 84.1240 },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', lat: 52.1326, lng: 5.2913 },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', lat: -40.9006, lng: 174.8860 },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮', lat: 12.8654, lng: -85.2072 },
  { code: '+227', name: 'Niger', flag: '🇳🇪', lat: 17.6078, lng: 8.0817 },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', lat: 9.0820, lng: 8.6753 },
  { code: '+389', name: 'North Macedonia', flag: '🇲🇰', lat: 41.6086, lng: 21.7453 },
  { code: '+47', name: 'Norway', flag: '🇳🇴', lat: 60.4720, lng: 8.4689 },
  { code: '+968', name: 'Oman', flag: '🇴🇲', lat: 21.5126, lng: 55.9233 },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', lat: 30.3753, lng: 69.3451 },
  { code: '+507', name: 'Panama', flag: '🇵🇦', lat: 8.5380, lng: -80.7821 },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾', lat: -23.4425, lng: -58.4438 },
  { code: '+51', name: 'Peru', flag: '🇵🇪', lat: -9.1900, lng: -75.0152 },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', lat: 12.8797, lng: 121.7740 },
  { code: '+48', name: 'Poland', flag: '🇵🇱', lat: 51.9194, lng: 19.1451 },
  { code: '+351', name: 'Portugal', flag: '🇵🇹', lat: 39.3999, lng: -8.2245 },
  { code: '+974', name: 'Qatar', flag: '🇶�', lat: 25.3548, lng: 51.1839 },
  { code: '+40', name: 'Romania', flag: '🇷🇴', lat: 45.9432, lng: 24.9668 },
  { code: '+7', name: 'Russia', flag: '🇷🇺', lat: 61.5240, lng: 105.3188 },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼', lat: -1.9403, lng: 29.8739 },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', lat: 23.8859, lng: 45.0792 },
  { code: '+221', name: 'Senegal', flag: '�🇳', lat: 14.4974, lng: -14.4524 },
  { code: '+381', name: 'Serbia', flag: '🇷🇸', lat: 44.0165, lng: 21.0059 },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨', lat: -4.6796, lng: 55.4920 },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱', lat: 8.4606, lng: -11.7799 },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰', lat: 48.6690, lng: 19.6990 },
  { code: '+386', name: 'Slovenia', flag: '�🇮', lat: 46.1512, lng: 14.9955 },
  { code: '+252', name: 'Somalia', flag: '�🇴', lat: 5.1521, lng: 46.1996 },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', lat: -30.5595, lng: 22.9375 },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸', lat: 4.8594, lng: 31.5713 },
  { code: '+34', name: 'Spain', flag: '🇪🇸', lat: 40.4637, lng: -3.7492 },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', lat: 7.8731, lng: 80.7718 },
  { code: '+249', name: 'Sudan', flag: '🇸🇩', lat: 12.8628, lng: 30.2176 },
  { code: '+597', name: 'Suriname', flag: '🇸🇷', lat: 3.9193, lng: -56.0278 },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', lat: 60.1282, lng: 18.6435 },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', lat: 46.8182, lng: 8.2275 },
  { code: '+963', name: 'Syria', flag: '🇸�', lat: 34.8021, lng: 38.9968 },
  { code: '+886', name: 'Taiwan', flag: '🇹🇼', lat: 23.6978, lng: 120.9605 },
  { code: '+992', name: 'Tajikistan', flag: '��', lat: 38.8610, lng: 71.2761 },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿', lat: -6.3690, lng: 34.8888 },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', lat: 15.8700, lng: 100.9925 },
  { code: '+228', name: 'Togo', flag: '🇹🇬', lat: 8.6195, lng: 0.8248 },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳', lat: 33.8869, lng: 9.5375 },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', lat: 38.9637, lng: 35.2433 },
  { code: '+993', name: 'Turkmenistan', flag: '🇹🇲', lat: 38.9697, lng: 59.5563 },
  { code: '+256', name: 'Uganda', flag: '🇺🇬', lat: 1.3733, lng: 32.2903 },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦', lat: 48.3794, lng: 31.1656 },
  { code: '+971', name: 'UAE', flag: '🇦🇪', lat: 23.4241, lng: 53.8478 },
  { code: '+44', name: 'UK', flag: '🇬🇧', lat: 55.3781, lng: -3.4360 },
  { code: '+1', name: 'USA', flag: '🇺🇸', lat: 37.0902, lng: -95.7129 },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾', lat: -32.5228, lng: -55.7658 },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿', lat: 41.3775, lng: 64.5854 },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪', lat: 6.4238, lng: -66.5897 },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', lat: 14.0583, lng: 108.2772 },
  { code: '+967', name: 'Yemen', flag: '🇾🇪', lat: 15.5527, lng: 48.5164 },
  { code: '+260', name: 'Zambia', flag: '🇿🇲', lat: -13.1339, lng: 27.8493 },
  { code: '+263', name: 'Zimbabwe', flag: '🇿�', lat: -19.0154, lng: 29.1549 },
];


export default function App() {
  // Navigation State
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('home');

  // Booking State
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Auth State
  const [authState, setAuthState] = useState('splash'); // splash -> login -> otp -> main
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(allCountries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Profile State
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://cdn-icons-png.flaticon.com/128/149/149071.png'
  });


  // Review State
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Location State
  const [currentCity, setCurrentCity] = useState(cities[0]);
  const [currentArea, setCurrentArea] = useState(cities[0].areas[0]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Fallback: nearest town when user is in a village
  const [nearestCityFallback, setNearestCityFallback] = useState(null); // { city, distKm }
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Booking Confirmed!', message: 'Your appointment at Red Scissor is set for 10:30 AM tomorrow.', time: '2h ago', type: 'booking' },
    { id: 'n2', title: 'Exclusive Offer 🎁', message: 'Flat 50% OFF on all Facials this weekend only!', time: '5h ago', type: 'offer' },
    { id: 'n3', title: 'Welcome to Saloon Essy', message: 'Start your grooming journey with our top-rated salons.', time: '1d ago', type: 'info' },
  ]);



  useEffect(() => {
    if (authState === 'splash') {
      const t = setTimeout(() => setAuthState('login'), 1200);
      return () => clearTimeout(t);
    }
  }, [authState]);

  // Handle Initial Location Detection
  useEffect(() => {
    if (authState === 'main') {
      getCurrentLocation();
    }
  }, [authState]);

  const [isLocating, setIsLocating] = useState(false);
  const [customLocationText, setCustomLocationText] = useState('');
  const [lastKnownCoords, setLastKnownCoords] = useState(null);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Don't alert on app start to avoid annoyance, just let them manual pick
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const item = address[0];
        const city = item.city || item.district || item.region;
        const area = item.street || item.subregion || item.name || 'Current Area';

        setLastKnownCoords({ lat: location.coords.latitude, lng: location.coords.longitude });

        // Try to find if this city exists in our predefined list
        const matchedCity = cities.find(c => c.name.toLowerCase() === city?.toLowerCase());

        if (matchedCity) {
          setCurrentCity(matchedCity);
          setCurrentArea(area);
          setNearestCityFallback(null);
        } else {
          // Village/unknown location — store as virtual city, then find nearest known city
          const virtualCity = { id: `loc-${Date.now()}`, name: city || area, areas: [area], lat: location.coords.latitude, lng: location.coords.longitude };
          setCurrentCity(virtualCity);
          setCurrentArea(area);
          // Find and flag the nearest city for fallback display
          const nearest = findNearestCity(location.coords.latitude, location.coords.longitude);
          const distKm = haversineDistance(location.coords.latitude, location.coords.longitude, nearest.lat, nearest.lng);
          setNearestCityFallback({ city: nearest, distKm: Math.round(distKm) });
        }
        setShowLocationPicker(false);
      }
    } catch (error) {
      console.log('Location error:', error);
    } finally {
      setIsLocating(false);
    }
  };


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library permits required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUserProfile({ ...userProfile, avatar: result.assets[0].uri });
    }
  };

  const salonTotal = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices]
  );

  const filteredSalons = useMemo(() => {
    // If user is in a village (no salons in their city), fall back to nearest known city
    const cityId = nearestCityFallback ? nearestCityFallback.city.id : currentCity.id;
    let result = salons.filter(s => s.cityId === cityId);
    if (selectedCategory) {
      result = result.filter(s =>
        s.services.some(service =>
          service.name.toLowerCase().includes(selectedCategory.label.toLowerCase()) ||
          (selectedCategory.label === 'Tattoos' && service.name.toLowerCase().includes('tattoo'))
        )
      );
    }
    return result;
  }, [currentCity, nearestCityFallback, selectedCategory]);





  const resetBookingState = () => {
    setSelectedServices([]);
    setSelectedWorker(null);
    setSelectedSlot(null);
    setSelectedDate(null);
  };

  const handleSelectSalon = (salon) => {
    setSelectedSalon(salon);
    resetBookingState();
    setScreen('salon');
    setTab('home');
  };

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) return prev.filter((s) => s.id !== service.id);
      return [...prev, service];
    });
  };

  const confirmBooking = () => {
    if (!selectedSalon || !selectedSlot || !selectedDate || selectedServices.length === 0) return;
    const booking = {
      id: `${Date.now()}`,
      salon: selectedSalon,
      services: selectedServices,
      worker: selectedWorker,
      slot: selectedSlot,
      date: selectedDate,
      status: 'Upcoming',
      total: salonTotal,
    };
    setBookings((prev) => [booking, ...prev]);
    setScreen('bookings');
    setTab('bookings');
    resetBookingState();
  };

  const markFavorite = (salonId) => {
    setFavorites((prev) =>
      prev.includes(salonId) ? prev.filter((id) => id !== salonId) : [...prev, salonId]
    );
  };

  const submitReview = () => {
    setRating(0);
    setReviewText('');
    setScreen('bookings');
  };

  const renderTabScreen = () => {
    if (authState === 'splash') return <SplashScreen />;
    if (authState === 'login') return <AuthScreen stage="login" phone={phone} setPhone={setPhone} setAuthState={setAuthState} selectedCountry={selectedCountry} setShowCountryPicker={setShowCountryPicker} />;
    if (authState === 'otp') return <AuthScreen stage="otp" phone={phone} otp={otp} setOtp={setOtp} setAuthState={setAuthState} setScreen={setScreen} selectedCountry={selectedCountry} setUserProfile={setUserProfile} userProfile={userProfile} />;


    if (screen === 'salon') return <SalonDetail selectedSalon={selectedSalon} setScreen={setScreen} markFavorite={markFavorite} favorites={favorites} toggleService={toggleService} selectedServices={selectedServices} workers={workers} selectedWorker={selectedWorker} setSelectedWorker={setSelectedWorker} slots={slots} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} selectedDate={selectedDate} setSelectedDate={setSelectedDate} salonTotal={salonTotal} />;
    if (screen === 'summary') return <BookingSummary selectedSalon={selectedSalon} selectedServices={selectedServices} selectedWorker={selectedWorker} selectedSlot={selectedSlot} salonTotal={salonTotal} confirmBooking={confirmBooking} paymentMethods={paymentMethods} />;
    if (screen === 'review') return <ReviewScreen rating={rating} setRating={setRating} reviewText={reviewText} setReviewText={setReviewText} submitReview={submitReview} />;
    if (screen === 'editProfile') return <EditProfileScreen userProfile={userProfile} setUserProfile={setUserProfile} setScreen={setScreen} pickImage={pickImage} />;
    if (screen === 'addressBook') return <AddressBookScreen setScreen={setScreen} />;
    if (screen === 'notifications') return <NotificationSettingsScreen setScreen={setScreen} />;
    if (screen === 'language') return <LanguageSelectionScreen setScreen={setScreen} />;
    if (screen === 'privacy') return <PrivacyPermissionsScreen setScreen={setScreen} />;
    if (screen === 'offers') return <OffersScreen setScreen={setScreen} setTab={setTab} banners={banners} />;
    if (screen === 'notificationsList') return <NotificationsListScreen setScreen={setScreen} notifications={notifications} />;

    if (tab === 'home') return <HomeScreen currentArea={currentArea} currentCity={currentCity} setShowLocationPicker={setShowLocationPicker} banners={banners} categories={categories} filteredSalons={filteredSalons} handleSelectSalon={handleSelectSalon} setScreen={setScreen} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} setTab={setTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} nearestCityFallback={nearestCityFallback} />;


    if (tab === 'search') return <SearchScreen filteredSalons={filteredSalons} handleSelectSalon={handleSelectSalon} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
    if (tab === 'bookings') return <BookingsScreen bookings={bookings} setScreen={setScreen} />;
    if (tab === 'favorites') return <FavoritesScreen favorites={favorites} salons={salons} handleSelectSalon={handleSelectSalon} />;
    if (tab === 'profile') return <ProfileScreen userProfile={userProfile} bookings={bookings} favorites={favorites} setScreen={setScreen} setTab={setTab} setAuthState={setAuthState} setShowLocationPicker={setShowLocationPicker} currentCity={currentCity} currentArea={currentArea} cities={cities} setCurrentCity={setCurrentCity} setCurrentArea={setCurrentArea} />;

    return <HomeScreen currentArea={currentArea} currentCity={currentCity} setShowLocationPicker={setShowLocationPicker} banners={banners} categories={categories} filteredSalons={filteredSalons} handleSelectSalon={handleSelectSalon} setScreen={setScreen} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      {renderTabScreen()}

      {/* Global Country Picker Overlay */}
      {showCountryPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCountryPicker(false)} />
          <View style={[styles.locationModal, { height: '60%' }]}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
              {allCountries.map((c, idx) => (
                <TouchableOpacity
                  key={`${c.code}-${idx}`}
                  style={styles.areaItem}
                  onPress={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                >
                  <Text style={{ fontSize: 18 }}>{c.flag} {c.name} ({c.code})</Text>
                  {selectedCountry.code === c.code && <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Global Location Picker Modal */}
      {showLocationPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowLocationPicker(false)} />
          <View style={[styles.locationModal, SHADOW]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                  <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Location</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={getCurrentLocation}
              disabled={isLocating}
            >
              <Ionicons name="navigate" size={20} color={PRIMARY} />
              <Text style={styles.currentLocationText}>
                {isLocating ? 'Detecting Location...' : 'Use Current Location'}
              </Text>
              {isLocating && <View style={{ marginLeft: 10 }}><Text style={{ color: '#999', fontSize: 12 }}>Wait...</Text></View>}
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>OR SELECT MANUALLY</Text>
              <View style={styles.line} />
            </View>

            {/* Type Custom Location */}
            <View style={styles.customLocationRow}>
              <Ionicons name="home-outline" size={18} color="#888" />
              <TextInput
                style={styles.customLocationInput}
                placeholder="Type your village / area name..."
                placeholderTextColor="#BBB"
                value={customLocationText}
                onChangeText={setCustomLocationText}
              />
              {customLocationText.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.setLocationBtn}
                  onPress={() => {
                    const typedArea = customLocationText.trim();
                    // Use last known GPS coords or center of India as fallback
                    const lat = lastKnownCoords?.lat ?? 20.5937;
                    const lng = lastKnownCoords?.lng ?? 78.9629;
                    const nearest = findNearestCity(lat, lng);
                    const distKm = haversineDistance(lat, lng, nearest.lat, nearest.lng);
                    const virtualCity = { id: `custom-${Date.now()}`, name: typedArea, areas: [typedArea], lat, lng };
                    setCurrentCity(virtualCity);
                    setCurrentArea(typedArea);
                    setNearestCityFallback({ city: nearest, distKm: Math.round(distKm) });
                    setCustomLocationText('');
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={styles.setLocationBtnText}>Set Location</Text>
                </TouchableOpacity>
              )}
            </View>


            <View style={styles.cityTabRow}>
              {cities.map(city => (
                <TouchableOpacity
                  key={city.id}
                  style={[styles.cityTab, currentCity.id === city.id && styles.activeCityTab]}
                  onPress={() => { setCurrentCity(city); setCurrentArea(city.areas[0]); }}
                >
                  <Text style={[styles.cityTabText, currentCity.id === city.id && styles.activeCityTabText]}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {currentCity.areas.map(area => (
                <TouchableOpacity key={area} style={styles.areaItem} onPress={() => { setCurrentArea(area); setShowLocationPicker(false); }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={currentArea === area ? "radio-button-on" : "location-outline"} size={20} color={currentArea === area ? PRIMARY : "#666"} />
                    <Text style={[styles.areaItemText, currentArea === area && { color: PRIMARY, fontWeight: '700' }]}>{area}</Text>
                  </View>
                  {currentArea === area && <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {authState === 'main' && (
        <View style={[styles.tabBar, SHADOW]}>
          <TabIcon name="home-outline" label="Home" active={tab === 'home'} onPress={() => { setTab('home'); setScreen('home'); }} />
          <TabIcon name="search-outline" label="Discovery" active={tab === 'search'} onPress={() => { setTab('search'); setScreen('search'); }} />
          <TabIcon name="calendar-outline" label="Bookings" active={tab === 'bookings'} onPress={() => { setTab('bookings'); setScreen('bookings'); }} />
          <TabIcon name={favorites.length ? 'heart' : 'heart-outline'} label="Favorites" active={tab === 'favorites'} onPress={() => { setTab('favorites'); setScreen('favorites'); }} />
          <TabIcon name="person-outline" label="Account" active={tab === 'profile'} onPress={() => { setTab('profile'); setScreen('profile'); }} />
        </View>
      )}
    </View>
  );
}

// --- EXTERNAL COMPONENTS ---

const TabIcon = ({ name, label, active, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Ionicons name={name} size={22} color={active ? PRIMARY : '#888'} />
    <Text style={[styles.tabLabel, active && { color: PRIMARY }]}>{label}</Text>
  </TouchableOpacity>
);

const SplashScreen = () => (
  <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
    <View style={styles.logoCircle}>
      <Ionicons name="cut" size={42} color="#fff" />
    </View>
    <Text style={{ marginTop: 16, fontSize: 22, fontWeight: '800', color: '#111' }}>Saloon Essy</Text>
    <Text style={{ color: '#555', marginTop: 6 }}>Book Your Style Anytime</Text>
  </View>
);

const AuthScreen = ({ stage, phone, setPhone, otp, setOtp, setAuthState, setScreen, selectedCountry, setShowCountryPicker, setUserProfile, userProfile }) => (

  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.authHeader}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }}
          style={styles.authBanner}
        />
        <View style={styles.brandOverlay}>
          <Text style={styles.brandName}>Saloon Essy</Text>
          <Text style={styles.brandTagline}>Your personal stylist, always ready.</Text>
        </View>
      </View>

      <View style={styles.authForm}>
        <Text style={styles.authTitle}>
          {stage === 'login' ? 'Login or Signup' : 'Enter OTP'}
        </Text>

        {stage === 'login' ? (
          <>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.countryCode} onPress={() => setShowCountryPicker(true)}>
                <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
                <Text style={styles.countryText}>{selectedCountry.code}</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
              <TextInput
                placeholder="Enter Phone Number"
                keyboardType="phone-pad"
                style={styles.authInput}
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.continueBtn, !phone && { opacity: 0.6 }]}
              onPress={() => setAuthState('otp')}
              disabled={!phone}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/128/300/300221.png' }} style={styles.socialIcon} />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="ellipsis-horizontal-circle" size={24} color="#111" />
                <Text style={styles.socialBtnText}>More</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.otpSentText}>We have sent a verification code to</Text>
            <Text style={styles.otpPhoneText}>{selectedCountry.code} {phone}</Text>

            <View style={styles.otpContainer}>
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <View key={i} style={styles.otpBox}>
                  <TextInput
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={(val) => {
                      let newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                    }}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => {
                setUserProfile({ ...userProfile, phone: `${selectedCountry.code} ${phone}` });
                setAuthState('main');
                setScreen('home');
              }}
            >

              <Text style={styles.continueBtnText}>Verify and Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20, alignSelf: 'center' }}>
              <Text style={styles.resendText}>Didn't receive OTP? <Text style={{ color: PRIMARY, fontWeight: '700' }}>Resend now</Text></Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.termsText}>
          By continuing, you agree to our {'\n'}
          <Text style={styles.linkText}>Terms of Service</Text> • <Text style={styles.linkText}>Privacy Policy</Text> • <Text style={styles.linkText}>Content Policy</Text>
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const HomeScreen = ({ currentArea, currentCity, setShowLocationPicker, banners, categories, filteredSalons, handleSelectSalon, setScreen, selectedCategory, setSelectedCategory, setTab, searchQuery, setSearchQuery, nearestCityFallback }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.locationWrap} onPress={() => setShowLocationPicker(true)}>
          <Ionicons name="location" size={18} color={PRIMARY} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.locationText}>{currentArea}</Text>
              <Ionicons name="chevron-down" size={14} color="#333" />
            </View>
            <Text style={{ fontSize: 11, color: '#666' }}>{currentCity.name}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('notificationsList')}>
          <View>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY }} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Search salons, haircut, facial…"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="options-outline" size={20} color={PRIMARY} />
      </View>

      {/* Nearest Town Banner for Village Users */}
      {nearestCityFallback && (
        <View style={styles.villageBanner}>
          <Ionicons name="navigate-circle" size={20} color="#1E6FA8" />
          <View style={{ flex: 1 }}>
            <Text style={styles.villageBannerTitle}>No salons in your area</Text>
            <Text style={styles.villageBannerText}>
              Showing salons in {nearestCityFallback.city.name} — nearest town ({nearestCityFallback.distKm} km away)
            </Text>
          </View>
        </View>
      )}

      {/* Offers Banners */}
      <FlatList
        data={banners}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.bannerCard, { backgroundColor: item.color }]} onPress={() => setScreen('offers')}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        style={{ marginVertical: 12 }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
      />

      {/* Categories */}
      <View>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryPill, selectedCategory?.id === item.id && { backgroundColor: PRIMARY }]}
              onPress={() => setSelectedCategory(selectedCategory?.id === item.id ? null : item)}
            >
              <Ionicons name={item.icon} size={20} color={selectedCategory?.id === item.id ? '#FFF' : PRIMARY} />
              <Text style={[styles.categoryText, selectedCategory?.id === item.id && { color: '#FFF' }]}>{item.label}</Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
        />
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={{ paddingHorizontal: 16, marginBottom: 10 }}>
            <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: '700' }}>Showing {selectedCategory.label} • Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Salon List */}
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        {filteredSalons.length > 0 ? (
          filteredSalons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} handleSelectSalon={handleSelectSalon} />
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="search" size={48} color="#EEE" />
            <Text style={{ marginTop: 10, color: '#999' }}>No salons found {selectedCategory ? `for ${selectedCategory.label}` : ''} in {currentCity.name}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
);


const SalonCard = ({ salon, handleSelectSalon }) => (
  <TouchableOpacity style={[styles.card, SHADOW]} onPress={() => handleSelectSalon(salon)}>
    <ImageBackground source={{ uri: salon.img }} style={styles.cardImage} imageStyle={{ borderRadius: 14 }}>
      {!salon.open && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
    </ImageBackground>
    <View style={styles.cardContent}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{salon.name}</Text>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.ratingText}>{salon.rating}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={14} color="#777" />
          <Text style={styles.metaText}>{salon.distance} km</Text>
        </View>
        <Text style={styles.metaText}>₹ {salon.priceFrom}+</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleSelectSalon(salon)}
        style={[styles.primaryBtn, { marginTop: 8, alignSelf: 'flex-start' }]}
      >
        <Text style={styles.primaryBtnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const SearchScreen = ({ filteredSalons, handleSelectSalon, searchQuery, setSearchQuery }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Search salons, haircut, facial…"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={searchQuery.length > 0}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {filteredSalons.map((salon) => (
        <SalonCard key={salon.id} salon={salon} handleSelectSalon={handleSelectSalon} />
      ))}


      {filteredSalons.length === 0 && searchQuery.length > 0 && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="search" size={48} color="#EEE" />
          <Text style={{ marginTop: 10, color: '#999' }}>No shops matching "{searchQuery}"</Text>
        </View>
      )}
    </ScrollView>
  </SafeAreaView>
);


const BookingsScreen = ({ bookings, setScreen }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90, gap: 12 }}>
      <View style={styles.cardRow}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={[styles.metaText, { color: PRIMARY }]}>Book new</Text>
        </TouchableOpacity>
      </View>
      {bookings.length === 0 && (
        <View style={[styles.card, SHADOW, { alignItems: 'center', padding: 20 }]}>
          <Text style={styles.metaText}>No bookings yet. Start exploring salons!</Text>
        </View>
      )}
      {bookings.map((bk) => (
        <View key={bk.id} style={[styles.card, SHADOW, { padding: 14, gap: 6 }]}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>{bk.salon.name}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{bk.status}</Text>
            </View>
          </View>
          <Text style={styles.metaText}>{bk.services.map((s) => s.name).join(', ')}</Text>
          <Text style={styles.metaText}>Date: {bk.date?.label} | Slot: {bk.slot}</Text>
          <View style={styles.cardRow}>
            <Text style={styles.totalText}>₹ {bk.total}</Text>
            <TouchableOpacity onPress={() => setScreen('review')} style={styles.linkBtn}>
              <Text style={[styles.metaText, { color: PRIMARY }]}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const FavoritesScreen = ({ favorites, salons, handleSelectSalon }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90, gap: 12 }}>
      <Text style={styles.sectionTitle}>Favorites</Text>
      {favorites.length === 0 && <Text style={styles.metaText}>No saved salons yet.</Text>}
      {salons
        .filter((s) => favorites.includes(s.id))
        .map((salon) => (
          <SalonCard key={salon.id} salon={salon} handleSelectSalon={handleSelectSalon} />
        ))}
    </ScrollView>
  </SafeAreaView>
);

const ProfileScreen = ({ userProfile, bookings, favorites, setScreen, setTab, setAuthState, setShowLocationPicker, currentCity, currentArea }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View>
            <Text style={styles.profileName}>{userProfile.name || 'Add your name'}</Text>
            <Text style={[styles.profileEmail, !userProfile.email && { color: '#AAA', fontStyle: 'italic' }]}>
              {userProfile.email || 'Email not set'}
            </Text>
            <TouchableOpacity onPress={() => setScreen('editProfile')} style={{ marginTop: 6 }}>
              <Text style={{ color: PRIMARY, fontWeight: '700', fontSize: 13 }}>Complete Profile →</Text>
            </TouchableOpacity>
          </View>

          <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatar} />
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statBox} onPress={() => setTab('bookings')}>
            <Text style={styles.statCount}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EEE' }]} onPress={() => setTab('favorites')}>
            <Text style={styles.statCount}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => setScreen('review')}>
            <Text style={styles.statCount}>12</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileMenuSection}>
        <Text style={styles.menuSectionTitle}>YOUR ACTIVITY</Text>
        {[
          { icon: 'calendar-outline', label: 'My Bookings', action: () => setTab('bookings'), count: bookings.length > 0 ? bookings.length : null },
          { icon: 'heart-outline', label: 'Favorite Salons', action: () => setTab('favorites') },
          { icon: 'star-outline', label: 'My Reviews', action: () => setScreen('review') },
          { icon: 'gift-outline', label: 'My Offers', action: () => setScreen('offers') },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.action}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={20} color="#444" />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.count && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#AAA" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.profileMenuSection}>
        <Text style={styles.menuSectionTitle}>SETTINGS</Text>
        {[
          { icon: 'location-outline', label: 'Address Book', action: () => setScreen('addressBook') },
          { icon: 'notifications-outline', label: 'Notification Settings', action: () => setScreen('notifications') },
          { icon: 'language-outline', label: 'Choose Language', action: () => setScreen('language') },
          { icon: 'shield-checkmark-outline', label: 'Privacy & Permissions', action: () => setScreen('privacy') },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.action}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={20} color="#444" />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#AAA" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setAuthState('login')}>
        <Ionicons name="log-out-outline" size={20} color={PRIMARY} />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const EditProfileScreen = ({ userProfile, setUserProfile, setScreen, pickImage }) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phoneNum, setPhoneNum] = useState(userProfile.phone);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setScreen('profile')}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => {
          setUserProfile({ ...userProfile, name, email, phone: phoneNum });
          setScreen('profile');
        }}>
          <Text style={{ color: PRIMARY, fontWeight: '800' }}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={{ uri: userProfile.avatar }} style={[styles.profileAvatar, { width: 100, height: 100, borderRadius: 50 }]} />
          <TouchableOpacity style={{ marginTop: 10 }} onPress={pickImage}>
            <Text style={{ color: PRIMARY, fontWeight: '700' }}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputBox}>
          <TextInput value={name} onChangeText={setName} placeholder="Full Name" style={styles.flexInput} />
        </View>
        <View style={styles.inputBox}>
          <TextInput value={email} onChangeText={setEmail} placeholder="Email Address" style={styles.flexInput} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AddressBookScreen = ({ setScreen }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => setScreen('profile')}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Address Book</Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={[styles.card, SHADOW, { padding: 16, gap: 8 }]}>
        <View style={styles.cardRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="home" size={18} color={PRIMARY} />
            <Text style={styles.cardTitle}>Home</Text>
          </View>
        </View>
        <Text style={styles.metaText}>123, Luxury Heights, Indiranagar, Bangalore - 560038</Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const NotificationSettingsScreen = ({ setScreen }) => {
  const [notifs, setNotifs] = useState({ promo: true, updates: true });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setScreen('profile')}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Notifications</Text>
      </View>
    </SafeAreaView>
  );
};

const LanguageSelectionScreen = ({ setScreen }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => setScreen('profile')}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Language</Text>
    </View>
  </SafeAreaView>
);

const PrivacyPermissionsScreen = ({ setScreen }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => setScreen('profile')}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Privacy</Text>
    </View>
  </SafeAreaView>
);

const OffersScreen = ({ setScreen, setTab, banners }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => { setScreen('home'); setTab('home'); }}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Exciting Offers</Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {banners.map(offer => (
        <View key={offer.id} style={[styles.offerDetailedCard, { backgroundColor: offer.color }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.offerTag}>LIMITED TIME</Text>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const SalonDetail = ({ selectedSalon, setScreen, markFavorite, favorites, toggleService, selectedServices, workers, selectedWorker, setSelectedWorker, slots, selectedSlot, setSelectedSlot, selectedDate, setSelectedDate, salonTotal }) => {
  const next10Days = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        id: d.toISOString(),
        label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d
      });
    }
    return dates;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {selectedSalon && (
          <View>
            <ImageBackground source={{ uri: selectedSalon.img }} style={styles.hero}>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setScreen('home')}>
                  <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleBtn} onPress={() => markFavorite(selectedSalon.id)}>
                  <Ionicons name={favorites.includes(selectedSalon.id) ? "heart" : "heart-outline"} size={20} color={PRIMARY} />
                </TouchableOpacity>
              </View>
            </ImageBackground>

            <View style={{ padding: 16 }}>
              <View style={styles.cardRow}>
                <Text style={styles.heroTitle}>{selectedSalon.name}</Text>
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={14} color="#fff" />
                  <Text style={styles.ratingText}>{selectedSalon.rating}</Text>
                </View>
              </View>
              <Text style={styles.metaText}>{selectedSalon.address}</Text>

              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Salon Features & Services</Text>
                <View style={{ gap: 10, marginTop: 12 }}>
                  {selectedSalon.services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[styles.serviceCard, SHADOW, selectedServices.find(s => s.id === service.id) && { borderColor: PRIMARY, borderWidth: 1 }]}
                      onPress={() => toggleService(service)}
                    >
                      <View>
                        <Text style={styles.serviceTitle}>{service.name}</Text>
                        <Text style={styles.metaText}>{service.duration} mins • ₹{service.price}</Text>
                      </View>
                      <Ionicons
                        name={selectedServices.find(s => s.id === service.id) ? "checkbox" : "add-circle-outline"}
                        size={24}
                        color={selectedServices.find(s => s.id === service.id) ? PRIMARY : "#999"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Select Stylist</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
                  {workers.map((worker) => (
                    <TouchableOpacity
                      key={worker.id}
                      style={[styles.workerCard, SHADOW, selectedWorker?.id === worker.id && { borderColor: PRIMARY, borderWidth: 1 }]}
                      onPress={() => setSelectedWorker(worker)}
                    >
                      <Image source={{ uri: worker.photo }} style={styles.workerImg} />
                      <Text style={styles.workerName}>{worker.name}</Text>
                      <Text style={[styles.metaText, { fontSize: 11 }]}>{worker.experience} yrs exp • {worker.rating}⭐</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
                  {next10Days.map((date) => (
                    <TouchableOpacity
                      key={date.id}
                      style={[styles.dateCard, SHADOW, selectedDate?.id === date.id && { borderColor: PRIMARY, borderWidth: 1 }]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dateDay, selectedDate?.id === date.id && { color: PRIMARY }]}>{date.day}</Text>
                      <Text style={[styles.dateLabel, selectedDate?.id === date.id && { color: PRIMARY }]}>{date.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>Available Slots</Text>
                <View style={[styles.grid, { marginTop: 12 }]}>
                  {slots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      disabled={!selectedDate}
                      style={[styles.slot, selectedSlot === slot && { backgroundColor: PRIMARY }, !selectedDate && { opacity: 0.5 }]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[styles.slotText, selectedSlot === slot && { color: '#FFF' }]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {selectedServices.length > 0 && selectedSlot && selectedDate && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.metaText}>{selectedServices.length} Services selected</Text>
            <Text style={styles.totalText}>₹ {salonTotal}</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('summary')}>
            <Text style={styles.primaryBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};


const BookingSummary = ({ selectedSalon, salonTotal, confirmBooking }) => (
  <SafeAreaView style={styles.container}>
    <View style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={confirmBooking}>
        <Text style={styles.primaryBtnText}>Confirm ₹{salonTotal}</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ReviewScreen = ({ rating, setRating, reviewText, setReviewText, submitReview }) => (
  <SafeAreaView style={styles.container}>
    <View style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Review</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={submitReview}>
        <Text style={styles.primaryBtnText}>Submit</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  locationWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 15, fontWeight: '700', color: '#111' },
  searchBar: { marginHorizontal: 16, marginTop: 6, backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, ...SHADOW },
  searchInput: { flex: 1, fontSize: 14 },
  bannerCard: { width: 240, borderRadius: 16, padding: 16 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: PRIMARY },
  bannerSubtitle: { fontSize: 13, color: '#444', marginTop: 4 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', gap: 6, alignItems: 'center', ...SHADOW },
  categoryText: { fontSize: 13, fontWeight: '700', color: '#222' },
  card: { backgroundColor: CARD, borderRadius: 16 },
  cardImage: { height: 160, width: '100%' },
  cardContent: { padding: 12, gap: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#267E3E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  metaText: { color: '#666', fontSize: 13 },
  primaryBtn: { backgroundColor: PRIMARY, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  hero: { height: 220, width: '100%', backgroundColor: '#ddd', justifyContent: 'space-between' },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  circleBtn: { backgroundColor: '#fff', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', ...SHADOW },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  openText: { color: '#333', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
  serviceCard: { backgroundColor: CARD, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  chipBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F1F2F6' },
  workerCard: { width: 140, backgroundColor: CARD, borderRadius: 14, padding: 12, alignItems: 'center' },
  workerImg: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  workerName: { fontWeight: '700', color: '#111', marginBottom: 4 },
  selectText: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 10, ...SHADOW },
  slotText: { fontWeight: '700' },
  bottomBar: { position: 'absolute', bottom: 90, left: 0, right: 0, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: CARD, borderTopLeftRadius: 18, borderTopRightRadius: 18, ...SHADOW },
  totalText: { fontSize: 18, fontWeight: '800', color: '#111' },
  statusPill: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { color: '#1976D2', fontWeight: '700', fontSize: 12 },
  linkBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  avatar: { width: 86, height: 86, borderRadius: 20 },
  tabBar: { position: 'absolute', bottom: 10, left: 14, right: 14, backgroundColor: CARD, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, ...SHADOW },
  tabItem: { alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 11, color: '#777', fontWeight: '700' },
  closedBadge: { position: 'absolute', right: 10, top: 10, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  closedText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  starRow: { flexDirection: 'row', gap: 8 },
  textArea: { backgroundColor: CARD, borderRadius: 12, padding: 12, minHeight: 110, textAlignVertical: 'top', ...SHADOW },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#FFF4F6', borderRadius: 12 },
  logoCircle: { width: 86, height: 86, borderRadius: 26, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', ...SHADOW },

  /* Auth/LoginSpecific Styles */
  authHeader: { height: 280, width: '100%', position: 'relative' },
  authBanner: { width: '100%', height: '100%' },
  brandOverlay: { position: 'absolute', bottom: 30, left: 20 },
  brandName: { fontSize: 32, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  brandTagline: { fontSize: 16, color: '#FFF', fontWeight: '600', marginTop: 4 },
  authForm: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#FFF', marginTop: -20, padding: 24, flex: 1 },
  authTitle: { fontSize: 24, fontWeight: '800', color: '#1C1C1C', textAlign: 'center', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  countryCode: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRightWidth: 1, borderRightColor: '#E8E8E8', paddingRight: 10, height: 48 },
  countryText: { fontSize: 16, fontWeight: '600', color: '#1C1C1C' },
  authInput: { flex: 1, height: 48, paddingLeft: 12, fontSize: 16, fontWeight: '500' },
  continueBtn: { backgroundColor: PRIMARY, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  continueBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  separatorText: { marginHorizontal: 16, color: '#9C9C9C', fontWeight: '600', fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, height: 48 },
  socialIcon: { width: 20, height: 20 },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: '#1C1C1C' },
  termsText: { textAlign: 'center', color: '#9C9C9C', fontSize: 12, lineHeight: 18, marginTop: 40 },
  linkText: { color: '#4F4F4F', fontWeight: '600', textDecorationLine: 'underline' },
  otpSentText: { textAlign: 'center', fontSize: 16, color: '#666' },
  otpPhoneText: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#111', marginVertical: 8 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 },
  otpBox: { width: 45, height: 54, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  otpInput: { fontSize: 22, fontWeight: '700', color: '#111', width: '100%', textAlign: 'center' },
  resendText: { color: '#666', fontSize: 14 },

  /* Profile & Location Modal Styles */
  profileHeader: { backgroundColor: '#FFF', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  profileInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: '900', color: '#1C1C1C' },
  profileEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  profileAvatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#EEE' },
  statsRow: { flexDirection: 'row', marginTop: 24, paddingVertical: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statCount: { fontSize: 18, fontWeight: '800', color: '#1C1C1C' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  profileMenuSection: { padding: 20, paddingTop: 10 },
  menuSectionTitle: { fontSize: 12, fontWeight: '800', color: '#888', letterSpacing: 1.2, marginBottom: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center' },
  menuItemLabel: { fontSize: 15, fontWeight: '600', color: '#1C1C1C' },
  menuBadge: { backgroundColor: PRIMARY, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  menuBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  logoutBtn: { margin: 20, padding: 16, borderRadius: 12, backgroundColor: '#FFF5F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  logoutBtnText: { color: PRIMARY, fontWeight: '700', fontSize: 16 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  locationModal: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1C' },
  cityTabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  cityTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  activeCityTab: { backgroundColor: '#FEECEC' },
  cityTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeCityTabText: { color: PRIMARY },
  areaItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  areaItemText: { fontSize: 16, color: '#1C1C1C', fontWeight: '500' },
  offerDetailedCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  offerTag: { fontSize: 10, fontWeight: '900', color: PRIMARY, letterSpacing: 1, marginBottom: 4 },
  offerTitle: { fontSize: 22, fontWeight: '900', color: '#1C1C1C' },
  offerSubtitle: { fontSize: 14, color: '#444', marginTop: 2, marginBottom: 12 },
  inputBox: { borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 10 },
  flexInput: { fontSize: 16, color: '#111' },
  currentLocationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: '#FFF5F5', marginBottom: 20, borderWidth: 1, borderColor: '#FEECEC' },
  currentLocationText: { color: PRIMARY, fontWeight: '700', fontSize: 16 },

  dateCard: { width: 70, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  dateLabel: { fontSize: 16, fontWeight: '800', color: '#111', marginTop: 2 },

  villageBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 16, marginTop: 10, padding: 14, backgroundColor: '#EAF4FF', borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#1E6FA8' },
  villageBannerTitle: { fontSize: 13, fontWeight: '800', color: '#1E6FA8' },
  villageBannerText: { fontSize: 12, color: '#444', marginTop: 2, lineHeight: 17 },

  customLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, backgroundColor: '#FAFAFA' },
  customLocationInput: { flex: 1, fontSize: 14, color: '#111', paddingVertical: 6 },
  setLocationBtn: { backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  setLocationBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
const NotificationsListScreen = ({ setScreen, notifications }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => setScreen('home')}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={{ width: 24 }} />
    </View>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {notifications.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="notifications-off-outline" size={48} color="#EEE" />
          <Text style={{ marginTop: 10, color: '#999' }}>No notifications yet</Text>
        </View>
      ) : (
        notifications.map((n) => (
          <TouchableOpacity key={n.id} style={[styles.card, SHADOW, { padding: 16, borderLeftWidth: 4, borderLeftColor: n.type === 'booking' ? '#267E3E' : n.type === 'offer' ? PRIMARY : '#1976D2' }]}>
            <View style={styles.cardRow}>
              <Text style={[styles.cardTitle, { fontSize: 15 }]}>{n.title}</Text>
              <Text style={{ fontSize: 11, color: '#999' }}>{n.time}</Text>
            </View>
            <Text style={[styles.metaText, { marginTop: 4, lineHeight: 18 }]}>{n.message}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  </SafeAreaView>
);
