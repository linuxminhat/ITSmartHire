import React, { useEffect, useRef } from 'react';
import { ICompany } from '@/types/backend';

interface CompanyMapProps {
  company: ICompany;
}

const CompanyMap: React.FC<CompanyMapProps> = ({ company }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!company.latitude || !company.longitude) {
      return;
    }

    // Initialize map when component mounts
    const initMap = () => {
      if (mapRef.current && window.google) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: company.latitude!, lng: company.longitude! },
          zoom: 15,
        });

        // Add marker
        new window.google.maps.Marker({
          position: { lat: company.latitude!, lng: company.longitude! },
          map: map,
          title: company.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">${company.name}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">📍 ${company.address || 'Địa chỉ chưa cập nhật'}</p>
            </div>
          `
        });

        // Add marker click event
        new window.google.maps.Marker({
          position: { lat: company.latitude!, lng: company.longitude! },
          map: map,
          title: company.name,
        }).addListener('click', () => {
          infoWindow.open(map);
        });
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [company]);

  if (!company.latitude || !company.longitude) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Vị trí trên bản đồ</h3>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Thông tin vị trí chưa được cập nhật</p>
            <p className="text-sm text-gray-400">Latitude và Longitude không có sẵn</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Vị trí trên bản đồ</h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          📍 {company.address || 'Địa chỉ chưa cập nhật'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tọa độ: {company.latitude}, {company.longitude}
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default CompanyMap; 