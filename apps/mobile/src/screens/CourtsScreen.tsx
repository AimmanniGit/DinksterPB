import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MOCK_COURTS, MOCK_BENEFITS } from '../constants/mockData';
import {
  CourtVenue,
  BenefitSlot,
  CheckInRecord,
  createCheckInRecord,
  isCheckInActive,
  formatTimeRemaining,
  getTimeRemainingMs,
  createVerifiedCheckInPayload,
  CourtBoundary,
} from '@dinkster/shared';

interface CourtsScreenProps {
  onStartLobby?: () => void;
}

export const CourtsScreen: React.FC<CourtsScreenProps> = ({ onStartLobby }) => {
  const [seg, setSeg] = useState<'find' | 'ben'>('find');
  const [courtFilter, setCourtFilter] = useState<'all' | 'free' | 'indoor' | 'outdoor' | 'now'>('all');
  const [benefitFilter, setBenefitFilter] = useState<'all' | 'wellhub' | 'classpass' | 'insurance'>('all');
  const [activeCheckIns, setActiveCheckIns] = useState<Record<number, CheckInRecord>>({});
  const [lastCheckInNotice, setLastCheckInNotice] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodically refresh active check-in countdown & purge expired check-ins (Risk 4: Firestore TTL Fix)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setActiveCheckIns((prev) => {
        const next: Record<number, CheckInRecord> = {};
        let changed = false;
        for (const [idStr, record] of Object.entries(prev)) {
          if (isCheckInActive(record, now)) {
            next[Number(idStr)] = record;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Booking Modal State
  const [selectedCourt, setSelectedCourt] = useState<CourtVenue | null>(null);
  const [bookingDay, setBookingDay] = useState<'Today' | 'Tomorrow' | 'Saturday'>('Today');
  const [bookingSlot, setBookingSlot] = useState<string>('6:00 PM');
  const [bookingDuration, setBookingDuration] = useState<number>(1.5);
  const [bookingPayment, setBookingPayment] = useState<'apple' | 'card' | 'link'>('apple');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Selected Benefit Slot State
  const [selectedBenefitKey, setSelectedBenefitKey] = useState<string | null>(null);

  const filteredCourts = MOCK_COURTS.filter((c) => {
    if (courtFilter === 'free') return c.type === 'free';
    if (courtFilter === 'indoor') return c.isIndoor;
    if (courtFilter === 'outdoor') return !c.isIndoor;
    if (courtFilter === 'now') return c.availabilityText.includes('now');
    return true;
  });

  const filteredBenefits = MOCK_BENEFITS.filter((b) => {
    if (benefitFilter === 'all') return true;
    return b.key === benefitFilter;
  });

  // Client-Side Geofence Claim Flow (Risk 5: Zero GPS Leakage + Risk 4: Explicit expiresAt)
  const handleClaimCourt = (court: CourtVenue) => {
    const existing = activeCheckIns[court.id];
    if (existing && isCheckInActive(existing, currentTime)) {
      // User checks out
      setActiveCheckIns((prev) => {
        const copy = { ...prev };
        delete copy[court.id];
        return copy;
      });
      setLastCheckInNotice(`Checked out from ${court.name}. Court released.`);
      return;
    }

    // Client-side device geofence validation (CPU-only, NO GPS transmitted to server)
    const courtBoundary: CourtBoundary = {
      courtId: court.id,
      name: court.name,
      latitude: 37.7749,
      longitude: -122.4194,
      radiusMeters: 250,
    };
    // Mock user device location within 65m
    const deviceLocation = {
      latitude: 37.7752,
      longitude: -122.4191,
      accuracy: 5,
    };

    const verification = createVerifiedCheckInPayload(deviceLocation, courtBoundary, 'DK-49281', 120);
    if (!verification.success) {
      setLastCheckInNotice(verification.error || 'Geofence verification failed');
      return;
    }

    const checkIn = createCheckInRecord(court.id, 'user_current', 'DK-49281', court.name, 120);
    setActiveCheckIns((prev) => ({ ...prev, [court.id]: checkIn }));
    setLastCheckInNotice(`Verified on-device: Checked in to ${court.name} (2h limit, 0 GPS transmitted)`);
  };

  const calculateTotal = () => {
    if (!selectedCourt) return { subtotal: 0, fee: 0, total: 0 };
    const rate = selectedCourt.ratePerHour || 20;
    const subtotal = rate * bookingDuration;
    const fee = subtotal * 0.10;
    return {
      subtotal,
      fee,
      total: subtotal + fee,
    };
  };

  const handleConfirmPay = () => {
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedBookingId(bookingId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Courts & Perks</Text>
        <Text style={styles.pageSubtitle}>Find free public courts, book venues, or tap into benefits</Text>
      </View>

      {/* Segment: Find Courts vs Benefits */}
      <View style={styles.segControl}>
        <TouchableOpacity
          style={[styles.segBtn, seg === 'find' && styles.segBtnActive]}
          onPress={() => setSeg('find')}
        >
          <Text style={[styles.segText, seg === 'find' && styles.segTextActive]}>Find Courts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segBtn, seg === 'ben' && styles.segBtnActive]}
          onPress={() => setSeg('ben')}
        >
          <Text style={[styles.segText, seg === 'ben' && styles.segTextActive]}>
            Benefits ($0 Play)
          </Text>
        </TouchableOpacity>
      </View>

      {seg === 'find' ? (
        <>
          {/* Filters Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {[
              { key: 'all', label: 'All Courts' },
              { key: 'free', label: 'Free Public' },
              { key: 'indoor', label: 'Indoor AC' },
              { key: 'outdoor', label: 'Outdoor' },
              { key: 'now', label: 'Available Now' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, courtFilter === f.key && styles.chipActive]}
                onPress={() => setCourtFilter(f.key as any)}
              >
                <Text style={[styles.chipText, courtFilter === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Geofence Privacy & TTL Notice Banner */}
          {lastCheckInNotice && (
            <View style={styles.privacyBanner}>
              <Text style={styles.privacyBannerText}>{lastCheckInNotice}</Text>
            </View>
          )}

          {/* Courts Cards List */}
          <View style={styles.courtsList}>
            {filteredCourts.map((court) => {
              const checkIn = activeCheckIns[court.id];
              const isClaimed = !!checkIn && isCheckInActive(checkIn, currentTime);
              const timeRemainingText = isClaimed
                ? formatTimeRemaining(getTimeRemainingMs(checkIn, currentTime))
                : null;

              return (
                <View key={court.id} style={styles.courtCard}>
                  <View style={styles.courtCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.courtName}>{court.name}</Text>
                        {court.rating && (
                          <Text style={styles.ratingText}>★ {court.rating}</Text>
                        )}
                      </View>
                      <Text style={styles.courtInfo}>
                        {court.distance} &bull; {court.courtCount} courts &bull; {court.info}
                      </Text>
                      <Text style={styles.courtAvailability}>
                        {court.isIndoor ? 'Indoor' : 'Outdoor'} &bull; {court.availabilityText}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priceTag,
                        court.type === 'free' ? styles.priceTagFree : styles.priceTagPaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priceTagText,
                          court.type === 'free' ? styles.priceTagTextFree : styles.priceTagTextPaid,
                        ]}
                      >
                        {court.type === 'free' ? 'Free' : `$${court.ratePerHour}-$${court.peakRatePerHour}/hr`}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  {court.type === 'free' ? (
                    <View>
                      <TouchableOpacity
                        style={[styles.claimBtn, isClaimed && styles.claimBtnActive]}
                        onPress={() => handleClaimCourt(court)}
                      >
                        <Text style={[styles.claimBtnText, isClaimed && styles.claimBtnTextActive]}>
                          {isClaimed
                            ? `✓ Court Claimed (${timeRemainingText})`
                            : 'Claim Court (2-Hour Check-In)'}
                        </Text>
                      </TouchableOpacity>
                      {isClaimed && (
                        <Text style={styles.privacyCourtFootnote}>
                          🔒 Geofence verified locally &bull; 0 GPS coordinates stored &bull; Auto-expires in 2h
                        </Text>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => {
                        setSelectedCourt(court);
                        setConfirmedBookingId(null);
                      }}
                    >
                      <Text style={styles.bookBtnText}>Book Time Slot</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </>
      ) : (
        /* Benefits Mode */
        <>
          {/* Benefits Highlight Box */}
          <View style={styles.wellhubHighlightCard}>
            <Text style={styles.wellhubHighlightTag}>Employer Benefit Linked</Text>
            <Text style={styles.wellhubHighlightTitle}>$0 Sessions Today via WellHub</Text>
            <Text style={styles.wellhubHighlightSub}>
              You have 8 WellHub check-ins remaining this month. Pickleland and Pickleball Kingdom both have open sessions today.
            </Text>
          </View>

          {/* Benefits Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {[
              { key: 'all', label: 'All Benefits' },
              { key: 'wellhub', label: 'WellHub (8 left)' },
              { key: 'classpass', label: 'ClassPass (14 cr)' },
              { key: 'insurance', label: 'Aetna Fitness' },
            ].map((b) => (
              <TouchableOpacity
                key={b.key}
                style={[styles.chip, benefitFilter === b.key && styles.chipActive]}
                onPress={() => setBenefitFilter(b.key as any)}
              >
                <Text style={[styles.chipText, benefitFilter === b.key && styles.chipTextActive]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Benefits Sessions List */}
          <View style={styles.benefitsList}>
            {filteredBenefits.map((item, idx) => (
              <View key={idx} style={styles.benefitCard}>
                <View style={styles.benefitCardHeader}>
                  <View>
                    <Text style={styles.benefitVenue}>{item.venueName}</Text>
                    <Text style={styles.benefitLocation}>{item.location}</Text>
                  </View>
                  <View style={styles.benefitPill}>
                    <Text style={styles.benefitPillText}>{item.label}</Text>
                  </View>
                </View>

                {/* Slots Grid */}
                <View style={styles.slotsGrid}>
                  {item.slots.map(([time, desc], sIdx) => {
                    const isFull = desc === 'full';
                    const slotId = `${idx}-${sIdx}`;
                    const isSelected = selectedBenefitKey === slotId;

                    return (
                      <TouchableOpacity
                        key={sIdx}
                        disabled={isFull}
                        style={[
                          styles.slotButton,
                          isFull && styles.slotButtonFull,
                          isSelected && styles.slotButtonSelected,
                        ]}
                        onPress={() => setSelectedBenefitKey(isSelected ? null : slotId)}
                      >
                        <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                          {time}
                        </Text>
                        <Text style={[styles.slotDesc, isSelected && styles.slotDescSelected]}>
                          {desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected CTA */}
                {selectedBenefitKey && selectedBenefitKey.startsWith(`${idx}-`) && (
                  <TouchableOpacity style={styles.benefitCtaBtn}>
                    <Text style={styles.benefitCtaText}>{item.ctaText} →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Notes on Benefits Card */}
          <View style={styles.benefitsPolicyCard}>
            <Text style={styles.policyTitle}>Important Notes on Benefits</Text>
            <Text style={styles.policyText}>
              • WellHub: Check-in on the WellHub app upon arrival at the venue counter.{'\n'}
              • ClassPass: Credits deducted instantly; 12-hour cancellation policy.{'\n'}
              • Aetna: Save digital receipt for reimbursement under code FIT-109.
            </Text>
          </View>
        </>
      )}

      {/* Booking Sheet Modal */}
      {selectedCourt && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bookingSheet}>
              {!confirmedBookingId ? (
                <>
                  <View style={styles.sheetHeader}>
                    <View>
                      <Text style={styles.sheetTitle}>Book Court</Text>
                      <Text style={styles.sheetSubtitle}>{selectedCourt.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedCourt(null)}>
                      <Text style={styles.sheetClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Day Picker */}
                  <Text style={styles.fieldLabel}>Select Day</Text>
                  <View style={styles.segControl}>
                    {(['Today', 'Tomorrow', 'Saturday'] as const).map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.segBtn, bookingDay === day && styles.segBtnActive]}
                        onPress={() => setBookingDay(day)}
                      >
                        <Text style={[styles.segText, bookingDay === day && styles.segTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Time Slots */}
                  <Text style={styles.fieldLabel}>Select Time</Text>
                  <View style={styles.slotPickerRow}>
                    {['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'].map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.slotChip, bookingSlot === slot && styles.slotChipActive]}
                        onPress={() => setBookingSlot(slot)}
                      >
                        <Text style={[styles.slotChipText, bookingSlot === slot && styles.slotChipTextActive]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Duration Picker */}
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <View style={styles.segControl}>
                    {[1, 1.5, 2].map((dur) => (
                      <TouchableOpacity
                        key={dur}
                        style={[styles.segBtn, bookingDuration === dur && styles.segBtnActive]}
                        onPress={() => setBookingDuration(dur)}
                      >
                        <Text style={[styles.segText, bookingDuration === dur && styles.segTextActive]}>
                          {dur} hr{dur > 1 ? 's' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Price Breakdown */}
                  <View style={styles.priceBreakdownCard}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Court Rate (${selectedCourt.ratePerHour}/hr)</Text>
                      <Text style={styles.priceValue}>${calculateTotal().subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Platform Fee (10%)</Text>
                      <Text style={styles.priceValue}>${calculateTotal().fee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${calculateTotal().total.toFixed(2)}</Text>
                    </View>
                  </View>

                  {/* Confirm Action */}
                  <TouchableOpacity style={styles.confirmPayBtn} onPress={handleConfirmPay}>
                    <Text style={styles.confirmPayText}>
                      Pay ${calculateTotal().total.toFixed(2)} with Apple Pay
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* Confirmed Booking View */
                <View style={styles.confirmedView}>
                  <Text style={styles.confirmedIcon}>✓</Text>
                  <Text style={styles.confirmedTitle}>Court Confirmed!</Text>
                  <Text style={styles.confirmedSub}>
                    {selectedCourt.name} &bull; {bookingDay} at {bookingSlot}
                  </Text>
                  <Text style={styles.bookingIdText}>{confirmedBookingId}</Text>
                  <Text style={styles.confirmedNotice}>
                    Calendar invite sent. Share this booking with your crew to start a lobby.
                  </Text>

                  <TouchableOpacity
                    style={styles.confirmPayBtn}
                    onPress={() => {
                      setSelectedCourt(null);
                      if (onStartLobby) onStartLobby();
                    }}
                  >
                    <Text style={styles.confirmPayText}>Start Lobby with this Court</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setSelectedCourt(null)}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A5C43',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  segControl: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 3,
    marginBottom: 14,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segBtnActive: {
    backgroundColor: '#0A5C43',
  },
  segText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  segTextActive: {
    color: '#FFF',
  },
  filterBar: {
    marginBottom: 14,
    maxHeight: 38,
  },
  chip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0A5C43',
    borderColor: '#0A5C43',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  chipTextActive: {
    color: '#FFF',
  },
  courtsList: {
    gap: 12,
  },
  courtCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  courtCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF9F27',
  },
  courtInfo: {
    fontSize: 12.5,
    color: '#666',
    marginTop: 2,
  },
  courtAvailability: {
    fontSize: 12,
    color: '#0A5C43',
    fontWeight: '600',
    marginTop: 2,
  },
  priceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceTagFree: {
    backgroundColor: '#E8F7F1',
  },
  priceTagPaid: {
    backgroundColor: '#FEF3E2',
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceTagTextFree: {
    color: '#0A5C43',
  },
  priceTagTextPaid: {
    color: '#7A4A00',
  },
  claimBtn: {
    backgroundColor: '#E8F7F1',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimBtnActive: {
    backgroundColor: '#F2F1EC',
  },
  claimBtnText: {
    color: '#0A5C43',
    fontWeight: '700',
    fontSize: 13,
  },
  claimBtnTextActive: {
    color: '#666',
  },
  bookBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  wellhubHighlightCard: {
    backgroundColor: '#E8F7F1',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.25)',
    marginBottom: 14,
  },
  wellhubHighlightTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A5C43',
    textTransform: 'uppercase',
  },
  wellhubHighlightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A5C43',
    marginVertical: 4,
  },
  wellhubHighlightSub: {
    fontSize: 12.5,
    color: '#0A5C43',
    lineHeight: 17,
  },
  benefitsList: {
    gap: 12,
  },
  benefitCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  benefitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitVenue: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111',
  },
  benefitLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  benefitPill: {
    backgroundColor: '#E8F7F1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  benefitPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A5C43',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotButton: {
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 64,
  },
  slotButtonFull: {
    opacity: 0.35,
  },
  slotButtonSelected: {
    backgroundColor: '#0A5C43',
    borderColor: '#0A5C43',
  },
  slotTime: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111',
  },
  slotTimeSelected: {
    color: '#FFF',
  },
  slotDesc: {
    fontSize: 10,
    color: '#666',
  },
  slotDescSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  benefitCtaBtn: {
    backgroundColor: '#0A5C43',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  benefitCtaText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  benefitsPolicyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginTop: 14,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  policyText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bookingSheet: {
    backgroundColor: '#FAF8F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  sheetClose: {
    fontSize: 18,
    color: '#888',
    fontWeight: '700',
    padding: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
  },
  slotPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  slotChip: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  slotChipActive: {
    backgroundColor: '#0A5C43',
    borderColor: '#0A5C43',
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  slotChipTextActive: {
    color: '#FFF',
  },
  priceBreakdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 6,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A5C43',
  },
  confirmPayBtn: {
    backgroundColor: '#0A5C43',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmPayText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmedView: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmedIcon: {
    fontSize: 48,
    color: '#0A5C43',
    marginBottom: 8,
  },
  confirmedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  confirmedSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookingIdText: {
    fontFamily: 'Courier',
    fontSize: 24,
    fontWeight: '700',
    color: '#0A5C43',
    marginVertical: 12,
    letterSpacing: 2,
  },
  confirmedNotice: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    paddingVertical: 10,
    marginTop: 6,
  },
  doneBtnText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  privacyBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  privacyBannerText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
    lineHeight: 16,
  },
  privacyCourtFootnote: {
    fontSize: 10.5,
    color: '#0A5C43',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
