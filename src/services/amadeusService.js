import axios from 'axios';

/**
 * ✅ Amadeus API (TEST)
 * لا تضع /v2 في الـ base لأن عندك Endpoints على v1 و v2
 */
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

const endpoints = {
  token: '/v1/security/oauth2/token',
  flightOffers: '/v2/shopping/flight-offers',
  locations: '/v1/reference-data/locations',
  airlines: '/v1/reference-data/airlines',
  priceMetrics: '/v1/analytics/itinerary-price-metrics',
};

const http = axios.create({
  baseURL: AMADEUS_BASE_URL,
  timeout: 20000,
});

let accessToken = null;
let tokenExpiryMs = 0;

/** أدوات مساعدة */
const buildQuery = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

const formatDateForUrl = (isoOrDateTime) => {
  if (!isoOrDateTime) return '';
  // يحافظ على اليوم بدون مشاكل timezone
  if (typeof isoOrDateTime === 'string') return isoOrDateTime.slice(0, 10);
  return new Date(isoOrDateTime).toISOString().slice(0, 10);
};

const normalizeTravelClassForAmadeus = (cls) => {
  if (!cls) return undefined;
  const c = String(cls).toUpperCase();
  if (c === 'ECONOMY' || c === 'BUSINESS' || c === 'FIRST') return c;
  if (c === 'PREMIUM' || c === 'PREMIUM_ECONOMY') return 'PREMIUM_ECONOMY';
  return 'ECONOMY';
};

const convertDuration = (isoDuration) => {
  if (!isoDuration) return 'Unknown';
  const match = String(isoDuration).match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 'Unknown';

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
};

const getAirlineName = (code) => {
  const airlines = {
    SV: 'Saudia',
    XY: 'Flynas',
    F3: 'Flyadeal',
    EK: 'Emirates',
    QR: 'Qatar Airways',
    EY: 'Etihad Airways',
  };
  return airlines[code] || code;
};

const getAirlineLogo = (code) => {
  const logos = {
    SV: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Saudia_logo.svg/800px-Saudia_logo.svg.png',
    XY: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Flynas_logo.svg/800px-Flynas_logo.svg.png',
    F3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Flyadeal_logo.svg/800px-Flyadeal_logo.svg.png',
  };
  return logos[code] || 'https://cdn-icons-png.flaticon.com/512/825/825517.png';
};

/**
 * ✅ Token
 */
export const getAmadeusToken = async () => {
  if (accessToken && Date.now() < tokenExpiryMs) return accessToken;

  const clientId = process.env.REACT_APP_AMADEUS_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API keys missing (move secrets to backend).');
  }

  const res = await http.post(
    endpoints.token,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  accessToken = res.data.access_token;
  tokenExpiryMs = Date.now() + (res.data.expires_in * 1000) - 60_000;
  return accessToken;
};

/**
 * ✅ بحث الرحلات
 */
export const searchFlights = async (searchParams) => {
  try {
    const token = await getAmadeusToken();

    const params = {
      originLocationCode: searchParams.origin,
      destinationLocationCode: searchParams.destination,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate || undefined,
      adults: Number(searchParams.passengers || 1),
      currencyCode: 'SAR',
      max: 20,
      travelClass: normalizeTravelClassForAmadeus(searchParams.class),
    };

    const response = await http.get(endpoints.flightOffers, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.amadeus+json',
      },
      params,
    });

    return formatFlightData(response.data?.data || [], searchParams);
  } catch (error) {
    console.error('❌ Flight search error:', error.response?.data || error.message);
    return getFallbackData(searchParams);
  }
};

/**
 * ✅ أهم جزء: Book Now Links
 *
 * - flyadeal: عندك رابط شغال ونثبته.
 * - saudia: نثبت الـ locale على ar-sa لتفادي تحويلات ar-YE/404.
 * - flynas: لا يوجد deep link ثابت؛ نفتح الصفحة الرئيسية/الحجز (بدون 404) + fallback skyscanner.
 *
 * ملاحظة: هذا لا "يضمن" نفس الرحلة داخل موقع الشركة (مثل Google) لأنه يحتاج deeplink رسمي.
 */
