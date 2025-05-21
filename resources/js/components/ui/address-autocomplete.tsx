import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

// Define which address components should use short_name instead of long_name
const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set([
  'street_number',
  'administrative_area_level_1', // Province/State
  'postal_code',
]);

interface AddressComponentMapping {
  [key: string]: string;
}

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  tooltipContent?: React.ReactNode;
  error?: string;
  // Address field type (helps determine which components to extract)
  addressType: 'street' | 'city' | 'province' | 'postal_code';
  // Optional callback when a place is selected with complete place details
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  // Optional form field setters for auto-filling related fields
  formSetters?: {
    setStreet?: (value: string) => void;
    setCity?: (value: string) => void;
    setProvince?: (value: string) => void;
    setPostalCode?: (value: string) => void;
  };
  // Optional mapping to override default component types
  componentMapping?: AddressComponentMapping;
}

// Creates component mapping for address types to Google Places address_component types
const defaultComponentMapping: AddressComponentMapping = {
  street: 'location',      // Special case - combines street_number and route
  city: 'locality',        // Or administrative_area_level_2 for some areas
  province: 'administrative_area_level_1',
  postal_code: 'postal_code',
};

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({
    className,
    label,
    icon,
    tooltipContent,
    error,
    addressType,
    formSetters,
    componentMapping = defaultComponentMapping,
    onPlaceSelect,
    disabled = false,
    ...props
  }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);

    // Forward the ref
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Function to extract address component text from place details
    const getComponentText = React.useCallback((place: google.maps.places.PlaceResult, componentType: string) => {
      // Special case for full street address - combines street_number and route
      if (componentType === 'location') {
        const streetNumber = getAddressComponent(place, 'street_number');
        const route = getAddressComponent(place, 'route');
        return `${streetNumber} ${route}`.trim();
      }
      
      // For city, try several possible types depending on country
      if (componentType === 'locality') {
        // Try locality first
        let component = getAddressComponent(place, 'locality');
        if (!component) {
          // If not found, try administrative_area_level_2 (some countries use this for cities)
          component = getAddressComponent(place, 'administrative_area_level_2');
        }
        if (!component) {
          // Last resort - try sublocality
          component = getAddressComponent(place, 'sublocality_level_1') || 
                      getAddressComponent(place, 'sublocality');
        }
        return component;
      }
      
      // For other types, directly get the component
      return getAddressComponent(place, componentType);
    }, []);

    // Helper function to get address component by type
    const getAddressComponent = (place: google.maps.places.PlaceResult, type: string): string => {
      if (!place.address_components) return '';
      
      for (const component of place.address_components) {
        if (component.types.indexOf(type) !== -1) {
          return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(type) ? 
              component.short_name : component.long_name;
        }
      }
      return '';
    };

    // Auto-fill form fields based on selected place
    const fillAddressFields = React.useCallback((place: google.maps.places.PlaceResult) => {
      // Don't proceed if no address components
      if (!place.address_components) return;

      // Update current field based on addressType
      const currentField = componentMapping[addressType];
      const valueForCurrentField = getComponentText(place, currentField);

      // Set value for current input through React state
      // This is handled by the parent component through the onChange prop
      if (inputRef.current) {
        // Create and dispatch an input event to trigger onChange
        const event = new Event('input', { bubbles: true });
        inputRef.current.value = valueForCurrentField;
        inputRef.current.dispatchEvent(event);
      }

      // Auto-fill other form fields if formSetters are provided
      if (formSetters) {
        // Set street address
        if (formSetters.setStreet && addressType !== 'street') {
          const streetValue = getComponentText(place, componentMapping.street);
          if (streetValue) formSetters.setStreet(streetValue);
        }

        // Set city
        if (formSetters.setCity && addressType !== 'city') {
          const cityValue = getComponentText(place, componentMapping.city);
          if (cityValue) formSetters.setCity(cityValue);
        }

        // Set province
        if (formSetters.setProvince && addressType !== 'province') {
          const provinceValue = getComponentText(place, componentMapping.province);
          if (provinceValue) formSetters.setProvince(provinceValue);
        }

        // Set postal code
        if (formSetters.setPostalCode && addressType !== 'postal_code') {
          const postalValue = getComponentText(place, componentMapping.postal_code);
          if (postalValue) formSetters.setPostalCode(postalValue);
        }
      }

      // Call onPlaceSelect callback if provided
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    }, [addressType, componentMapping, formSetters, getComponentText, onPlaceSelect]);

    // Initialize Google Places Autocomplete
    React.useEffect(() => {
      // Don't initialize if Google Maps API not loaded or input not available
      if (!inputRef.current || !window.google?.maps?.places?.Autocomplete) return;
      
      try {
        // Create options based on address type
        const options: google.maps.places.AutocompletionRequest = {
          componentRestrictions: { country: 'ph' }, // Philippines
          fields: ['address_components', 'formatted_address', 'name', 'geometry'],
        };
        
        // Set type restrictions based on address type
        if (addressType === 'street') {
          options.types = ['address'];
        } else if (addressType === 'city') {
          options.types = ['(cities)'];
        } else if (addressType === 'province') {
          options.types = ['administrative_area_level_1'];
        }
        
        // Create the autocomplete instance
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        );
        
        // Set the autocomplete instance
        setAutocomplete(autocompleteInstance);

        // Add listener for place changes
        const listener = autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place) {
            fillAddressFields(place);
          }
        });

        // Cleanup
        return () => {
          if (window.google?.maps?.event && listener) {
            window.google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error("Error initializing Google Places Autocomplete:", error);
      }
    }, [addressType, fillAddressFields]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="flex items-center gap-1.5">
            {icon}
            {label}
            {tooltipContent}
          </Label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={inputRef}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <div className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };