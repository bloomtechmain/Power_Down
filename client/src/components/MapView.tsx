import React, { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { Position, OutageCluster, OutageReport } from '../types';
import { REASON_ICONS_INNER, getIconSvg } from './icons';

// Standard map styles removed for Austin Energy default look
const MAP_STYLES: google.maps.MapTypeStyle[] = [];

interface MapViewProps {
  position: Position | null;
  clusters: OutageCluster[];
  outages: OutageReport[];
  heatmapVisible: boolean;
}

declare global {
  interface Window {
    __initGoogleMaps?: () => void;
    google: typeof google;
  }
}

export interface MapViewRef {
  zoomIn: () => void;
  zoomOut: () => void;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(({ position, clusters, outages, heatmapVisible }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [missingApiKey, setMissingApiKey] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 14) + 1);
      }
    },
    zoomOut: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() || 14) - 1);
      }
    }
  }));

  const createMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center = position || { lat: 30.35, lng: -97.68 };
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: 'greedy',
      minZoom: 4,
      maxZoom: 18,
      backgroundColor: '#f7f7f7',
    });

    mapInstanceRef.current.addListener('zoom_changed', () => {
      setZoomLevel(mapInstanceRef.current?.getZoom() || 14);
    });
  }, [position]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (window.google?.maps) {
      createMap();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.startsWith('YOUR_')) {
      setMissingApiKey(true);
      return;
    }
    setMissingApiKey(false);

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=__initGoogleMaps`;
      script.async = true;
      script.defer = true;

      window.__initGoogleMaps = () => {
        window.dispatchEvent(new Event('google-maps-loaded'));
      };
      document.head.appendChild(script);
    }

    const initListener = () => {
      createMap();
    };

    window.addEventListener('google-maps-loaded', initListener);

    return () => {
      window.removeEventListener('google-maps-loaded', initListener);
    };
  }, [createMap]);

  // Update user marker
  useEffect(() => {
    if (!mapInstanceRef.current || !position) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(position);
    } else {
      userMarkerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#008080',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          strokeOpacity: 0.9,
        },
        zIndex: 999,
        title: 'Your Location',
      });
    }
    mapInstanceRef.current.panTo(position);
  }, [position]);

  // Update outage markers and circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Calculate dynamic scaling for zoom
    const scaleFactor = Math.pow(1.5, zoomLevel - 14);
    const size = Math.max(24, 48 * scaleFactor);
    const centerOffset = size / 2;
    const fontSz = Math.max(10, 16 * scaleFactor);

    // Clear existing
    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    clusters.forEach((cluster) => {
      const pos = { lat: cluster.center_lat, lng: cluster.center_lng };
      const count = cluster.report_count;

      let circle: google.maps.Circle | null = null;
      if (heatmapVisible) {
        // Red zone circle
        circle = new google.maps.Circle({
          map,
          center: pos,
          radius: cluster.radius,
          fillColor: '#ef4444',
          fillOpacity: Math.min(0.1 + cluster.intensity * 0.05, 0.45),
          strokeColor: '#ef4444',
          strokeOpacity: Math.min(0.3 + cluster.intensity * 0.05, 0.7),
          strokeWeight: 2,
          clickable: true,
          zIndex: 10,
        });
        circlesRef.current.push(circle);
      }

      // Marker - Exact Austin Energy SVG Clone
      let svgIconStr = '';

      const totalSize = 48;
      const mainCx = 20;
      const mainCy = 26;
      const mainR = 14; 
      const strokeW = 6;

      const badgeCx = 33;
      const badgeCy = 13;
      const badgeR = 9.5;

      const workerPath = `<path d="M12 4a3.5 3.5 0 0 0-3.5 3.5v1h7v-1A3.5 3.5 0 0 0 12 4zM7 11h10v1H7zM8.5 13a1.5 1.5 0 0 0-1.5 1.5V19h10v-4.5a1.5 1.5 0 0 0-1.5-1.5h-7z" fill="#FFFFFF" />`;
      
      const workerIcon = `
        <g transform="translate(${badgeCx - 9.5}, ${badgeCy - 10.5}) scale(0.8)">
          ${workerPath}
        </g>
      `;

      svgIconStr = `
        <svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${mainCx}" cy="${mainCy}" r="${mainR - strokeW/2}" fill="#FFFFFF" stroke="#007DA5" stroke-width="${strokeW}" />
          <circle cx="${badgeCx}" cy="${badgeCy}" r="${badgeR}" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" />
          ${workerIcon}
        </svg>
      `;

      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIconStr),
          anchor: new google.maps.Point(mainCx, mainCy),
          scaledSize: new google.maps.Size(totalSize, totalSize)
        },
      });

      const latestDate = new Date(cluster.latest_report);
      const ago = getTimeAgo(latestDate);

      let reasonHtml = '';
      if (cluster.reasons && cluster.reasons.length > 0) {
        reasonHtml = `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;gap:4px;color:#334155;">`;
        cluster.reasons.forEach(r => {
          reasonHtml += `<span title="${r}" style="display:flex;align-items:center;justify-content:center;background:#000000;padding:4px;border-radius:4px;">${getIconSvg(r, 20)}</span>`;
        });
        reasonHtml += `</div>`;
      }

      marker.addListener('click', () => {
        infoWindowRef.current!.setContent(`
          <div style="background:#ffffff;color:#334155;padding:12px 16px;border-radius:8px;font-family:Inter,sans-serif;min-width:180px;box-shadow:0 1px 3px rgba(0,0,0,0.1); border:1px solid #e2e8f0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
              <strong style="font-size:14px;color:#9f1239;">Power Outage</strong>
            </div>
            <div style="font-size:12px;color:#64748b;line-height:1.6;">
              <div>Reports: ${count}</div>
              <div>Latest: ${ago}</div>
            </div>
            ${reasonHtml}
          </div>
        `);
        infoWindowRef.current!.open(map, marker);
      });

      if (circle) {
        circle.addListener('click', () => google.maps.event.trigger(marker, 'click'));
      }
      markersRef.current.push(marker);
    });
  }, [clusters, zoomLevel, heatmapVisible]);

  // Build/update heatmap data when outages change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!window.google?.maps?.visualization) return;
    if (outages.length === 0) return;

    const data = outages.map((r) => ({
      location: new google.maps.LatLng(r.latitude, r.longitude),
      weight: getReportWeight(r),
    }));

    if (heatmapRef.current) {
      heatmapRef.current.setData(data);
    } else {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data,
        map: null, // don't show yet — visibility effect controls this
        radius: 60,
        opacity: 0.7,
        gradient: [
          'rgba(0,0,0,0)',
          'rgba(255,100,100,0.3)',
          'rgba(255,80,80,0.5)',
          'rgba(239,68,68,0.6)',
          'rgba(220,38,38,0.7)',
          'rgba(185,28,28,0.85)',
          'rgba(153,27,27,1)',
        ],
      });
    }

    // Sync visibility after (re)building the layer
    heatmapRef.current.setMap(heatmapVisible ? map : null);
  }, [outages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle heatmap visibility independently of data
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!heatmapRef.current || !map) return;
    heatmapRef.current.setMap(heatmapVisible ? map : null);
  }, [heatmapVisible]);

  if (missingApiKey) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#64748b', padding: '20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '400px', background: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <MapIcon size={48} color="#94a3b8" />
          </div>
          <h2 style={{ color: '#334155', marginBottom: '12px' }}>Google Maps Not Configured</h2>
          <p style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Roboto, sans-serif' }}>
            The map requires a valid Google Maps JavaScript API key. Right now it is using the placeholder from your <code style={{ background: '#f7f7f7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}>.env</code> file.
          </p>
          <p style={{ fontSize: '14px', color: '#3a4186' }}>
            To fix this, edit <strong>client/.env</strong> and set VITE_GOOGLE_MAPS_API_KEY to your actual key, then restart the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getReportWeight(report: OutageReport): number {
  const ageMs = Date.now() - new Date(report.created_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  return Math.max(1, 5 - ageHours * 2);
}
