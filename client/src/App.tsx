import React, { useState, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { MapView, MapViewRef } from './components/MapView';
import { ReportButton, ConfirmModal } from './components/ReportButton';
import { StatsPanel } from './components/StatsPanel';
import { OverviewPanel } from './components/OverviewPanel';
import { StatsDashboardModal } from './components/StatsDashboardModal';
import { MyReportsModal } from './components/MyReportsModal';
import { MapControls } from './components/MapControls';
import { ToastContainer } from './components/Toast';
import { useAuth, useLocation, useOutages, useNearby, useToast } from './hooks';
import { reportOutage } from './services/api';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { position, requestLocation } = useLocation();
  const { outages, clusters, stats, refresh } = useOutages();
  const nearbyCount = useNearby(position);
  const { toasts, showToast, removeToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const mapRef = React.useRef<MapViewRef>(null);
  const [notifiedPendings, setNotifiedPendings] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!user || authLoading) return;
    
    const pendingMyOutages = outages.filter(o => 
      o.user_id === user.uid && 
      o.status === 'pending_expiration' && 
      !notifiedPendings.has(o.id)
    );

    if (pendingMyOutages.length > 0) {
      pendingMyOutages.forEach(r => {
        showToast('Your report is about to expire! Open "My Reports" to keep it.', 'warning');
      });
      setNotifiedPendings(prev => {
        const next = new Set(prev);
        pendingMyOutages.forEach(r => next.add(r.id));
        return next;
      });
    }
  }, [outages, user, authLoading, notifiedPendings, showToast]);

  const handleReport = useCallback(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!position) {
      showToast('Unable to determine location. Enable location services.', 'error');
      return;
    }
    setShowModal(true);
  }, [user, position, showToast]);

  const handleConfirmReport = useCallback(async (reason: string | null, phoneNumber: string) => {
    setShowModal(false);
    if (!position) return;

    try {
      const result = await reportOutage(position.lat, position.lng, reason, phoneNumber);
      if (result.success) {
        showToast('Outage reported! Others will be alerted.', 'success');
        refresh();
      } else {
        showToast(result.error || 'Failed to report', 'warning');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  }, [position, showToast, refresh]);

  // Loading screen
  if (authLoading) {
    return (
      <div className="loading-screen">
        <Zap className="loading-logo" size={56} color="var(--color-electric)" />
        <span className="loading-text">PowerDown</span>
        <div className="loading-bar">
          <div className="loading-bar-inner" />
        </div>
      </div>
    );
  }

  // Main app
  return (
    <>
      {showAuthModal && (
        <AuthScreen
          onToast={showToast}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      <Header user={user} onToast={showToast} onOpenMyReports={() => setShowMyReports(true)} onSignIn={() => setShowAuthModal(true)} />

      <MapView
        ref={mapRef}
        position={position}
        clusters={clusters}
        outages={outages}
        heatmapVisible={heatmapVisible}
      />

      <MapControls
        heatmapVisible={heatmapVisible}
        onToggleHeatmap={() => setHeatmapVisible((v) => !v)}
        onRecenter={() => {
          requestLocation();
          showToast('Centered on your location', 'info');
        }}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onOpenStats={() => setShowStatsDashboard(true)}
        onOpenOverview={() => setShowOverview(true)}
      />

      {showOverview && (
        <OverviewPanel 
          stats={stats} 
          onClose={() => setShowOverview(false)} 
          onReportOutage={handleReport}
          onMyReports={() => setShowMyReports(true)}
        />
      )}

      {(!showOverview || window.innerWidth <= 768) && <ReportButton onClick={handleReport} />}

      {!showOverview && <StatsPanel stats={stats} nearbyCount={nearbyCount} />}

      <ConfirmModal
        visible={showModal}
        onConfirm={handleConfirmReport}
        onCancel={() => setShowModal(false)}
      />

      {showMyReports && (
        <MyReportsModal 
          onClose={() => setShowMyReports(false)} 
          onToast={showToast}
          onUpdate={refresh} 
        />
      )}

      {showStatsDashboard && (
        <StatsDashboardModal
          stats={stats}
          onClose={() => setShowStatsDashboard(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default App;
