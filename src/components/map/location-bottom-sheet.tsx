'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/store/map';
import { apiFetch } from '@/lib/api-fetch';
import {
  getLocationDetail,
  normalizeLocationDetail,
  pickFeaturedEvent,
  reportNavigationClick,
} from '@/lib/api/locations';
import toast from 'react-hot-toast';
import { isAuthenticated, loginUrl } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { applyMarkersCameraTarget, getMarkersCameraTarget } from '@/lib/map-utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

function LocationLogo({
  name,
  logo,
  size = 'md',
}: {
  name: string;
  logo?: string;
  size?: 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'h-16 w-16 rounded-2xl' : 'h-14 w-14 rounded-xl';

  return (
    <div className='relative shrink-0'>
      <div className='absolute inset-0 rounded-2xl bg-primary/20 blur-lg scale-110' />
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-background ring-2 ring-background shadow-md',
          dim,
        )}
      >
        {logo ? (
          <OptimizedImage src={logo} alt={name} fill sizes='64px' />
        ) : (
          <span className='text-xl font-bold text-primary'>{name.charAt(0)}</span>
        )}
      </div>
    </div>
  );
}

export function LocationBottomSheet() {
  const router = useRouter();
  const markers = useMapStore((s) => s.markers);
  const selectedLocation = useMapStore((s) => s.selectedLocation);
  const sheetOpen = useMapStore((s) => s.sheetOpen);
  const setSheetOpen = useMapStore((s) => s.setSheetOpen);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);
  const setFlyToTarget = useMapStore((s) => s.setFlyToTarget);
  const setFitBoundsTarget = useMapStore((s) => s.setFitBoundsTarget);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  const closeSheet = useCallback(
    (options?: { zoomOut?: boolean }) => {
      setSheetOpen(false);
      selectLocation(null);
      setSelectedLocation(null);

      if (options?.zoomOut === false) return;

      applyMarkersCameraTarget(getMarkersCameraTarget(markers), setFlyToTarget, setFitBoundsTarget);
    },
    [
      markers,
      selectLocation,
      setFitBoundsTarget,
      setFlyToTarget,
      setSelectedLocation,
      setSheetOpen,
    ],
  );

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 100) {
      closeSheet();
    }
    setDragY(0);
  }, [dragY, closeSheet]);

  const handleClose = useCallback(() => {
    closeSheet();
  }, [closeSheet]);

  const handleNavigate = useCallback(() => {
    if (!selectedLocation) return;

    if (!isAuthenticated()) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(loginUrl(currentPath));
      return;
    }

    const { latitude, longitude, slug } = selectedLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
    reportNavigationClick(slug);
  }, [selectedLocation, router]);

  const [viewEventsLoading, setViewEventsLoading] = useState(false);

  const handleViewEvents = useCallback(async () => {
    if (!selectedLocation || viewEventsLoading) return;

    setViewEventsLoading(true);
    try {
      let detail;
      try {
        detail = await getLocationDetail(selectedLocation.slug);
      } catch {
        const res = await apiFetch(`/main/v2/location/${selectedLocation.slug}/`);
        if (!res.ok) throw new Error('location fetch failed');
        detail = normalizeLocationDetail(await res.json());
      }

      const featured = pickFeaturedEvent(detail.events);
      if (!featured) {
        toast.error('رویدادی برای این مکان ثبت نشده');
        return;
      }

      const eventPath = `/events/${featured.event_slug}`;
      closeSheet({ zoomOut: false });

      if (!isAuthenticated()) {
        router.push(loginUrl(eventPath));
        return;
      }

      reportNavigationClick(selectedLocation.slug);
      router.push(eventPath);
    } catch {
      toast.error('خطا در بارگذاری رویدادها');
    } finally {
      setViewEventsLoading(false);
    }
  }, [selectedLocation, router, closeSheet, viewEventsLoading]);

  return (
    <AnimatePresence>
      {sheetOpen && selectedLocation && (
        <motion.div
          className='fixed inset-0 z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className='absolute inset-0 bg-black/30 backdrop-blur-[2px]'
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: dragY }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            className='absolute bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2'
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className='overflow-hidden rounded-t-[28px] border border-border/70 bg-background/95 shadow-lg backdrop-blur-xl'>
              <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent' />

              <div
                className='flex cursor-grab touch-none flex-col items-center pt-3 pb-1 active:cursor-grabbing'
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
              >
                <div className='h-1 w-10 rounded-full bg-border/80' />
              </div>

              <div className='px-5 pb-5'>
                <div className='mb-4 flex items-start gap-3.5'>
                  <LocationLogo
                    name={selectedLocation.name}
                    logo={selectedLocation.logo}
                    size='lg'
                  />

                  <div className='min-w-0 flex-1 pt-0.5'>
                    <div className='flex items-start justify-between gap-2'>
                      <h2 className='text-lg font-bold leading-snug text-text-primary'>
                        {selectedLocation.name}
                      </h2>
                      <button
                        type='button'
                        onClick={handleClose}
                        aria-label='بستن'
                        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors hover:bg-border/60'
                      >
                        <Icon name='close' size='sm' />
                      </button>
                    </div>

                    {selectedLocation.address && (
                      <p className='mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-text-secondary'>
                        <Icon
                          name='mapPin'
                          size={13}
                          color='primary'
                          className='mt-0.5 shrink-0 opacity-70'
                        />
                        <span className='line-clamp-2'>{selectedLocation.address}</span>
                      </p>
                    )}

                    <div className='mt-2.5 flex flex-wrap items-center gap-1.5'>
                      {selectedLocation.category !== undefined && (
                        <span className='rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-[10px] font-medium text-text-secondary'>
                          دسته {selectedLocation.category}
                        </span>
                      )}
                      {selectedLocation.events_count !== undefined &&
                        selectedLocation.events_count > 0 && (
                          <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary'>
                            {selectedLocation.events_count} رویداد
                          </span>
                        )}
                      {selectedLocation.is_open && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium text-success'>
                          <span className='h-1.5 w-1.5 rounded-full bg-success animate-pulse' />
                          فعال
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedLocation.description && (
                  <p className='mb-4 line-clamp-2 rounded-xl bg-surface/80 px-3 py-2.5 text-xs leading-relaxed text-text-secondary'>
                    {selectedLocation.description}
                  </p>
                )}

                <div className='flex flex-col gap-2.5'>
                  <Button
                    fullWidth
                    size='lg'
                    onClick={handleViewEvents}
                    disabled={viewEventsLoading}
                  >
                    {viewEventsLoading ? 'در حال بارگذاری...' : 'مشاهده پروفایل گالری'}
                    <Icon name='chevronLeft' size='sm' className='mr-1.5 scale-x-[-1]' />
                  </Button>

                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      type='button'
                      onClick={handleNavigate}
                      className='flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5'
                    >
                      <Icon name='mapPin' size='sm' color='primary' />
                      مسیریابی
                    </button>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='flex h-11 items-center justify-center rounded-xl border border-border/70 bg-surface text-sm font-medium text-text-secondary transition-colors hover:bg-border/40'
                    >
                      بستن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