/*export const generateBookingLink = ({
  airlineCode,
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
  travelClass = 'ECONOMY',
}) => {
  const dep = formatDateForUrl(departureDate);
  const ret = returnDate ? formatDateForUrl(returnDate) : null;

  const cabinClass =
    String(travelClass).toUpperCase() === 'BUSINESS'
      ? 'business'
      : String(travelClass).toUpperCase() === 'FIRST'
      ? 'first'
      : 'economy';

  const skyscannerFallback =
    `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${dep}` +
    (ret ? `/${ret}` : '') +
    `/?adults=${encodeURIComponent(passengers)}&cabinclass=${encodeURIComponent(cabinClass)}&airlines=${encodeURIComponent(airlineCode)}`;

  switch (airlineCode) {
    case 'F3': {
      // ✅ هذا الذي قلت أنه اشتغل معك
      return `https://www.flyadeal.com/ar/search-flight?${buildQuery({
        origin,
        destination,
        departure: dep,
        adults: passengers,
        type: ret ? 'round' : 'oneway',
        return: ret || undefined,
      })}`;
    }

    case 'SV': {
      // ✅ تثبيت locale "ar-sa" لتفادي التحويل إلى ar-YE/404
      // إذا مسار /booking/flights تغيّر عندهم، سيفشل—عندها استخدم fallback
      const saudiaTry = `https://www.saudia.com/booking/flights?${buildQuery({
        origin,
        destination,
        departureDate: dep,
        returnDate: ret || undefined,
        adults: passengers,
        cabinClass,
        tripType: ret ? 'ROUND' : 'ONE_WAY',
      })}`;

      // إذا تريد "تضمن فتح صفحة" بدون 404 حتى لو ليس نفس الرحلة:
      // ارجع للرئيسية بدل saudiaTry
      return saudiaTry || `https://www.saudia.com/`;
    }

    case 'XY': {
      // ❌ /en/book/process صار 404 عندك → لا يوجد رابط ثابت مضمون
      // نفتح flynas الرئيسية (بدون 404) + لو تبغى دقة أعلى استخدم fallback
      return `https://www.flynas.com/en`;
    }

    default:
      return skyscannerFallback;
  }
};*/

/**
 * توليد رابط حجز متكامل
 */
export const generateBookingLink = ({
  airlineCode,
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
  travelClass = 'ECONOMY',
}) => {
  const dep = formatDateForUrl(departureDate);
  const ret = returnDate ? formatDateForUrl(returnDate) : null;

  const cabinClass =
    String(travelClass).toUpperCase() === 'BUSINESS'
      ? 'business'
      : String(travelClass).toUpperCase() === 'FIRST'
      ? 'first'
      : 'economy';

  // ✅ Fallback مضمون
  const skyscannerFallback =
    `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${dep}` +
    (ret ? `/${ret}` : '') +
    `/?adults=${passengers}&cabinclass=${cabinClass}&airlines=${airlineCode}`;

  switch (airlineCode) {
    case 'F3': // Flyadeal ✅ شغال
      return `https://www.flyadeal.com/ar/search-flight?${buildQuery({
        origin,
        destination,
        departure: dep,
        adults: passengers,
        type: ret ? 'round' : 'oneway',
        return: ret || undefined,
      })}`;

    case 'SV': // Saudia ✅ بدون 404
      return `https://www.saudia.com/booking/flights`;

    case 'XY': // Flynas ❌ لا Deep Link ثابت
      return `https://www.flynas.com/en/book-flight`;

    case 'EK': // Emirates
      return `https://www.emirates.com/sa/english/book/`;

    case 'QR': // Qatar Airways
      return `https://www.qatarairways.com/en/book.html`;

    case 'EY': // Etihad
      return `https://www.etihad.com/en/book`;

    default:
      return skyscannerFallback;
  }
};


/**
 * ✅ تحويل بيانات Amadeus لتنسيق تطبيقك
 */
