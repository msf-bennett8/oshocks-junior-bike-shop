import { useState, useCallback, useMemo } from 'react';

/**
 * useEventBooking — Centralized state management for event booking flow
 * Handles: participants, bike selection, resource selection, pricing calculation
 */
export const useEventBooking = (event) => {
  // Step 1: Participants
  const [participants, setParticipants] = useState(1);

  // Step 2: Bike
  const [bikeOption, setBikeOption] = useState('own'); // 'own', 'rent', 'included'
  const [selectedBike, setSelectedBike] = useState(null);
  const [showBikeModal, setShowBikeModal] = useState(false);

  // Step 2: Resources & Equipment (replaces old addOns)
  const [selectedResources, setSelectedResources] = useState([]); // Array of { resourceItem, quantity, price }
  const [showResourceSelector, setShowResourceSelector] = useState(false);

  // Step 3: Details
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });
  const [waiverAgreed, setWaiverAgreed] = useState(false);

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');

  // Loading states
  const [actionLoading, setActionLoading] = useState(false);

  // Event duration
  const eventDurationDays = useMemo(() => {
    if (!event) return 1;
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [event]);

  // ─── Bike Pricing ───
  const bikeRentalPrice = useMemo(() => {
    if (bikeOption !== 'rent' || !selectedBike) return 0;
    return (selectedBike.daily_rate || 0) * eventDurationDays * participants;
  }, [bikeOption, selectedBike, eventDurationDays, participants]);

  const bikeSecurityDeposit = useMemo(() => {
    if (bikeOption !== 'rent' || !selectedBike) return 0;
    return (selectedBike.security_deposit || 0) * participants;
  }, [bikeOption, selectedBike, participants]);

  // ─── Resources Pricing ───
  const resourcesTotalPrice = useMemo(() => {
    return selectedResources.reduce((sum, item) => {
      const unitPrice = item.resourceItem.current_price || item.resourceItem.base_price || 0;
      return sum + (unitPrice * item.quantity * eventDurationDays);
    }, 0);
  }, [selectedResources, eventDurationDays]);

  // ─── Event Add-ons (kept from original: transport, insurance, nutrition) ───
  const [eventAddOns, setEventAddOns] = useState({
    transport: false,
    insurance: false,
    nutrition: false,
  });

  const transportPrice = useMemo(() => {
    return eventAddOns.transport && event?.transport_provided ? (event.transport_price || 0) * participants : 0;
  }, [eventAddOns.transport, event, participants]);

  const eventInsurancePrice = useMemo(() => {
    return eventAddOns.insurance ? 200 * participants : 0;
  }, [eventAddOns.insurance, participants]);

  const nutritionPrice = useMemo(() => {
    return eventAddOns.nutrition ? 300 * participants : 0;
  }, [eventAddOns.nutrition, participants]);

  // ─── Base Price & Discounts ───
  const basePrice = useMemo(() => {
    return (event?.price_per_person || 0) * participants;
  }, [event, participants]);

  const groupDiscount = useMemo(() => {
    if (!event || participants < (event.group_discount_threshold || 999)) return 0;
    return Math.round(basePrice * ((event.group_discount_percent || 0) / 100));
  }, [event, participants, basePrice]);

  // ─── Grand Total ───
  const total = useMemo(() => {
    return basePrice + bikeRentalPrice + resourcesTotalPrice + transportPrice + eventInsurancePrice + nutritionPrice - groupDiscount;
  }, [basePrice, bikeRentalPrice, resourcesTotalPrice, transportPrice, eventInsurancePrice, nutritionPrice, groupDiscount]);

  // ─── Resource Management ───
  const addResource = useCallback((resourceItem, quantity = 1) => {
    setSelectedResources(prev => {
      const existing = prev.find(r => r.resourceItem.id === resourceItem.id);
      if (existing) {
        return prev.map(r => 
          r.resourceItem.id === resourceItem.id 
            ? { ...r, quantity }  // ← Replace, don't increment
            : r
        );
      }
      return [...prev, { resourceItem, quantity, price: resourceItem.current_price || resourceItem.base_price }];
    });
  }, []);

  const removeResource = useCallback((resourceId) => {
    setSelectedResources(prev => prev.filter(r => r.resourceItem.id !== resourceId));
  }, []);

  const updateResourceQuantity = useCallback((resourceId, quantity) => {
    if (quantity <= 0) {
      removeResource(resourceId);
      return;
    }
    setSelectedResources(prev => prev.map(r => 
      r.resourceItem.id === resourceId ? { ...r, quantity } : r
    ));
  }, [removeResource]);

  const toggleEventAddOn = useCallback((key) => {
    setEventAddOns(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetBikeSelection = useCallback(() => {
    setSelectedBike(null);
    setBikeOption('own');
    setSelectedResources([]);
  }, []);

  return {
    // Participants
    participants, setParticipants,
    
    // Bike
    bikeOption, setBikeOption,
    selectedBike, setSelectedBike,
    showBikeModal, setShowBikeModal,
    bikeRentalPrice, bikeSecurityDeposit,
    
    // Resources
    selectedResources, setSelectedResources,
    showResourceSelector, setShowResourceSelector,
    resourcesTotalPrice,
    addResource, removeResource, updateResourceQuantity,
    
    // Event Add-ons
    eventAddOns, setEventAddOns, toggleEventAddOn,
    transportPrice, eventInsurancePrice, nutritionPrice,
    
    // Details
    emergencyContact, setEmergencyContact,
    waiverAgreed, setWaiverAgreed,
    
    // Payment
    paymentMethod, setPaymentMethod,
    mpesaPhone, setMpesaPhone,
    actionLoading, setActionLoading,
    
    // Pricing
    basePrice, groupDiscount, total,
    eventDurationDays,
    
    // Helpers
    resetBikeSelection,
  };
};

export default useEventBooking;
