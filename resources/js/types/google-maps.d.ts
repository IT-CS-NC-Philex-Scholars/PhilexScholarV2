declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng | LatLngBounds | LatLngLiteral): LatLngBounds;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface PlaceResult {
    address_components?: google.maps.GeocoderAddressComponent[];
    formatted_address?: string;
    geometry?: {
      location: LatLng;
      viewport?: LatLngBounds;
    };
    name?: string;
    place_id?: string;
    types?: string[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface AutocompletionRequest {
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: ComponentRestrictions;
    location?: LatLng;
    offset?: number;
    radius?: number;
    types?: string[];
    fields?: string[];
  }

  interface ComponentRestrictions {
    country: string | string[];
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompletionRequest);
      addListener(eventName: string, handler: Function): google.maps.MapsEventListener;
      getPlace(): PlaceResult;
    }
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace event {
    function removeListener(listener: MapsEventListener): void;
  }
}

export {};