const formatFlightData = (amadeusFlights, searchParams) => {
  if (!Array.isArray(amadeusFlights) || amadeusFlights.length === 0) return [];

  return amadeusFlights.map((offer, index) => {
    const itinerary = offer.itineraries?.[0];
    const segments = itinerary?.segments || [];
    const first = segments[0];
    const last = segments[segments.length - 1];

    const airlineCode = first?.carrierCode || 'NA';
    const airline = getAirlineName(airlineCode);

    const depDate = formatDateForUrl(first?.departure?.at || searchParams.departureDate);
    const retDate = searchParams.returnDate ? formatDateForUrl(searchParams.returnDate) : null;

    const totalPrice = Math.round(parseFloat(offer?.price?.total || '0')) || 0;

    return {
      id: offer.id || `flight-${index}`,
      airline,
      airlineCode,
      origin: first?.departure?.iataCode || searchParams.origin,
      destination: last?.arrival?.iataCode || searchParams.destination,
      departure: first?.departure?.at,
      arrival: last?.arrival?.at,
      duration: convertDuration(itinerary?.duration),
      stops: Math.max(0, segments.length - 1),
      price: totalPrice,
      currency: offer?.price?.currency || 'SAR',
      flightNumber: first?.number || '',
      aircraft: first?.aircraft?.code || 'Unknown',
      logo: getAirlineLogo(airlineCode),
      itinerary: offer.itineraries || [],
      bookingLink: generateBookingLink({
        airlineCode,
        origin: first?.departure?.iataCode || searchParams.origin,
        destination: last?.arrival?.iataCode || searchParams.destination,
        departureDate: depDate,
        returnDate: retDate,
        passengers: searchParams.passengers || 1,
        travelClass: searchParams.class || 'ECONOMY',
      }),
      seatsAvailable: offer.numberOfBookableSeats || 0,
    };
  });
};

/** Fallback */
const getFallbackData = (searchParams) => {
  const departureDate = searchParams.departureDate || '2026-01-19';

  return [
    {
      id: 'mock-1',
      airline: 'Flyadeal',
      airlineCode: 'F3',
      origin: searchParams.origin || 'JED',
      destination: searchParams.destination || 'RUH',
      departure: `${departureDate}T08:00:00`,
      arrival: `${departureDate}T09:30:00`,
      duration: '1h 30m',
      stops: 0,
      price: 200,
      currency: 'SAR',
      flightNumber: '0000',
      aircraft: 'Unknown',
      logo: getAirlineLogo('F3'),
      bookingLink: generateBookingLink({
        airlineCode: 'F3',
        origin: searchParams.origin || 'JED',
        destination: searchParams.destination || 'RUH',
        departureDate,
        returnDate: searchParams.returnDate || null,
        passengers: searchParams.passengers || 1,
        travelClass: searchParams.class || 'ECONOMY',
      }),
      seatsAvailable: 10,
    },
  ];
};

/**
 * ✅ Airport info
 */
export const getAirportInfo = async (iataCode) => {
  try {
    const token = await getAmadeusToken();

    const response = await http.get(endpoints.locations, {
      headers: { Authorization: `Bearer ${token}` },
      params: { subType: 'AIRPORT', keyword: iataCode, 'page[limit]': 1 },
    });

    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching airport info:', error.response?.data || error.message);
    return null;
  }
};

/**
 * ✅ Airline info
 */
export const getAirlineInfo = async (airlineCode) => {
  try {
    const token = await getAmadeusToken();

    const response = await http.get(endpoints.airlines, {
      headers: { Authorization: `Bearer ${token}` },
      params: { airlineCodes: airlineCode },
    });

    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching airline info:', error.response?.data || error.message);
    return null;
  }
};

/**
 * ✅ Price metrics
 */
export const getFlightPriceAnalysis = async (params) => {
  try {
    const token = await getAmadeusToken();

    const response = await http.get(endpoints.priceMetrics, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originIataCode: params.origin,
        destinationIataCode: params.destination,
        departureDate: params.departureDate,
        currencyCode: 'SAR',
        oneWay: !params.returnDate,
      },
    });

    return response.data?.data || null;
  } catch (error) {
    console.error('Error fetching price analysis:', error.response?.data || error.message);
    return null;
  }
};

/**
 * ✅ Search airports
 */
export const searchAirports = async (query) => {
  try {
    const token = await getAmadeusToken();
    if (!token) return [];

    const response = await http.get(endpoints.locations, {
      headers: { Authorization: `Bearer ${token}` },
      params: { subType: 'AIRPORT', keyword: query, 'page[limit]': 10 },
    });

    return (response.data?.data || []).map((item) => ({
      iataCode: item.iataCode,
      name: item.name,
      address: {
        cityName: item.address?.cityName || '',
        countryName: item.address?.countryName || '',
      },
      geoCode: item.geoCode,
    }));
  } catch (error) {
    console.error('Error searching airports:', error.response?.data || error.message);
    return [];
  }
};

export default {
  searchFlights,
  getAmadeusToken,
  getAirportInfo,
  getAirlineInfo,
  getFlightPriceAnalysis,
  searchAirports,
  generateBookingLink,
};