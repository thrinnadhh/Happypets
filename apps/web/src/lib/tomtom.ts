export type LatLng = {
  lat: number;
  lng: number;
};

export type ReverseGeocodeResult = {
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

export type StructuredLocation = {
  addressLine: string;
  city: string;
  pincode: string;
};

const DEFAULT_INDIA_CENTER: LatLng = {
  lat: 20.5937,
  lng: 78.9629,
};

function getEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = import.meta.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function getTomTomPublicKey(): string {
  return getEnvValue(
    "VITE_LOCATIONIQ_API_KEY",
    "NEXT_PUBLIC_LOCATIONIQ_API_KEY",
    "VITE_TOMTOM_API_KEY",
    "NEXT_PUBLIC_TOMTOM_API_KEY",
  ) ?? "";
}

export function hasTomTomPublicKey(): boolean {
  return Boolean(getTomTomPublicKey());
}

export function getDefaultIndiaCenter(): LatLng {
  return DEFAULT_INDIA_CENTER;
}

export function getDisplayMapTileConfig(): { attribution: string; subdomains: string[]; url: string } {
  return {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: ["a", "b", "c", "d"],
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  };
}

export function buildLocationQuery(location: StructuredLocation): string {
  const addressLine = location.addressLine.trim();
  const city = location.city.trim();
  const pincode = location.pincode.trim();
  const parts = [addressLine];

  if (city && !addressLine.toLowerCase().includes(city.toLowerCase())) {
    parts.push(city);
  }

  if (pincode && !addressLine.includes(pincode)) {
    parts.push(pincode);
  }

  return parts.filter(Boolean).join(", ");
}

export function extractStructuredLocation(input: {
  address: string;
  city?: string;
  pincode?: string;
  secondaryText?: string;
}): StructuredLocation {
  const address = input.address.trim();
  const secondaryText = input.secondaryText?.trim() ?? "";
  const city =
    input.city?.trim() ||
    secondaryText.split(",").map((part) => part.trim()).find(Boolean) ||
    "";
  const pincode =
    input.pincode?.trim() ||
    address.match(/\b\d{6}\b/)?.[0] ||
    secondaryText.match(/\b\d{6}\b/)?.[0] ||
    "";

  return {
    addressLine: address,
    city,
    pincode,
  };
}

export async function reverseGeocodeTomTom(position: LatLng): Promise<ReverseGeocodeResult> {
  const key = getTomTomPublicKey();
  if (!key) {
    throw new Error("Map reverse geocoding is not configured. Add VITE_LOCATIONIQ_API_KEY, NEXT_PUBLIC_LOCATIONIQ_API_KEY, VITE_TOMTOM_API_KEY, or NEXT_PUBLIC_TOMTOM_API_KEY.");
  }

  if (getEnvValue("VITE_LOCATIONIQ_API_KEY", "NEXT_PUBLIC_LOCATIONIQ_API_KEY")) {
    const url = new URL("https://us1.locationiq.com/v1/reverse");
    url.searchParams.set("key", key);
    url.searchParams.set("lat", String(position.lat));
    url.searchParams.set("lon", String(position.lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("normalizeaddress", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Unable to identify the selected location.");
    }

    const payload = await response.json() as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state_district?: string;
        postcode?: string;
      };
      lat?: string | number;
      lon?: string | number;
    };

    const address = payload.display_name?.trim() ?? "";
    const city = payload.address?.city?.trim() ??
      payload.address?.town?.trim() ??
      payload.address?.village?.trim() ??
      payload.address?.state_district?.trim() ??
      "";
    const pincode = payload.address?.postcode?.trim() ?? "";
    const latitude = Number(payload.lat ?? position.lat);
    const longitude = Number(payload.lon ?? position.lng);

    if (!address) {
      throw new Error("We could not derive an address from that map pin.");
    }

    return {
      address,
      city,
      pincode,
      latitude,
      longitude,
    };
  }

  const url = new URL(
    `https://api.tomtom.com/search/2/reverseGeocode/${position.lat},${position.lng}.json`,
  );
  url.searchParams.set("key", key);
  url.searchParams.set("language", "en-GB");
  url.searchParams.set("view", "IN");
  url.searchParams.set("radius", "200");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Unable to identify the selected location.");
  }

  const payload = await response.json() as {
    addresses?: Array<{
      address?: {
        freeformAddress?: string;
        municipality?: string;
        postalCode?: string;
      };
      position?: {
        lat?: number;
        lon?: number;
      };
    }>;
  };

  const match = payload.addresses?.[0];
  const address = match?.address?.freeformAddress?.trim() ?? "";
  const city = match?.address?.municipality?.trim() ?? "";
  const pincode = match?.address?.postalCode?.trim() ?? "";
  const latitude = Number(match?.position?.lat ?? position.lat);
  const longitude = Number(match?.position?.lon ?? position.lng);

  if (!address) {
    throw new Error("We could not derive an address from that map pin.");
  }

  return {
    address,
    city,
    pincode,
    latitude,
    longitude,
  };
}
